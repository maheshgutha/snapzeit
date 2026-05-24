import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SEOImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
  blurDataURL?: string;
}

export function SEOImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
  srcSet,
  onLoad,
  onError,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2NjIj5JbWFnZTwvdGV4dD48L3N2Zz4=',
  blurDataURL
}: SEOImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!loading || loading === 'eager' || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'lazy' && !priority && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [loading, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive srcSet if not provided
  const generateSrcSet = (baseSrc: string) => {
    if (srcSet) return srcSet;
    
    const baseUrl = baseSrc.split('?')[0];
    const params = baseSrc.includes('?') ? '&' + baseSrc.split('?')[1] : '';
    
    return [
      `${baseUrl}?w=400${params} 400w`,
      `${baseUrl}?w=800${params} 800w`,
      `${baseUrl}?w=1200${params} 1200w`,
      `${baseUrl}?w=1600${params} 1600w`
    ].join(', ');
  };

  // Generate sizes attribute if not provided
  const generateSizes = () => {
    if (sizes) return sizes;
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
    >
      {/* Placeholder/Blur */}
      {!isLoaded && !hasError && (
        <img
          src={blurDataURL || placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          srcSet={generateSrcSet(src)}
          sizes={generateSizes()}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          // SEO attributes
          itemProp="image"
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Specialized components for different use cases
export function PhotographerAvatar({ src, alt, name, ...props }: SEOImageProps & { name?: string }) {
  return (
    <SEOImage
      {...props}
      src={src}
      alt={alt || `${name} - Professional Photographer`}
      className={cn('rounded-full', props.className)}
      loading="lazy"
    />
  );
}

export function PortfolioImage({ src, alt, photographer, category, ...props }: SEOImageProps & { photographer?: string; category?: string }) {
  const enhancedAlt = alt || `${category} photography by ${photographer}`;
  
  return (
    <SEOImage
      {...props}
      src={src}
      alt={enhancedAlt}
      loading="lazy"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}

export function HeroImage({ src, alt, ...props }: SEOImageProps) {
  return (
    <SEOImage
      {...props}
      src={src}
      alt={alt}
      priority={true}
      loading="eager"
      sizes="100vw"
    />
  );
}

export default SEOImage;