import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { LoadingSpinner, LoadingState } from './loading-spinner';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  error?: React.ReactNode;
  delay?: number;
}

interface LazyWrapperProps extends LazyComponentProps {
  children: React.ReactNode;
}

// Componente wrapper para lazy loading
export function LazyWrapper({ 
  children, 
  fallback = <LoadingState message="Carregando componente..." />,
  error = <div className="p-4 text-center text-red-600">Erro ao carregar componente</div>
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={error}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

// Error Boundary para capturar erros de lazy loading
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro no lazy loading:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// HOC para criar componentes lazy com configurações personalizadas
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentProps = {}
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper {...options}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

// Hook para lazy loading com preload
export function useLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  const [Component, setComponent] = React.useState<ComponentType<P> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    if (Component) return Component;
    
    setLoading(true);
    setError(null);
    
    try {
      const module = await importFn();
      setComponent(() => module.default);
      return module.default;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar componente');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [importFn, Component]);

  const preload = React.useCallback(() => {
    if (!Component && !loading) {
      loadComponent();
    }
  }, [Component, loading, loadComponent]);

  return {
    Component,
    loading,
    error,
    loadComponent,
    preload
  };
}

// Componente para lazy loading com intersection observer
interface LazyOnViewProps extends LazyComponentProps {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function LazyOnView({
  children,
  fallback = <LoadingSpinner size="lg" />,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  ...props
}: LazyOnViewProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasTriggered, setHasTriggered] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, triggerOnce]);

  return (
    <div ref={ref}>
      {(isVisible || hasTriggered) ? (
        <LazyWrapper {...props}>
          {children}
        </LazyWrapper>
      ) : (
        fallback
      )}
    </div>
  );
}

// Componente para lazy loading de imagens
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  fallback = <div className="bg-gray-200 animate-pulse rounded" />,
  rootMargin = '50px',
  threshold = 0.1,
  className = '',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {!isInView && (
        placeholder ? (
          <img src={placeholder} alt={alt} className="w-full h-full object-cover" />
        ) : (
          fallback
        )
      )}
      
      {isInView && (
        <>
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <LoadingSpinner size="sm" />
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
              <span className="text-sm">Erro ao carregar imagem</span>
            </div>
          ) : (
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              {...props}
            />
          )}
        </>
      )}
    </div>
  );
}

// Utilitário para criar lazy components pré-configurados
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  displayName?: string
): LazyExoticComponent<ComponentType<P>> => {
  const LazyComponent = lazy(importFn);
  
  if (displayName) {
    LazyComponent.displayName = `Lazy(${displayName})`;
  }
  
  return LazyComponent;
};

// Lazy components pré-configurados para o sistema
export const LazyCalendarioAgendamento = createLazyComponent(
  () => import('../agendamento/CalendarioAgendamento'),
  'CalendarioAgendamento'
);

export const LazyListaAgendamentos = createLazyComponent(
  () => import('../agendamento/ListaAgendamentos'),
  'ListaAgendamentos'
);

export const LazyFormularioAgendamento = createLazyComponent(
  () => import('../agendamento/FormularioAgendamento'),
  'FormularioAgendamento'
);

export const LazyRelatorios = createLazyComponent(
  () => import('../relatorios/Relatorios'),
  'Relatorios'
);

export const LazyConfiguracoes = createLazyComponent(
  () => import('../configuracoes/Configuracoes'),
  'Configuracoes'
);

// Hook para preload de componentes
export function usePreloadComponents() {
  const preloadCalendario = React.useCallback(() => {
    import('../agendamento/CalendarioAgendamento');
  }, []);

  const preloadLista = React.useCallback(() => {
    import('../agendamento/ListaAgendamentos');
  }, []);

  const preloadFormulario = React.useCallback(() => {
    import('../agendamento/FormularioAgendamento');
  }, []);

  const preloadRelatorios = React.useCallback(() => {
    import('../relatorios/Relatorios');
  }, []);

  const preloadConfiguracoes = React.useCallback(() => {
    import('../configuracoes/Configuracoes');
  }, []);

  const preloadAll = React.useCallback(() => {
    preloadCalendario();
    preloadLista();
    preloadFormulario();
    preloadRelatorios();
    preloadConfiguracoes();
  }, [preloadCalendario, preloadLista, preloadFormulario, preloadRelatorios, preloadConfiguracoes]);

  return {
    preloadCalendario,
    preloadLista,
    preloadFormulario,
    preloadRelatorios,
    preloadConfiguracoes,
    preloadAll
  };
}

export default LazyWrapper;