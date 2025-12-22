import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export function AuthRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading
    if (authLoading || roleLoading) return;

    // If no user and on protected routes, redirect to auth
    if (!user) {
      const protectedRoutes = ['/admin', '/patient-dashboard', '/clinic-dashboard', '/profile', '/settings'];
      const loginPages = ['/admin-login', '/login-paciente', '/login-clinica', '/patient-login', '/clinic-login', '/auth'];
      const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));
      const isLoginPage = loginPages.some(page => location.pathname === page);
      
      if (isProtectedRoute && !isLoginPage) {
        navigate('/patient-login', { replace: true });
        return;
      }
    }

    // Don't redirect if already on auth page
    if (location.pathname === '/auth') return;

    // Redirect based on role when user is on wrong dashboard (but allow access to home page)
    if (role && user) {
      // Redirecionar usuários com base em suas funções
      if ((role === 'admin' || role === 'master') && (location.pathname === '/patient-dashboard' || location.pathname === '/clinic-dashboard')) {
        navigate('/admin', { replace: true });
      } else if (role === 'clinic' && (location.pathname === '/patient-dashboard')) {
        navigate('/clinic-dashboard' + location.search, { replace: true });
      } else if (role === 'patient' && (location.pathname === '/clinic-dashboard' || location.pathname === '/admin')) {
        navigate('/patient-dashboard', { replace: true });
      }
    }
  }, [user, role, authLoading, roleLoading, navigate, location.pathname]);

  return null;
}