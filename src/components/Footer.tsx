import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import UserInfo from "./UserInfo";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-1.5 flex-shrink-0">
      <div className="container mx-auto px-4">
        {/* Trial Version Notice */}
        <div className="text-center mb-1.5">
          <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-0.5 inline-block">
            <span className="font-medium text-orange-500">⚠️ Trial Version</span> - 
            <span className="ml-1">This is a trial version with some limits. Come back after 24 hours for more credits.</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Left side - Made by Chinu and User Info */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="text-xs text-muted-foreground">
                Made with <span className="text-red-500 animate-pulse">♥</span> by
              </div>
              <div className="relative group">
                <span className="font-bold text-xs bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 cursor-pointer">
                  Chinu
                </span>
                <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
            <div className="hidden sm:block">
              <UserInfo />
            </div>
          </div>

          {/* Right side - Social icons */}
          <div className="flex items-center gap-2">
            <a 
              href="https://x.com/MrChinmayaKumar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              title="Follow on X (Twitter)"
            >
              <Twitter className="w-3 h-3" />
            </a>
            <a 
              href="https://www.linkedin.com/in/chinmaya-nayak-09226317b/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              title="Connect on LinkedIn"
            >
              <Linkedin className="w-3 h-3" />
            </a>
            <a 
              href="mailto:chinuisback@gmail.com" 
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              title="Send Email"
            >
              <Mail className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;