import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'clinic' | 'patient' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      console.log('[useUserRole] Buscando role para usuário:', user?.id, user?.email);
      
      // Priorizar role do metadata imediatamente para evitar redirecionamento errado
      const metaRoleRaw = user?.user_metadata?.role as string | undefined;
      const metaRoleMapped = metaRoleRaw === 'master' ? 'admin' : metaRoleRaw;
      const metaRoleValid = !!metaRoleMapped && ['admin', 'clinic', 'patient'].includes(metaRoleMapped as any);
      if (metaRoleValid) {
        setRole(metaRoleMapped as UserRole);
      }
      
      // Buscar role da tabela profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      console.log('[useUserRole] Resultado da busca:', { profile, error });

      if (error && error.code !== 'PGRST116') {
        console.error('[useUserRole] Erro na busca:', error);
        // Em caso de erro, usar fallback do metadata ou heurística de email
        if (metaRoleValid) {
          setRole(metaRoleMapped as UserRole);
        } else {
          const email = user.email?.toLowerCase() || '';
          if (email.includes('master') || email.includes('admin')) {
            setRole('admin');
          } else if (email.includes('clinic') || email.includes('edeventos')) {
            setRole('clinic');
          } else {
            setRole('patient');
          }
        }
      } else if (profile?.role) {
        console.log('[useUserRole] Role encontrado:', profile.role);
        const mappedRole = profile.role === 'master' ? 'admin' : profile.role;
        // Se metadata não estava válido, usar o role do perfil
        // Ou se metadata for 'patient' e perfil indicar algo mais elevado, confiar no perfil
        if (!metaRoleValid || (metaRoleMapped === 'patient' && mappedRole !== 'patient')) {
          setRole(mappedRole as UserRole);
        }
      } else {
        console.log('[useUserRole] Nenhum role encontrado, usando metadata/heurística');
        if (metaRoleValid) {
          setRole(metaRoleMapped as UserRole);
        } else {
          const email = user.email?.toLowerCase() || '';
          if (email.includes('master') || email.includes('admin')) {
            setRole('admin');
          } else if (email.includes('clinic') || email.includes('edeventos')) {
            setRole('clinic');
          } else {
            setRole('patient');
          }
        }
      }
    } catch (error) {
      console.error('[useUserRole] Erro geral:', error);
      // Detectar role baseado no metadata ou email em caso de erro
      const metaRoleRaw = user?.user_metadata?.role as string | undefined;
      const metaRoleMapped = metaRoleRaw === 'master' ? 'admin' : metaRoleRaw;
      const metaRoleValid = !!metaRoleMapped && ['admin', 'clinic', 'patient'].includes(metaRoleMapped as any);
      if (metaRoleValid) {
        setRole(metaRoleMapped as UserRole);
      } else {
        const email = user.email?.toLowerCase() || '';
        if (email.includes('master') || email.includes('admin')) {
          setRole('admin');
        } else if (email.includes('clinic') || email.includes('edeventos')) {
          setRole('clinic');
        } else {
          setRole('patient');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return { role, loading };
}