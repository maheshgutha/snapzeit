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
    const { imageUrl, context } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating captions for image:', imageUrl);
    console.log('Context:', context || 'None provided');

    const prompt = `Analyze this portfolio photograph and generate multiple caption suggestions optimized for different platforms.

${context ? `Additional context from photographer: ${context}` : ''}

Please provide caption suggestions in the following JSON format:
{
  "imageDescription": "A brief 1-2 sentence description of what's in the image",
  "captions": {
    "instagram": {
      "short": "A punchy 1-line caption with 2-3 relevant hashtags",
      "long": "A 2-3 sentence engaging caption with storytelling element and 5-8 hashtags"
    },
    "seo": {
      "title": "SEO-optimized title (50-60 characters)",
      "altText": "Descriptive alt text for accessibility and SEO (100-125 characters)",
      "description": "Meta description for portfolio page (150-160 characters)"
    },
    "linkedin": "Professional caption suitable for LinkedIn (2-3 sentences, no hashtags)",
    "pinterest": "Pinterest-optimized description with keywords (2-3 sentences)"
  },
  "keywords": ["array", "of", "relevant", "seo", "keywords"],
  "mood": "The emotional tone/mood of the image",
  "suggestedHashtags": ["array", "of", "15", "relevant", "hashtags", "without", "the", "hash", "symbol"]
}

Focus on:
- Authentic, engaging language that reflects the photographer's style
- Platform-specific best practices
- SEO optimization with relevant keywords
- Accessibility considerations for alt text
- Trending and niche-specific hashtags for photography`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response received, parsing...');

    // Parse JSON from the response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Return raw content if parsing fails
      result = {
        raw: content,
        parseError: true
      };
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating captions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate captions';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
