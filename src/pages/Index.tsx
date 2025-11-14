import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, MapPin, Sparkles, Globe, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/planner");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Plane className="h-12 w-12 text-primary animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TripPlanner AI
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plan your dream trip with AI-powered personalized itineraries.
            Hotels, attractions, food, and hidden gems—all in one place.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 transition-smooth text-lg px-8 py-6"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-12 w-6 rounded-full border-2 border-primary flex items-start justify-center p-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need for the Perfect Trip
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-medium hover:shadow-large transition-smooth">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Itineraries</h3>
                <p className="text-muted-foreground">
                  AI-generated travel plans tailored to your preferences and budget
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-large transition-smooth">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Hidden Gems</h3>
                <p className="text-muted-foreground">
                  Discover secret spots and local favorites off the beaten path
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-large transition-smooth">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Coverage</h3>
                <p className="text-muted-foreground">
                  Plan trips to any destination around the world with confidence
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-large transition-smooth">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Complete Planning</h3>
                <p className="text-muted-foreground">
                  Hotels, food, transport, and attractions all in organized tabs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of travelers who trust TripPlanner AI for their adventures
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6"
          >
            {isLoggedIn ? "Go to Planner" : "Sign Up Now"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;