import React from "react";
import ChatSection from "@/components/ChatSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <div className="flex-1 overflow-hidden">
        <ChatSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;