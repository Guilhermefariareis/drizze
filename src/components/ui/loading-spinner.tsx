import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ isLoading, text = 'Carregando...', children, className }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingText?: string;
  emptyText?: string;
  isEmpty?: boolean;
}

export function LoadingState({ 
  isLoading, 
  error, 
  children, 
  loadingText = 'Carregando...', 
  emptyText = 'Nenhum item encontrado',
  isEmpty = false 
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text={loadingText} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Erro</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📋</div>
          <p className="text-gray-600">{emptyText}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}