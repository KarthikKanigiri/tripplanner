import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fromLocation, toLocation, travelDays } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating trip plan from ${fromLocation} to ${toLocation} for ${travelDays} days`);

    const systemPrompt = `You are an expert travel planner. Generate comprehensive travel information in valid JSON format only. Return a JSON object with these exact keys: hotels, places_to_visit, food_places, attractions, transportation, hidden_gems, tips, budget_per_person, best_time_to_visit.

For each category (except budget_per_person and best_time_to_visit which are strings):
- Return an array of objects
- Each object should have: name, description, price_range (or price for budget), rating, tips
- For transportation: include modes and estimated costs
- Be specific and detailed
- Include actual places and recommendations

Example format:
{
  "hotels": [{"name": "Hotel Name", "description": "...", "price_range": "$100-150/night", "rating": "4.5/5", "tips": "..."}],
  "places_to_visit": [...],
  "food_places": [...],
  "attractions": [...],
  "transportation": [{"name": "Taxi", "description": "...", "price": "$20-30", "tips": "..."}],
  "hidden_gems": [...],
  "tips": [{"name": "General Tip", "description": "...", "tips": "..."}],
  "budget_per_person": "$1500-2000 for the entire trip",
  "best_time_to_visit": "March to May"
}`;

    const userPrompt = `Generate a complete travel plan from ${fromLocation} to ${toLocation} for ${travelDays} days. Include:
- 3-5 hotel recommendations with prices
- 5-7 must-visit places
- 5-7 food places and local cuisine
- 3-5 main attractions
- Transportation options and costs
- 3-5 hidden gems
- 5-7 useful tips for travelers
- Overall budget estimate per person
- Best time to visit

Return ONLY valid JSON, no markdown formatting or explanations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("Raw AI response:", content);
    
    // Clean up the response to extract JSON
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();
    
    const tripData = JSON.parse(cleanedContent);
    
    console.log("Successfully generated trip plan");

    return new Response(
      JSON.stringify(tripData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in generate-trip-plan:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate trip plan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});