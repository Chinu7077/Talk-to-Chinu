import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Send, Trash2, Settings, Key, MessageCircle, Menu, X, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useChatHistory, Message } from "@/contexts/ChatHistoryContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCredits } from "@/contexts/CreditContext";
import MessageBubble from "./MessageBubble";
import VoiceInput from "./VoiceInput";
import TextToSpeech from "./TextToSpeech";
import ThemeToggle from "./ThemeToggle";
import ChatHistorySidebar from "./ChatHistorySidebar";
import MessageSearch from "./MessageSearch";
import ExportFeatures from "./ExportFeatures";
import FileUpload from "./FileUpload";
import CreditDisplay from "./CreditDisplay";

const ChatSection = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("AIzaSyALYTBHYnetAwVDc9-RHRi-gxzjpZGHVAY");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { actualTheme } = useTheme();
  const { useCredit, isOutOfCredits, credits, timeUntilReset, checkApiCredits } = useCredits();
  
  const {
    getCurrentSession,
    addMessage,
    updateSession,
    createNewSession,
    currentSessionId
  } = useChatHistory();

  const systemPrompt = "You are Chinu's AI Assistant. When someone asks about your name or who you are, always respond with: 'I'm Chinu's Assistant. I'm just here to help you. What can I do for you?' When someone asks what you do, always respond with: 'I'm here to help everyone, and I am being upgraded to make me even smarter.' Answer in simple, clear, and human-like tone. If user writes in Hindi, reply in Hindi. If user writes in Odia, reply in Odia. If user writes in English, reply in English. Keep responses short (2-5 lines). For technical queries, explain step by step. Be polite and supportive. You can understand and respond in Hindi, English, and Odia languages.";

  const clearChat = () => {
    if (currentSessionId) {
      updateSession(currentSessionId, []);
    }
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared.",
    });
  };

  // Keyboard shortcuts
  const shortcuts = useMemo(() => [
    {
      key: 'n',
      ctrlKey: true,
      action: () => createNewSession(),
      description: 'New chat'
    },
    {
      key: 'b',
      ctrlKey: true,
      action: () => setShowSidebar(!showSidebar),
      description: 'Toggle sidebar'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => clearChat(),
      description: 'Clear chat'
    },
    {
      key: 'l',
      ctrlKey: true,
      action: () => inputRef.current?.focus(),
      description: 'Focus input'
    },
    {
      key: 'Escape',
      action: () => {
        setShowApiKeyInput(false);
        setShowSidebar(false);
        setShowAdvancedPanel(false);
      },
      description: 'Close dialogs'
    }
  ], [createNewSession, showSidebar, clearChat]);

  useKeyboardShortcuts(shortcuts);

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Check real API credits on component mount
  useEffect(() => {
    checkApiCredits();
  }, [checkApiCredits]);

  useEffect(() => {
    scrollToBottom();
  }, [getCurrentSession()?.messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Google AI Studio API key",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('gemini-api-key', apiKey);
    setShowApiKeyInput(false);
    toast({
      title: "Success",
      description: "API key saved! You can now start chatting.",
    });
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    
    if (!text) return;
    
    if (!apiKey) {
      setShowApiKeyInput(true);
      toast({
        title: "API Key Required",
        description: "Please enter your Google AI Studio API key to start chatting.",
        variant: "destructive",
      });
      return;
    }

    // Check real API credits
    const realCredits = await checkApiCredits();
    if (realCredits <= 0) {
      const formatTime = (milliseconds: number) => {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
          return `${minutes}m ${seconds}s`;
        } else {
          return `${seconds}s`;
        }
      };

      toast({
        title: "Out of Credits",
        description: `You've used all 50 free searches. Come back in ${formatTime(timeUntilReset)} for more credits.`,
        variant: "destructive",
      });
      return;
    }

    // Create new session if none exists
    if (!currentSessionId) {
      createNewSession();
    }

    const userMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    // Use a credit
    await useCredit();

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt + "\n\nUser: " + text }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (errorData.error?.code === 429) {
          // Update credits to 0 when API quota is exceeded
          const { useCredits } = await import('@/contexts/CreditContext');
          // This will be handled by the credit context
          throw new Error('API quota exceeded. Please check your Google AI Studio billing or try again later.');
        } else if (errorData.error?.code === 400) {
          throw new Error('Invalid API key. Please check your Google AI Studio API key.');
        } else if (errorData.error?.code === 403) {
          throw new Error('API access denied. Please check your API key permissions.');
        } else {
          throw new Error(`API Error: ${errorData.error?.message || 'Failed to get AI response'}`);
        }
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't process your message.";

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      addMessage(aiMessage);
    } catch (error) {
      console.error('Error:', error);
      
      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";
      
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Add a fallback response when API fails
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        text: `I apologize, but I'm currently unable to process your request due to API limitations. ${errorMessage.includes('quota') ? 'Please try again later or check your API key.' : 'Please check your API key and try again.'}`,
        isUser: false,
        timestamp: new Date(),
      };

      addMessage(fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    sendMessage(transcript);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: `${file.name} is larger than 10MB`,
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      sendMessage(`I've uploaded a ${fileType}: ${file.name}. Here's the content:\n\n${content}`);
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: `Failed to read ${file.name}`,
        variant: "destructive",
      });
    };

    if (file.type.startsWith('text/') || file.type === 'application/json') {
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Unsupported file type",
        description: `${file.type} is not supported`,
        variant: "destructive",
      });
    }

    // Reset the input
    event.target.value = '';
  };

  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];
  
  // Debug log for first message issue
  useEffect(() => {
    console.log('Messages updated:', messages.length, messages);
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <div className="hidden md:block">
          <ChatHistorySidebar />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowSidebar(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border" onClick={(e) => e.stopPropagation()}>
            <ChatHistorySidebar />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="border-b border-border p-2 sm:p-3 flex items-center justify-between bg-background flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-8 w-8 p-0 md:hidden flex-shrink-0"
            >
              {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="text-base font-semibold truncate">Ask Chinu(AI)</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile Search - Always visible but compact */}
            <div className="sm:hidden">
              <MessageSearch 
                messages={messages} 
                onMessageSelect={(messageId) => {
                  const element = document.getElementById(`message-${messageId}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
            
            {/* Desktop Search */}
            <div className="hidden sm:block">
              <MessageSearch 
                messages={messages} 
                onMessageSelect={(messageId) => {
                  const element = document.getElementById(`message-${messageId}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
            
            {/* Credit Display - Always visible */}
            <div className="hidden sm:block">
              <CreditDisplay />
            </div>
            
            {/* Mobile Menu Button - Dropdown for mobile */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                className="h-8 w-8 p-0"
                title="Menu"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                className="h-7 w-7 p-0"
                title="Advanced Features"
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="h-7 w-7 p-0"
                title="API Settings"
              >
                <Key className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="h-7 w-7 p-0"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* API Key Setup */}
        {showApiKeyInput && (
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 m-2 sm:m-4">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <span className="truncate">Setup Google AI Studio API Key</span>
            </h3>
            <p className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm">
              Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="password"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 min-w-0"
              />
              <Button onClick={saveApiKey} size="sm" className="w-full sm:w-auto">
                Save Key
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto chat-messages-scroll p-2 sm:p-4 pb-4 space-y-3 sm:space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full px-4">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground/30" />
                    <h2 className="text-lg sm:text-2xl font-semibold mb-2">How can I help you today?</h2>
                    <p className="text-xs sm:text-sm">I can help you in Hindi, English, and Odia.</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} id={`message-${message.id}`} className="w-full">
                  <MessageBubble message={message} />
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 p-3 border-t border-border bg-background">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Message Ask Chinu(AI)..."
                      className="w-full rounded-2xl border-2 focus:border-primary pr-12 py-3 text-base resize-none"
                      disabled={isLoading}
                      style={{ fontSize: '16px' }} // Prevent zoom on iOS
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        title="Upload file or image"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
                    </div>
                  </div>
                  <Button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    size="sm"
                    className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Ask Chinu(AI) can make mistakes. Consider checking important information.
                  </div>
                  <div className="sm:hidden">
                    <CreditDisplay />
                  </div>
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.md,.json,.png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx"
              />
            </div>

          </div>

          {/* Advanced Panel */}
          {showAdvancedPanel && (
            <div className="w-full sm:w-80 border-l border-border bg-background overflow-y-auto">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    <span className="sm:hidden">Menu</span>
                    <span className="hidden sm:inline">Advanced Features</span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedPanel(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Mobile-specific controls */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Credits</span>
                      <CreditDisplay />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Key</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                        className="h-8 px-3"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clear Chat</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearChat}
                        className="h-8 px-3 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium mb-2">File Upload</h4>
                    <FileUpload onFileProcessed={(file, content) => {
                      sendMessage(`I've uploaded a file: ${file.name}. Here's the content:\n\n${content}`);
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSection;