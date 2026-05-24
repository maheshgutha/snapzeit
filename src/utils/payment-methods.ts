// Payment methods configuration for different countries
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'card' | 'digital_wallet' | 'bank_transfer' | 'cash' | 'crypto';
  processingFee: number; // percentage
  countries: string[];
  popular: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'visa', name: 'Visa', icon: '??', type: 'card', processingFee: 2.9, countries: ['*'], popular: true },
  { id: 'mastercard', name: 'Mastercard', icon: '??', type: 'card', processingFee: 2.9, countries: ['*'], popular: true },
  { id: 'amex', name: 'American Express', icon: '??', type: 'card', processingFee: 3.4, countries: ['*'], popular: false },
  { id: 'paypal', name: 'PayPal', icon: '???', type: 'digital_wallet', processingFee: 3.49, countries: ['*'], popular: true },
  { id: 'apple_pay', name: 'Apple Pay', icon: '??', type: 'digital_wallet', processingFee: 2.9, countries: ['US', 'CA', 'GB', 'AU'], popular: true },
  { id: 'google_pay', name: 'Google Pay', icon: '??', type: 'digital_wallet', processingFee: 2.9, countries: ['US', 'CA', 'GB', 'AU', 'IN'], popular: true },
  { id: 'venmo', name: 'Venmo', icon: '??', type: 'digital_wallet', processingFee: 1.9, countries: ['US'], popular: true },
  { id: 'zelle', name: 'Zelle', icon: '?', type: 'bank_transfer', processingFee: 0, countries: ['US'], popular: false },
  { id: 'interac', name: 'Interac', icon: '????', type: 'bank_transfer', processingFee: 1.5, countries: ['CA'], popular: true },
  { id: 'sepa', name: 'SEPA Transfer', icon: '??', type: 'bank_transfer', processingFee: 0.5, countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI'], popular: true },
  { id: 'sofort', name: 'Sofort', icon: '??', type: 'bank_transfer', processingFee: 1.4, countries: ['DE', 'AT', 'CH'], popular: true },
  { id: 'ideal', name: 'iDEAL', icon: '????', type: 'bank_transfer', processingFee: 0.29, countries: ['NL'], popular: true },
  { id: 'bancontact', name: 'Bancontact', icon: '????', type: 'card', processingFee: 1.4, countries: ['BE'], popular: true },
  { id: 'eps', name: 'EPS', icon: '????', type: 'bank_transfer', processingFee: 1.8, countries: ['AT'], popular: true },
  { id: 'giropay', name: 'Giropay', icon: '????', type: 'bank_transfer', processingFee: 1.2, countries: ['DE'], popular: false },
  { id: 'przelewy24', name: 'Przelewy24', icon: '????', type: 'bank_transfer', processingFee: 2.2, countries: ['PL'], popular: true },
  { id: 'blik', name: 'BLIK', icon: '??', type: 'digital_wallet', processingFee: 1.95, countries: ['PL'], popular: true },
  { id: 'swish', name: 'Swish', icon: '????', type: 'digital_wallet', processingFee: 1.25, countries: ['SE'], popular: true },
  { id: 'vipps', name: 'Vipps', icon: '????', type: 'digital_wallet', processingFee: 1.45, countries: ['NO'], popular: true },
  { id: 'mobilepay', name: 'MobilePay', icon: '????', type: 'digital_wallet', processingFee: 1.45, countries: ['DK', 'FI'], popular: true },
  { id: 'twint', name: 'TWINT', icon: '????', type: 'digital_wallet', processingFee: 1.5, countries: ['CH'], popular: true },
  { id: 'bizum', name: 'Bizum', icon: '????', type: 'digital_wallet', processingFee: 0.5, countries: ['ES'], popular: true },
  { id: 'mbway', name: 'MB WAY', icon: '????', type: 'digital_wallet', processingFee: 1.4, countries: ['PT'], popular: true },
  { id: 'alipay', name: 'Alipay', icon: '???', type: 'digital_wallet', processingFee: 0.55, countries: ['CN', 'HK'], popular: true },
  { id: 'wechat_pay', name: 'WeChat Pay', icon: '??', type: 'digital_wallet', processingFee: 0.6, countries: ['CN'], popular: true },
  { id: 'unionpay', name: 'UnionPay', icon: '????', type: 'card', processingFee: 2.95, countries: ['CN', 'HK', 'TW'], popular: true },
  { id: 'upi', name: 'UPI', icon: '????', type: 'bank_transfer', processingFee: 0, countries: ['IN'], popular: true },
  { id: 'paytm', name: 'Paytm', icon: '??', type: 'digital_wallet', processingFee: 1.99, countries: ['IN'], popular: true },
  { id: 'razorpay', name: 'Razorpay', icon: '??', type: 'digital_wallet', processingFee: 2.0, countries: ['IN'], popular: false },
  { id: 'jcb', name: 'JCB', icon: '????', type: 'card', processingFee: 3.25, countries: ['JP'], popular: true },
  { id: 'konbini', name: 'Konbini', icon: '??', type: 'cash', processingFee: 3.0, countries: ['JP'], popular: true },
  { id: 'paynow', name: 'PayNow', icon: '????', type: 'bank_transfer', processingFee: 0, countries: ['SG'], popular: true },
  { id: 'grabpay', name: 'GrabPay', icon: '??', type: 'digital_wallet', processingFee: 2.0, countries: ['SG', 'MY', 'TH', 'PH', 'VN'], popular: true },
  { id: 'kakaopay', name: 'KakaoPay', icon: '??', type: 'digital_wallet', processingFee: 2.3, countries: ['KR'], popular: true },
  { id: 'toss', name: 'Toss', icon: '????', type: 'digital_wallet', processingFee: 2.3, countries: ['KR'], popular: true },
  { id: 'promptpay', name: 'PromptPay', icon: '????', type: 'bank_transfer', processingFee: 0.5, countries: ['TH'], popular: true },
  { id: 'truemoney', name: 'TrueMoney', icon: '??', type: 'digital_wallet', processingFee: 2.5, countries: ['TH'], popular: false },
  { id: 'fpx', name: 'FPX', icon: '????', type: 'bank_transfer', processingFee: 1.5, countries: ['MY'], popular: true },
  { id: 'gopay', name: 'GoPay', icon: '???', type: 'digital_wallet', processingFee: 2.0, countries: ['ID'], popular: true },
  { id: 'ovo', name: 'OVO', icon: '??', type: 'digital_wallet', processingFee: 2.0, countries: ['ID'], popular: true },
  { id: 'gcash', name: 'GCash', icon: '??', type: 'digital_wallet', processingFee: 2.5, countries: ['PH'], popular: true },
  { id: 'paymaya', name: 'PayMaya', icon: '????', type: 'digital_wallet', processingFee: 2.5, countries: ['PH'], popular: true },
  { id: 'momo', name: 'MoMo', icon: '????', type: 'digital_wallet', processingFee: 2.0, countries: ['VN'], popular: true },
  { id: 'zalopay', name: 'ZaloPay', icon: '??', type: 'digital_wallet', processingFee: 2.0, countries: ['VN'], popular: true },
  { id: 'stc_pay', name: 'STC Pay', icon: '????', type: 'digital_wallet', processingFee: 2.75, countries: ['SA'], popular: true },
  { id: 'mada', name: 'Mada', icon: '??', type: 'card', processingFee: 1.75, countries: ['SA'], popular: true },
  { id: 'fawry', name: 'Fawry', icon: '????', type: 'digital_wallet', processingFee: 2.5, countries: ['EG'], popular: true },
  { id: 'vodafone_cash', name: 'Vodafone Cash', icon: '??', type: 'digital_wallet', processingFee: 2.0, countries: ['EG'], popular: false },
  { id: 'snapscan', name: 'SnapScan', icon: '??', type: 'digital_wallet', processingFee: 2.9, countries: ['ZA'], popular: true },
  { id: 'eft', name: 'EFT', icon: '??', type: 'bank_transfer', processingFee: 1.5, countries: ['ZA'], popular: true },
  { id: 'pix', name: 'PIX', icon: '????', type: 'bank_transfer', processingFee: 0, countries: ['BR'], popular: true },
  { id: 'boleto', name: 'Boleto', icon: '??', type: 'cash', processingFee: 3.99, countries: ['BR'], popular: true },
  { id: 'mercadopago', name: 'Mercado Pago', icon: '??', type: 'digital_wallet', processingFee: 4.99, countries: ['AR', 'BR', 'CL', 'CO', 'MX', 'PE'], popular: true },
  { id: 'rapipago', name: 'Rapipago', icon: '????', type: 'cash', processingFee: 4.5, countries: ['AR'], popular: false },
  { id: 'webpay', name: 'Webpay', icon: '????', type: 'card', processingFee: 3.25, countries: ['CL'], popular: true },
  { id: 'khipu', name: 'Khipu', icon: '??', type: 'bank_transfer', processingFee: 1.4, countries: ['CL'], popular: true },
  { id: 'nequi', name: 'Nequi', icon: '????', type: 'digital_wallet', processingFee: 2.95, countries: ['CO'], popular: true },
  { id: 'daviplata', name: 'Daviplata', icon: '??', type: 'digital_wallet', processingFee: 2.95, countries: ['CO'], popular: false },
  { id: 'yape', name: 'Yape', icon: '????', type: 'digital_wallet', processingFee: 2.3, countries: ['PE'], popular: true },
  { id: 'plin', name: 'Plin', icon: '??', type: 'digital_wallet', processingFee: 2.3, countries: ['PE'], popular: true },
  { id: 'oxxo', name: 'OXXO', icon: '??', type: 'cash', processingFee: 3.0, countries: ['MX'], popular: true },
  { id: 'spei', name: 'SPEI', icon: '??', type: 'bank_transfer', processingFee: 1.0, countries: ['MX'], popular: true },
];

export const getPaymentMethodsForCountry = (countryCode: string): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => method.countries.includes('*') || method.countries.includes(countryCode)).sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.processingFee - b.processingFee;
  });
};

export const getPopularPaymentMethods = (countryCode: string): PaymentMethod[] => {
  return getPaymentMethodsForCountry(countryCode).filter(method => method.popular);
};

export const calculateTotalWithFees = (amount: number, paymentMethodId: string): number => {
  const method = PAYMENT_METHODS.find(m => m.id === paymentMethodId);
  if (!method) return amount;
  const fee = (amount * method.processingFee) / 100;
  return amount + fee;
};

export const getPaymentMethod = (id: string): PaymentMethod | undefined => {
  return PAYMENT_METHODS.find(method => method.id === id);
};

export default {
  PAYMENT_METHODS,
  getPaymentMethodsForCountry,
  getPopularPaymentMethods,
  calculateTotalWithFees,
  getPaymentMethod,
};
