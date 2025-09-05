import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-2 mt-auto">
      <div className="container mx-auto px-4">
        {/* Trial Version Notice */}
        <div className="text-center mb-2">
          <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-block">
            <span className="font-medium text-orange-500">⚠️ Trial Version</span> - 
            <span className="ml-1">This is a trial version with some limits. Come back after 24 hours for more credits.</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Left side - Made by Chinu */}
          <div className="flex items-center gap-1.5">
            <div className="text-xs text-muted-foreground">
              Made with <span className="text-red-500 animate-pulse">♥</span> by
            </div>
            <div className="relative group">
              <span className="font-bold text-sm bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 cursor-pointer">
                Chinu
              </span>
              <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Right side - Social icons */}
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a 
              href="mailto:contact@example.com" 
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;