import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

// Loading State Component
export const LoadingState = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-pulse text-sm text-muted-foreground">Loading...</div>
  </div>
);

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
}

export const EmptyState = ({ icon, message }: EmptyStateProps) => (
  <div className="text-center py-8">
    <div className="text-muted-foreground/50 mx-auto mb-2">{icon}</div>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

// Card Header with Icon Component
interface CardHeaderWithIconProps {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  viewAllPath?: string;
  viewAllLabel?: string;
}

export const CardHeaderWithIcon = ({
  icon,
  iconBgClass,
  title,
  viewAllPath,
  viewAllLabel = 'View All'
}: CardHeaderWithIconProps) => {
  const navigate = useNavigate();

  return (
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBgClass}`}>{icon}</div>
          <span>{title}</span>
        </div>
        {viewAllPath && (
          <button
            onClick={() => navigate(viewAllPath)}
            className='text-xs text-primary hover:underline font-normal'
          >
            {viewAllLabel}
          </button>
        )}
      </CardTitle>
    </CardHeader>
  );
};

// Stat Item Component
interface StatItemProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  bgClass: string;
}

export const StatItem = ({ icon, value, label, bgClass }: StatItemProps) => (
  <div className={`text-center p-2 rounded-lg ${bgClass}`}>
    <div className="mx-auto mb-1">{icon}</div>
    <p className="text-lg font-semibold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
      {label}
    </p>
  </div>
);

// Percentage Display Component
interface PercentageDisplayProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PercentageDisplay = ({
  value,
  size = 'lg'
}: PercentageDisplayProps) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`${sizeClasses[size]} font-bold text-foreground`}>
      {value}%
    </div>
  );
};

// Summary Card Wrapper
interface SummaryCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SummaryCard = ({ children, className = '' }: SummaryCardProps) => (
  <Card className={`shadow-soft h-full ${className}`}>{children}</Card>
);

// Profile Info Item Component
interface ProfileInfoItemProps {
  icon: React.ReactNode;
  iconBgClass: string;
  label: string;
  value: string | number;
  truncate?: boolean;
}

export const ProfileInfoItem = ({
  icon,
  iconBgClass,
  label,
  value,
  truncate = false
}: ProfileInfoItemProps) => (
  <div className="flex items-center gap-2">
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBgClass}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-sm font-medium ${truncate ? 'truncate max-w-[120px]' : ''}`}
      >
        {value}
      </p>
    </div>
  </div>
);
