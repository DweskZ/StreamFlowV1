import { Badge } from '@/components/ui/badge';
import { Crown, Zap } from 'lucide-react';
import { usePlanInfo } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface PlanBadgeProps {
  variant?: 'default' | 'outline';
  showIcon?: boolean;
  className?: string;
  clickable?: boolean;
}

export const PlanBadge = ({ 
  variant = 'default', 
  showIcon = true, 
  className = '',
  clickable = false
}: PlanBadgeProps) => {
  const { planName, isPremium } = usePlanInfo();
  const navigate = useNavigate();

  const handleClick = () => {
    if (clickable && !isPremium) {
      navigate('/app/pricing');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && !isPremium && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      navigate('/app/pricing');
    }
  };

  const getIconAndColors = () => {
    if (isPremium) {
      return {
        icon: Crown,
        bgColor: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
        textColor: 'text-yellow-500',
        borderColor: 'border-yellow-500/30'
      };
    }
    
    return {
      icon: Zap,
      bgColor: 'bg-gray-500/20',
      textColor: 'text-gray-500',
      borderColor: 'border-gray-500/30'
    };
  };

  const { icon: Icon, bgColor, textColor, borderColor } = getIconAndColors();

  if (variant === 'outline') {
    return (
      <Badge 
        variant="outline" 
        className={`${textColor} ${borderColor} ${className} ${
          clickable && !isPremium ? 'cursor-pointer hover:bg-blue-500/10 transition-colors' : ''
        }`}
        onClick={handleClick}
      >
        {showIcon && <Icon className="w-3 h-3 mr-1" />}
        {planName}
      </Badge>
    );
  }

  return (
    <div 
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
        ${bgColor} ${textColor} ${borderColor} border backdrop-blur-sm
        ${clickable && !isPremium ? 'cursor-pointer hover:bg-blue-500/10 transition-colors' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable && !isPremium ? "button" : undefined}
      tabIndex={clickable && !isPremium ? 0 : undefined}
      aria-label={clickable && !isPremium ? "Upgrade to premium plan" : undefined}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {planName}
    </div>
  );
};

interface PlanStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const PlanStatus = ({ showDetails = true, className = '' }: PlanStatusProps) => {
  const { 
    isPremium, 
    isFreePlan,
    planLimits
  } = usePlanInfo();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <PlanBadge />
        {isPremium && (
          <span className="text-xs text-yellow-500/80">
            ✨ Premium activo
          </span>
        )}
      </div>
      
      {showDetails && (
        <div className="text-xs text-muted-foreground space-y-1">
          {isFreePlan && (
            <>
              <div>• Máximo {planLimits.maxPlaylists} playlists</div>
              <div>• Con anuncios</div>
              <div>• Calidad estándar</div>
            </>
          )}
          
          {isPremium && (
            <>
              <div>• Playlists ilimitadas</div>
              <div>• Sin anuncios</div>
              <div>• Calidad premium</div>
              <div>• Descargas offline</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
