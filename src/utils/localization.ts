// Comprehensive localization system for SnapZeiT
export interface LocalizedContent {
  [key: string]: {
    [key: string]: string;
  };
}

export const TRANSLATIONS: LocalizedContent = {
  // English (Default)
  en: {
    'hero.title': 'Book Amazing Photographers in 2 Minutes',
    'hero.subtitle': 'Find verified professionals. Instant booking.',
    'hero.cta': 'Find Photographers',
    'nav.photographers': 'Photographers',
    'nav.categories': 'Categories',
    'nav.locations': 'Locations',
    'nav.pricing': 'Pricing',
    'nav.how_it_works': 'How It Works',
    'search.placeholder': 'Wedding, Portrait, Event photography...',
    'pricing.from': 'From',
    'pricing.per_hour': 'per hour',
    'booking.instant': 'Instant Booking',
    'rating.reviews': 'reviews',
    'support.phone': 'Phone Support',
    'support.email': 'Email Support',
    'payment.secure': 'Secure Payment',
    'guarantee.quality': 'Quality Guarantee'
  },

  // Spanish
  es: {
    'hero.title': 'Reserva Fotógrafos Increíbles en 2 Minutos',
    'hero.subtitle': 'Encuentra profesionales verificados. Reserva instantánea.',
    'hero.cta': 'Encontrar Fotógrafos',
    'nav.photographers': 'Fotógrafos',
    'nav.categories': 'Categorías',
    'nav.locations': 'Ubicaciones',
    'nav.pricing': 'Precios',
    'nav.how_it_works': 'Cómo Funciona',
    'search.placeholder': 'Fotografía de bodas, retratos, eventos...',
    'pricing.from': 'Desde',
    'pricing.per_hour': 'por hora',
    'booking.instant': 'Reserva Instantánea',
    'rating.reviews': 'reseñas',
    'support.phone': 'Soporte Telefónico',
    'support.email': 'Soporte por Email',
    'payment.secure': 'Pago Seguro',
    'guarantee.quality': 'Garantía de Calidad'
  },

  // French
  fr: {
    'hero.title': 'Réservez des Photographes Exceptionnels en 2 Minutes',
    'hero.subtitle': 'Trouvez des professionnels vérifiés. Réservation instantanée.',
    'hero.cta': 'Trouver des Photographes',
    'nav.photographers': 'Photographes',
    'nav.categories': 'Catégories',
    'nav.locations': 'Emplacements',
    'nav.pricing': 'Tarifs',
    'nav.how_it_works': 'Comment Ça Marche',
    'search.placeholder': 'Photographie de mariage, portrait, événement...',
    'pricing.from': 'À partir de',
    'pricing.per_hour': 'par heure',
    'booking.instant': 'Réservation Instantanée',
    'rating.reviews': 'avis',
    'support.phone': 'Support Téléphonique',
    'support.email': 'Support Email',
    'payment.secure': 'Paiement Sécurisé',
    'guarantee.quality': 'Garantie Qualité'
  },

  // German
  de: {
    'hero.title': 'Buchen Sie Erstaunliche Fotografen in 2 Minuten',
    'hero.subtitle': 'Finden Sie verifizierte Profis. Sofortige Buchung.',
    'hero.cta': 'Fotografen Finden',
    'nav.photographers': 'Fotografen',
    'nav.categories': 'Kategorien',
    'nav.locations': 'Standorte',
    'nav.pricing': 'Preise',
    'nav.how_it_works': 'Wie Es Funktioniert',
    'search.placeholder': 'Hochzeits-, Portrait-, Eventfotografie...',
    'pricing.from': 'Ab',
    'pricing.per_hour': 'pro Stunde',
    'booking.instant': 'Sofortbuchung',
    'rating.reviews': 'Bewertungen',
    'support.phone': 'Telefon-Support',
    'support.email': 'E-Mail-Support',
    'payment.secure': 'Sichere Zahlung',
    'guarantee.quality': 'Qualitätsgarantie'
  },

  // Portuguese (Brazil)
  pt: {
    'hero.title': 'Reserve Fotógrafos Incríveis em 2 Minutos',
    'hero.subtitle': 'Encontre profissionais verificados. Reserva instantânea.',
    'hero.cta': 'Encontrar Fotógrafos',
    'nav.photographers': 'Fotógrafos',
    'nav.categories': 'Categorias',
    'nav.locations': 'Localizações',
    'nav.pricing': 'Preços',
    'nav.how_it_works': 'Como Funciona',
    'search.placeholder': 'Fotografia de casamento, retrato, evento...',
    'pricing.from': 'A partir de',
    'pricing.per_hour': 'por hora',
    'booking.instant': 'Reserva Instantânea',
    'rating.reviews': 'avaliações',
    'support.phone': 'Suporte Telefônico',
    'support.email': 'Suporte por Email',
    'payment.secure': 'Pagamento Seguro',
    'guarantee.quality': 'Garantia de Qualidade'
  },

  // Japanese
  ja: {
    'hero.title': '2分で素晴らしいフォトグラファーを予約',
    'hero.subtitle': '認証済みのプロを見つけよう。即座に予約。',
    'hero.cta': 'フォトグラファーを探す',
    'nav.photographers': 'フォトグラファー',
    'nav.categories': 'カテゴリー',
    'nav.locations': 'ロケーション',
    'nav.pricing': '料金',
    'nav.how_it_works': '仕組み',
    'search.placeholder': 'ウェディング、ポートレート、イベント撮影...',
    'pricing.from': '〜から',
    'pricing.per_hour': '時間あたり',
    'booking.instant': '即座予約',
    'rating.reviews': 'レビュー',
    'support.phone': '電話サポート',
    'support.email': 'メールサポート',
    'payment.secure': '安全な支払い',
    'guarantee.quality': '品質保証'
  },

  // Chinese (Simplified)
  zh: {
    'hero.title': '2分钟预订优秀摄影师',
    'hero.subtitle': '寻找经过验证的专业人士。即时预订。',
    'hero.cta': '寻找摄影师',
    'nav.photographers': '摄影师',
    'nav.categories': '类别',
    'nav.locations': '地点',
    'nav.pricing': '价格',
    'nav.how_it_works': '工作原理',
    'search.placeholder': '婚礼、肖像、活动摄影...',
    'pricing.from': '起价',
    'pricing.per_hour': '每小时',
    'booking.instant': '即时预订',
    'rating.reviews': '评论',
    'support.phone': '电话支持',
    'support.email': '邮件支持',
    'payment.secure': '安全支付',
    'guarantee.quality': '质量保证'
  },

  // Arabic
  ar: {
    'hero.title': 'احجز مصورين رائعين في دقيقتين',
    'hero.subtitle': 'اعثر على محترفين معتمدين. حجز فوري.',
    'hero.cta': 'البحث عن مصورين',
    'nav.photographers': 'المصورون',
    'nav.categories': 'الفئات',
    'nav.locations': 'المواقع',
    'nav.pricing': 'الأسعار',
    'nav.how_it_works': 'كيف يعمل',
    'search.placeholder': 'تصوير الزفاف، البورتريه، الأحداث...',
    'pricing.from': 'ابتداءً من',
    'pricing.per_hour': 'في الساعة',
    'booking.instant': 'حجز فوري',
    'rating.reviews': 'مراجعات',
    'support.phone': 'الدعم الهاتفي',
    'support.email': 'دعم البريد الإلكتروني',
    'payment.secure': 'دفع آمن',
    'guarantee.quality': 'ضمان الجودة'
  },

  // Italian
  it: {
    'hero.title': 'Prenota Fotografi Straordinari in 2 Minuti',
    'hero.subtitle': 'Trova professionisti verificati. Prenotazione istantanea.',
    'hero.cta': 'Trova Fotografi',
    'nav.photographers': 'Fotografi',
    'nav.categories': 'Categorie',
    'nav.locations': 'Località',
    'nav.pricing': 'Prezzi',
    'nav.how_it_works': 'Come Funziona',
    'search.placeholder': 'Fotografia matrimoni, ritratti, eventi...',
    'pricing.from': 'Da',
    'pricing.per_hour': 'all\'ora',
    'booking.instant': 'Prenotazione Istantanea',
    'rating.reviews': 'recensioni',
    'support.phone': 'Supporto Telefonico',
    'support.email': 'Supporto Email',
    'payment.secure': 'Pagamento Sicuro',
    'guarantee.quality': 'Garanzia di Qualità'
  },

  // Korean
  ko: {
    'hero.title': '2분 안에 놀라운 사진작가 예약',
    'hero.subtitle': '검증된 전문가를 찾으세요. 즉시 예약.',
    'hero.cta': '사진작가 찾기',
    'nav.photographers': '사진작가',
    'nav.categories': '카테고리',
    'nav.locations': '위치',
    'nav.pricing': '가격',
    'nav.how_it_works': '작동 방식',
    'search.placeholder': '웨딩, 인물, 이벤트 사진...',
    'pricing.from': '시작가',
    'pricing.per_hour': '시간당',
    'booking.instant': '즉시 예약',
    'rating.reviews': '리뷰',
    'support.phone': '전화 지원',
    'support.email': '이메일 지원',
    'payment.secure': '안전한 결제',
    'guarantee.quality': '품질 보증'
  }
};

// Translation function
export const t = (key: string, language: string = 'en'): string => {
  return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
};

// Get RTL languages
export const isRTL = (language: string): boolean => {
  return ['ar', 'he', 'fa'].includes(language);
};

// Cultural photography preferences by country
export const CULTURAL_PREFERENCES = {
  'US': ['candid', 'natural', 'documentary', 'lifestyle'],
  'GB': ['traditional', 'elegant', 'countryside', 'heritage'],
  'DE': ['precise', 'professional', 'minimalist', 'technical'],
  'FR': ['artistic', 'romantic', 'fashion', 'elegant'],
  'ES': ['warm', 'family', 'celebration', 'vibrant'],
  'IT': ['artistic', 'romantic', 'heritage', 'fashion'],
  'IN': ['colorful', 'traditional', 'celebration', 'family'],
  'CN': ['formal', 'group', 'prosperity', 'modern'],
  'JP': ['precise', 'seasonal', 'minimalist', 'nature'],
  'AU': ['outdoor', 'casual', 'beach', 'adventure'],
  'BR': ['vibrant', 'beach', 'carnival', 'celebration'],
  'AE': ['luxury', 'modern', 'desert', 'architectural'],
  'KR': ['trendy', 'k-style', 'modern', 'fashion'],
  'MX': ['vibrant', 'family', 'celebration', 'cultural'],
  'CA': ['natural', 'outdoor', 'lifestyle', 'seasonal']
};

export default { TRANSLATIONS, t, isRTL, CULTURAL_PREFERENCES };