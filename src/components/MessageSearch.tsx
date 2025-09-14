import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Message } from '@/contexts/ChatHistoryContext';

interface MessageSearchProps {
  messages: Message[];
  onMessageSelect?: (messageId: string) => void;
}

const MessageSearch = ({ messages, onMessageSelect }: MessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return messages.filter(msg => 
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0"
        title="Search messages"
      >
        <Search className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-0 text-sm"
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setSearchQuery('');
          }}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {filteredMessages.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No messages found
            </div>
          ) : (
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2">
                {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found
              </div>
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    onMessageSelect?.(message.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {message.isUser ? 'You' : 'AI'} • {message.timestamp.toLocaleString()}
                  </div>
                  <div className="text-sm line-clamp-2">
                    {highlightText(message.text, searchQuery)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;
