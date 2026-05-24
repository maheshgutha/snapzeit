// Sentiment Analysis for Review Analysis and Better Matching
export interface SentimentScore {
  overall: number; // -1 to 1
  aspects: {
    quality: number;
    communication: number;
    professionalism: number;
    value: number;
    timeliness: number;
  };
  confidence: number;
  keyPhrases: string[];
}

export interface ReviewInsights {
  photographerId: string;
  avgSentiment: number;
  aspectScores: { [key: string]: number };
  strengths: string[];
  weaknesses: string[];
  recommendationScore: number;
}

const POSITIVE_WORDS = [
  'amazing', 'excellent', 'outstanding', 'perfect', 'wonderful', 'fantastic',
  'professional', 'talented', 'creative', 'beautiful', 'stunning', 'incredible',
  'recommend', 'satisfied', 'happy', 'pleased', 'impressed', 'exceeded'
];

const NEGATIVE_WORDS = [
  'terrible', 'awful', 'horrible', 'disappointing', 'unprofessional', 'late',
  'poor', 'bad', 'worst', 'unsatisfied', 'unhappy', 'frustrated', 'rude',
  'overpriced', 'expensive', 'slow', 'delayed', 'cancelled'
];

const ASPECT_KEYWORDS = {
  quality: ['quality', 'photos', 'pictures', 'images', 'shots', 'editing', 'resolution'],
  communication: ['communication', 'responsive', 'contact', 'reply', 'answer', 'available'],
  professionalism: ['professional', 'punctual', 'organized', 'prepared', 'courteous', 'respectful'],
  value: ['price', 'cost', 'value', 'worth', 'expensive', 'affordable', 'reasonable'],
  timeliness: ['time', 'schedule', 'delivery', 'deadline', 'prompt', 'quick', 'fast', 'late']
};

export const analyzeSentiment = (reviewText: string): SentimentScore => {
  const text = reviewText.toLowerCase();
  const words = text.split(/\s+/);
  
  // Overall sentiment calculation
  let positiveScore = 0;
  let negativeScore = 0;
  
  POSITIVE_WORDS.forEach(word => {
    const matches = (text.match(new RegExp(word, 'g')) || []).length;
    positiveScore += matches;
  });
  
  NEGATIVE_WORDS.forEach(word => {
    const matches = (text.match(new RegExp(word, 'g')) || []).length;
    negativeScore += matches;
  });
  
  const totalWords = words.length;
  const overall = totalWords > 0 ? 
    (positiveScore - negativeScore) / Math.max(totalWords * 0.1, 1) : 0;
  
  // Aspect-based sentiment
  const aspects = {
    quality: calculateAspectSentiment(text, 'quality'),
    communication: calculateAspectSentiment(text, 'communication'),
    professionalism: calculateAspectSentiment(text, 'professionalism'),
    value: calculateAspectSentiment(text, 'value'),
    timeliness: calculateAspectSentiment(text, 'timeliness')
  };
  
  // Extract key phrases
  const keyPhrases = extractKeyPhrases(text);
  
  const confidence = Math.min(0.95, 0.5 + (positiveScore + negativeScore) * 0.05);
  
  return {
    overall: Math.max(-1, Math.min(1, overall)),
    aspects,
    confidence,
    keyPhrases
  };
};

const calculateAspectSentiment = (text: string, aspect: keyof typeof ASPECT_KEYWORDS): number => {
  const keywords = ASPECT_KEYWORDS[aspect];
  let aspectScore = 0;
  let mentions = 0;
  
  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      mentions++;
      // Check surrounding words for sentiment
      const keywordIndex = text.indexOf(keyword);
      const context = text.substring(
        Math.max(0, keywordIndex - 50),
        Math.min(text.length, keywordIndex + 50)
      );
      
      let contextScore = 0;
      POSITIVE_WORDS.forEach(pos => {
        if (context.includes(pos)) contextScore += 1;
      });
      NEGATIVE_WORDS.forEach(neg => {
        if (context.includes(neg)) contextScore -= 1;
      });
      
      aspectScore += contextScore;
    }
  });
  
  return mentions > 0 ? Math.max(-1, Math.min(1, aspectScore / mentions)) : 0;
};

const extractKeyPhrases = (text: string): string[] => {
  // Simple key phrase extraction
  const phrases = [];
  
  // Look for common positive/negative phrases
  if (text.includes('highly recommend')) phrases.push('highly recommend');
  if (text.includes('exceeded expectations')) phrases.push('exceeded expectations');
  if (text.includes('professional service')) phrases.push('professional service');
  if (text.includes('great communication')) phrases.push('great communication');
  if (text.includes('on time')) phrases.push('on time');
  if (text.includes('beautiful photos')) phrases.push('beautiful photos');
  
  return phrases;
};

export const analyzePhotographerReviews = (reviews: any[]): ReviewInsights => {
  if (reviews.length === 0) {
    return {
      photographerId: '',
      avgSentiment: 0,
      aspectScores: {},
      strengths: [],
      weaknesses: [],
      recommendationScore: 0
    };
  }
  
  const sentiments = reviews.map(review => analyzeSentiment(review.text || review.comment));
  
  // Calculate averages
  const avgSentiment = sentiments.reduce((sum, s) => sum + s.overall, 0) / sentiments.length;
  
  const aspectScores = {
    quality: sentiments.reduce((sum, s) => sum + s.aspects.quality, 0) / sentiments.length,
    communication: sentiments.reduce((sum, s) => sum + s.aspects.communication, 0) / sentiments.length,
    professionalism: sentiments.reduce((sum, s) => sum + s.aspects.professionalism, 0) / sentiments.length,
    value: sentiments.reduce((sum, s) => sum + s.aspects.value, 0) / sentiments.length,
    timeliness: sentiments.reduce((sum, s) => sum + s.aspects.timeliness, 0) / sentiments.length
  };
  
  // Identify strengths and weaknesses
  const strengths = [];
  const weaknesses = [];
  
  Object.entries(aspectScores).forEach(([aspect, score]) => {
    if (score > 0.3) {
      strengths.push(aspect);
    } else if (score < -0.2) {
      weaknesses.push(aspect);
    }
  });
  
  // Calculate recommendation score
  const recommendationScore = Math.max(0, Math.min(100, 
    50 + (avgSentiment * 30) + (reviews.length > 10 ? 10 : reviews.length)
  ));
  
  return {
    photographerId: reviews[0]?.photographerId || '',
    avgSentiment,
    aspectScores,
    strengths,
    weaknesses,
    recommendationScore
  };
};

export const getMatchingScore = (
  photographerInsights: ReviewInsights,
  userPriorities: string[]
): number => {
  let matchScore = photographerInsights.recommendationScore;
  
  // Boost score if photographer's strengths match user priorities
  userPriorities.forEach(priority => {
    if (photographerInsights.strengths.includes(priority)) {
      matchScore += 10;
    }
    if (photographerInsights.weaknesses.includes(priority)) {
      matchScore -= 15;
    }
  });
  
  return Math.max(0, Math.min(100, matchScore));
};

export const generateReviewSummary = (insights: ReviewInsights): string => {
  const { avgSentiment, strengths, weaknesses, recommendationScore } = insights;
  
  let summary = '';
  
  if (avgSentiment > 0.3) {
    summary += 'Highly rated photographer with ';
  } else if (avgSentiment > 0) {
    summary += 'Well-regarded photographer with ';
  } else {
    summary += 'Photographer with mixed reviews, ';
  }
  
  if (strengths.length > 0) {
    summary += `strong ${strengths.join(' and ')}. `;
  }
  
  if (weaknesses.length > 0) {
    summary += `Some concerns about ${weaknesses.join(' and ')}. `;
  }
  
  summary += `Overall recommendation score: ${Math.round(recommendationScore)}%.`;
  
  return summary;
};

export default {
  analyzeSentiment,
  analyzePhotographerReviews,
  getMatchingScore,
  generateReviewSummary
};