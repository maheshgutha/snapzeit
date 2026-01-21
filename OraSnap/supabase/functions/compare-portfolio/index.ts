import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NICHE_STANDARDS: Record<string, string> = {
  portrait: `Top portrait photographers are known for: masterful use of natural and studio lighting, shallow depth of field for subject isolation, clean/minimal backgrounds, authentic emotional expressions, flattering poses, high-quality skin retouching while maintaining natural texture, consistent warm or neutral color grading, strong eye contact compositions.`,
  wedding: `Successful wedding photographers excel at: capturing candid emotional moments, romantic lighting (golden hour, fairy lights), storytelling sequences, elegant composition, timeless editing style (not overly trendy), detail shots of dress/rings/venue, creative couple portraits, documentary-style coverage, consistent warm romantic tones.`,
  landscape: `Top landscape photographers master: golden hour/blue hour timing, leading lines and strong composition, hyperfocal distance focus, graduated ND filter techniques, dramatic sky capture, foreground interest elements, panoramic stitching, HDR for dynamic range, clean color grading emphasizing natural beauty.`,
  product: `Successful product photographers feature: clean white/gradient backgrounds, precise lighting with no harsh shadows, focus stacking for sharpness, lifestyle context shots, consistent lighting setup, high detail capture, brand-aligned color treatment, professional retouching, multiple angles coverage.`,
  fashion: `Top fashion photographers are known for: bold creative lighting, strong model direction, trend-aware styling, high-end retouching, editorial storytelling, dynamic poses, striking color palettes or moody monochromes, unique perspectives, brand-appropriate aesthetics.`,
  food: `Successful food photographers excel at: appetizing color enhancement, strategic props and styling, natural lighting preference, shallow depth of field, overhead and 45-degree angles, steam/motion capture, complementary backgrounds, warm inviting tones, texture emphasis.`,
  event: `Top event photographers master: fast-paced candid capture, available light expertise, decisive moment timing, crowd and atmosphere shots, key moment anticipation, flash techniques for dark venues, storytelling coverage, minimal post-processing for quick delivery.`,
  architecture: `Successful architecture photographers feature: perspective correction, blue hour/golden hour exteriors, interior lighting balance, wide-angle without excessive distortion, detail shots, clean geometric compositions, HDR techniques, precise verticals, context with surroundings.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls, niche } = await req.json();
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 images are required for comparison" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imageUrls.length > 6) {
      return new Response(
        JSON.stringify({ error: "Maximum 6 images allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const selectedNiche = niche?.toLowerCase() || "portrait";
    const nicheStandards = NICHE_STANDARDS[selectedNiche] || NICHE_STANDARDS.portrait;

    console.log(`Comparing ${imageUrls.length} images against ${selectedNiche} standards`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageContent = imageUrls.map(url => ({
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
            content: `You are an expert photography consultant comparing portfolios against industry standards for ${selectedNiche} photography.

INDUSTRY STANDARDS FOR ${selectedNiche.toUpperCase()} PHOTOGRAPHY:
${nicheStandards}

Analyze the provided images and return ONLY valid JSON:
{
  "overallMatch": <number 1-100>,
  "nicheAlignment": "<strong|moderate|weak>",
  "competitiveLevel": "<beginner|intermediate|advanced|professional|elite>",
  "meetsStandards": [
    {"standard": "description", "score": <1-10>, "yourLevel": "what you do well"}
  ],
  "gaps": [
    {"standard": "what top photographers do", "gap": "what's missing in your work", "priority": "<high|medium|low>"}
  ],
  "uniqueStrengths": ["strength1", "strength2"],
  "actionPlan": [
    {"action": "specific improvement", "impact": "<high|medium|low>", "difficulty": "<easy|moderate|challenging>"}
  ],
  "marketPosition": "2-3 sentence assessment of where this portfolio stands in the ${selectedNiche} market",
  "topTip": "Single most impactful thing to focus on"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Compare my ${selectedNiche} photography portfolio against successful photographers in this niche. What standards do I meet? Where are my gaps? How can I compete better?`
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
        JSON.stringify({ error: "Failed to analyze portfolio" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("Portfolio comparison complete");

    let analysis;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      analysis = JSON.parse(jsonMatch[1] || content);
    } catch {
      console.error("Failed to parse AI response:", content);
      analysis = {
        overallMatch: 50,
        nicheAlignment: "moderate",
        competitiveLevel: "intermediate",
        meetsStandards: [],
        gaps: [],
        uniqueStrengths: ["Analysis completed"],
        actionPlan: [{ action: content, impact: "high", difficulty: "moderate" }],
        marketPosition: "Unable to fully parse analysis. See action plan for details.",
        topTip: "Review the full analysis for insights."
      };
    }

    // Add niche context to response
    analysis.niche = selectedNiche;
    analysis.nicheDescription = nicheStandards;

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in compare-portfolio:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
