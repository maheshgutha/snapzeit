import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PhotographerCard from '@/components/PhotographerCard';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/api/client';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/hooks/useFavorites';

interface Photographer {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  review_count: number;
  price_per_hour: number;
  currency?: string;
  avatar_url?: string;
  tags?: string[];
  [key: string]: any;
}

export default function Favorites() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { favoriteIds, loading: favoritesLoading } = useFavorites();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchPhotographers = async () => {
      if (favoritesLoading) return;

      const ids = Array.from(favoriteIds);
      if (ids.length === 0) {
        setPhotographers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .in('id', ids);

      if (!error && data) {
        setPhotographers(data);
      }
      setLoading(false);
    };

    fetchPhotographers();
  }, [favoriteIds, favoritesLoading]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">Photographers you've saved</p>
          </div>
        </div>

        {loading || favoritesLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : photographers.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Tap the heart on any photographer to save them here.
            </p>
            <Link to="/photographers">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Browse Photographers
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photographers.map((photographer) => (
              <PhotographerCard key={photographer.id} photographer={photographer as any} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
