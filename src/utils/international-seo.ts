// International SEO and localization utilities - Expanded to 50+ countries
export interface CountryData {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  language: string;
  timezone: string;
  continent: string;
  popular: boolean;
  paymentMethods: string[];
  priceMultiplier: number;
  supportPhone: string;
  culturalPrefs: string[];
}

export const COUNTRIES: CountryData[] = [
  // North America
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', language: 'en', timezone: 'America/New_York', continent: 'North America', popular: true, paymentMethods: ['card', 'paypal', 'apple_pay'], priceMultiplier: 1.0, supportPhone: '+1-800-672-7627', culturalPrefs: ['candid', 'natural', 'documentary'] },
  { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$', language: 'en', timezone: 'America/Toronto', continent: 'North America', popular: true, paymentMethods: ['card', 'paypal', 'interac'], priceMultiplier: 1.3, supportPhone: '+1-800-672-7627', culturalPrefs: ['natural', 'outdoor', 'lifestyle'] },
  { code: 'MX', name: 'Mexico', currency: 'MXN', currencySymbol: '$', language: 'es', timezone: 'America/Mexico_City', continent: 'North America', popular: true, paymentMethods: ['card', 'oxxo', 'spei'], priceMultiplier: 20.0, supportPhone: '+52-800-123-4567', culturalPrefs: ['vibrant', 'family', 'celebration'] },

  // Europe
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', language: 'en', timezone: 'Europe/London', continent: 'Europe', popular: true, paymentMethods: ['card', 'paypal', 'bacs'], priceMultiplier: 0.8, supportPhone: '+44-800-123-456', culturalPrefs: ['traditional', 'elegant', 'countryside'] },
  { code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€', language: 'de', timezone: 'Europe/Berlin', continent: 'Europe', popular: true, paymentMethods: ['card', 'sepa', 'sofort'], priceMultiplier: 0.9, supportPhone: '+49-800-123-456', culturalPrefs: ['precise', 'professional', 'minimalist'] },
  { code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€', language: 'fr', timezone: 'Europe/Paris', continent: 'Europe', popular: true, paymentMethods: ['card', 'sepa', 'paypal'], priceMultiplier: 0.9, supportPhone: '+33-800-123-456', culturalPrefs: ['artistic', 'romantic', 'fashion'] },
  { code: 'ES', name: 'Spain', currency: 'EUR', currencySymbol: '€', language: 'es', timezone: 'Europe/Madrid', continent: 'Europe', popular: true, paymentMethods: ['card', 'sepa', 'bizum'], priceMultiplier: 0.85, supportPhone: '+34-800-123-456', culturalPrefs: ['warm', 'family', 'celebration'] },
  { code: 'IT', name: 'Italy', currency: 'EUR', currencySymbol: '€', language: 'it', timezone: 'Europe/Rome', continent: 'Europe', popular: true, paymentMethods: ['card', 'sepa', 'postepay'], priceMultiplier: 0.9, supportPhone: '+39-800-123-456', culturalPrefs: ['artistic', 'romantic', 'heritage'] },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', currencySymbol: '€', language: 'nl', timezone: 'Europe/Amsterdam', continent: 'Europe', popular: false, paymentMethods: ['card', 'ideal', 'sepa'], priceMultiplier: 0.95, supportPhone: '+31-800-123-456', culturalPrefs: ['natural', 'candid', 'modern'] },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', currencySymbol: 'CHF', language: 'de', timezone: 'Europe/Zurich', continent: 'Europe', popular: false, paymentMethods: ['card', 'twint', 'sepa'], priceMultiplier: 1.1, supportPhone: '+41-800-123-456', culturalPrefs: ['precise', 'luxury', 'alpine'] },
  { code: 'SE', name: 'Sweden', currency: 'SEK', currencySymbol: 'kr', language: 'sv', timezone: 'Europe/Stockholm', continent: 'Europe', popular: false, paymentMethods: ['card', 'swish', 'sepa'], priceMultiplier: 10.5, supportPhone: '+46-800-123-456', culturalPrefs: ['minimalist', 'natural', 'modern'] },
  { code: 'NO', name: 'Norway', currency: 'NOK', currencySymbol: 'kr', language: 'no', timezone: 'Europe/Oslo', continent: 'Europe', popular: false, paymentMethods: ['card', 'vipps', 'sepa'], priceMultiplier: 11.0, supportPhone: '+47-800-123-456', culturalPrefs: ['natural', 'outdoor', 'fjord'] },
  { code: 'DK', name: 'Denmark', currency: 'DKK', currencySymbol: 'kr', language: 'da', timezone: 'Europe/Copenhagen', continent: 'Europe', popular: false, paymentMethods: ['card', 'mobilepay', 'sepa'], priceMultiplier: 7.0, supportPhone: '+45-800-123-456', culturalPrefs: ['hygge', 'cozy', 'modern'] },
  { code: 'FI', name: 'Finland', currency: 'EUR', currencySymbol: '€', language: 'fi', timezone: 'Europe/Helsinki', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'siirto'], priceMultiplier: 0.9, supportPhone: '+358-800-123-456', culturalPrefs: ['natural', 'minimalist', 'forest'] },
  { code: 'AT', name: 'Austria', currency: 'EUR', currencySymbol: '€', language: 'de', timezone: 'Europe/Vienna', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'eps'], priceMultiplier: 0.9, supportPhone: '+43-800-123-456', culturalPrefs: ['classical', 'elegant', 'alpine'] },
  { code: 'BE', name: 'Belgium', currency: 'EUR', currencySymbol: '€', language: 'nl', timezone: 'Europe/Brussels', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'bancontact'], priceMultiplier: 0.9, supportPhone: '+32-800-123-456', culturalPrefs: ['artistic', 'heritage', 'cozy'] },
  { code: 'PT', name: 'Portugal', currency: 'EUR', currencySymbol: '€', language: 'pt', timezone: 'Europe/Lisbon', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'mbway'], priceMultiplier: 0.8, supportPhone: '+351-800-123-456', culturalPrefs: ['warm', 'coastal', 'traditional'] },
  { code: 'IE', name: 'Ireland', currency: 'EUR', currencySymbol: '€', language: 'en', timezone: 'Europe/Dublin', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'paypal'], priceMultiplier: 0.9, supportPhone: '+353-800-123-456', culturalPrefs: ['natural', 'countryside', 'storytelling'] },
  { code: 'PL', name: 'Poland', currency: 'PLN', currencySymbol: 'zł', language: 'pl', timezone: 'Europe/Warsaw', continent: 'Europe', popular: false, paymentMethods: ['card', 'blik', 'przelewy24'], priceMultiplier: 4.5, supportPhone: '+48-800-123-456', culturalPrefs: ['traditional', 'family', 'heritage'] },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK', currencySymbol: 'Kč', language: 'cs', timezone: 'Europe/Prague', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'csob'], priceMultiplier: 25.0, supportPhone: '+420-800-123-456', culturalPrefs: ['artistic', 'heritage', 'bohemian'] },

  // Asia Pacific
  { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', language: 'en', timezone: 'Asia/Kolkata', continent: 'Asia', popular: true, paymentMethods: ['card', 'upi', 'paytm'], priceMultiplier: 83.0, supportPhone: '+91-800-123-4567', culturalPrefs: ['colorful', 'traditional', 'celebration'] },
  { code: 'CN', name: 'China', currency: 'CNY', currencySymbol: '¥', language: 'zh', timezone: 'Asia/Shanghai', continent: 'Asia', popular: true, paymentMethods: ['alipay', 'wechat_pay', 'unionpay'], priceMultiplier: 7.2, supportPhone: '+86-400-123-4567', culturalPrefs: ['formal', 'group', 'prosperity'] },
  { code: 'JP', name: 'Japan', currency: 'JPY', currencySymbol: '¥', language: 'ja', timezone: 'Asia/Tokyo', continent: 'Asia', popular: true, paymentMethods: ['card', 'konbini', 'bank_transfer'], priceMultiplier: 150.0, supportPhone: '+81-800-123-456', culturalPrefs: ['precise', 'seasonal', 'minimalist'] },
  { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', language: 'en', timezone: 'Australia/Sydney', continent: 'Oceania', popular: true, paymentMethods: ['card', 'paypal', 'bpay'], priceMultiplier: 1.5, supportPhone: '+61-800-123-456', culturalPrefs: ['outdoor', 'casual', 'beach'] },
  { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: 'S$', language: 'en', timezone: 'Asia/Singapore', continent: 'Asia', popular: true, paymentMethods: ['card', 'paynow', 'grabpay'], priceMultiplier: 1.35, supportPhone: '+65-800-123-456', culturalPrefs: ['modern', 'multicultural', 'urban'] },
  { code: 'KR', name: 'South Korea', currency: 'KRW', currencySymbol: '₩', language: 'ko', timezone: 'Asia/Seoul', continent: 'Asia', popular: false, paymentMethods: ['card', 'kakaopay', 'toss'], priceMultiplier: 1300.0, supportPhone: '+82-800-123-456', culturalPrefs: ['trendy', 'k-style', 'modern'] },
  { code: 'TH', name: 'Thailand', currency: 'THB', currencySymbol: '฿', language: 'th', timezone: 'Asia/Bangkok', continent: 'Asia', popular: false, paymentMethods: ['card', 'promptpay', 'truemoney'], priceMultiplier: 36.0, supportPhone: '+66-800-123-456', culturalPrefs: ['tropical', 'temple', 'smile'] },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', currencySymbol: 'RM', language: 'en', timezone: 'Asia/Kuala_Lumpur', continent: 'Asia', popular: false, paymentMethods: ['card', 'fpx', 'grabpay'], priceMultiplier: 4.7, supportPhone: '+60-800-123-456', culturalPrefs: ['multicultural', 'tropical', 'heritage'] },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', currencySymbol: 'Rp', language: 'id', timezone: 'Asia/Jakarta', continent: 'Asia', popular: false, paymentMethods: ['card', 'gopay', 'ovo'], priceMultiplier: 15800.0, supportPhone: '+62-800-123-456', culturalPrefs: ['tropical', 'island', 'cultural'] },
  { code: 'PH', name: 'Philippines', currency: 'PHP', currencySymbol: '₱', language: 'en', timezone: 'Asia/Manila', continent: 'Asia', popular: false, paymentMethods: ['card', 'gcash', 'paymaya'], priceMultiplier: 56.0, supportPhone: '+63-800-123-456', culturalPrefs: ['tropical', 'family', 'celebration'] },
  { code: 'VN', name: 'Vietnam', currency: 'VND', currencySymbol: '₫', language: 'vi', timezone: 'Asia/Ho_Chi_Minh', continent: 'Asia', popular: false, paymentMethods: ['card', 'momo', 'zalopay'], priceMultiplier: 24000.0, supportPhone: '+84-800-123-456', culturalPrefs: ['traditional', 'nature', 'heritage'] },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', currencySymbol: 'NZ$', language: 'en', timezone: 'Pacific/Auckland', continent: 'Oceania', popular: false, paymentMethods: ['card', 'paypal', 'poli'], priceMultiplier: 1.6, supportPhone: '+64-800-123-456', culturalPrefs: ['natural', 'adventure', 'landscape'] },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD', currencySymbol: 'HK$', language: 'en', timezone: 'Asia/Hong_Kong', continent: 'Asia', popular: false, paymentMethods: ['card', 'alipay_hk', 'octopus'], priceMultiplier: 7.8, supportPhone: '+852-800-123-456', culturalPrefs: ['urban', 'modern', 'skyline'] },
  { code: 'TW', name: 'Taiwan', currency: 'TWD', currencySymbol: 'NT$', language: 'zh', timezone: 'Asia/Taipei', continent: 'Asia', popular: false, paymentMethods: ['card', 'line_pay', 'jkopay'], priceMultiplier: 31.0, supportPhone: '+886-800-123-456', culturalPrefs: ['traditional', 'night_market', 'temple'] },

  // Middle East & Africa
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', currencySymbol: 'د.إ', language: 'ar', timezone: 'Asia/Dubai', continent: 'Asia', popular: true, paymentMethods: ['card', 'apple_pay', 'samsung_pay'], priceMultiplier: 3.67, supportPhone: '+971-800-123-456', culturalPrefs: ['luxury', 'modern', 'desert'] },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', currencySymbol: 'SR', language: 'ar', timezone: 'Asia/Riyadh', continent: 'Asia', popular: false, paymentMethods: ['card', 'stc_pay', 'apple_pay'], priceMultiplier: 3.75, supportPhone: '+966-800-123-456', culturalPrefs: ['traditional', 'family', 'heritage'] },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', currencySymbol: 'R', language: 'en', timezone: 'Africa/Johannesburg', continent: 'Africa', popular: false, paymentMethods: ['card', 'eft', 'snapscan'], priceMultiplier: 18.5, supportPhone: '+27-800-123-456', culturalPrefs: ['wildlife', 'landscape', 'cultural'] },
  { code: 'EG', name: 'Egypt', currency: 'EGP', currencySymbol: 'E£', language: 'ar', timezone: 'Africa/Cairo', continent: 'Africa', popular: false, paymentMethods: ['card', 'fawry', 'vodafone_cash'], priceMultiplier: 31.0, supportPhone: '+20-800-123-456', culturalPrefs: ['heritage', 'ancient', 'nile'] },
  { code: 'IL', name: 'Israel', currency: 'ILS', currencySymbol: '₪', language: 'he', timezone: 'Asia/Jerusalem', continent: 'Asia', popular: false, paymentMethods: ['card', 'bit', 'paypal'], priceMultiplier: 3.7, supportPhone: '+972-800-123-456', culturalPrefs: ['modern', 'heritage', 'mediterranean'] },
  { code: 'TR', name: 'Turkey', currency: 'TRY', currencySymbol: '₺', language: 'tr', timezone: 'Europe/Istanbul', continent: 'Europe', popular: false, paymentMethods: ['card', 'papara', 'bkm'], priceMultiplier: 30.0, supportPhone: '+90-800-123-456', culturalPrefs: ['cultural', 'heritage', 'bosphorus'] },

  // South America
  { code: 'BR', name: 'Brazil', currency: 'BRL', currencySymbol: 'R$', language: 'pt', timezone: 'America/Sao_Paulo', continent: 'South America', popular: true, paymentMethods: ['card', 'pix', 'boleto'], priceMultiplier: 5.2, supportPhone: '+55-800-123-4567', culturalPrefs: ['vibrant', 'beach', 'carnival'] },
  { code: 'AR', name: 'Argentina', currency: 'ARS', currencySymbol: '$', language: 'es', timezone: 'America/Argentina/Buenos_Aires', continent: 'South America', popular: false, paymentMethods: ['card', 'mercadopago', 'rapipago'], priceMultiplier: 350.0, supportPhone: '+54-800-123-456', culturalPrefs: ['passionate', 'tango', 'european'] },
  { code: 'CL', name: 'Chile', currency: 'CLP', currencySymbol: '$', language: 'es', timezone: 'America/Santiago', continent: 'South America', popular: false, paymentMethods: ['card', 'khipu', 'webpay'], priceMultiplier: 900.0, supportPhone: '+56-800-123-456', culturalPrefs: ['natural', 'andes', 'wine'] },
  { code: 'CO', name: 'Colombia', currency: 'COP', currencySymbol: '$', language: 'es', timezone: 'America/Bogota', continent: 'South America', popular: false, paymentMethods: ['card', 'nequi', 'daviplata'], priceMultiplier: 4300.0, supportPhone: '+57-800-123-456', culturalPrefs: ['colorful', 'coffee', 'salsa'] },
  { code: 'PE', name: 'Peru', currency: 'PEN', currencySymbol: 'S/', language: 'es', timezone: 'America/Lima', continent: 'South America', popular: false, paymentMethods: ['card', 'yape', 'plin'], priceMultiplier: 3.8, supportPhone: '+51-800-123-456', culturalPrefs: ['heritage', 'inca', 'mountain'] },

  // Additional Countries
  { code: 'RU', name: 'Russia', currency: 'RUB', currencySymbol: '₽', language: 'ru', timezone: 'Europe/Moscow', continent: 'Europe', popular: false, paymentMethods: ['card', 'yandex_money', 'qiwi'], priceMultiplier: 90.0, supportPhone: '+7-800-123-4567', culturalPrefs: ['classical', 'winter', 'grand'] },
  { code: 'UA', name: 'Ukraine', currency: 'UAH', currencySymbol: '₴', language: 'uk', timezone: 'Europe/Kiev', continent: 'Europe', popular: false, paymentMethods: ['card', 'privat24', 'monobank'], priceMultiplier: 37.0, supportPhone: '+380-800-123-456', culturalPrefs: ['traditional', 'countryside', 'heritage'] },
  { code: 'GR', name: 'Greece', currency: 'EUR', currencySymbol: '€', language: 'el', timezone: 'Europe/Athens', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'paypal'], priceMultiplier: 0.9, supportPhone: '+30-800-123-456', culturalPrefs: ['mediterranean', 'island', 'ancient'] },
  { code: 'HR', name: 'Croatia', currency: 'EUR', currencySymbol: '€', language: 'hr', timezone: 'Europe/Zagreb', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'keks'], priceMultiplier: 0.9, supportPhone: '+385-800-123-456', culturalPrefs: ['coastal', 'heritage', 'adriatic'] },
  { code: 'HU', name: 'Hungary', currency: 'HUF', currencySymbol: 'Ft', language: 'hu', timezone: 'Europe/Budapest', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'simple'], priceMultiplier: 380.0, supportPhone: '+36-800-123-456', culturalPrefs: ['thermal', 'heritage', 'danube'] },
  { code: 'RO', name: 'Romania', currency: 'RON', currencySymbol: 'lei', language: 'ro', timezone: 'Europe/Bucharest', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'netopia'], priceMultiplier: 4.9, supportPhone: '+40-800-123-456', culturalPrefs: ['traditional', 'castle', 'carpathian'] },
  { code: 'BG', name: 'Bulgaria', currency: 'BGN', currencySymbol: 'лв', language: 'bg', timezone: 'Europe/Sofia', continent: 'Europe', popular: false, paymentMethods: ['card', 'sepa', 'epay'], priceMultiplier: 1.8, supportPhone: '+359-800-123-456', culturalPrefs: ['traditional', 'mountain', 'rose'] },
];

// Get country by user's location or preference
export const detectUserCountry = (): CountryData => {
  // Try to get from localStorage first
  const savedCountry = localStorage.getItem('userCountry');
  if (savedCountry) {
    const country = COUNTRIES.find(c => c.code === savedCountry);
    if (country) return country;
  }

  // Try to detect from browser
  const browserLang = navigator.language || 'en-US';
  const countryCode = browserLang.split('-')[1];
  
  if (countryCode) {
    const country = COUNTRIES.find(c => c.code === countryCode.toUpperCase());
    if (country) return country;
  }

  // Default to US
  return COUNTRIES.find(c => c.code === 'US')!;
};

// Generate country-specific SEO data
export const generateCountrySEO = (country: CountryData, page: string) => {
  const baseTitle = 'SnapZeit - Professional Photographers';
  const baseDesc = 'Book verified professional photographers for weddings, events, portraits and more.';
  
  return {
    title: `${baseTitle} in ${country.name} | Local Photography Services`,
    description: `${baseDesc} Find photographers in ${country.name}. Prices in ${country.currency}. Instant booking available.`,
    keywords: `photographers ${country.name}, photography services ${country.name}, ${country.name} photographers, professional photography ${country.name}`,
    canonical: `https://snapzeit.com/${country.code.toLowerCase()}/${page}`,
    hreflang: country.language,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `SnapZeit ${country.name}`,
      "description": `Professional photographer booking platform in ${country.name}`,
      "url": `https://snapzeit.com/${country.code.toLowerCase()}`,
      "areaServed": {
        "@type": "Country",
        "name": country.name
      },
      "currenciesAccepted": country.currency,
      "paymentAccepted": "Credit Card, Debit Card, Digital Payment"
    }
  };
};

// Generate city-specific SEO data
export const generateCitySEO = (city: string, country: CountryData, photographerCount: number) => {
  return {
    title: `Professional Photographers in ${city}, ${country.name} | Book Now | SnapZeit`,
    description: `Find ${photographerCount}+ verified photographers in ${city}. Wedding, portrait, event photography. Prices in ${country.currencySymbol}. Instant booking.`,
    keywords: `photographers ${city}, ${city} photographers, ${country.name} photographers, professional photography ${city}`,
    canonical: `https://snapzeit.com/${country.code.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `Photographers in ${city}, ${country.name}`,
      "description": `Professional photographers available in ${city}`,
      "url": `https://snapzeit.com/${country.code.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}`,
      "about": {
        "@type": "Place",
        "name": city,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city,
          "addressCountry": country.name
        }
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": photographerCount,
        "itemListElement": []
      }
    }
  };
};

// Format price with regional pricing strategy
export const formatPrice = (baseAmount: number, country: CountryData): string => {
  const localAmount = Math.round(baseAmount * country.priceMultiplier);
  try {
    return new Intl.NumberFormat(country.language === 'en' ? 'en-US' : country.language, {
      style: 'currency',
      currency: country.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(localAmount);
  } catch {
    return `${country.currencySymbol}${localAmount}`;
  }
};

// Get localized content based on cultural preferences
export const getLocalizedContent = (country: CountryData) => {
  const contentMap: { [key: string]: any } = {
    'US': {
      heroTitle: 'Book Amazing Photographers in 2 Minutes',
      heroSubtitle: 'Find verified professionals. Instant booking.',
      popularStyles: ['candid', 'natural', 'documentary'],
      testimonialStyle: 'casual and friendly'
    },
    'GB': {
      heroTitle: 'Book Brilliant Photographers Instantly',
      heroSubtitle: 'Find verified professionals across the UK.',
      popularStyles: ['traditional', 'elegant', 'countryside'],
      testimonialStyle: 'polite and professional'
    },
    'DE': {
      heroTitle: 'Professionelle Fotografen sofort buchen',
      heroSubtitle: 'Verifizierte Profis in ganz Deutschland finden.',
      popularStyles: ['precise', 'professional', 'minimalist'],
      testimonialStyle: 'direct and professional'
    },
    'FR': {
      heroTitle: 'Réservez des Photographes Exceptionnels',
      heroSubtitle: 'Trouvez des professionnels vérifiés en France.',
      popularStyles: ['artistic', 'romantic', 'fashion'],
      testimonialStyle: 'elegant and artistic'
    },
    'IN': {
      heroTitle: 'Book Professional Photographers Instantly',
      heroSubtitle: 'Find verified photographers across India.',
      popularStyles: ['colorful', 'traditional', 'celebration'],
      testimonialStyle: 'warm and family-oriented'
    },
    'JP': {
      heroTitle: 'プロの写真家を即座に予約',
      heroSubtitle: '日本全国の認証済みプロを見つけよう。',
      popularStyles: ['precise', 'seasonal', 'minimalist'],
      testimonialStyle: 'respectful and detailed'
    },
    'BR': {
      heroTitle: 'Reserve Fotógrafos Incríveis Agora',
      heroSubtitle: 'Encontre profissionais verificados no Brasil.',
      popularStyles: ['vibrant', 'beach', 'carnival'],
      testimonialStyle: 'warm and enthusiastic'
    }
  };
  
  return contentMap[country.code] || contentMap['US'];
};

// Get payment methods for country
export const getPaymentMethods = (country: CountryData) => {
  return country.paymentMethods || ['card', 'paypal'];
};

// Get support contact for country
export const getSupportContact = (country: CountryData) => {
  return {
    phone: country.supportPhone,
    email: `support-${country.code.toLowerCase()}@snapzeit.com`,
    hours: getBusinessHours(country.timezone)
  };
};

const getBusinessHours = (timezone: string) => {
  // Simplified business hours - in production, this would be more sophisticated
  return '9:00 AM - 6:00 PM local time';
};

// Generate hreflang tags for international SEO
export const generateHreflangTags = (currentPath: string) => {
  const hreflangTags: { [key: string]: string } = {};
  
  // Add popular countries
  COUNTRIES.filter(c => c.popular).forEach(country => {
    hreflangTags[country.language] = `https://snapzeit.com/${country.code.toLowerCase()}${currentPath}`;
  });
  
  // Add default
  hreflangTags['x-default'] = `https://snapzeit.com${currentPath}`;
  
  return hreflangTags;
};

// Update page SEO with international considerations
export const updateInternationalSEO = (seoData: any, country: CountryData) => {
  // Update meta tags
  document.title = seoData.title;
  
  // Update or create meta tags
  const updateMeta = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const updateProperty = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  updateMeta('description', seoData.description);
  updateMeta('keywords', seoData.keywords);
  updateProperty('og:title', seoData.title);
  updateProperty('og:description', seoData.description);
  updateProperty('og:locale', `${country.language}_${country.code}`);

  // Add hreflang tags
  const hreflangTags = generateHreflangTags(window.location.pathname);
  Object.entries(hreflangTags).forEach(([lang, url]) => {
    let link = document.querySelector(`link[hreflang="${lang}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  });

  // Add structured data
  if (seoData.structuredData) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-international-seo', 'true');
    script.textContent = JSON.stringify(seoData.structuredData);
    
    // Remove existing
    const existing = document.querySelector('script[data-international-seo="true"]');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
  }
};

// Get popular cities by country
export const getPopularCities = (countryCode: string): string[] => {
  const cityMap: { [key: string]: string[] } = {
    'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco'],
    'GB': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool', 'Bristol'],
    'CA': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'],
    'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
    'DE': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart'],
    'FR': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'],
    'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
    'JP': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Kobe', 'Nagoya'],
    'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
    'AE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah']
  };
  
  return cityMap[countryCode] || [];
};

export default {
  COUNTRIES,
  detectUserCountry,
  generateCountrySEO,
  generateCitySEO,
  formatPrice,
  updateInternationalSEO,
  getPopularCities
};