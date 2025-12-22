import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: permissionsLoading, error } = useAdminPermissions();

  console.log('🚨🚨🚨 [AdminRoute] EXECUTADO');
  console.log('🚨🚨🚨 [AdminRoute] user:', user);
  console.log('🚨🚨🚨 [AdminRoute] authLoading:', authLoading);
  console.log('🚨🚨🚨 [AdminRoute] isAdmin:', isAdmin);
  console.log('🚨🚨🚨 [AdminRoute] permissionsLoading:', permissionsLoading);
  console.log('🚨🚨🚨 [AdminRoute] error:', error);

  // Mostrar loading enquanto verifica autenticação e permissões
  if (authLoading || permissionsLoading) {
    console.log('🚨🚨🚨 [AdminRoute] MOSTRANDO LOADING');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    console.log('🚨🚨🚨 [AdminRoute] SEM USUÁRIO - REDIRECIONANDO PARA /admin-login');
    return <Navigate to="/admin-login" replace />;
  }

  // Redirecionar para login se não for admin
  if (!isAdmin) {
    console.log('🚨🚨🚨 [AdminRoute] NÃO É ADMIN - REDIRECIONANDO PARA /admin-login');
    return <Navigate to="/admin-login" replace />;
  }

  // Se houver erro mas ainda assim for admin (fallback funcionou), mostrar aviso
  if (error && isAdmin) {
    console.warn('🚨🚨🚨 [AdminRoute] Acesso admin concedido apesar do erro:', error);
  }

  console.log('🚨🚨🚨 [AdminRoute] ACESSO PERMITIDO - RENDERIZANDO CHILDREN');
  return <>{children}</>;
};