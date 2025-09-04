import { Button } from "@/components/ui/enhanced-button";
import { ArrowDown, MessageCircle, Sparkles, Zap } from "lucide-react";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-background relative overflow-hidden pt-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-muted/50 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">No Backend Required • Direct Browser Integration</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Chat with AI
            </span>
            <br />
            <span className="text-foreground">Instantly</span>
            <span className="text-2xl md:text-4xl lg:text-5xl ml-4">🚀</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            This website uses <span className="text-primary font-semibold">Google AI Studio (Gemini)</span> directly from your browser. 
            No backend, no complexity - just pure AI conversation in <span className="text-accent font-semibold">Hindi</span>, <span className="text-accent font-semibold">English</span>, and <span className="text-accent font-semibold">Odia</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => scrollToSection('chat')}
              className="min-w-[200px]"
            >
              <MessageCircle className="w-5 h-5" />
              Try Chat Now
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl"
              onClick={() => scrollToSection('features')}
              className="min-w-[200px]"
            >
              <Zap className="w-5 h-5" />
              See Features
            </Button>
          </div>

          {/* Demo Card */}
          <div className="max-w-md mx-auto bg-gradient-card backdrop-blur-sm rounded-xl border border-card-border p-6 shadow-glow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-card-foreground">AI Assistant</span>
            </div>
            <div className="text-left space-y-3">
              <div className="bg-chat-user text-chat-user-foreground rounded-lg rounded-br-sm px-4 py-2 ml-8">
                Hello! How are you?
              </div>
              <div className="bg-chat-ai text-chat-ai-foreground rounded-lg rounded-bl-sm px-4 py-2 mr-8">
                नमस्ते! ନମସ୍କାର! I am doing great, thank you for asking. How can I help you today?
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;