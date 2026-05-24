// Dynamic content translation system
export interface TranslationCache {
  [key: string]: { [lang: string]: string };
}

const translationCache: TranslationCache = {};

// Auto-translate photographer profiles
export const translatePhotographerProfile = async (
  profile: any, 
  targetLanguage: string
): Promise<any> => {
  if (targetLanguage === 'en') return profile;

  const cacheKey = `${profile.id}_${targetLanguage}`;
  if (translationCache[cacheKey]) {
    return { ...profile, ...translationCache[cacheKey] };
  }

  try {
    const fieldsToTranslate = {
      bio: profile.bio,
      specialty: profile.specialty,
      tags: profile.tags?.join(', ')
    };

    const translations = await Promise.all(
      Object.entries(fieldsToTranslate).map(async ([field, text]) => {
        if (!text) return [field, text];
        const translated = await translateText(text, targetLanguage);
        return [field, translated];
      })
    );

    const translatedProfile = Object.fromEntries(translations);
    if (translatedProfile.tags) {
      translatedProfile.tags = translatedProfile.tags.split(', ');
    }

    translationCache[cacheKey] = translatedProfile;
    return { ...profile, ...translatedProfile };
  } catch (error) {
    console.error('Translation failed:', error);
    return profile;
  }
};

// Simple translation function (in production, use Google Translate API)
const translateText = async (text: string, targetLang: string): Promise<string> => {
  // Mock translation - replace with actual API
  const translations: { [key: string]: { [key: string]: string } } = {
    'Wedding Photography': {
      'es': 'Fotografía de Bodas',
      'fr': 'Photographie de Mariage',
      'de': 'Hochzeitsfotografie',
      'pt': 'Fotografia de Casamento',
      'ja': 'ウェディング撮影',
      'zh': '婚礼摄影',
      'ar': 'تصوير الزفاف'
    },
    'Portrait Photography': {
      'es': 'Fotografía de Retratos',
      'fr': 'Photographie de Portrait',
      'de': 'Porträtfotografie',
      'pt': 'Fotografia de Retrato',
      'ja': 'ポートレート撮影',
      'zh': '肖像摄影',
      'ar': 'تصوير البورتريه'
    }
  };

  return translations[text]?.[targetLang] || text;
};

export default { translatePhotographerProfile };