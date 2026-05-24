import { toast } from "sonner";
import { sanitizeLog } from './sanitize';

export class ErrorHandler {
  static handleAuthError(error: any) {
    if (error?.message?.includes('Invalid login credentials')) {
      toast.error('Invalid email or password');
    } else if (error?.message?.includes('Email not confirmed')) {
      toast.error('Please check your email and confirm your account');
    } else if (error?.message?.includes('User not found')) {
      toast.error('Account not found. Please sign up first.');
    } else {
      toast.error('Authentication failed. Please try again.');
    }
  }

  static handleDatabaseError(error: any, context: string = '') {
    console.error(`Database error ${sanitizeLog(context)}:`, sanitizeLog(JSON.stringify(error)));
    
    if (error?.code === 'PGRST116') {
      toast.error('No data found');
    } else if (error?.code === '23505') {
      toast.error('This record already exists');
    } else if (error?.code === '23503') {
      toast.error('Cannot delete: record is referenced by other data');
    } else if (error?.message?.includes('JWT expired')) {
      toast.error('Session expired. Please sign in again.');
    } else if (error?.message?.includes('Row level security')) {
      toast.error('Access denied');
    } else {
      toast.error(`Database error: ${error?.message || 'Unknown error'}`);
    }
  }

  static handleFileError(error: any, fileName?: string) {
    if (error?.message?.includes('File too large')) {
      toast.error(`File ${fileName || ''} is too large (max 10MB)`);
    } else if (error?.message?.includes('Invalid file type')) {
      toast.error(`Invalid file type for ${fileName || 'file'}`);
    } else if (error?.message?.includes('Upload failed')) {
      toast.error(`Failed to upload ${fileName || 'file'}`);
    } else {
      toast.error(`File error: ${error?.message || 'Unknown error'}`);
    }
  }

  static handleNetworkError(error: any) {
    if (error?.message?.includes('Failed to fetch')) {
      toast.error('Network error. Please check your connection.');
    } else if (error?.message?.includes('timeout')) {
      toast.error('Request timed out. Please try again.');
    } else {
      toast.error('Network error occurred');
    }
  }

  static handleValidationError(field: string, value: any) {
    if (!value || value === '') {
      toast.error(`${field} is required`);
      return false;
    }
    
    if (field === 'email' && !this.isValidEmail(value)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (field === 'password' && value.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static handleGenericError(error: any, fallbackMessage: string = 'An error occurred') {
    console.error('Generic error:', sanitizeLog(JSON.stringify(error)));
    
    if (error instanceof Error) {
      toast.error(error.message);
    } else if (typeof error === 'string') {
      toast.error(error);
    } else {
      toast.error(fallbackMessage);
    }
  }
}

export const validateRequired = (fields: Record<string, any>): boolean => {
  for (const [key, value] of Object.entries(fields)) {
    if (!ErrorHandler.handleValidationError(key, value)) {
      return false;
    }
  }
  return true;
};

export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  errorContext: string = ''
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    ErrorHandler.handleGenericError(error, `Failed to ${errorContext}`);
    return null;
  }
};