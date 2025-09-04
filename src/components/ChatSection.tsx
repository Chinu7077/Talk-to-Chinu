import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Send, Trash2, Settings, Key, MessageCircle, Menu, X, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useChatHistory, Message } from "@/contexts/ChatHistoryContext";
import { useTheme } from "@/contexts/ThemeContext";
import MessageBubble from "./MessageBubble";
import VoiceInput from "./VoiceInput";
import TextToSpeech from "./TextToSpeech";
import ThemeToggle from "./ThemeToggle";
import ChatHistorySidebar from "./ChatHistorySidebar";
import MessageSearch from "./MessageSearch";
import ExportFeatures from "./ExportFeatures";
import FileUpload from "./FileUpload";

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

  useEffect(() => {
    scrollToBottom();
  }, [getCurrentSession()?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        throw new Error('Failed to get AI response');
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
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API key and try again.",
        variant: "destructive",
      });
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
        <div className="md:block hidden">
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
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-border p-3 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-8 w-8 p-0 md:hidden"
            >
              {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Ask Chinu(AI)</h3>
            </div>
          </div>
          
          <div className="flex gap-1">
            <MessageSearch 
              messages={messages} 
              onMessageSelect={(messageId) => {
                const element = document.getElementById(`message-${messageId}`);
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
              className="h-8 w-8 p-0"
              title="Advanced Features"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="h-8 w-8 p-0"
              title="API Settings"
            >
              <Key className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-8 w-8 p-0"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* API Key Setup */}
        {showApiKeyInput && (
          <div className="bg-card border border-border rounded-lg p-4 m-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Setup Google AI Studio API Key
            </h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={saveApiKey} size="sm">
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
            <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
                    <p className="text-sm">I can help you in Hindi, English, and Odia.</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} id={`message-${message.id}`} className="w-full">
                  <MessageBubble message={message} />
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>


          </div>

          {/* Advanced Panel */}
          {showAdvancedPanel && (
            <div className="w-80 border-l border-border bg-background overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Advanced Features</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedPanel(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">File Upload</h4>
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