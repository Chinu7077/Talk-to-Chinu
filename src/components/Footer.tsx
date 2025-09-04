import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
                {/* Left side - Made by Chinu */}
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Made with <span className="text-red-500 animate-pulse">♥</span> by
        </div>
        <div className="relative group">
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 cursor-pointer">
            Chinu
          </span>
          <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>

          {/* Right side - Social icons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href="mailto:contact@example.com" 
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;