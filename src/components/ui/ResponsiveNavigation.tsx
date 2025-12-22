import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint, useIsMobile } from '@/hooks/useBreakpoint';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  active?: boolean;
  disabled?: boolean;
}

export interface ResponsiveNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'sidebar';
  position?: 'top' | 'bottom' | 'left' | 'right';
  backgroundColor?: string;
  textColor?: string;
  activeColor?: string;
  hoverColor?: string;
  onItemClick?: (item: NavigationItem) => void;
  mobileBreakpoint?: 'mobile' | 'tablet';
}

/**
 * Componente de navegação responsivo que se adapta a diferentes tamanhos de tela
 */
export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  items,
  logo,
  className,
  variant = 'horizontal',
  position = 'top',
  backgroundColor = 'bg-white',
  textColor = 'text-gray-700',
  activeColor = 'text-blue-600 border-blue-600',
  hoverColor = 'hover:text-blue-600 hover:bg-gray-50',
  onItemClick,
  mobileBreakpoint = 'tablet',
}) => {
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Determina se deve mostrar menu mobile baseado no breakpoint configurado
  const shouldShowMobileMenu = mobileBreakpoint === 'mobile' ? isMobile : breakpoint === 'mobile' || breakpoint === 'tablet';

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleExpandedItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    }
    
    if (onItemClick) {
      onItemClick(item);
    }

    // Fechar menu mobile ao clicar em um item
    if (shouldShowMobileMenu) {
      setMobileMenuOpen(false);
    }
  };

  const renderNavItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = item.active;
    const isDisabled = item.disabled;

    const baseClasses = cn(
      'flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      isDisabled 
        ? 'opacity-50 cursor-not-allowed' 
        : `${hoverColor} cursor-pointer`,
      isActive 
        ? `${activeColor} border-b-2` 
        : `${textColor}`,
      level > 0 && 'pl-8' // Indentação para itens filhos
    );

    return (
      <div key={item.id} className="w-full">
        <div
          className={baseClasses}
          onClick={() => {
            if (hasChildren) {
              toggleExpandedItem(item.id);
            }
            handleItemClick(item);
          }}
        >
          <div className="flex items-center space-x-3">
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronDown 
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isExpanded && 'transform rotate-180'
              )} 
            />
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderHorizontalNav = () => (
    <nav className={cn(
      'w-full',
      backgroundColor,
      'border-b border-gray-200',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}

          {/* Menu Desktop */}
          {!shouldShowMobileMenu && (
            <div className="hidden md:flex items-center space-x-4">
              {items.map(item => (
                <div key={item.id} className="relative">
                  {renderNavItem(item)}
                </div>
              ))}
            </div>
          )}

          {/* Botão Menu Mobile */}
          {shouldShowMobileMenu && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Abrir menu principal</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Menu Mobile */}
      {shouldShowMobileMenu && mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            {items.map(item => renderNavItem(item))}
          </div>
        </div>
      )}
    </nav>
  );

  const renderVerticalNav = () => (
    <nav className={cn(
      'w-64 h-full',
      backgroundColor,
      'border-r border-gray-200',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        {logo && (
          <div className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
            {logo}
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.map(item => renderNavItem(item))}
        </div>
      </div>
    </nav>
  );

  const renderSidebarNav = () => (
    <nav className={cn(
      'w-64 h-screen fixed left-0 top-0 z-40',
      backgroundColor,
      'border-r border-gray-200 shadow-lg',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        {logo && (
          <div className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
            {logo}
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.map(item => renderNavItem(item))}
        </div>
      </div>
    </nav>
  );

  switch (variant) {
    case 'horizontal':
      return renderHorizontalNav();
    case 'vertical':
      return renderVerticalNav();
    case 'sidebar':
      return renderSidebarNav();
    default:
      return renderHorizontalNav();
  }
};

/**
 * Componente de navegação mobile simplificado
 */
export const MobileNavigation: React.FC<{
  items: NavigationItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}> = ({ items, isOpen, onClose, className }) => {
  if (!isOpen) return null;

  return (
    <div className={cn('fixed inset-0 z-50', className)}>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose} 
      />
      
      {/* Menu */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="overflow-y-auto p-4">
          {items.map(item => (
            <div key={item.id} className="mb-2">
              <div
                className={cn(
                  'flex items-center justify-between p-3 text-sm font-medium rounded-lg',
                  'hover:bg-gray-50 cursor-pointer',
                  item.active && 'bg-blue-50 text-blue-600'
                )}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  onClose();
                }}
              >
                <div className="flex items-center space-x-3">
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para gerenciar estado de navegação mobile
 */
export const useMobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle,
    isMobile,
  };
};