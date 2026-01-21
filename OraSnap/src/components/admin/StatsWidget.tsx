import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsWidget({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
}: StatsWidgetProps) {
  const getTrendIcon = () => {
    if (!trend || trend === 0) return <Minus className="h-3 w-3" />;
    return trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-muted-foreground';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend !== undefined && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
                {getTrendIcon()}
                <span>{Math.abs(trend)}%</span>
                {trendLabel && (
                  <span className="text-muted-foreground font-normal">{trendLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", iconBgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
