import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatsCardProps } from '@/types';

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className
}: StatsCardProps) => {
  return (
    <Card
      className={cn(
        'shadow-soft hover:shadow-elevation transition-all duration-200',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-foreground">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary-soft rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
