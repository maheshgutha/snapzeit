import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/api/client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

// Module-level cache shared by every component using the hook, so a grid of
// photographer cards triggers one fetch instead of one per card.
let cachedIds: Set<string> | null = null;
let cachedForUserId: string | null = null;
let inflight: Promise<Set<string>> | null = null;
const subscribers = new Set<(ids: Set<string>) => void>();

function notify(ids: Set<string>) {
  cachedIds = ids;
  subscribers.forEach((fn) => fn(new Set(ids)));
}

async function loadFavorites(userId: string): Promise<Set<string>> {
  if (cachedIds && cachedForUserId === userId) return cachedIds;
  if (inflight) return inflight;

  inflight = (async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);
    inflight = null;
    if (error) {
      console.error('Error loading favorites:', error);
      return cachedIds ?? new Set<string>();
    }
    cachedForUserId = userId;
    const ids = new Set<string>((data || []).map((f: any) => f.photographer_id));
    notify(ids);
    return ids;
  })();

  return inflight;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(cachedIds ?? new Set());
  const [loading, setLoading] = useState(!cachedIds);

  useEffect(() => {
    const subscriber = (ids: Set<string>) => setFavoriteIds(ids);
    subscribers.add(subscriber);

    if (user) {
      loadFavorites(user.id).then((ids) => {
        setFavoriteIds(new Set(ids));
        setLoading(false);
      });
    } else {
      cachedIds = null;
      cachedForUserId = null;
      setFavoriteIds(new Set());
      setLoading(false);
    }

    return () => {
      subscribers.delete(subscriber);
    };
  }, [user]);

  const isFavorite = useCallback((photographerId: string) => favoriteIds.has(photographerId), [favoriteIds]);

  const toggleFavorite = useCallback(async (photographerId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    const currentlyFavorite = favoriteIds.has(photographerId);

    // Optimistic update
    const next = new Set(favoriteIds);
    if (currentlyFavorite) next.delete(photographerId);
    else next.add(photographerId);
    notify(next);

    if (currentlyFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('photographer_id', photographerId);
      if (error) {
        toast.error('Could not remove favorite');
        const reverted = new Set(next);
        reverted.add(photographerId);
        notify(reverted);
      }
    } else {
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        photographer_id: photographerId,
        created_at: new Date().toISOString(),
      });
      if (error) {
        toast.error('Could not save favorite');
        const reverted = new Set(next);
        reverted.delete(photographerId);
        notify(reverted);
      } else {
        toast.success('Added to favorites');
      }
    }
  }, [user, favoriteIds]);

  return { favoriteIds, isFavorite, toggleFavorite, loading };
}
