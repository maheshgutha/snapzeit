// Natural Language Processing for Client Requirements
export interface ClientIntent {
  eventType: string;
  style: string[];
  mood: string[];
  location: string;
  budget: number;
  urgency: 'low' | 'medium' | 'high';
  specialRequests: string[];
  confidence: number;
}

const STYLE_KEYWORDS = {
  'candid': ['natural', 'candid', 'spontaneous', 'unposed', 'documentary'],
  'formal': ['formal', 'traditional', 'classic', 'posed', 'structured'],
  'artistic': ['artistic', 'creative', 'unique', 'abstract', 'experimental'],
  'vintage': ['vintage', 'retro', 'film', 'analog', 'nostalgic'],
  'modern': ['modern', 'contemporary', 'clean', 'minimalist', 'sleek']
};

const MOOD_KEYWORDS = {
  'romantic': ['romantic', 'intimate', 'soft', 'dreamy', 'tender'],
  'fun': ['fun', 'playful', 'energetic', 'vibrant', 'lively'],
  'elegant': ['elegant', 'sophisticated', 'classy', 'refined', 'graceful'],
  'dramatic': ['dramatic', 'bold', 'intense', 'moody', 'striking']
};

const EVENT_KEYWORDS = {
  'wedding': ['wedding', 'marriage', 'ceremony', 'reception', 'bridal'],
  'portrait': ['portrait', 'headshot', 'family', 'individual', 'personal'],
  'event': ['event', 'party', 'celebration', 'corporate', 'conference'],
  'maternity': ['maternity', 'pregnancy', 'expecting', 'baby bump', 'newborn']
};

export const parseClientDescription = (description: string): ClientIntent => {
  const text = description.toLowerCase();
  const words = text.split(/\s+/);
  
  // Extract event type
  let eventType = 'portrait';
  let eventConfidence = 0;
  for (const [event, keywords] of Object.entries(EVENT_KEYWORDS)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > eventConfidence) {
      eventType = event;
      eventConfidence = matches;
    }
  }
  
  // Extract style preferences
  const styles: string[] = [];
  for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      styles.push(style);
    }
  }
  
  // Extract mood preferences
  const moods: string[] = [];
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      moods.push(mood);
    }
  }
  
  // Extract budget (simple regex)
  const budgetMatch = text.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  const budget = budgetMatch ? parseInt(budgetMatch[1].replace(',', '')) : 0;
  
  // Extract urgency
  let urgency: 'low' | 'medium' | 'high' = 'medium';
  if (text.includes('urgent') || text.includes('asap') || text.includes('soon')) {
    urgency = 'high';
  } else if (text.includes('flexible') || text.includes('no rush')) {
    urgency = 'low';
  }
  
  // Extract location
  const locationMatch = text.match(/in\s+([a-zA-Z\s]+?)(?:\s|$|,)/);
  const location = locationMatch ? locationMatch[1].trim() : '';
  
  // Extract special requests
  const specialRequests: string[] = [];
  if (text.includes('outdoor')) specialRequests.push('outdoor_preferred');
  if (text.includes('indoor')) specialRequests.push('indoor_preferred');
  if (text.includes('travel')) specialRequests.push('travel_required');
  if (text.includes('editing')) specialRequests.push('editing_included');
  
  const confidence = Math.min(0.95, 0.5 + (eventConfidence * 0.1) + (styles.length * 0.1) + (moods.length * 0.1));
  
  return {
    eventType,
    style: styles,
    mood: moods,
    location,
    budget,
    urgency,
    specialRequests,
    confidence
  };
};

export const generateSearchQuery = (intent: ClientIntent): string => {
  const parts = [intent.eventType];
  if (intent.style.length > 0) parts.push(...intent.style);
  if (intent.mood.length > 0) parts.push(...intent.mood);
  if (intent.location) parts.push(intent.location);
  return parts.join(' ');
};

export const enhanceUserPreferences = (description: string, currentPrefs: any) => {
  const intent = parseClientDescription(description);
  
  return {
    ...currentPrefs,
    eventType: intent.eventType,
    style: [...(currentPrefs.style || []), ...intent.style],
    mood: intent.mood,
    location: intent.location || currentPrefs.location,
    budget: intent.budget || currentPrefs.budget,
    urgency: intent.urgency,
    specialRequests: intent.specialRequests
  };
};

export default { parseClientDescription, generateSearchQuery, enhanceUserPreferences };