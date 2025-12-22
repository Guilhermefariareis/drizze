import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint, useIsMobile } from '@/hooks/useBreakpoint';
import { Menu, X, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer } from './ResponsiveContainer';
import { ResponsiveGrid } from './ResponsiveGrid';
import { ResponsiveNavigation, NavigationItem } from './ResponsiveNavigation';

export interface ResponsiveDashboardProps {
  children: React.ReactNode;
  sidebarItems: NavigationItem[];
  headerTitle?: string;
  headerActions?: React.ReactNode;
  userMenuItems?: NavigationItem[];
  notifications?: {
    id: string;
    title: string;
    message: string;
    time: string;
    unread: boolean;
  }[];
  className?: string;
  sidebarWidth?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  headerHeight?: number;
  showSidebar?: boolean;
  showHeader?: boolean;
  sidebarVariant?: 'sidebar' | 'drawer';
}

/**
 * Layout de dashboard responsivo completo com sidebar, header e área de conteúdo
 */
export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  children,
  sidebarItems,
  headerTitle,
  headerActions,
  userMenuItems = [],
  notifications = [],
  className,
  sidebarWidth = { mobile: 280, tablet: 300, desktop: 320 },
  headerHeight = 64,
  showSidebar = true,
  showHeader = true,
  sidebarVariant = 'drawer',
}) => {
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setNotificationsOpen(false);
  };

  const getSidebarWidth = () => {
    return sidebarWidth[breakpoint] || sidebarWidth.desktop;
  };

  // Menu do usuário padrão
  const defaultUserMenuItems: NavigationItem[] = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: <User className="w-4 h-4" />,
      onClick: () => console.log('Profile clicked'),
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => console.log('Settings clicked'),
    },
    {
      id: 'logout',
      label: 'Sair',
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => console.log('Logout clicked'),
    },
    ...userMenuItems,
  ];

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <header
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-sm"
        style={{ height: headerHeight }}
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          {/* Lado esquerdo: Menu e Título */}
          <div className="flex items-center">
            {showSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Abrir sidebar</span>
                <Menu className="h-6 w-6" />
              </Button>
            )}
            {headerTitle && (
              <h1 className="text-xl font-semibold text-gray-900">
                {headerTitle}
              </h1>
            )}
          </div>

          {/* Lado direito: Ações, Notificações e Menu do Usuário */}
          <div className="flex items-center space-x-4">
            {headerActions}
            
            {/* Notificações */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNotifications}
                className="relative p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </Button>

              {/* Dropdown de Notificações */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notificações</h3>
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhuma notificação</p>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              'p-3 rounded-lg border',
                              notification.unread
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu do Usuário */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleUserMenu}
                className="flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <User className="h-6 w-6" />
              </Button>

              {/* Dropdown do Usuário */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {defaultUserMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        {item.icon && <span className="mr-3">{item.icon}</span>}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderSidebar = () => {
    if (!showSidebar) return null;

    if (sidebarVariant === 'sidebar' && !isMobile) {
      // Sidebar fixo para desktop
      return (
        <aside
          className="fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-30 shadow-sm"
          style={{ 
            width: getSidebarWidth(),
            marginTop: showHeader ? headerHeight : 0 
          }}
        >
          <div className="h-full overflow-y-auto">
            <ResponsiveNavigation
              items={sidebarItems}
              variant="vertical"
              backgroundColor="bg-white"
              textColor="text-gray-700"
              activeColor="text-blue-600 bg-blue-50"
              hoverColor="hover:text-blue-600 hover:bg-gray-50"
            />
          </div>
        </aside>
      );
    } else {
      // Drawer para mobile e tablet
      return (
        <>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
              onClick={toggleSidebar}
            />
          )}

          {/* Drawer */}
          <aside
            className={cn(
              'fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-50 shadow-lg transform transition-transform duration-300',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
            style={{ 
              width: getSidebarWidth(),
              marginTop: showHeader ? headerHeight : 0 
            }}
          >
            <div className="h-full overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ResponsiveNavigation
                items={sidebarItems}
                variant="vertical"
                backgroundColor="bg-white"
                textColor="text-gray-700"
                activeColor="text-blue-600 bg-blue-50"
                hoverColor="hover:text-blue-600 hover:bg-gray-50"
              />
            </div>
          </aside>
        </>
      );
    }
  };

  const renderContent = () => {
    const sidebarOffset = showSidebar && !isMobile && sidebarVariant === 'sidebar' 
      ? getSidebarWidth() 
      : 0;

    return (
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          className
        )}
        style={{
          marginLeft: sidebarOffset,
          marginTop: showHeader ? headerHeight : 0,
        }}
      >
        <ResponsiveContainer
          variant="dashboard"
          className="h-full"
        >
          {children}
        </ResponsiveContainer>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      <div className="flex">
        {renderSidebar()}
        {renderContent()}
      </div>
    </div>
  );
};

/**
 * Hook para gerenciar o estado do dashboard
 */
export const useDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    breakpoint,
    isMobile,
  };
};

/**
 * Componente de página de dashboard
 */
export const DashboardPage: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({
  title,
  subtitle,
  actions,
  children,
  className,
}) => {
  const breakpoint = useBreakpoint();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            'font-bold text-gray-900',
            breakpoint === 'mobile' && 'text-2xl',
            breakpoint === 'tablet' && 'text-3xl',
            breakpoint === 'desktop' && 'text-4xl'
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 mt-2">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {children}
    </div>
  );
};