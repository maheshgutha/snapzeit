import { useState, useCallback } from 'react';
import { sanitizeInput, validateSqlInput, validateXssInput, rateLimit, logSecurityEvent } from '@/utils/security';

interface UseSecureFormOptions {
  maxSubmissions?: number;
  rateLimitWindow?: number;
}

export function useSecureForm(options: UseSecureFormOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInput = useCallback((name: string, value: string): string | null => {
    // Sanitize input
    const sanitized = sanitizeInput(value);
    
    // Check for SQL injection
    if (!validateSqlInput(sanitized)) {
      logSecurityEvent('SQL_INJECTION_ATTEMPT', { field: name, value: sanitized }, 'high');
      return 'Invalid input detected';
    }
    
    // Check for XSS
    if (!validateXssInput(sanitized)) {
      logSecurityEvent('XSS_ATTEMPT', { field: name, value: sanitized }, 'high');
      return 'Invalid input detected';
    }
    
    return null;
  }, []);

  const secureSubmit = useCallback(async (
    formData: Record<string, any>,
    submitFn: (data: Record<string, any>) => Promise<void>
  ) => {
    // Rate limiting
    const userIdentifier = `form_${Date.now()}`;
    if (!rateLimit(userIdentifier, options.maxSubmissions || 10)) {
      logSecurityEvent('FORM_RATE_LIMIT_EXCEEDED', { formData: Object.keys(formData) }, 'medium');
      setErrors({ general: 'Too many submissions. Please wait before trying again.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate all inputs
      const validationErrors: Record<string, string> = {};
      const sanitizedData: Record<string, any> = {};

      for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
          const error = validateInput(key, value);
          if (error) {
            validationErrors[key] = error;
          } else {
            sanitizedData[key] = sanitizeInput(value);
          }
        } else {
          sanitizedData[key] = value;
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Validate CSRF token
      const csrfToken = sessionStorage.getItem('csrf_token');
      const formCsrfToken = sanitizedData.csrf_token;
      
      if (!csrfToken || !formCsrfToken || csrfToken !== formCsrfToken) {
        logSecurityEvent('CSRF_TOKEN_MISMATCH', {}, 'high');
        setErrors({ general: 'Security validation failed. Please refresh and try again.' });
        return;
      }

      // Submit form with sanitized data
      await submitFn(sanitizedData);
      
      logSecurityEvent('SECURE_FORM_SUBMITTED', { fields: Object.keys(sanitizedData) }, 'low');
      
    } catch (error) {
      logSecurityEvent('FORM_SUBMISSION_ERROR', { error: String(error) }, 'medium');
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateInput, options.maxSubmissions]);

  return {
    isSubmitting,
    errors,
    secureSubmit,
    validateInput
  };
}