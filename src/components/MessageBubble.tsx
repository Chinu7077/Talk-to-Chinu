import { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/contexts/ChatHistoryContext';
import TextToSpeech from './TextToSpeech';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: Message;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
}

const MessageBubble = ({ message, onReaction }: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex gap-2 sm:gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!message.isUser && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary-foreground rounded-full"></div>
        </div>
      )}
      
      <div className="max-w-[85%] sm:max-w-[80%] group">
        <div
          className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
            message.isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <p className="whitespace-pre-wrap text-sm sm:text-sm leading-relaxed break-words">
            {message.text}
          </p>
          
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <span className="text-xs opacity-70">
              {formatTime(message.timestamp)}
            </span>
            
            {showActions && (
              <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                  title="Copy message"
                >
                  <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </Button>
                
                {!message.isUser && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReaction?.(message.id, 'like')}
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      title="Like message"
                    >
                      <ThumbsUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReaction?.(message.id, 'dislike')}
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      title="Dislike message"
                    >
                      <ThumbsDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </Button>
                    <TextToSpeech text={message.text} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {message.isUser && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-primary rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
