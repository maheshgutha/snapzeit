// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security configuration
const SECURITY_CONFIG = {
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_WINDOW_MS: 15 * 60 * 1000
  },
  VALIDATION: {
    MAX_INPUT_LENGTH: 10000,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
  }
};

// Rate limiting
export const rateLimit = (identifier: string, maxRequests = SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS): boolean => {
  const now = Date.now();
  const key = `rate_${identifier}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

// Input sanitization and validation
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, SECURITY_CONFIG.VALIDATION.MAX_INPUT_LENGTH)
    .replace(/[<>\"'&]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    });
};

// SQL injection prevention
export const validateSqlInput = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|")/,
    /(\bOR\b|\bAND\b).*[=<>]/i
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
};

// XSS prevention
export const validateXssInput = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];
  
  return !xssPatterns.some(pattern => pattern.test(input));
};

// File upload validation
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  if (!SECURITY_CONFIG.VALIDATION.ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  if (file.size > SECURITY_CONFIG.VALIDATION.MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large' };
  }
  
  return { valid: true };
};

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};

// Suspicious activity detection
export const detectSuspiciousActivity = (userAgent: string, ip: string): boolean => {
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /curl|wget|python|java/i,
    /sqlmap|nikto|nmap/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};

// Password strength validation
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character');
  
  return { valid: errors.length === 0, errors };
};

// Content Security Policy headers
export const getCSPHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' *",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
};

// Audit logging
export const logSecurityEvent = (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium'): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.warn('[SECURITY]', logEntry);
  
  // In production, send to security monitoring service
  if (severity === 'high') {
    // Alert security team
  }
};

// Session security
export const validateSession = (sessionData: any): boolean => {
  if (!sessionData || !sessionData.exp) return false;
  
  const now = Math.floor(Date.now() / 1000);
  return sessionData.exp > now;
};

// IP-based blocking (basic implementation)
const blockedIPs = new Set<string>();

export const blockIP = (ip: string): void => {
  blockedIPs.add(ip);
  logSecurityEvent('IP_BLOCKED', { ip }, 'high');
};

export const isIPBlocked = (ip: string): boolean => {
  return blockedIPs.has(ip);
};