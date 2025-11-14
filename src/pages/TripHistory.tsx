import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Trash2, Edit, MapPin, Calendar, ChevronLeft } from "lucide-react";
import { TripResults } from "@/components/TripResults";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Session } from "@supabase/supabase-js";

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  travel_days: number;
  created_at: string;
  budget_per_person: string;
  best_time_to_visit: string;
  hotels: any[];
  places_to_visit: any[];
  food_places: any[];
  attractions: any[];
  transportation: any[];
  hidden_gems: any[];
  tips: any[];
}

const TripHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      console.error("Error fetching trips:", error);
      toast({
        title: "Error",
        description: "Failed to load trip history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

      if (error) throw error;

      setTrips(trips.filter(trip => trip.id !== tripId));
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
      }
      
      toast({
        title: "Trip Deleted",
        description: "Trip has been removed from your history",
      });
    } catch (error: any) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/planner")}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Planner
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Trip History
            </h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {selectedTrip ? (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => setSelectedTrip(null)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to History
            </Button>
            <TripResults
              tripData={selectedTrip}
              fromLocation={selectedTrip.from_location}
              toLocation={selectedTrip.to_location}
              travelDays={selectedTrip.travel_days}
            />
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : trips.length === 0 ? (
              <Card className="shadow-large text-center py-12">
                <CardContent>
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">No Trips Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start planning your first trip to see it here
                  </p>
                  <Button onClick={() => navigate("/planner")}>
                    Plan New Trip
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="shadow-medium hover:shadow-large transition-smooth cursor-pointer group"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 group-hover:text-primary transition-smooth">
                            {trip.from_location} → {trip.to_location}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {trip.travel_days} days
                            </span>
                            <span className="text-xs">
                              {new Date(trip.created_at).toLocaleDateString()}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Budget:</span>{" "}
                          {trip.budget_per_person}
                        </p>
                        <p>
                          <span className="font-medium">Best Time:</span>{" "}
                          {trip.best_time_to_visit}
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedTrip(trip)}
                        >
                          View Details
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete your trip to{" "}
                                {trip.to_location}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTrip(trip.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TripHistory;
