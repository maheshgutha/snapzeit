import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Camera, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ErrorHandler } from "../utils/errorHandler";
import { formatCurrency } from "../utils/validators";

interface Photographer {
  id: string;
  name: string;
  location: string;
  specialty: string;
  price_per_hour: number;
  currency: string;
  rating: number;
  review_count: number;
  portfolio: string[];
  avatar_url: string;
  bio: string;
}

export function PublicPhotographerBrowse() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const fetchPhotographers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_photographers');
      if (error) {
        ErrorHandler.handleSupabaseError(error, 'fetching photographers');
        return;
      }
      setPhotographers(data || []);
    } catch (error) {
      ErrorHandler.handleGenericError(error, 'Failed to load photographers');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate('/auth/signup?redirect=booking');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Photographer</h1>
        <p className="text-muted-foreground">Browse our talented photographers and book your session</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photographers.map((photographer) => (
          <Card key={photographer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              {photographer.portfolio?.[0] ? (
                <img 
                  src={photographer.portfolio[0]} 
                  alt={photographer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/60 text-white">
                  {formatCurrency(photographer.price_per_hour, photographer.currency)}/hr
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{photographer.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {photographer.location}
                  </div>
                </div>
                {photographer.avatar_url && (
                  <img 
                    src={photographer.avatar_url} 
                    alt={photographer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              </div>

              <Badge variant="outline" className="mb-2">
                {photographer.specialty}
              </Badge>

              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{photographer.rating}</span>
                </div>
                <div className="flex items-center ml-3 text-sm text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {photographer.review_count} reviews
                </div>
              </div>

              {photographer.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {photographer.bio}
                </p>
              )}

              <Button onClick={handleBookNow} className="w-full">
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {photographers.length === 0 && (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No photographers found</h3>
          <p className="text-muted-foreground">Check back later for available photographers</p>
        </div>
      )}
    </div>
  );
}