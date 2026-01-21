import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageAnalysis {
  imageUrl: string;
  score: number;
  strengths: string[];
  suggestions: string[];
  category: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls } = await req.json();
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      console.error("No image URLs provided");
      return new Response(
        JSON.stringify({ error: "At least one image URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imageUrls.length > 10) {
      return new Response(
        JSON.stringify({ error: "Maximum 10 images allowed per batch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing batch of ${imageUrls.length} images`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze each image
    const analyses: ImageAnalysis[] = [];
    
    for (const imageUrl of imageUrls) {
      try {
        console.log(`Analyzing image: ${imageUrl.substring(0, 50)}...`);
        
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
                content: `You are an expert photography consultant analyzing portfolio images. Return ONLY valid JSON with:
{
  "score": <number 1-10>,
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "category": "<portrait|landscape|event|product|other>"
}
Be concise. Max 2 strengths, max 2 suggestions.`
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Analyze this portfolio image briefly." },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ]
          }),
        });

        if (!response.ok) {
          console.error(`Failed to analyze image: ${response.status}`);
          analyses.push({
            imageUrl,
            score: 0,
            strengths: [],
            suggestions: ["Could not analyze this image"],
            category: "unknown"
          });
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        
        // Parse JSON from response
        let parsed;
        try {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                            content.match(/```\s*([\s\S]*?)\s*```/) ||
                            [null, content];
          parsed = JSON.parse(jsonMatch[1] || content);
        } catch {
          parsed = { score: 5, strengths: ["Image received"], suggestions: [content], category: "other" };
        }

        analyses.push({
          imageUrl,
          score: parsed.score || 5,
          strengths: parsed.strengths || [],
          suggestions: parsed.suggestions || [],
          category: parsed.category || "other"
        });

      } catch (error) {
        console.error(`Error analyzing image:`, error);
        analyses.push({
          imageUrl,
          score: 0,
          strengths: [],
          suggestions: ["Error analyzing this image"],
          category: "unknown"
        });
      }
    }

    // Calculate overall portfolio score and summary
    const validScores = analyses.filter(a => a.score > 0).map(a => a.score);
    const overallScore = validScores.length > 0 
      ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
      : 0;

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    analyses.forEach(a => {
      categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    });

    // Find common themes in suggestions
    const allSuggestions = analyses.flatMap(a => a.suggestions);
    const allStrengths = analyses.flatMap(a => a.strengths);

    // Generate portfolio summary
    const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are a photography portfolio consultant. Provide a brief 2-3 sentence portfolio summary based on the analysis data. Be encouraging but constructive."
          },
          {
            role: "user",
            content: `Portfolio analysis data:
- Overall score: ${overallScore}/10
- ${analyses.length} images analyzed
- Categories: ${JSON.stringify(categoryCount)}
- Common strengths: ${allStrengths.slice(0, 5).join(", ")}
- Common areas to improve: ${allSuggestions.slice(0, 5).join(", ")}

Provide a brief portfolio summary.`
          }
        ]
      }),
    });

    let portfolioSummary = "Your portfolio shows good potential. Focus on consistency across your images.";
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      portfolioSummary = summaryData.choices?.[0]?.message?.content || portfolioSummary;
    }

    const result = {
      overallScore,
      totalImages: analyses.length,
      categoryBreakdown: categoryCount,
      portfolioSummary,
      topStrengths: [...new Set(allStrengths)].slice(0, 5),
      topSuggestions: [...new Set(allSuggestions)].slice(0, 5),
      imageAnalyses: analyses
    };

    console.log(`Batch analysis complete. Overall score: ${overallScore}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-portfolio-batch:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
