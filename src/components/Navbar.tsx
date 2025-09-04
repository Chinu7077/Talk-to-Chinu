import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Menu, X, MessageCircle } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Chat Hub
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('chat')}
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              Chat
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-foreground hover:text-primary transition-colors duration-200"
            >
              FAQ
            </button>
            <Button 
              variant="hero" 
              onClick={() => scrollToSection('chat')}
              className="ml-4"
            >
              Start Chatting
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('chat')}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Chat
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors"
            >
              FAQ
            </button>
            <div className="px-4 pt-2">
              <Button 
                variant="hero" 
                onClick={() => scrollToSection('chat')}
                className="w-full"
              >
                Start Chatting
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;