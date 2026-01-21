import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
}

function LazyImage({ 
  src, 
  alt, 
  className, 
  onClick 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  onClick?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={imgRef} 
      className={cn(
        "relative overflow-hidden bg-secondary group cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-secondary via-muted to-secondary" />
      )}
      {inView && (
        <>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              loaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
              "group-hover:scale-110"
            )}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </>
      )}
    </div>
  );
}

export function PhotoGallery({ images, alt = "Gallery image", className }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setSelectedIndex(null);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground">
        No photos available
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        "grid gap-3",
        images.length === 1 && "grid-cols-1",
        images.length === 2 && "grid-cols-2",
        images.length === 3 && "grid-cols-3",
        images.length === 4 && "grid-cols-2 md:grid-cols-4",
        images.length >= 5 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}>
        {images.map((image, index) => (
          <LazyImage
            key={index}
            src={image}
            alt={`${alt} ${index + 1}`}
            className={cn(
              "rounded-xl aspect-square",
              index === 0 && images.length >= 5 && "md:col-span-2 md:row-span-2"
            )}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent 
          className="max-w-5xl p-0 bg-black/95 border-0"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            {selectedIndex !== null && selectedIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {selectedIndex !== null && (
              <img
                src={images[selectedIndex]}
                alt={`${alt} ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {selectedIndex !== null && selectedIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {selectedIndex !== null && `${selectedIndex + 1} / ${images.length}`}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
