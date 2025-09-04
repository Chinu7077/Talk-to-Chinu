import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextToSpeechProps {
  text: string;
  disabled?: boolean;
}

const TextToSpeech = ({ text, disabled = false }: TextToSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useState(() => {
    setIsSupported('speechSynthesis' in window);
  });

  const speak = () => {
    if (!isSupported || disabled) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={speak}
      disabled={disabled}
      className={`h-6 w-6 p-0 ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`}
      title={isPlaying ? 'Stop speaking' : 'Speak text'}
    >
      {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
    </Button>
  );
};

export default TextToSpeech;
