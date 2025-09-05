import React from 'react';
import { Clock, Zap, AlertCircle } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';
import { Button } from '@/components/ui/button';

const CreditDisplay = () => {
  const { credits, timeUntilReset, isOutOfCredits } = useCredits();

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

  const getCreditColor = () => {
    if (credits === 0) return 'text-red-500';
    if (credits <= 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getCreditIcon = () => {
    if (credits === 0) return <AlertCircle className="w-4 h-4" />;
    if (credits <= 10) return <Clock className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        {getCreditIcon()}
        <span className={`font-medium ${getCreditColor()}`}>
          {credits}/50
        </span>
      </div>
      
      {isOutOfCredits && timeUntilReset > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="text-xs">
            Reset in {formatTime(timeUntilReset)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;
