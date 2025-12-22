import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock } from 'lucide-react';

interface IndicadorMultiplosAgendamentosProps {
  quantidade: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'dot' | 'counter';
  showIcon?: boolean;
  className?: string;
}

const IndicadorMultiplosAgendamentos: React.FC<IndicadorMultiplosAgendamentosProps> = ({
  quantidade,
  size = 'sm',
  variant = 'badge',
  showIcon = false,
  className = ''
}) => {
  if (quantidade <= 1) {
    return null;
  }

  const getColorClass = (qty: number) => {
    if (qty >= 5) return 'bg-red-500 text-white border-red-600';
    if (qty >= 3) return 'bg-orange-500 text-white border-orange-600';
    return 'bg-blue-500 text-white border-blue-600';
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'lg':
        return 'text-sm px-2 py-1 min-w-[24px] h-6';
      case 'md':
        return 'text-xs px-1.5 py-0.5 min-w-[20px] h-5';
      case 'sm':
      default:
        return 'text-xs px-1 py-0.5 min-w-[16px] h-4';
    }
  };

  const renderBadge = () => (
    <Badge 
      className={`
        ${getColorClass(quantidade)} 
        ${getSizeClasses(size)}
        font-bold rounded-full flex items-center justify-center
        shadow-sm border-2
        ${className}
      `}
    >
      {showIcon && <Users className="w-3 h-3 mr-1" />}
      {quantidade}
    </Badge>
  );

  const renderDot = () => (
    <div 
      className={`
        ${getColorClass(quantidade)}
        rounded-full flex items-center justify-center
        font-bold text-white shadow-sm border-2
        ${size === 'lg' ? 'w-6 h-6 text-sm' : size === 'md' ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-xs'}
        ${className}
      `}
    >
      {quantidade}
    </div>
  );

  const renderCounter = () => (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && <Calendar className="w-3 h-3 text-gray-500" />}
      <span className={`
        ${getColorClass(quantidade)}
        rounded px-1.5 py-0.5 text-xs font-bold
      `}>
        {quantidade}
      </span>
    </div>
  );

  switch (variant) {
    case 'dot':
      return renderDot();
    case 'counter':
      return renderCounter();
    case 'badge':
    default:
      return renderBadge();
  }
};

export default IndicadorMultiplosAgendamentos;