import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const getStrengthColor = (label: string) => {
  switch (label) {
    case 'Débil': return 'text-red-400';
    case 'Media': return 'text-yellow-400';
    case 'Fuerte': return 'text-green-400';
    default: return 'text-emerald-400';
  }
};

export const PasswordStrength = ({ password, className = '' }: PasswordStrengthProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    
    // Consecutive characters penalty
    if (!/(.)\1{2,}/.test(password)) score += 1;
    
    const maxScore = 7;
    const percentage = (score / maxScore) * 100;
    
    if (score <= 2) {
      return { score: percentage, label: 'Débil', color: 'bg-red-500' };
    } else if (score <= 4) {
      return { score: percentage, label: 'Media', color: 'bg-yellow-500' };
    } else if (score <= 6) {
      return { score: percentage, label: 'Fuerte', color: 'bg-green-500' };
    } else {
      return { score: percentage, label: 'Muy fuerte', color: 'bg-emerald-500' };
    }
  }, [password]);

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">Seguridad de la contraseña</span>
        <span className={`text-xs font-medium ${getStrengthColor(strength.label)}`}>
          {strength.label}
        </span>
      </div>
      <Progress 
        value={strength.score} 
        className="h-2 bg-white/10"
      />
      <div className="text-xs text-gray-400 space-y-1">
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className={password.length >= 8 ? 'text-green-400' : 'text-gray-500'}>
            • 8+ caracteres
          </span>
          <span className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'}>
            • Mayúsculas
          </span>
          <span className={/[a-z]/.test(password) ? 'text-green-400' : 'text-gray-500'}>
            • Minúsculas
          </span>
          <span className={/\d/.test(password) ? 'text-green-400' : 'text-gray-500'}>
            • Números
          </span>
        </div>
      </div>
    </div>
  );
};
