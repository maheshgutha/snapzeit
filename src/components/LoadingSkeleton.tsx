export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-secondary rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-secondary rounded w-5/6"></div>
    </div>
  );
}

export function PhotographerCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-secondary rounded-xl mb-4"></div>
      <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-secondary rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-secondary rounded w-2/3"></div>
    </div>
  );
}