// Local photography partnerships and associations
export interface Partnership {
  id: string;
  name: string;
  country: string;
  type: 'association' | 'school' | 'vendor' | 'media';
  website: string;
  benefits: string[];
  memberDiscount: number;
  verificationBonus: boolean;
}

export const LOCAL_PARTNERSHIPS: Partnership[] = [
  // United States
  {
    id: 'ppa_us',
    name: 'Professional Photographers of America',
    country: 'US',
    type: 'association',
    website: 'ppa.com',
    benefits: ['Certification recognition', 'Insurance discounts', 'Featured listings'],
    memberDiscount: 15,
    verificationBonus: true
  },
  {
    id: 'wppi_us',
    name: 'Wedding & Portrait Photographers International',
    country: 'US',
    type: 'association',
    website: 'wppi.com',
    benefits: ['Wedding specialist badge', 'Priority support', 'Marketing tools'],
    memberDiscount: 20,
    verificationBonus: true
  },

  // United Kingdom
  {
    id: 'bipp_uk',
    name: 'British Institute of Professional Photography',
    country: 'GB',
    type: 'association',
    website: 'bipp.com',
    benefits: ['BIPP qualification recognition', 'Professional badge', 'UK tax benefits'],
    memberDiscount: 12,
    verificationBonus: true
  },
  {
    id: 'swpp_uk',
    name: 'Society of Wedding & Portrait Photographers',
    country: 'GB',
    type: 'association',
    website: 'swpp.co.uk',
    benefits: ['Wedding specialist status', 'Insurance partnerships', 'Training discounts'],
    memberDiscount: 18,
    verificationBonus: true
  },

  // Germany
  {
    id: 'bvf_de',
    name: 'Bundesverband Freie Fotografen',
    country: 'DE',
    type: 'association',
    website: 'bvf-ev.de',
    benefits: ['Professional certification', 'Legal support', 'Tax advisory'],
    memberDiscount: 10,
    verificationBonus: true
  },

  // India
  {
    id: 'fpai_in',
    name: 'Federation of Photography Associations of India',
    country: 'IN',
    type: 'association',
    website: 'fpai.in',
    benefits: ['FPAI certification', 'Regional networking', 'Equipment discounts'],
    memberDiscount: 25,
    verificationBonus: true
  },
  {
    id: 'wipa_in',
    name: 'Wedding Industry Photographers Association',
    country: 'IN',
    type: 'association',
    website: 'wipa.in',
    benefits: ['Wedding specialist badge', 'Vendor partnerships', 'Training programs'],
    memberDiscount: 30,
    verificationBonus: true
  },

  // Japan
  {
    id: 'jps_jp',
    name: 'Japan Professional Photographers Society',
    country: 'JP',
    type: 'association',
    website: 'jps.gr.jp',
    benefits: ['JPS certification', 'Exhibition opportunities', 'Equipment loans'],
    memberDiscount: 15,
    verificationBonus: true
  },

  // Brazil
  {
    id: 'abf_br',
    name: 'Associação Brasileira de Fotografia',
    country: 'BR',
    type: 'association',
    website: 'abf.org.br',
    benefits: ['ABF certification', 'Regional events', 'Legal support'],
    memberDiscount: 20,
    verificationBonus: true
  },

  // Australia
  {
    id: 'aipp_au',
    name: 'Australian Institute of Professional Photography',
    country: 'AU',
    type: 'association',
    website: 'aipp.com.au',
    benefits: ['AIPP accreditation', 'Insurance discounts', 'Awards eligibility'],
    memberDiscount: 15,
    verificationBonus: true
  },

  // France
  {
    id: 'ffp_fr',
    name: 'Fédération Française de la Photographie',
    country: 'FR',
    type: 'association',
    website: 'f-f-p.org',
    benefits: ['FFP certification', 'Exhibition support', 'Professional development'],
    memberDiscount: 12,
    verificationBonus: true
  }
];

export const getPartnershipsForCountry = (countryCode: string): Partnership[] => {
  return LOCAL_PARTNERSHIPS.filter(p => p.country === countryCode);
};

export const getPartnershipBenefits = (photographerId: string, countryCode: string) => {
  const partnerships = getPartnershipsForCountry(countryCode);
  return {
    availablePartnerships: partnerships,
    maxDiscount: Math.max(...partnerships.map(p => p.memberDiscount), 0),
    verificationBenefits: partnerships.filter(p => p.verificationBonus)
  };
};

export default { LOCAL_PARTNERSHIPS, getPartnershipsForCountry, getPartnershipBenefits };