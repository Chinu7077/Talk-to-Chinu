import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is the API key already configured?",
    answer: "Yes! This website comes with a pre-configured Google AI Studio API key, so you can start chatting immediately. For security, this key should be restricted by domain in Google Cloud Console. You can also use your own API key by clicking the Settings button in the chat interface."
  },
  {
    question: "Is my API key safe?",
    answer: "Yes, absolutely! API keys are stored only in your browser's local storage and never sent to any server except Google's AI Studio. For additional security, you should restrict your API key by domain in Google Cloud Console to only work on your website's domain."
  },
  {
    question: "Does it support multiple Indian languages?",
    answer: "हाँ बिल्कुल! ହଁ ନିଶ୍ଚିତ! Yes, absolutely! The AI can understand and respond in Hindi, English, and Odia. It automatically detects the language you are using and responds accordingly. आप हिंदी में भी बात कर सकते हैं। ଆପଣ ଓଡ଼ିଆରେ ମଧ୍ୟ କଥା କହିପାରିବେ।"
  },
  {
    question: "Can I deploy this on Netlify or GitHub Pages?",
    answer: "Yes! Since this is a frontend-only application with no backend dependencies, you can deploy it on any static hosting service like Netlify, GitHub Pages, Vercel, or even a simple web server. Just build the project and upload the files."
  },
  {
    question: "How do I get a Google AI Studio API key?",
    answer: "Visit https://makersuite.google.com/app/apikey, sign in with your Google account, and create a new API key. It's free to get started with generous usage limits. Make sure to restrict the key by domain for security."
  },
  {
    question: "What AI model is being used?",
    answer: "We use Google's Gemini 1.5 Flash model, which is fast, cost-effective, and provides excellent responses in multiple languages including Hindi and English. It's optimized for conversational AI applications."
  },
  {
    question: "Can I customize the AI's behavior?",
    answer: "Yes! The system prompt in the code can be modified to change how the AI behaves, its personality, and response style. You can make it more formal, casual, technical, or specialized for specific use cases."
  },
  {
    question: "Is there a message limit?",
    answer: "The limit depends on your Google AI Studio API key quota. The free tier provides generous limits for personal use. You can check your usage in the Google Cloud Console and upgrade if needed."
  },
  {
    question: "Can I use this commercially?",
    answer: "Yes, you can use this for commercial purposes. Just make sure to comply with Google AI Studio's terms of service and consider upgrading to a paid plan for higher usage limits if needed."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our AI chat system
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-gradient-card backdrop-blur-sm rounded-xl border border-card-border px-6 hover:shadow-glow-sm transition-all duration-300"
              >
                <AccordionTrigger className="text-left text-card-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-card backdrop-blur-sm rounded-xl border border-card-border p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">
              Need More Help?
            </h3>
            <p className="text-muted-foreground mb-6">
              If you have additional questions or need technical support, feel free to reach out or check the documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://ai.google.dev/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-medium hover:shadow-glow-md transition-all duration-300 hover:scale-105"
              >
                View Documentation
              </a>
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary bg-background/10 backdrop-blur-sm rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
              >
                Get API Key
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;