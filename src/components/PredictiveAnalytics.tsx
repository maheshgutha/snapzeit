import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { forecastDemand, getMarketInsights, getDemandAlerts } from '@/utils/predictive-analytics';

interface PredictiveAnalyticsProps {
  country: string;
  city: string;
}

export function PredictiveAnalytics({ country, city }: PredictiveAnalyticsProps) {
  const [forecast, setForecast] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, city]);

  const loadAnalytics = () => {
    const demandForecast = forecastDemand(country, city, 'wedding', 3);
    const marketInsights = getMarketInsights(country, city);
    const demandAlerts = getDemandAlerts(country, city);
    
    setForecast(demandForecast);
    setInsights(marketInsights);
    setAlerts(demandAlerts);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Demand Forecast - {city}, {country}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecast.map((period, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{period.period}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{period.predictedBookings} bookings</div>
                    <div className="text-sm text-gray-500">{Math.round(period.confidence * 100)}% confidence</div>
                  </div>
                  <Badge variant={period.trend === 'increasing' ? 'default' : 'secondary'}>
                    {period.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Current Market</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Demand Level:</span>
                    <Badge variant={insights.currentDemand === 'high' ? 'default' : 'secondary'}>
                      {insights.currentDemand}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth Rate:</span>
                    <span className={insights.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                      {insights.growthRate > 0 ? '+' : ''}{insights.growthRate}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pricing</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Recommended:</span>
                    <span className="font-semibold">${insights.recommendedPricing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Avg:</span>
                    <span>${insights.competitorAnalysis.avgPrice}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Peak Seasons</h4>
              <div className="flex gap-2">
                {insights.peakSeasons.map((season: string, index: number) => (
                  <Badge key={index} variant="outline">{season}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Business Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium capitalize">{alert.type}</div>
                    <div className="text-sm text-gray-600">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PredictiveAnalytics;