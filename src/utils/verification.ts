// Country-specific photographer verification system
export interface VerificationRequirement {
  id: string;
  name: string;
  required: boolean;
  type: 'document' | 'portfolio' | 'reference' | 'license' | 'insurance';
  description: string;
}

export interface CountryVerification {
  countryCode: string;
  requirements: VerificationRequirement[];
  processingTime: string;
  cost: number;
  currency: string;
}

export const VERIFICATION_REQUIREMENTS: CountryVerification[] = [
  {
    countryCode: 'US',
    processingTime: '2-3 business days',
    cost: 25,
    currency: 'USD',
    requirements: [
      { id: 'id', name: 'Government ID', required: true, type: 'document', description: 'Driver\'s license or passport' },
      { id: 'portfolio', name: 'Portfolio Review', required: true, type: 'portfolio', description: 'Minimum 10 professional photos' },
      { id: 'insurance', name: 'Liability Insurance', required: true, type: 'insurance', description: 'Professional liability coverage' },
      { id: 'references', name: 'Client References', required: false, type: 'reference', description: '3 client testimonials' }
    ]
  },
  {
    countryCode: 'GB',
    processingTime: '3-5 business days',
    cost: 20,
    currency: 'GBP',
    requirements: [
      { id: 'id', name: 'UK ID Document', required: true, type: 'document', description: 'Passport or driving licence' },
      { id: 'portfolio', name: 'Portfolio Assessment', required: true, type: 'portfolio', description: 'Professional work samples' },
      { id: 'dbs', name: 'DBS Check', required: true, type: 'document', description: 'Enhanced DBS certificate' },
      { id: 'insurance', name: 'Public Liability', required: true, type: 'insurance', description: 'Minimum £1M coverage' }
    ]
  },
  {
    countryCode: 'DE',
    processingTime: '5-7 business days',
    cost: 30,
    currency: 'EUR',
    requirements: [
      { id: 'id', name: 'Personalausweis', required: true, type: 'document', description: 'German ID card or passport' },
      { id: 'portfolio', name: 'Portfolioprüfung', required: true, type: 'portfolio', description: 'Professional portfolio review' },
      { id: 'license', name: 'Gewerbeschein', required: true, type: 'license', description: 'Business registration' },
      { id: 'tax', name: 'Steuernummer', required: true, type: 'document', description: 'Tax identification number' }
    ]
  },
  {
    countryCode: 'IN',
    processingTime: '1-2 business days',
    cost: 500,
    currency: 'INR',
    requirements: [
      { id: 'aadhaar', name: 'Aadhaar Card', required: true, type: 'document', description: 'Government issued Aadhaar' },
      { id: 'pan', name: 'PAN Card', required: true, type: 'document', description: 'Permanent Account Number' },
      { id: 'portfolio', name: 'Portfolio Review', required: true, type: 'portfolio', description: 'Minimum 15 photos' },
      { id: 'gst', name: 'GST Registration', required: false, type: 'license', description: 'For business photographers' }
    ]
  },
  {
    countryCode: 'JP',
    processingTime: '3-5 business days',
    cost: 3000,
    currency: 'JPY',
    requirements: [
      { id: 'id', name: '身分証明書', required: true, type: 'document', description: 'Japanese ID or residence card' },
      { id: 'portfolio', name: 'ポートフォリオ審査', required: true, type: 'portfolio', description: 'Professional work evaluation' },
      { id: 'license', name: '営業許可', required: false, type: 'license', description: 'Business permit if applicable' }
    ]
  },
  {
    countryCode: 'BR',
    processingTime: '2-4 business days',
    cost: 50,
    currency: 'BRL',
    requirements: [
      { id: 'cpf', name: 'CPF', required: true, type: 'document', description: 'Cadastro de Pessoas Físicas' },
      { id: 'rg', name: 'RG', required: true, type: 'document', description: 'Registro Geral' },
      { id: 'portfolio', name: 'Avaliação de Portfólio', required: true, type: 'portfolio', description: 'Portfolio profissional' },
      { id: 'mei', name: 'MEI Registration', required: false, type: 'license', description: 'Microempreendedor Individual' }
    ]
  }
];

export const getVerificationRequirements = (countryCode: string): CountryVerification => {
  return VERIFICATION_REQUIREMENTS.find(v => v.countryCode === countryCode) || 
         VERIFICATION_REQUIREMENTS.find(v => v.countryCode === 'US')!;
};

export const calculateVerificationCost = (countryCode: string): { amount: number; currency: string } => {
  const verification = getVerificationRequirements(countryCode);
  return { amount: verification.cost, currency: verification.currency };
};

export default { VERIFICATION_REQUIREMENTS, getVerificationRequirements, calculateVerificationCost };