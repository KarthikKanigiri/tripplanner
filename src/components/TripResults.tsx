import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Hotel, MapPin, UtensilsCrossed, Camera, Bus, Sparkles, Lightbulb, DollarSign, Calendar } from "lucide-react";

interface TripResultsProps {
  tripData: any;
  fromLocation: string;
  toLocation: string;
  travelDays: number;
}

export const TripResults = ({ tripData, fromLocation, toLocation, travelDays }: TripResultsProps) => {
  const renderItems = (items: any[], icon: React.ReactNode) => {
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground">No data available</p>;
    }

    return (
      <div className="grid gap-4">
        {items.map((item, index) => (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {icon}
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </div>
                {item.rating && (
                  <Badge variant="secondary" className="ml-2">
                    ⭐ {item.rating}
                  </Badge>
                )}
              </div>
              {item.price_range && (
                <CardDescription className="font-medium text-accent">
                  {item.price_range}
                </CardDescription>
              )}
              {item.price && (
                <CardDescription className="font-medium text-accent">
                  {item.price}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{item.description}</p>
              {item.tips && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium flex items-center gap-1 mb-1">
                    <Lightbulb className="h-4 w-4" />
                    Tip:
                  </p>
                  <p className="text-sm text-muted-foreground">{item.tips}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="shadow-large bg-gradient-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-3xl">
            {fromLocation} → {toLocation}
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 text-lg">
            {travelDays} Day Trip Plan
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
            <DollarSign className="h-6 w-6" />
            <div>
              <p className="text-sm opacity-90">Budget Per Person</p>
              <p className="font-semibold text-lg">{tripData.budget_per_person}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg">
            <Calendar className="h-6 w-6" />
            <div>
              <p className="text-sm opacity-90">Best Time to Visit</p>
              <p className="font-semibold text-lg">{tripData.best_time_to_visit}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="hotels" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto gap-2">
          <TabsTrigger value="hotels" className="flex items-center gap-1">
            <Hotel className="h-4 w-4" />
            <span className="hidden sm:inline">Hotels</span>
          </TabsTrigger>
          <TabsTrigger value="places" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Places</span>
          </TabsTrigger>
          <TabsTrigger value="food" className="flex items-center gap-1">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden sm:inline">Food</span>
          </TabsTrigger>
          <TabsTrigger value="attractions" className="flex items-center gap-1">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Attractions</span>
          </TabsTrigger>
          <TabsTrigger value="transport" className="flex items-center gap-1">
            <Bus className="h-4 w-4" />
            <span className="hidden sm:inline">Transport</span>
          </TabsTrigger>
          <TabsTrigger value="gems" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Hidden Gems</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Tips</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Hotel Recommendations</h3>
          {renderItems(tripData.hotels, <Hotel className="h-5 w-5 text-primary" />)}
        </TabsContent>

        <TabsContent value="places" className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Must-Visit Places</h3>
          {renderItems(tripData.places_to_visit, <MapPin className="h-5 w-5 text-primary" />)}
        </TabsContent>

        <TabsContent value="food" className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Food & Dining</h3>
          {renderItems(tripData.food_places, <UtensilsCrossed className="h-5 w-5 text-primary" />)}
        </TabsContent>

        <TabsContent value="attractions" className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Top Attractions</h3>
          {renderItems(tripData.attractions, <Camera className="h-5 w-5 text-primary" />)}
        </TabsContent>

        <TabsContent value="transport" className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Transportation Options</h3>
          {renderItems(tripData.transportation, <Bus className="h-5 w-5 text-primary" />)}
        </TabsContent>

        <TabsContent value="gems" className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Hidden Gems</h3>
          {renderItems(tripData.hidden_gems, <Sparkles className="h-5 w-5 text-primary" />)}
        </TabsContent>

        <TabsContent value="tips" className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Travel Tips</h3>
          {renderItems(tripData.tips, <Lightbulb className="h-5 w-5 text-primary" />)}
        </TabsContent>
      </Tabs>
    </div>
  );
};