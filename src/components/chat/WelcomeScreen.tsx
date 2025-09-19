import { MessageSquare, Mic, Zap, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/hero-conversation.jpg';

export const WelcomeScreen = () => {
  const features = [
    {
      icon: Mic,
      title: "Voice Recognition",
      description: "Speak naturally and watch your words appear in real-time"
    },
    {
      icon: Zap,
      title: "AI Conversations",
      description: "Powered by advanced language models via OpenRouter"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your conversations stay secure with local processing"
    }
  ];

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="relative">
          <div className="w-full max-w-2xl mx-auto mb-8 rounded-xl overflow-hidden shadow-conversation">
            <img 
              src={heroImage} 
              alt="Conversational AI Interface" 
              className="w-full h-64 object-cover"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome to Careless Convo
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the future of AI conversations through natural voice interactions. 
              Speak freely and engage with intelligent responses in real-time.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-subtle rounded-xl p-6 border border-border/50">
          <h3 className="text-lg font-semibold mb-3 text-foreground">Getting Started</h3>
          <p className="text-muted-foreground mb-4">
            Ready to begin? Simply tap the microphone button below to start your first voice conversation.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-voice-active rounded-full animate-pulse" />
            <span>Microphone ready • Tap to speak</span>
          </div>
        </div>
      </div>
    </div>
  );
};