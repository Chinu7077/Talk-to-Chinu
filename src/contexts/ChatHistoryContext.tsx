import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  getCurrentSession: () => ChatSession | null;
  createNewSession: () => string;
  updateSession: (sessionId: string, messages: Message[]) => void;
  deleteSession: (sessionId: string) => void;
  loadSession: (sessionId: string) => void;
  addMessage: (message: Message) => void;
  searchSessions: (query: string) => ChatSession[];
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('chat-sessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setSessions(parsedSessions);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const getCurrentSession = (): ChatSession | null => {
    if (!currentSessionId) return null;
    return sessions.find(session => session.id === currentSessionId) || null;
  };

  const createNewSession = (): string => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const updateSession = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            messages, 
            updatedAt: new Date(),
            title: messages.length > 0 ? messages[0].text.slice(0, 50) + '...' : 'New Chat'
          }
        : session
    ));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const loadSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const addMessage = (message: Message) => {
    if (!currentSessionId) {
      createNewSession();
      return;
    }
    
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages: [...session.messages, message],
            updatedAt: new Date(),
            title: session.messages.length === 0 ? message.text.slice(0, 50) + '...' : session.title
          }
        : session
    ));
  };

  const searchSessions = (query: string): ChatSession[] => {
    return sessions.filter(session => 
      session.title.toLowerCase().includes(query.toLowerCase()) ||
      session.messages.some(msg => msg.text.toLowerCase().includes(query.toLowerCase()))
    );
  };

  return (
    <ChatHistoryContext.Provider value={{
      sessions,
      currentSessionId,
      getCurrentSession,
      createNewSession,
      updateSession,
      deleteSession,
      loadSession,
      addMessage,
      searchSessions
    }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};
