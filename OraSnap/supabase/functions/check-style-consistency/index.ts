import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls, userId } = await req.json();
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 images are required for consistency analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imageUrls.length > 8) {
      return new Response(
        JSON.stringify({ error: "Maximum 8 images allowed for style analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify photographer or admin role if userId is provided
    if (userId) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (roleData?.role !== 'photographer' && roleData?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: "Access denied: Photographer role required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Checking style consistency for ${imageUrls.length} images`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build image content for the AI
    const imageContent = imageUrls.map((url, i) => ({
      type: "image_url",
      image_url: { url }
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert photography brand consultant analyzing portfolio images for visual consistency. 
Analyze ALL provided images together and return ONLY valid JSON with this exact structure:
{
  "consistencyScore": <number 1-100>,
  "styleProfile": {
    "dominantColorPalette": ["color1", "color2", "color3"],
    "lightingStyle": "<natural|studio|dramatic|soft|mixed>",
    "compositionStyle": "<centered|rule-of-thirds|dynamic|minimal|varied>",
    "editingStyle": "<warm|cool|neutral|high-contrast|muted|vibrant>",
    "mood": "<professional|artistic|casual|moody|bright|varied>"
  },
  "consistentElements": ["element1", "element2", "element3"],
  "inconsistencies": [
    {"issue": "description", "severity": "<high|medium|low>", "affectedImages": [1, 3]}
  ],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "brandIdentityStrength": "<strong|moderate|weak>",
  "summary": "2-3 sentence summary of the portfolio's visual identity"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze these ${imageUrls.length} portfolio images for style consistency. Identify what elements are consistent, what's inconsistent, and provide actionable recommendations to improve visual cohesion.`
              },
              ...imageContent
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze images" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("Style analysis complete");

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      analysis = JSON.parse(jsonMatch[1] || content);
    } catch {
      console.error("Failed to parse AI response:", content);
      analysis = {
        consistencyScore: 50,
        styleProfile: {
          dominantColorPalette: ["varied"],
          lightingStyle: "mixed",
          compositionStyle: "varied",
          editingStyle: "neutral",
          mood: "varied"
        },
        consistentElements: ["Unable to fully parse analysis"],
        inconsistencies: [],
        recommendations: [content],
        brandIdentityStrength: "moderate",
        summary: "Analysis completed but structured parsing failed. See recommendations for details."
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in check-style-consistency:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
