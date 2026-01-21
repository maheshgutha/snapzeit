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
    const { clientName, eventType, styleKeywords, colorPreferences, inspirationNotes, referenceImageUrls } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating mood board for:', { clientName, eventType, styleKeywords });

    const systemPrompt = `You are an expert photography creative director and mood board curator. Your role is to help photographers understand their client's visual preferences and create detailed mood board concepts.

When given client preferences, generate a comprehensive mood board concept that includes:
1. A cohesive visual theme and aesthetic direction
2. Specific color palette recommendations with hex codes
3. Lighting style suggestions
4. Composition and framing ideas
5. Location/backdrop recommendations
6. Wardrobe and styling suggestions
7. Props and accessory ideas
8. Mood and emotion keywords
9. Reference photography styles and photographers to draw inspiration from
10. Specific shot list ideas

Be creative, specific, and practical. Your recommendations should be actionable for the photographer.`;

    const userPrompt = `Create a detailed mood board concept for a photography session with these client preferences:

Client Name: ${clientName || 'Not specified'}
Event/Session Type: ${eventType || 'General photography session'}
Style Keywords: ${styleKeywords?.join(', ') || 'Not specified'}
Color Preferences: ${colorPreferences?.join(', ') || 'Not specified'}
Additional Notes/Inspiration: ${inspirationNotes || 'None provided'}
${referenceImageUrls?.length ? `Reference Images Provided: ${referenceImageUrls.length} images` : ''}

Please provide a comprehensive mood board concept with specific, actionable recommendations for the photographer.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_mood_board',
              description: 'Generate a comprehensive mood board concept for a photography session',
              parameters: {
                type: 'object',
                properties: {
                  theme: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: 'Creative title for the mood board' },
                      description: { type: 'string', description: 'Overall aesthetic direction and vision' },
                      keywords: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Key mood/vibe words'
                      }
                    },
                    required: ['title', 'description', 'keywords']
                  },
                  colorPalette: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        hex: { type: 'string' },
                        usage: { type: 'string' }
                      },
                      required: ['name', 'hex', 'usage']
                    },
                    description: 'Recommended color palette with 4-6 colors'
                  },
                  lighting: {
                    type: 'object',
                    properties: {
                      style: { type: 'string' },
                      timeOfDay: { type: 'string' },
                      techniques: { 
                        type: 'array', 
                        items: { type: 'string' } 
                      },
                      tips: { type: 'string' }
                    },
                    required: ['style', 'timeOfDay', 'techniques', 'tips']
                  },
                  composition: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        technique: { type: 'string' },
                        description: { type: 'string' }
                      },
                      required: ['technique', 'description']
                    },
                    description: 'Composition and framing suggestions'
                  },
                  locations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        description: { type: 'string' },
                        considerations: { type: 'string' }
                      },
                      required: ['type', 'description']
                    },
                    description: 'Location/backdrop recommendations'
                  },
                  styling: {
                    type: 'object',
                    properties: {
                      wardrobe: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Wardrobe suggestions'
                      },
                      accessories: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Accessory ideas'
                      },
                      props: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Props to consider'
                      },
                      avoidItems: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Items to avoid'
                      }
                    },
                    required: ['wardrobe', 'accessories', 'props']
                  },
                  shotList: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        shot: { type: 'string' },
                        description: { type: 'string' },
                        priority: { type: 'string', enum: ['must-have', 'nice-to-have', 'creative-extra'] }
                      },
                      required: ['shot', 'description', 'priority']
                    },
                    description: 'Specific shot ideas with priority'
                  },
                  inspirationReferences: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        reference: { type: 'string' },
                        whatToEmulate: { type: 'string' }
                      },
                      required: ['reference', 'whatToEmulate']
                    },
                    description: 'Photography styles and references to draw from'
                  }
                },
                required: ['theme', 'colorPalette', 'lighting', 'composition', 'locations', 'styling', 'shotList', 'inspirationReferences']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_mood_board' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_mood_board') {
      throw new Error('Invalid response from AI');
    }

    const moodBoard = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ 
      success: true, 
      moodBoard,
      clientName,
      eventType,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating mood board:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate mood board' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
