import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Camera, Award, Heart, MessageCircle } from 'lucide-react';
import { formatPriceLocal } from '@/lib/currency';
import { useFavorites } from '@/hooks/useFavorites';

interface Photographer {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string | null;
  price_per_hour: number;
  experience_years: number;
  rating: number;
  review_count: number;
  avatar_url: string | null;
  portfolio: string[];
  tags: string[];
  currency?: string;
  country?: string;
}

interface PhotographerCardProps {
  photographer: Photographer;
}

export default function PhotographerCard({ photographer }: PhotographerCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const portfolioImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop'
  ];

  const avatarImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  ];

  const portfolioImage = photographer.portfolio?.[0] || portfolioImages[0];
  const avatarImage = photographer.avatar_url || avatarImages[0];
  const saved = isFavorite(photographer.id);

  // Use the photographer's actual currency and price
  const displayCurrency = photographer.currency || 'USD';
  const displayPrice = photographer.price_per_hour;

  return (
    <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800 rounded-3xl hover:scale-[1.03] hover:-translate-y-1">
      {photographer.rating >= 4.8 && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 shadow-lg">
            ⭐ TOP RATED
          </Badge>
        </div>
      )}
      
      <div className="relative h-64 overflow-hidden">
        <img
          src={portfolioImage}
          alt={`${photographer.name}'s work`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">{photographer.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-3 border-white shadow-2xl">
                  <AvatarImage src={avatarImage} alt={photographer.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg">
                    {photographer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-white">
                <h3 className="font-black text-xl mb-1 drop-shadow-lg">{photographer.name}</h3>
                <div className="flex items-center gap-2 text-sm opacity-95">
                  <MapPin className="h-4 w-4" />
                  <span className="font-semibold">{photographer.location}</span>
                </div>
              </div>
            </div>
            <div className="text-right text-white">
              <div className="text-3xl font-black drop-shadow-lg">
                {formatPriceLocal(displayPrice, displayCurrency)}
              </div>
              <span className="text-sm opacity-90 font-semibold">/{t('photographers.perHour')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600 font-bold text-lg">{photographer.specialty}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <div className="text-lg font-bold text-blue-600">{photographer.experience_years}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('photographers.years')}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <div className="text-lg font-bold text-green-600">{photographer.review_count}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('photographers.reviews')}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
              <div className="text-lg font-bold text-purple-600 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-purple-500 text-purple-500" />
                {photographer.rating?.toFixed(1) ?? '—'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('photographers.rating', 'Rating')}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {photographer.tags?.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          <Link to={`/photographer/${photographer.id}`} className="block">
            <Button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl h-12 hover:scale-105 transition-all duration-300 shadow-xl text-lg">
              {t('photographers.viewProfile')}
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toggleFavorite(photographer.id)}
              className={`flex-1 rounded-xl hover:scale-105 transition-all border-2 hover:border-blue-500 hover:text-blue-600 ${saved ? 'border-pink-500 text-pink-600' : ''}`}
            >
              <Heart className={`h-4 w-4 mr-2 ${saved ? 'fill-pink-500 text-pink-500' : ''}`} />
              {saved ? t('common.saved', 'Saved') : t('common.save')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/messages?to=${photographer.id}`)}
              className="flex-1 rounded-xl hover:scale-105 transition-all border-2 hover:border-purple-500 hover:text-purple-600"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('common.message')}
            </Button>
          </div>
        </div>
      </CardContent>
      
      <div className="absolute bottom-4 right-4">
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg">
          <Award className="h-3 w-3 mr-1" />
          {t('common.verifiedPro')}
        </Badge>
      </div>
    </Card>
  );
}