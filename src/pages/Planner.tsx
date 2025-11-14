import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, MapPin, Calendar, History } from "lucide-react";
import { TripResults } from "@/components/TripResults";
import { User, Session } from "@supabase/supabase-js";

const Planner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [travelDays, setTravelDays] = useState("5");
  const [tripData, setTripData] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleGenerateTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromLocation.trim() || !toLocation.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both from and to locations",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTripData(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-trip-plan", {
        body: {
          fromLocation: fromLocation.trim(),
          toLocation: toLocation.trim(),
          travelDays: parseInt(travelDays),
        },
      });

      if (error) throw error;

      console.log("Trip data received:", data);

      // Save to database
      const { error: insertError } = await supabase.from("trips").insert({
        user_id: user?.id,
        from_location: fromLocation,
        to_location: toLocation,
        travel_days: parseInt(travelDays),
        budget_per_person: data.budget_per_person,
        best_time_to_visit: data.best_time_to_visit,
        hotels: data.hotels,
        places_to_visit: data.places_to_visit,
        food_places: data.food_places,
        attractions: data.attractions,
        transportation: data.transportation,
        hidden_gems: data.hidden_gems,
        tips: data.tips,
      });

      if (insertError) {
        console.error("Error saving trip:", insertError);
      }

      setTripData(data);
      toast({
        title: "Trip Plan Generated!",
        description: `Your personalized itinerary for ${toLocation} is ready.`,
      });
    } catch (error: any) {
      console.error("Error generating trip:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate trip plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TripPlanner AI
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/history")}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto p-8 shadow-large mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Plan Your Dream Trip</h2>
            <p className="text-muted-foreground">
              Enter your travel details and let AI create a personalized itinerary
            </p>
          </div>

          <form onSubmit={handleGenerateTrip} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="from">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  From
                </Label>
                <Input
                  id="from"
                  placeholder="e.g., New York"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  To
                </Label>
                <Input
                  id="to"
                  placeholder="e.g., Paris"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">
                <Calendar className="inline h-4 w-4 mr-1" />
                Number of Days
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="30"
                value={travelDays}
                onChange={(e) => setTravelDays(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-smooth"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Trip Plan...
                </>
              ) : (
                "Generate Trip Plan"
              )}
            </Button>
          </form>
        </Card>

        {tripData && (
          <TripResults
            tripData={tripData}
            fromLocation={fromLocation}
            toLocation={toLocation}
            travelDays={parseInt(travelDays)}
          />
        )}
      </main>
    </div>
  );
};

export default Planner;