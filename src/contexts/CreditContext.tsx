import React, { createContext, useContext, useState, useEffect } from 'react';

interface CreditContextType {
  credits: number;
  lastReset: Date | null;
  timeUntilReset: number;
  useCredit: () => boolean;
  resetCredits: () => void;
  isOutOfCredits: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

const DAILY_CREDITS = 50; // Free tier limit
const RESET_HOURS = 24;

export const CreditProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState(DAILY_CREDITS);
  const [lastReset, setLastReset] = useState<Date | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState(0);

  // Load credits from localStorage on mount
  useEffect(() => {
    const savedCredits = localStorage.getItem('ai-chat-credits');
    const savedLastReset = localStorage.getItem('ai-chat-last-reset');
    
    if (savedCredits && savedLastReset) {
      const lastResetDate = new Date(savedLastReset);
      const now = new Date();
      const hoursSinceReset = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceReset >= RESET_HOURS) {
        // Reset credits if 24 hours have passed
        setCredits(DAILY_CREDITS);
        setLastReset(now);
        localStorage.setItem('ai-chat-credits', DAILY_CREDITS.toString());
        localStorage.setItem('ai-chat-last-reset', now.toISOString());
      } else {
        setCredits(parseInt(savedCredits));
        setLastReset(lastResetDate);
      }
    } else {
      // First time user
      setCredits(DAILY_CREDITS);
      setLastReset(new Date());
      localStorage.setItem('ai-chat-credits', DAILY_CREDITS.toString());
      localStorage.setItem('ai-chat-last-reset', new Date().toISOString());
    }
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!lastReset) return;

    const updateTimer = () => {
      const now = new Date();
      const timeDiff = lastReset.getTime() + (RESET_HOURS * 60 * 60 * 1000) - now.getTime();
      
      if (timeDiff <= 0) {
        // Time to reset
        setCredits(DAILY_CREDITS);
        setLastReset(now);
        localStorage.setItem('ai-chat-credits', DAILY_CREDITS.toString());
        localStorage.setItem('ai-chat-last-reset', now.toISOString());
        setTimeUntilReset(0);
      } else {
        setTimeUntilReset(Math.max(0, timeDiff));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastReset]);

  const useCredit = (): boolean => {
    if (credits > 0) {
      const newCredits = credits - 1;
      setCredits(newCredits);
      localStorage.setItem('ai-chat-credits', newCredits.toString());
      return true;
    }
    return false;
  };

  const resetCredits = () => {
    setCredits(DAILY_CREDITS);
    setLastReset(new Date());
    localStorage.setItem('ai-chat-credits', DAILY_CREDITS.toString());
    localStorage.setItem('ai-chat-last-reset', new Date().toISOString());
  };

  const isOutOfCredits = credits <= 0;

  const value = {
    credits,
    lastReset,
    timeUntilReset,
    useCredit,
    resetCredits,
    isOutOfCredits,
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};
