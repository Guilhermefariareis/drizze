import React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  imageHeight?: number;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right';
  loading?: boolean;
  loadingText?: string;
}

/**
 * Componente de card responsivo que se adapta a diferentes tamanhos de tela
 */
export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  borderRadius = 'md',
  shadow = 'md',
  hover = false,
  clickable = false,
  onClick,
  header,
  footer,
  title,
  subtitle,
  image,
  imageHeight = 200,
  imagePosition = 'top',
  loading = false,
  loadingText = 'Carregando...',
}) => {
  const breakpoint = useBreakpoint();

  // Padding responsivo baseado no breakpoint
  const getResponsivePadding = () => {
    const paddingMap = {
      none: 'p-0',
      sm: {
        mobile: 'p-3',
        tablet: 'p-4',
        desktop: 'p-4',
      },
      md: {
        mobile: 'p-4',
        tablet: 'p-5',
        desktop: 'p-6',
      },
      lg: {
        mobile: 'p-5',
        tablet: 'p-6',
        desktop: 'p-8',
      },
      xl: {
        mobile: 'p-6',
        tablet: 'p-8',
        desktop: 'p-10',
      },
    };

    if (padding === 'none') return paddingMap.none;
    return paddingMap[padding][breakpoint];
  };

  // Border radius responsivo
  const getBorderRadius = () => {
    const radiusMap = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    };
    return radiusMap[borderRadius];
  };

  // Shadow responsivo
  const getShadow = () => {
    const shadowMap = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };
    return shadowMap[shadow];
  };

  // Variantes de estilo
  const getVariantClasses = () => {
    const variantMap = {
      default: 'bg-white border border-gray-200',
      outlined: 'bg-transparent border-2 border-gray-300',
      elevated: 'bg-white border-0',
      filled: 'bg-gray-50 border border-gray-200',
    };
    return variantMap[variant];
  };

  const cardClasses = cn(
    'relative overflow-hidden transition-all duration-200',
    getVariantClasses(),
    getBorderRadius(),
    getShadow(),
    getResponsivePadding(),
    hover && !clickable && 'hover:shadow-lg hover:-translate-y-1',
    clickable && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
    loading && 'opacity-75 pointer-events-none',
    className
  );

  const handleClick = () => {
    if (!loading && clickable && onClick) {
      onClick();
    }
  };

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{loadingText}</span>
        </div>
      </div>
    );
  }

  const renderContent = () => (
    <>
      {/* Header */}
      {header && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          {header}
        </div>
      )}

      {/* Título e subtítulo */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Imagem */}
      {image && (
        <div className={cn(
          'mb-4 overflow-hidden',
          imagePosition === 'top' && 'order-first',
          imagePosition === 'bottom' && 'order-last',
          getBorderRadius()
        )}>
          <img
            src={image}
            alt={title || 'Card image'}
            className="w-full h-auto object-cover"
            style={{ height: imageHeight }}
            loading="lazy"
          />
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyPress={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
    >
      {renderContent()}
    </div>
  );
};

/**
 * Componente de grid de cards responsivo
 */
export const ResponsiveCardGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}> = ({
  children,
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
}) => {
  const breakpoint = useBreakpoint();

  const getGridClasses = () => {
    const cols = columns[breakpoint] || columns.desktop;
    const gapSize = gap[breakpoint] || gap.desktop;
    
    const gapMap = {
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
    };

    return `grid grid-cols-${cols} ${gapMap[gapSize as keyof typeof gapMap] || 'gap-4'}`;
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
};

/**
 * Componente de card de métrica responsivo
 */
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  className?: string;
  loading?: boolean;
}> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
  className,
  loading = false,
}) => {
  const breakpoint = useBreakpoint();

  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  const getFontSize = () => {
    if (breakpoint === 'mobile') return 'text-2xl';
    if (breakpoint === 'tablet') return 'text-3xl';
    return 'text-4xl';
  };

  return (
    <ResponsiveCard
      variant="filled"
      className={cn(colorMap[color], className)}
      padding="md"
      loading={loading}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75 mb-1">
            {title}
          </p>
          <p className={cn('font-bold mb-1', getFontSize())}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm opacity-75">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                'text-sm font-medium',
                trend.positive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.positive ? '↗' : '↘'} {trend.value}%
              </span>
              <span className="text-sm opacity-75 ml-1">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </ResponsiveCard>
  );
};

/**
 * Componente de card de ação responsivo
 */
export const ActionCard: React.FC<{
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  variant = 'primary',
  className,
  disabled = false,
  loading = false,
}) => {
  const breakpoint = useBreakpoint();

  const variantMap = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const getButtonSize = () => {
    if (breakpoint === 'mobile') return 'px-4 py-2 text-sm';
    return 'px-6 py-3';
  };

  return (
    <ResponsiveCard
      variant="default"
      className={cn('text-center', className)}
      padding="lg"
    >
      {icon && (
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6">
        {description}
      </p>
      <button
        onClick={onAction}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          variantMap[variant],
          getButtonSize(),
          (disabled || loading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        )}
        {actionText}
      </button>
    </ResponsiveCard>
  );
};