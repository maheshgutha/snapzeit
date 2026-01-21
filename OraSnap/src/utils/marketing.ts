// Regional marketing campaigns with cultural adaptation
export interface MarketingCampaign {
  countryCode: string;
  language: string;
  campaigns: {
    hero: { title: string; subtitle: string; cta: string; };
    seasonal: { title: string; description: string; period: string; };
    cultural: { event: string; message: string; targeting: string; };
  };
  adChannels: string[];
  budget: { min: number; max: number; currency: string; };
}

export const REGIONAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    countryCode: 'US',
    language: 'en',
    campaigns: {
      hero: {
        title: 'Capture Life\'s Perfect Moments',
        subtitle: 'Professional photographers for every occasion',
        cta: 'Book Now'
      },
      seasonal: {
        title: 'Wedding Season Special',
        description: '20% off wedding photography packages',
        period: 'May-September'
      },
      cultural: {
        event: 'Thanksgiving',
        message: 'Family memories that last forever',
        targeting: 'family_photography'
      }
    },
    adChannels: ['google_ads', 'facebook', 'instagram', 'tiktok'],
    budget: { min: 1000, max: 10000, currency: 'USD' }
  },
  {
    countryCode: 'IN',
    language: 'en',
    campaigns: {
      hero: {
        title: 'शादी की यादें, जो रहें हमेशा',
        subtitle: 'Professional wedding & event photography',
        cta: 'Book करें'
      },
      seasonal: {
        title: 'Wedding Season Offer',
        description: 'Pre-wedding + Wedding package deals',
        period: 'October-March'
      },
      cultural: {
        event: 'Diwali',
        message: 'Festival of lights, captured beautifully',
        targeting: 'festival_photography'
      }
    },
    adChannels: ['google_ads', 'facebook', 'instagram', 'whatsapp'],
    budget: { min: 25000, max: 200000, currency: 'INR' }
  },
  {
    countryCode: 'JP',
    language: 'ja',
    campaigns: {
      hero: {
        title: '人生の大切な瞬間を美しく',
        subtitle: 'プロフェッショナル写真撮影サービス',
        cta: '予約する'
      },
      seasonal: {
        title: '桜シーズン特別プラン',
        description: '春の記念撮影キャンペーン',
        period: 'March-May'
      },
      cultural: {
        event: '七五三',
        message: 'お子様の成長を美しく記録',
        targeting: 'family_children'
      }
    },
    adChannels: ['google_ads', 'yahoo_ads', 'line', 'instagram'],
    budget: { min: 100000, max: 1000000, currency: 'JPY' }
  },
  {
    countryCode: 'BR',
    language: 'pt',
    campaigns: {
      hero: {
        title: 'Momentos Únicos, Fotos Perfeitas',
        subtitle: 'Fotógrafos profissionais para sua ocasião especial',
        cta: 'Reservar Agora'
      },
      seasonal: {
        title: 'Carnaval 2024',
        description: 'Capture a magia do Carnaval',
        period: 'February-March'
      },
      cultural: {
        event: 'Festa Junina',
        message: 'Tradição e alegria em cada foto',
        targeting: 'cultural_events'
      }
    },
    adChannels: ['google_ads', 'facebook', 'instagram', 'tiktok'],
    budget: { min: 2000, max: 20000, currency: 'BRL' }
  },
  {
    countryCode: 'AE',
    language: 'ar',
    campaigns: {
      hero: {
        title: 'لحظات لا تُنسى، صور استثنائية',
        subtitle: 'مصورون محترفون لكل المناسبات',
        cta: 'احجز الآن'
      },
      seasonal: {
        title: 'عروض رمضان',
        description: 'تصوير الإفطار والعائلة',
        period: 'Ramadan'
      },
      cultural: {
        event: 'National Day',
        message: 'احتفل بيوم الإمارات مع أجمل الصور',
        targeting: 'national_celebrations'
      }
    },
    adChannels: ['google_ads', 'facebook', 'instagram', 'snapchat'],
    budget: { min: 5000, max: 50000, currency: 'AED' }
  }
];

export const getCampaignForCountry = (countryCode: string): MarketingCampaign => {
  return REGIONAL_CAMPAIGNS.find(c => c.countryCode === countryCode) || 
         REGIONAL_CAMPAIGNS[0];
};

export const generateLocalizedAd = (countryCode: string, type: 'hero' | 'seasonal' | 'cultural') => {
  const campaign = getCampaignForCountry(countryCode);
  return campaign.campaigns[type];
};

export default { REGIONAL_CAMPAIGNS, getCampaignForCountry, generateLocalizedAd };