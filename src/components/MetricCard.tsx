import { MetricValue } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  metric: MetricValue;
}

function getLevelColor(level: MetricValue['level']): string {
  switch (level) {
    case 'high':
      return 'bg-civic-blue/10 text-civic-blue';
    case 'moderate':
      return 'bg-muted text-muted-foreground';
    case 'low':
      return 'bg-secondary text-secondary-foreground';
  }
}

function getLevelLabel(level: MetricValue['level']): string {
  switch (level) {
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    case 'low':
      return 'Low';
  }
}

export function MetricCard({ title, metric }: MetricCardProps) {
  return (
    <div className="metric-section">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded',
          getLevelColor(metric.level)
        )}>
          {getLevelLabel(metric.level)}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {metric.description}
      </p>
      
      <p className="mt-2 text-xs text-muted-foreground/70">
        Period: {metric.timePeriod}
      </p>
    </div>
  );
}
