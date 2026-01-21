import { supabase } from '@/integrations/supabase/client';
import { rateLimit, sanitizeInput, validateSqlInput, validateXssInput, logSecurityEvent } from './security';

interface SecureRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
  rateLimitKey?: string;
  maxRequests?: number;
}

export class SecurityMiddleware {
  static async secureRequest(
    endpoint: string, 
    options: SecureRequestOptions = {}
  ): Promise<any> {
    const {
      method = 'GET',
      body,
      requireAuth = true,
      rateLimitKey,
      maxRequests = 100
    } = options;

    try {
      // 1. Authentication check
      if (requireAuth) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', { endpoint }, 'high');
          throw new Error('Authentication required');
        }
      }

      // 2. Rate limiting
      if (rateLimitKey) {
        if (!rateLimit(rateLimitKey, maxRequests)) {
          logSecurityEvent('RATE_LIMIT_EXCEEDED', { endpoint, rateLimitKey }, 'medium');
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }

      // 3. Input validation and sanitization
      if (body && typeof body === 'object') {
        const sanitizedBody = this.sanitizeRequestBody(body);
        if (!this.validateRequestBody(sanitizedBody)) {
          logSecurityEvent('MALICIOUS_INPUT_DETECTED', { endpoint, body: sanitizedBody }, 'high');
          throw new Error('Invalid input detected');
        }
      }

      // 4. CSRF token validation for state-changing operations
      if (['POST', 'PUT', 'DELETE'].includes(method)) {
        const csrfToken = sessionStorage.getItem('csrf_token');
        const requestCsrfToken = body?.csrf_token;
        
        if (!csrfToken || !requestCsrfToken || csrfToken !== requestCsrfToken) {
          logSecurityEvent('CSRF_TOKEN_VALIDATION_FAILED', { endpoint }, 'high');
          throw new Error('CSRF token validation failed');
        }
      }

      // 5. Execute the request
      const response = await this.executeRequest(endpoint, { method, body });
      
      logSecurityEvent('SECURE_REQUEST_SUCCESS', { endpoint, method }, 'low');
      return response;

    } catch (error) {
      logSecurityEvent('SECURE_REQUEST_FAILED', { 
        endpoint, 
        method, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'medium');
      throw error;
    }
  }

  private static sanitizeRequestBody(body: any): any {
    if (typeof body === 'string') {
      return sanitizeInput(body);
    }
    
    if (Array.isArray(body)) {
      return body.map(item => this.sanitizeRequestBody(item));
    }
    
    if (typeof body === 'object' && body !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(body)) {
        sanitized[sanitizeInput(key)] = this.sanitizeRequestBody(value);
      }
      return sanitized;
    }
    
    return body;
  }

  private static validateRequestBody(body: any): boolean {
    if (typeof body === 'string') {
      return validateSqlInput(body) && validateXssInput(body);
    }
    
    if (Array.isArray(body)) {
      return body.every(item => this.validateRequestBody(item));
    }
    
    if (typeof body === 'object' && body !== null) {
      return Object.entries(body).every(([key, value]) => 
        validateSqlInput(key) && validateXssInput(key) && this.validateRequestBody(value)
      );
    }
    
    return true;
  }

  private static async executeRequest(endpoint: string, options: any): Promise<any> {
    // This would be replaced with actual API calls
    // For now, using Supabase functions as an example
    if (endpoint.startsWith('supabase:')) {
      const functionName = endpoint.replace('supabase:', '');
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: options.body
      });
      
      if (error) throw error;
      return data;
    }
    
    // For other endpoints, use fetch with security headers
    const response = await fetch(endpoint, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': sessionStorage.getItem('csrf_token') || '',
        ...this.getSecurityHeaders()
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  private static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // Specific security methods for common operations
  static async secureFileUpload(file: File, uploadPath: string): Promise<any> {
    // Validate file before upload
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }

    if (file.size > maxSize) {
      throw new Error('File too large');
    }

    // Sanitize filename
    const sanitizedName = sanitizeInput(file.name);
    
    return this.secureRequest('supabase:upload-file', {
      method: 'POST',
      body: {
        file: file,
        path: uploadPath,
        filename: sanitizedName,
        csrf_token: sessionStorage.getItem('csrf_token')
      },
      rateLimitKey: 'file_upload',
      maxRequests: 10
    });
  }

  static async secureUserAction(action: string, data: any): Promise<any> {
    return this.secureRequest('supabase:user-action', {
      method: 'POST',
      body: {
        action: sanitizeInput(action),
        data: data,
        csrf_token: sessionStorage.getItem('csrf_token')
      },
      rateLimitKey: `user_action_${action}`,
      maxRequests: 50
    });
  }
}