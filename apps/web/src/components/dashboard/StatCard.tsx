import React from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon?: React.ReactNode;
  colorClass?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  colorClass = 'bg-primary',
}: StatCardProps) {
  const isTrendPositive = (trend ?? 0) > 0;

  return (
    <Card hoverable>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="text-xs">{title}</CardDescription>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon && (
          <div className={clsx('p-3 rounded-lg', colorClass, 'text-white')}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {isTrendPositive ? (
              <>
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm text-green-600 font-semibold">
                  {trend}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown size={16} className="text-red-600" />
                <span className="text-sm text-red-600 font-semibold">
                  {Math.abs(trend)}%
                </span>
              </>
            )}
            <span className="text-xs text-muted-foreground">vs yesterday</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
