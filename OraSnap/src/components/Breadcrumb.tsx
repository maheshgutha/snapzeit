import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation();
  
  // Generate breadcrumbs from URL if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(location.search);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Custom labels for specific routes
      const labelMap: { [key: string]: string } = {
        'photographers': 'Find Photographers',
        'categories': 'Photography Categories', 
        'locations': 'Browse Locations',
        'pricing': 'Pricing Plans',
        'how-it-works': 'How It Works',
        'contact': 'Contact Us',
        'auth': 'Sign In',
        'photographer': 'Photographer Profile',
        'register': 'Registration',
        'dashboard': 'Dashboard',
        'onboarding': 'Complete Profile'
      };
      
      if (labelMap[segment]) {
        label = labelMap[segment];
      }
      
      // Handle dynamic labels based on URL parameters
      if (segment === 'photographers' && searchParams.get('location')) {
        const locationName = searchParams.get('location');
        label = `Photographers in ${locationName}`;
      }
      
      breadcrumbs.push({
        label,
        href: currentPath + (isLast ? location.search : ''),
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Add breadcrumb structured data for SEO
  useEffect(() => {
    const breadcrumbStructuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `https://orasnap.com${item.href}`
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(breadcrumbStructuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[data-breadcrumb="true"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [breadcrumbItems]);

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`py-4 ${className}`}
    >
      <div className="container">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              
              {item.current ? (
                <span 
                  className="text-gray-900 dark:text-white font-medium"
                  aria-current="page"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

export default Breadcrumb;