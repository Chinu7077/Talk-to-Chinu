import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserIdentification } from '@/utils/userIdentification';

interface CreditContextType {
  credits: number;
  lastReset: Date | null;
  timeUntilReset: number;
  useCredit: () => Promise<boolean>;
  resetCredits: () => Promise<void>;
  isOutOfCredits: boolean;
  checkApiCredits: () => Promise<number>;
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
    const loadUserCredits = async () => {
      const creditsKey = await UserIdentification.getStorageKey('ai-chat-credits');
      const resetKey = await UserIdentification.getStorageKey('ai-chat-last-reset');
      
      const savedCredits = localStorage.getItem(creditsKey);
      const savedLastReset = localStorage.getItem(resetKey);
      
      if (savedCredits && savedLastReset) {
        const lastResetDate = new Date(savedLastReset);
        const now = new Date();
        const hoursSinceReset = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceReset >= RESET_HOURS) {
          // Reset credits if 24 hours have passed
          setCredits(DAILY_CREDITS);
          setLastReset(now);
          localStorage.setItem(creditsKey, DAILY_CREDITS.toString());
          localStorage.setItem(resetKey, now.toISOString());
        } else {
          setCredits(parseInt(savedCredits));
          setLastReset(lastResetDate);
        }
      } else {
        // First time user for this IP/device
        setCredits(DAILY_CREDITS);
        setLastReset(new Date());
        localStorage.setItem(creditsKey, DAILY_CREDITS.toString());
        localStorage.setItem(resetKey, new Date().toISOString());
      }
    };

    loadUserCredits();
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

  const useCredit = async (): Promise<boolean> => {
    if (credits > 0) {
      const newCredits = credits - 1;
      setCredits(newCredits);
      const creditsKey = await UserIdentification.getStorageKey('ai-chat-credits');
      localStorage.setItem(creditsKey, newCredits.toString());
      return true;
    }
    return false;
  };

  const resetCredits = async () => {
    setCredits(DAILY_CREDITS);
    setLastReset(new Date());
    const creditsKey = await UserIdentification.getStorageKey('ai-chat-credits');
    const resetKey = await UserIdentification.getStorageKey('ai-chat-last-reset');
    localStorage.setItem(creditsKey, DAILY_CREDITS.toString());
    localStorage.setItem(resetKey, new Date().toISOString());
  };

  const checkApiCredits = async (): Promise<number> => {
    // Don't make real API calls to check credits - just return current local credits
    // The actual API quota will be checked when making real requests
    return credits;
  };

  const isOutOfCredits = credits <= 0;

  const value = {
    credits,
    lastReset,
    timeUntilReset,
    useCredit,
    resetCredits,
    isOutOfCredits,
    checkApiCredits,
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
