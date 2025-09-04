import { Download, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/contexts/ChatHistoryContext';

interface ExportFeaturesProps {
  messages: Message[];
  sessionTitle?: string;
}

const ExportFeatures = ({ messages, sessionTitle = 'Chat' }: ExportFeaturesProps) => {
  const exportAsText = () => {
    const content = messages.map(msg => 
      `${msg.isUser ? 'You' : 'AI'}: ${msg.text}\n${msg.timestamp.toLocaleString()}\n`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionTitle}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const data = {
      title: sessionTitle,
      exportedAt: new Date().toISOString(),
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionTitle}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    const content = `# ${sessionTitle}\n\n` +
      `*Exported on ${new Date().toLocaleString()}*\n\n` +
      messages.map(msg => 
        `## ${msg.isUser ? 'You' : 'AI'}\n\n${msg.text}\n\n*${msg.timestamp.toLocaleString()}*\n\n---\n\n`
      ).join('');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionTitle}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 border-t border-border bg-muted/30">
      <span className="text-sm text-muted-foreground">Export:</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={exportAsText}
        className="h-8 px-2"
        title="Export as text"
      >
        <FileText className="w-4 h-4 mr-1" />
        Text
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={exportAsMarkdown}
        className="h-8 px-2"
        title="Export as Markdown"
      >
        <File className="w-4 h-4 mr-1" />
        MD
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={exportAsJSON}
        className="h-8 px-2"
        title="Export as JSON"
      >
        <Download className="w-4 h-4 mr-1" />
        JSON
      </Button>
    </div>
  );
};

export default ExportFeatures;
