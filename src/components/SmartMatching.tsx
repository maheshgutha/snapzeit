import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import { getSmartRecommendations, MatchScore, UserPreferences } from '@/utils/ai-matching';
import { forecastDemand, getMarketInsights } from '@/utils/predictive-analytics';

interface SmartMatchingProps {
  userPreferences: UserPreferences;
  photographers: any[];
  onSelectPhotographer: (id: string) => void;
}

export function SmartMatching({ userPreferences, photographers, onSelectPhotographer }: SmartMatchingProps) {
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (photographers.length > 0) {
      generateRecommendations();
    }
  }, [userPreferences, photographers]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const recommendations = await getSmartRecommendations(userPreferences, photographers);
      const marketInsights = getMarketInsights(userPreferences.location.split(',')[1] || 'US', userPreferences.location.split(',')[0]);
      
      setMatches(recommendations.slice(0, 3));
      setInsights(marketInsights);
    } catch (error) {
      console.error('AI matching failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>AI analyzing perfect matches...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Smart Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.map((match, index) => {
            const photographer = photographers.find(p => p.id === match.photographerId);
            return (
              <div key={match.photographerId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{photographer?.name}</span>
                    <Badge variant={match.confidence === 'high' ? 'default' : 'secondary'}>
                      {match.score}% match
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {match.reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-green-500" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={() => onSelectPhotographer(match.photographerId)}>
                  View Profile
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Current Demand:</span>
                <Badge className="ml-2" variant={insights.currentDemand === 'high' ? 'default' : 'secondary'}>
                  {insights.currentDemand}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Growth Rate:</span>
                <span className="ml-2 text-green-600">+{insights.growthRate}%</span>
              </div>
              <div>
                <span className="font-medium">Recommended Price:</span>
                <span className="ml-2 font-semibold">${insights.recommendedPricing}</span>
              </div>
              <div>
                <span className="font-medium">Peak Season:</span>
                <span className="ml-2">{insights.peakSeasons.join(', ')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SmartMatching;