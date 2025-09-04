import { useState, useRef } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import VoiceInput from "@/components/VoiceInput";
import ChatSection from "@/components/ChatSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("AIzaSyA9SQQf6uuIHC-4AyN8dqKjr2SMvs14lUo");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Start in demo mode by default
  const [apiError, setApiError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addMessage, createNewSession, currentSessionId } = useChatHistory();

  const systemPrompt = "You are Chinu's AI Assistant. When someone asks about your name or who you are, always respond with: 'I'm Chinu's Assistant. I'm just here to help you. What can I do for you?' When someone asks what you do, always respond with: 'I'm here to help everyone, and I am being upgraded to make me even smarter.' Answer in simple, clear, and human-like tone. If user writes in Hindi, reply in Hindi. If user writes in Odia, reply in Odia. If user writes in English, reply in English. Keep responses short (2-5 lines). For technical queries, explain step by step. Be polite and supportive. You can understand and respond in Hindi, English, and Odia languages.";

  const demoResponses = [
    "Hello! I'm Chinu's Assistant. I'm just here to help you. What can I do for you?",
    "I'm here to help everyone, and I am being upgraded to make me even smarter.",
    "That's a great question! Let me help you with that.",
    "I understand what you're asking. Here's what I think...",
    "Thanks for sharing that with me. I'm here to help!",
    "I'm currently in demo mode due to API limitations, but I'm still here to assist you!",
    "Even though I'm in demo mode, I can still provide helpful responses to your questions."
  ];

  const testApiConnection = async () => {
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
                  { text: "test" }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        setApiError(false);
        setDemoMode(false);
        toast({
          title: "API Connected!",
          description: "Switched to normal mode with real AI responses.",
          variant: "default",
        });
        return true;
      } else {
        const errorData = await response.json();
        if (errorData.error?.code === 429) {
          setApiError(true);
          setDemoMode(true);
          toast({
            title: "API Quota Exceeded",
            description: "Switched to demo mode. Get a new API key to use real AI.",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      setApiError(true);
      setDemoMode(true);
      return false;
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    
    if (!text) return;
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google AI Studio API key to start chatting.",
        variant: "destructive",
      });
      return;
    }

    // Check if we should use demo mode
    if (demoMode) {
      const userMessage = {
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: new Date(),
      };

      addMessage(userMessage);
      setInputValue("");
      setIsLoading(true);

      // Simulate API delay
      setTimeout(() => {
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          isUser: false,
          timestamp: new Date(),
        };
        addMessage(aiMessage);
        setIsLoading(false);
      }, 1000);

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
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (errorData.error?.code === 429) {
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
        text: `I apologize, but I'm currently unable to process your request due to API limitations. ${errorMessage.includes('quota') ? 'Switching to demo mode. You can still chat with me!' : 'Please check your API key and try again.'}`,
        isUser: false,
        timestamp: new Date(),
      };

      addMessage(fallbackMessage);

      // Auto-switch to demo mode if quota exceeded
      if (errorMessage.includes('quota')) {
        setDemoMode(true);
        toast({
          title: "Switched to Demo Mode",
          description: "API quota exceeded. You can still chat in demo mode!",
          variant: "default",
        });
      }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1">
        <ChatSection />
      </div>
      
      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="p-4 border-t border-border bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">Google AI Studio API Key:</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyInput(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google AI Studio API key"
                className="flex-1"
              />
              <Button
                onClick={async () => {
                  setShowApiKeyInput(false);
                  await testApiConnection();
                }}
                size="sm"
              >
                Test & Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
            </p>
          </div>
        </div>
      )}

      {/* Input Area - Just above footer */}
      <div className="p-4 border-t border-border bg-background">
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
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
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
              className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                Ask Chinu(AI) can make mistakes. Consider checking important information.
              </div>
              {demoMode && (
                <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Demo Mode
                </div>
              )}
              {apiError && !demoMode && (
                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  API Error
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (demoMode) {
                    // Try to switch to normal mode
                    await testApiConnection();
                  } else {
                    // Switch to demo mode
                    setDemoMode(true);
                    setApiError(false);
                    toast({
                      title: "Switched to Demo Mode",
                      description: "Now using sample responses.",
                      variant: "default",
                    });
                  }
                }}
                className={`text-xs ${demoMode ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {demoMode ? 'Try Real AI' : 'Demo Mode'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showApiKeyInput ? 'Hide' : 'API Key'}
              </Button>
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
      
      <Footer />
    </div>
  );
};

export default Index;