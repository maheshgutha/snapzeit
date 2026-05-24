// Compliance management for local regulations and tax requirements
export interface ComplianceRequirement {
  country: string;
  taxRate: number;
  vatRequired: boolean;
  vatRate?: number;
  businessLicense: boolean;
  dataProtection: string[];
  paymentRegulations: string[];
  photographyLaws: string[];
  minAge: number;
}

export const COMPLIANCE_RULES: ComplianceRequirement[] = [
  {
    country: 'US',
    taxRate: 0.25, // Federal + State average
    vatRequired: false,
    businessLicense: true,
    dataProtection: ['CCPA', 'COPPA'],
    paymentRegulations: ['PCI DSS', 'SOX'],
    photographyLaws: ['Model releases required', 'Property releases for commercial use'],
    minAge: 18
  },
  {
    country: 'GB',
    taxRate: 0.20,
    vatRequired: true,
    vatRate: 0.20,
    businessLicense: false,
    dataProtection: ['GDPR', 'UK DPA 2018'],
    paymentRegulations: ['PCI DSS', 'FCA regulations'],
    photographyLaws: ['GDPR consent for portraits', 'Copyright Act compliance'],
    minAge: 18
  },
  {
    country: 'DE',
    taxRate: 0.30,
    vatRequired: true,
    vatRate: 0.19,
    businessLicense: true,
    dataProtection: ['GDPR', 'BDSG'],
    paymentRegulations: ['PCI DSS', 'PSD2'],
    photographyLaws: ['Recht am eigenen Bild', 'Panoramafreiheit limitations'],
    minAge: 18
  },
  {
    country: 'IN',
    taxRate: 0.30,
    vatRequired: true,
    vatRate: 0.18, // GST
    businessLicense: false,
    dataProtection: ['IT Act 2000', 'DPDP Act 2023'],
    paymentRegulations: ['RBI guidelines', 'PCI DSS'],
    photographyLaws: ['Model consent required', 'Religious site restrictions'],
    minAge: 18
  },
  {
    country: 'JP',
    taxRate: 0.23,
    vatRequired: true,
    vatRate: 0.10,
    businessLicense: true,
    dataProtection: ['APPI', 'Personal Information Protection Act'],
    paymentRegulations: ['Payment Services Act', 'PCI DSS'],
    photographyLaws: ['Portrait rights protection', 'Public photography restrictions'],
    minAge: 20
  },
  {
    country: 'BR',
    taxRate: 0.27,
    vatRequired: true,
    vatRate: 0.17, // ICMS average
    businessLicense: true,
    dataProtection: ['LGPD'],
    paymentRegulations: ['Central Bank regulations', 'PCI DSS'],
    photographyLaws: ['Image rights law', 'Minor consent requirements'],
    minAge: 18
  },
  {
    country: 'AE',
    taxRate: 0.00,
    vatRequired: true,
    vatRate: 0.05,
    businessLicense: true,
    dataProtection: ['UAE Data Protection Law'],
    paymentRegulations: ['Central Bank regulations', 'PCI DSS'],
    photographyLaws: ['Cultural sensitivity requirements', 'Public photography permits'],
    minAge: 21
  }
];

export const getComplianceForCountry = (countryCode: string): ComplianceRequirement => {
  return COMPLIANCE_RULES.find(c => c.country === countryCode) || COMPLIANCE_RULES[0];
};

export const calculateTaxes = (amount: number, countryCode: string) => {
  const compliance = getComplianceForCountry(countryCode);
  
  const platformFee = amount * 0.05; // 5% platform fee
  const taxableAmount = amount - platformFee;
  
  const incomeTax = taxableAmount * compliance.taxRate;
  const vat = compliance.vatRequired ? amount * (compliance.vatRate || 0) : 0;
  
  return {
    grossAmount: amount,
    platformFee,
    incomeTax,
    vat,
    netAmount: amount - platformFee - incomeTax - vat,
    taxRate: compliance.taxRate,
    vatRate: compliance.vatRate || 0
  };
};

export const getRequiredDocuments = (countryCode: string) => {
  const compliance = getComplianceForCountry(countryCode);
  
  const documents = ['Government ID', 'Portfolio'];
  
  if (compliance.businessLicense) {
    documents.push('Business License');
  }
  
  if (compliance.vatRequired) {
    documents.push('VAT Registration');
  }
  
  return documents;
};

export const checkAgeCompliance = (age: number, countryCode: string): boolean => {
  const compliance = getComplianceForCountry(countryCode);
  return age >= compliance.minAge;
};

export const getDataProtectionRequirements = (countryCode: string): string[] => {
  const compliance = getComplianceForCountry(countryCode);
  return compliance.dataProtection;
};

export const getPhotographyLaws = (countryCode: string): string[] => {
  const compliance = getComplianceForCountry(countryCode);
  return compliance.photographyLaws;
};

// Generate compliance checklist for photographers
export const generateComplianceChecklist = (countryCode: string) => {
  const compliance = getComplianceForCountry(countryCode);
  
  return {
    legal: [
      `Minimum age: ${compliance.minAge} years`,
      compliance.businessLicense ? 'Business license required' : 'No business license needed',
      compliance.vatRequired ? `VAT registration required (${compliance.vatRate! * 100}%)` : 'No VAT registration needed'
    ],
    dataProtection: compliance.dataProtection.map(law => `Comply with ${law}`),
    photography: compliance.photographyLaws,
    taxation: [
      `Income tax rate: ${compliance.taxRate * 100}%`,
      compliance.vatRequired ? `VAT rate: ${compliance.vatRate! * 100}%` : 'No VAT applicable'
    ]
  };
};

export default {
  COMPLIANCE_RULES,
  getComplianceForCountry,
  calculateTaxes,
  getRequiredDocuments,
  checkAgeCompliance,
  generateComplianceChecklist
};