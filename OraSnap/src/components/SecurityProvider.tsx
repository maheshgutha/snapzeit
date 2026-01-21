import { useEffect, useState, ReactNode } from 'react';
import { rateLimit, detectSuspiciousActivity, logSecurityEvent, isIPBlocked } from '@/utils/security';

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Initialize security measures
    initializeSecurity();
    
    // Set up security monitoring
    setupSecurityMonitoring();
    
    // Generate CSRF token
    const token = generateCSRFToken();
    setCsrfToken(token);
    sessionStorage.setItem('csrf_token', token);
  }, []);

  const initializeSecurity = () => {
    // Get user's IP (in production, this would come from server)
    const userIP = 'client_ip'; // Placeholder
    
    // Check if IP is blocked
    if (isIPBlocked(userIP)) {
      setIsBlocked(true);
      return;
    }

    // Rate limiting check
    if (!rateLimit(userIP)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip: userIP }, 'high');
      setIsBlocked(true);
      return;
    }

    // Detect suspicious activity
    if (detectSuspiciousActivity(navigator.userAgent, userIP)) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY', { 
        userAgent: navigator.userAgent, 
        ip: userIP 
      }, 'medium');
    }
  };

  const setupSecurityMonitoring = () => {
    // Monitor for console access attempts
    let devtools = false;
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true;
          logSecurityEvent('DEVTOOLS_DETECTED', {}, 'low');
        }
      } else {
        devtools = false;
      }
    }, 500);

    // Monitor for right-click attempts
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      logSecurityEvent('RIGHT_CLICK_ATTEMPT', {}, 'low');
    });

    // Monitor for key combinations
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || 
          e.key === 's' || e.key === 'S' || 
          e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        logSecurityEvent('KEYBOARD_SHORTCUT_BLOCKED', { key: e.key }, 'low');
      }
    });

    // Monitor for copy attempts
    document.addEventListener('copy', () => {
      logSecurityEvent('COPY_ATTEMPT', {}, 'low');
    });
  };

  const generateCSRFToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Blocked</h1>
          <p className="text-red-500">Your access has been temporarily restricted due to suspicious activity.</p>
          <p className="text-sm text-gray-500 mt-4">Contact support if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-csrf-token={csrfToken}>
      {children}
    </div>
  );
}