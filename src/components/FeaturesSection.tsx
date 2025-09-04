import { Globe, Zap, Settings, Languages } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Frontend-Only",
    description: "No backend required. Everything runs directly in your browser with Google AI Studio integration.",
    color: "text-primary"
  },
  {
    icon: Globe,
    title: "Modern UI",
    description: "Clean, responsive design with smooth animations and beautiful gradient themes.",
    color: "text-accent"
  },
  {
    icon: Settings,
    title: "Editable Prompt",
    description: "Customize the AI's behavior and personality to match your needs perfectly.",
    color: "text-success"
  },
  {
    icon: Languages,
    title: "Trilingual Support",
    description: "Seamlessly chat in Hindi, English, and Odia with automatic language detection.",
    color: "text-warning"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-surface relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Why Choose Our AI Chat?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with modern web technologies for the best user experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-gradient-card backdrop-blur-sm rounded-xl border border-card-border p-6 hover:shadow-glow-md transition-all duration-300 hover:scale-105 group"
              >
                <div className="mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 text-primary-foreground`} />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gradient-card rounded-xl border border-card-border">
            <div className="text-3xl font-bold text-primary mb-2">⚡</div>
            <div className="text-2xl font-bold text-card-foreground mb-1">Lightning Fast</div>
            <p className="text-muted-foreground">Instant responses with Google's powerful Gemini AI</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-card rounded-xl border border-card-border">
            <div className="text-3xl font-bold text-accent mb-2">🔒</div>
            <div className="text-2xl font-bold text-card-foreground mb-1">Secure</div>
            <p className="text-muted-foreground">Your API key stays in your browser, never stored on servers</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-card rounded-xl border border-card-border">
            <div className="text-3xl font-bold text-success mb-2">🌍</div>
            <div className="text-2xl font-bold text-card-foreground mb-1">Deploy Anywhere</div>
            <p className="text-muted-foreground">Works on Netlify, GitHub Pages, or any static host</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;