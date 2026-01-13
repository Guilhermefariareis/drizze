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
      if (!user) return;

      console.log('[useUserRole] Buscando role para usuário:', user.id, user.email);

      // Priorizar role do metadata imediatamente para evitar redirecionamento errado
      const metaRoleRaw = user.user_metadata?.role as string | undefined;
      const metaRoleMapped = metaRoleRaw === 'master' ? 'admin' : metaRoleRaw;
      const metaRoleValid = !!metaRoleMapped && ['admin', 'clinic', 'patient'].includes(metaRoleMapped as any);

      if (metaRoleValid) {
        setRole(metaRoleMapped as UserRole);
      }

      // Buscar role da tabela profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      console.log('[useUserRole] Resultado da busca:', { profile, error });

      if (profile?.role) {
        console.log('[useUserRole] Role encontrado no perfil:', profile.role);
        const mappedRole = profile.role === 'master' ? 'admin' : profile.role;
        setRole(mappedRole as UserRole);
        return;
      }

      if (error && error.code === 'PGRST116') {
        console.log('[useUserRole] Perfil não encontrado, tentando criar fallback...');

        const fallbackRole = metaRoleValid ? (metaRoleMapped as UserRole) : 'patient';

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            email: user.email,
            name: user.user_metadata?.full_name || 'Usuário',
            full_name: user.user_metadata?.full_name || 'Usuário',
            role: fallbackRole === 'master' ? 'admin' : fallbackRole
          });

        if (!insertError) {
          console.log('[useUserRole] Perfil de fallback criado com sucesso!');
          setRole(fallbackRole);
          return;
        }

        console.error('[useUserRole] Erro ao criar perfil:', JSON.stringify(insertError, null, 2));
      }

      // Fallback final por heurística se nada mais funcionou
      if (!metaRoleValid) {
        const email = user.email?.toLowerCase() || '';
        if (email.includes('master') || email.includes('admin')) {
          setRole('admin');
        } else if (email.includes('clinic') || email.includes('edeventos')) {
          setRole('clinic');
        } else {
          setRole('patient');
        }
      }
    } catch (err) {
      console.error('[useUserRole] Erro geral:', err);
    } finally {
      setLoading(false);
    }
  };

  return { role, loading };
}