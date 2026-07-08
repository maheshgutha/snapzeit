// SEO utility functions for SnapZeit
export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: any;
}

export const updatePageSEO = (seoData: SEOData) => {
  // Update title
  document.title = seoData.title;

  // Update meta description
  updateMetaTag('description', seoData.description);

  // Update keywords if provided
  if (seoData.keywords) {
    updateMetaTag('keywords', seoData.keywords);
  }

  // Update canonical URL
  if (seoData.canonical) {
    updateLinkTag('canonical', seoData.canonical);
  }

  // Update Open Graph tags
  updateMetaProperty('og:title', seoData.title);
  updateMetaProperty('og:description', seoData.description);
  updateMetaProperty('og:type', seoData.ogType || 'website');
  updateMetaProperty('og:url', seoData.canonical || window.location.href);
  
  if (seoData.ogImage) {
    updateMetaProperty('og:image', seoData.ogImage);
  }

  // Update Twitter Card tags
  updateMetaName('twitter:title', seoData.title);
  updateMetaName('twitter:description', seoData.description);
  if (seoData.ogImage) {
    updateMetaName('twitter:image', seoData.ogImage);
  }

  // Add structured data
  if (seoData.structuredData) {
    addStructuredData(seoData.structuredData);
  }
};

const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const updateMetaName = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const updateLinkTag = (rel: string, href: string) => {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const addStructuredData = (data: any) => {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"][data-dynamic]');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-dynamic', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// SEO data for different pages
export const seoData = {
  home: {
    title: 'SnapZeit - Find Professional Photographers Near You | Book Instantly',
    description: 'Book verified professional photographers for weddings, events, portraits and more. Browse 2,500+ photographers in 50+ countries. Instant booking, secure payments.',
    keywords: 'photography booking, professional photographers, wedding photographer, event photography, portrait photography, photographer near me',
    canonical: 'https://snapzeit.com/',
    ogImage: 'https://snapzeit.com/assets/snapzeit-og-image.jpg',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SnapZeit",
      "description": "Professional photographer booking platform",
      "url": "https://snapzeit.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://snapzeit.com/photographers?search={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        "https://facebook.com/snapzeit",
        "https://twitter.com/snapzeit",
        "https://instagram.com/snapzeit"
      ]
    }
  },
  
  photographers: {
    title: 'Professional Photographers Directory | Browse & Book | SnapZeit',
    description: 'Browse 2,500+ verified professional photographers worldwide. Filter by location, specialty, price. View portfolios, read reviews, book instantly.',
    keywords: 'professional photographers, photographer directory, wedding photographers, portrait photographers, event photographers, photography services',
    canonical: 'https://snapzeit.com/photographers',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Professional Photographers Directory",
      "description": "Browse verified professional photographers worldwide",
      "url": "https://snapzeit.com/photographers"
    }
  },

  categories: {
    title: 'Photography Categories | Wedding, Portrait, Event & More | SnapZeit',
    description: 'Explore photography categories: Wedding, Portrait, Event, Commercial, Fashion, Product photography and more. Find specialists for your specific needs.',
    keywords: 'photography categories, wedding photography, portrait photography, event photography, commercial photography, fashion photography',
    canonical: 'https://snapzeit.com/categories',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Photography Categories",
      "description": "Browse photography services by category",
      "url": "https://snapzeit.com/categories"
    }
  },

  locations: {
    title: 'Find Photographers by Location | 50+ Countries | SnapZeit',
    description: 'Find professional photographers in your city. Available in 200+ cities across 50+ countries. New York, London, Paris, Tokyo, Mumbai and more.',
    keywords: 'photographers by location, photographers near me, local photographers, city photographers, international photographers',
    canonical: 'https://snapzeit.com/locations',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Photographers by Location",
      "description": "Find photographers in your city or region",
      "url": "https://snapzeit.com/locations"
    }
  },

  pricing: {
    title: 'Photography Pricing Guide | Transparent Rates | SnapZeit',
    description: 'Transparent photography pricing. Wedding photography from $2,500, Portrait sessions from $300, Event photography from $800. No hidden fees.',
    keywords: 'photography pricing, photographer rates, wedding photography cost, portrait photography price, event photography rates',
    canonical: 'https://snapzeit.com/pricing'
  }
};

// Generate photographer-specific SEO data
export const generatePhotographerSEO = (photographer: any) => ({
  title: `${photographer.name} - ${photographer.specialty} in ${photographer.location} | SnapZeit`,
  description: `Book ${photographer.name}, professional ${photographer.specialty.toLowerCase()} in ${photographer.location}. ${photographer.experience_years}+ years experience, ${photographer.rating}★ rating. View portfolio and book instantly.`,
  keywords: `${photographer.name}, ${photographer.specialty}, ${photographer.location} photographer, professional photography, book photographer`,
  canonical: `https://snapzeit.com/photographer/${photographer.id}`,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": photographer.name,
    "description": photographer.bio || `Professional ${photographer.specialty} in ${photographer.location}`,
    "image": photographer.avatar_url,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": photographer.location,
      "addressCountry": photographer.country
    },
    "priceRange": `${photographer.currency || '$'}${photographer.price_per_hour}/hour`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": photographer.rating,
      "reviewCount": photographer.review_count
    },
    "serviceArea": photographer.location,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Photography Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": photographer.specialty,
            "description": `Professional ${photographer.specialty} services`
          }
        }
      ]
    }
  }
});

// Generate location-specific SEO data
export const generateLocationSEO = (location: string, country: string, photographerCount: number) => ({
  title: `Professional Photographers in ${location}, ${country} | Book Now | SnapZeit`,
  description: `Find and book ${photographerCount}+ professional photographers in ${location}, ${country}. Wedding, portrait, event photography. Verified profiles, instant booking.`,
  keywords: `photographers in ${location}, ${location} photographers, ${country} photographers, professional photography ${location}`,
  canonical: `https://snapzeit.com/locations/${location.toLowerCase().replace(/\s+/g, '-')}`,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Photographers in ${location}, ${country}`,
    "description": `Professional photographers available in ${location}`,
    "url": `https://snapzeit.com/locations/${location.toLowerCase().replace(/\s+/g, '-')}`,
    "about": {
      "@type": "Place",
      "name": location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location,
        "addressCountry": country
      }
    }
  }
});