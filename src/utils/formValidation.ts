export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, message: 'Email is required' };
  if (!emailRegex.test(email)) return { isValid: false, message: 'Please enter a valid email address' };
  return { isValid: true, message: '' };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { isValid: false, message: 'Password is required' };
  if (password.length < 8) return { isValid: false, message: 'Password must be at least 8 characters' };
  return { isValid: true, message: '' };
};

export const validateName = (name: string): ValidationResult => {
  if (!name) return { isValid: false, message: 'Name is required' };
  if (name.length < 2) return { isValid: false, message: 'Name must be at least 2 characters' };
  return { isValid: true, message: '' };
};

export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phone) return { isValid: true, message: '' }; // Optional field
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }
  return { isValid: true, message: '' };
};

export const validatePrice = (price: string): ValidationResult => {
  const priceNum = parseFloat(price);
  if (!price) return { isValid: false, message: 'Price is required' };
  if (isNaN(priceNum) || priceNum <= 0) return { isValid: false, message: 'Please enter a valid price' };
  if (priceNum > 10000) return { isValid: false, message: 'Price seems too high' };
  return { isValid: true, message: '' };
};