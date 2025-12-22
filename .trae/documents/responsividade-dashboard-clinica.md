# Documento Técnico: Implementação de Responsividade - Dashboard da Clínica

## 1. Visão Geral

Este documento define os padrões técnicos para implementação de responsividade completa no dashboard da clínica, garantindo adaptação automática a diferentes tamanhos de tela com foco em centralização, consistência visual e acessibilidade.

## 2. Especificações de Breakpoints

### 2.1 Definições de Breakpoints

```css
/* Breakpoints principais */
@media (min-width: 1200px) { /* Desktop */ }
@media (min-width: 768px) and (max-width: 1199px) { /* Tablet */ }
@media (max-width: 767px) { /* Mobile */ }

/* Breakpoints auxiliares para refinamento */
@media (min-width: 1400px) { /* Desktop Large */ }
@media (min-width: 992px) and (max-width: 1199px) { /* Tablet Large */ }
@media (min-width: 576px) and (max-width: 767px) { /* Mobile Large */ }
@media (max-width: 375px) { /* Mobile Small */ }
```

### 2.2 Configuração Tailwind CSS

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
        '2xl': '1400px',
      },
      spacing: {
        'section': 'clamp(1.5rem, 4vw, 3rem)',
        'container': 'clamp(1rem, 3vw, 2rem)',
      },
      fontSize: {
        'responsive-sm': 'clamp(0.875rem, 1.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 2vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 2.5vw, 1.5rem)',
        'responsive-xl': 'clamp(1.25rem, 3vw, 2rem)',
        'responsive-2xl': 'clamp(1.5rem, 4vw, 2.5rem)',
      }
    }
  }
}
```

## 3. Grid System Flexível

### 3.1 Container Principal Responsivo

```tsx
// Componente ContainerResponsivo.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerResponsivoProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}

export const ContainerResponsivo: React.FC<ContainerResponsivoProps> = ({ 
  children, 
  className, 
  centered = true 
}) => {
  return (
    <div className={cn(
      "w-full mx-auto",
      "px-4 sm:px-6 lg:px-8", // Padding responsivo
      "max-w-full lg:max-w-7xl", // Largura máxima progressiva
      centered && "flex flex-col items-center justify-center min-h-screen",
      className
    )}>
      <div className={cn(
        "w-full",
        centered && "max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
      )}>
        {children}
      </div>
    </div>
  );
};
```

### 3.2 Grid System Adaptativo

```tsx
// Componente GridResponsivo.tsx
export const GridResponsivo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={cn(
      "grid gap-4 sm:gap-6 lg:gap-8",
      "grid-cols-1", // Mobile: 1 coluna
      "sm:grid-cols-2", // Tablet pequeno: 2 colunas
      "md:grid-cols-3", // Tablet grande: 3 colunas
      "lg:grid-cols-4", // Desktop: 4 colunas
      "xl:grid-cols-5", // Desktop grande: 5 colunas
      "2xl:grid-cols-6" // Desktop extra: 6 colunas
    )}>
      {children}
    </div>
  );
};
```

## 4. Centralização de Elementos

### 4.1 Dashboard Header Responsivo

```tsx
// DashboardHeader.tsx
export const DashboardHeader: React.FC = () => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between",
      "gap-4 sm:gap-6 lg:gap-8",
      "mb-6 sm:mb-8 lg:mb-10",
      "text-center sm:text-left"
    )}>
      <div className="flex-1 min-w-0">
        <h1 className={cn(
          "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900",
          "mb-2 sm:mb-3 lg:mb-4",
          "truncate" // Evita overflow de texto longo
        )}>
          Dashboard da Clínica
        </h1>
        <p className={cn(
          "text-responsive-sm text-gray-600",
          "max-w-full lg:max-w-2xl"
        )}>
          Gerencie suas operações e acompanhe o desempenho da clínica
        </p>
      </div>
      
      <div className={cn(
        "flex flex-col sm:flex-row items-center gap-2 sm:gap-4",
        "w-full sm:w-auto"
      )}>
        {/* Botões de ação */}
        <button className={cn(
          "w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg",
          "hover:bg-blue-700 transition-colors",
          "text-sm sm:text-base"
        )}>
          Nova Consulta
        </button>
      </div>
    </div>
  );
};
```

### 4.2 Cards de Métricas Centralizados

```tsx
// MetricCard.tsx
export const MetricCard: React.FC<{ title: string; value: string; change: string }> = ({ 
  title, 
  value, 
  change 
}) => {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200",
      "p-4 sm:p-6 lg:p-8",
      "flex flex-col items-center justify-center text-center",
      "hover:shadow-md transition-shadow duration-200"
    )}>
      <h3 className={cn(
        "text-responsive-sm font-medium text-gray-600 mb-2",
        "text-center"
      )}>
        {title}
      </h3>
      <div className={cn(
        "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2",
        "text-center"
      )}>
        {value}
      </div>
      <div className={cn(
        "text-sm text-green-600 font-medium",
        "text-center"
      )}>
        {change}
      </div>
    </div>
  );
};
```

## 5. Ajustes de Fonte e Espaçamento

### 5.1 Sistema de Tipografia Responsivo

```css
/* Tipografia responsiva base */
.text-responsive-heading {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
  font-weight: 700;
}

.text-responsive-subheading {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  line-height: 1.3;
  font-weight: 600;
}

.text-responsive-body {
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.5;
}

.text-responsive-small {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  line-height: 1.4;
}
```

### 5.2 Espaçamentos Responsivos

```tsx
// Espaçamentos consistentes por breakpoint
const spacingConfig = {
  section: {
    mobile: "py-6 px-4",      // Mobile: 24px vertical, 16px horizontal
    tablet: "py-8 px-6",      // Tablet: 32px vertical, 24px horizontal
    desktop: "py-12 px-8",    // Desktop: 48px vertical, 32px horizontal
  },
  component: {
    mobile: "gap-4 p-4",      // Mobile: 16px gap, 16px padding
    tablet: "gap-6 p-6",      // Tablet: 24px gap, 24px padding
    desktop: "gap-8 p-8",     // Desktop: 32px gap, 32px padding
  },
  text: {
    mobile: "mb-4",           // Mobile: 16px margin-bottom
    tablet: "mb-6",           // Tablet: 24px margin-bottom
    desktop: "mb-8",            // Desktop: 32px margin-bottom
  }
};
```

## 6. Media Queries CSS

### 6.1 Dashboard Layout Responsivo

```css
/* Dashboard Layout - Mobile First */
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1rem;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet: 768px - 1199px */
@media (min-width: 768px) {
  .dashboard-container {
    padding: 1.5rem;
  }
  
  .dashboard-header {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop: 1200px+ */
@media (min-width: 1200px) {
  .dashboard-container {
    padding: 2rem;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}
```

### 6.2 Tabela Responsiva

```tsx
// TabelaResponsiva.tsx
export const TabelaResponsiva: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
      <div className="min-w-[768px] sm:min-w-0">
        <table className="w-full bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-50 hidden sm:table-header-group">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Procedimento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="block sm:table-row border-b sm:border-0">
                {/* Mobile Card View */}
                <td className="block sm:table-cell p-4" data-label="Paciente">
                  <div className="sm:hidden font-medium text-gray-900 mb-2">Paciente</div>
                  <div className="text-sm font-medium text-gray-900">{item.patient}</div>
                  <div className="sm:hidden text-xs text-gray-500 mt-1">
                    <div>{item.date}</div>
                    <div className="mt-1">{item.procedure}</div>
                  </div>
                </td>
                
                <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.date}
                </td>
                
                <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.procedure}
                </td>
                
                <td className="block sm:table-cell p-4" data-label="Status">
                  <div className="sm:hidden font-medium text-gray-900 mb-2">Status</div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.status}
                  </span>
                </td>
                
                <td className="block sm:table-cell p-4 text-right" data-label="Ações">
                  <div className="flex sm:justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      Ver
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

## 7. Componentes de Navegação Responsiva

### 7.1 Sidebar Responsiva

```tsx
// SidebarResponsiva.tsx
export const SidebarResponsiva: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      
      {/* Sidebar Overlay */}
      <div className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden",
        isOpen ? "block" : "hidden",
        { "lg:hidden": true }
      )} onClick={() => setIsOpen(false)} />
      
      {/* Sidebar Content */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-40",
        "w-64 bg-white shadow-lg transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:w-64 lg:shadow-none"
      )}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>
          <nav className="space-y-2">
            {/* Menu items */}
          </nav>
        </div>
      </div>
    </>
  );
};
```

### 7.2 Navbar Responsiva

```tsx
// NavbarResponsiva.tsx
export const NavbarResponsiva: React.FC = () => {
  return (
    <nav className={cn(
      "bg-white shadow-sm border-b",
      "sticky top-0 z-30"
    )}>
      <div className={cn(
        "max-w-full mx-auto",
        "px-4 sm:px-6 lg:px-8"
      )}>
        <div className={cn(
          "flex justify-between items-center",
          "h-16 lg:h-20"
        )}>
          <div className="flex items-center">
            <div className={cn(
              "text-xl sm:text-2xl font-bold text-gray-900",
              "hidden sm:block"
            )}>
              doutorizze
            </div>
            <div className={cn(
              "text-lg font-bold text-gray-900",
              "sm:hidden"
            )}>
              dz
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {/* Desktop Navigation */}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <span className="hidden sm:block text-sm text-gray-700">
                Carlos Mauricio
              </span>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
```

## 8. Testes e Validações

### 8.1 Checklist de Testes Responsivos

#### Mobile (≤ 767px)
- [ ] Layout em coluna única
- [ ] Fontes legíveis (mínimo 14px)
- [ ] Botões com área de toque mínima 44x44px
- [ ] Scroll horizontal apenas quando necessário
- [ ] Menu hamburger funcional
- [ ] Cards empilhados verticalmente
- [ ] Formulários com campos full-width
- [ ] Tabelas com scroll horizontal

#### Tablet (768px - 1199px)
- [ ] Grid de 2 colunas para cards
- [ ] Sidebar visível ou menu hamburger
- [ ] Fontes ajustadas proporcionalmente
- [ ] Espaçamentos consistentes
- [ ] Tabelas com colunas visíveis
- [ ] Formulários em 2 colunas quando apropriado

#### Desktop (≥ 1200px)
- [ ] Grid multi-coluna (3-6 colunas)
- [ ] Sidebar sempre visível
- [ ] Tabelas com todas as colunas
- [ ] Dashboard com layout horizontal
- [ ] Cards com informações completas

### 8.2 Testes de Navegador

```bash
# Comandos para testar em diferentes navegadores
npm run dev # Desenvolvimento local

# Testes de responsividade
npm run test:responsive # Testes automatizados de breakpoint
```

### 8.3 Ferramentas de Teste

1. **Chrome DevTools**: Device Mode
2. **Firefox Responsive Design Mode**
3. **Safari Web Inspector**
4. **BrowserStack**: Testes em dispositivos reais
5. **Lighthouse**: Análise de performance e acessibilidade

## 9. Padrões de Acessibilidade

### 9.1 Contraste e Legibilidade

```css
/* Garantir contraste WCAG 2.1 AA */
.text-primary {
  color: #1a202c; /* Preto com boa legibilidade */
  background-color: #ffffff;
  contrast-ratio: 21:1; /* Excelente contraste */
}

.text-secondary {
  color: #4a5568; /* Cinza com contraste adequado */
  contrast-ratio: 7.5:1; /* Cumpre WCAG AA */
}
```

### 9.2 Tamanhos de Toque

```css
/* Áreas de toque mínimas */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

.button-mobile {
  @media (max-width: 767px) {
    min-height: 48px;
    padding: 16px 24px;
    font-size: 16px; /* Previne zoom no iOS */
  }
}
```

## 10. Performance e Otimização

### 10.1 Lazy Loading de Componentes

```tsx
// Lazy loading para componentes pesados
const ChartComponent = lazy(() => import('./ChartComponent'));
const DataTable = lazy(() => import('./DataTable'));

// Skeleton loading para melhor UX
const SkeletonCard: React.FC = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
);
```

### 10.2 Otimização de Imagens

```tsx
// Componente de imagem responsiva
export const ImagemResponsiva: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <picture>
      <source media="(min-width: 1200px)" srcSet={`${src}?w=800`} />
      <source media="(min-width: 768px)" srcSet={`${src}?w=600`} />
      <source media="(max-width: 767px)" srcSet={`${src}?w=400`} />
      <img 
        src={`${src}?w=600`}
        alt={alt}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </picture>
  );
};
```

## 11. Documentação Escalável

### 11.1 Estrutura de Componentes

```
src/
├── components/
│   ├── responsive/
│   │   ├── ContainerResponsivo.tsx
│   │   ├── GridResponsivo.tsx
│   │   ├── TabelaResponsiva.tsx
│   │   ├── SidebarResponsiva.tsx
│   │   └── NavbarResponsiva.tsx
│   └── ui/
│       ├── ButtonResponsivo.tsx
│       ├── CardResponsivo.tsx
│       └── FormResponsivo.tsx
```

### 11.2 Padrões de Implementação

1. **Mobile First**: Sempre começar com mobile e escalar para cima
2. **Componentes Reutilizáveis**: Criar componentes genéricos para uso em todas as telas
3. **Consistência Visual**: Manter mesmos espaçamentos, cores e tipografia
4. **Performance**: Implementar lazy loading e otimização de imagens
5. **Acessibilidade**: Garantir contraste adequado e navegação por teclado

## 12. Métricas de Sucesso

### 12.1 KPIs de Responsividade

- **Tempo de Carregamento**: < 2s em 3G
- **Pontuação Lighthouse**: > 90 em mobile e desktop
- **Taxa de Rejeição**: < 40% em mobile
- **Tempo de Sessão**: > 2 minutos em todas as plataformas

### 12.2 Monitoramento

```tsx
// Hook para monitorar performance
export const usePerformanceMonitor = () => {
  useEffect(() => {
    const reportWebVitals = (metric: any) => {
      // Enviar métricas para analytics
      console.log('Web Vital:', metric);
    };
    
    // Monitorar breakpoints
    const handleResize = () => {
      const width = window.innerWidth;
      const breakpoint = width < 768 ? 'mobile' : width < 1200 ? 'tablet' : 'desktop';
      analytics.track('Breakpoint Usage', { breakpoint, width });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
};
```

## Conclusão

Esta documentação fornece uma base sólida para implementação de responsividade completa no dashboard da clínica, com padrões escaláveis para todo o sistema. A abordagem mobile-first garante experiência otimizada em todos os dispositivos, mantendo consistência visual e acessibilidade.