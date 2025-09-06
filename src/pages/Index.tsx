import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import { useCredits } from "@/contexts/CreditContext";
import VoiceInput from "@/components/VoiceInput";
import ChatSection from "@/components/ChatSection";
import Footer from "@/components/Footer";
import CreditDisplay from "@/components/CreditDisplay";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("AIzaSyA9SQQf6uuIHC-4AyN8dqKjr2SMvs14lUo");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addMessage, createNewSession, currentSessionId } = useChatHistory();
  const { useCredit, isOutOfCredits, credits, timeUntilReset, checkApiCredits } = useCredits();

  const systemPrompt = "You are Chinu's AI Assistant. When someone asks about your name or who you are, always respond with: 'I'm Chinu's Assistant. I'm just here to help you. What can I do for you?' When someone asks what you do, always respond with: 'I'm here to help everyone, and I am being upgraded to make me even smarter.' Answer in simple, clear, and human-like tone. If user writes in Hindi, reply in Hindi. If user writes in Odia, reply in Odia. If user writes in English, reply in English. Keep responses short (2-5 lines). For technical queries, explain step by step. Be polite and supportive. You can understand and respond in Hindi, English, and Odia languages.";

  // Check real API credits on component mount
  React.useEffect(() => {
    checkApiCredits();
  }, []);


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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <div className="flex-1 overflow-hidden">
        <ChatSection />
      </div>
      
      {/* Input Area - Fixed at bottom for mobile */}
      <div className="flex-shrink-0 p-2 sm:p-3 md:p-4 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1.5 sm:gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Ask Chinu(AI)..."
                className="w-full rounded-2xl border-2 focus:border-primary pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base resize-none"
                disabled={isLoading}
                style={{ fontSize: '16px' }} // Prevent zoom on iOS
              />
              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-foreground"
                  title="Upload file or image"
                >
                  <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
              </div>
            </div>
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="rounded-full w-9 h-9 sm:w-10 sm:h-10 p-0 bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <div className="text-xs text-muted-foreground hidden sm:block">
              Ask Chinu(AI) can make mistakes. Consider checking important information.
            </div>
            <div className="md:hidden">
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
      
      <Footer />
    </div>
  );
};

export default Index;