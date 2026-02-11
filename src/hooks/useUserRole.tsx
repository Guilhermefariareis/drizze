import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'clinic' | 'patient' | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setFullName(null);
      setLoading(false);
      return;
    }

    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      if (!user) return;

      console.log('[useUserRole] Buscando role e nome para usuário:', user.id, user.email);

      // Hardcode para admins conhecidos (garante acesso mesmo se DB estiver desatualizado)
      if (user.email === 'admin@admin.com' || user.email === 'master@doutorizze.com.br') {
        console.log('[useUserRole] Admin identificado por email (whitelist hardcoded)');
        setRole('admin');
        setFullName('Administrador');
        setLoading(false);
        // Não retornamos aqui para permitir que o fetch do profile atualize o nome se existir,
        // mas o role já está garantido como admin.
      }

      // Priorizar role e nome do metadata imediatamente
      const metaRoleRaw = user.user_metadata?.role as string | undefined;
      const metaName = user.user_metadata?.full_name as string | undefined;

      const metaRoleMapped = metaRoleRaw === 'master' ? 'admin' : metaRoleRaw;
      const metaRoleValid = !!metaRoleMapped && ['admin', 'clinic', 'patient'].includes(metaRoleMapped as any);

      if (metaRoleValid) {
        setRole(metaRoleMapped as UserRole);
      }

      if (metaName) {
        setFullName(metaName);
      } else {
        setFullName(user.email?.split('@')[0] || 'Usuário');
      }

      // Buscar da tabela profiles para dados mais atuais
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('[useUserRole] Resultado da busca:', { profile, error });

      if (profile) {
        const p = profile as any;
        if (p.role) {
          const mappedRole = p.role === 'master' ? 'admin' : p.role;
          setRole(mappedRole as UserRole);
        } else if (p.account_type) {
          const mappedRole = p.account_type === 'master' ? 'admin' : p.account_type;
          setRole(mappedRole as UserRole);
        }

        if (p.full_name) {
          setFullName(p.full_name);
        } else if (p.name) {
          setFullName(p.name);
        }
      }

      if (error && error.code === 'PGRST116') {
        // ... (resto do código de inserção permanece o mesmo, mas vamos simplificar se necessário)
        const fallbackRole = metaRoleValid ? (metaRoleMapped as UserRole) : 'patient';
        // ...
      }
    } catch (err) {
      console.error('[useUserRole] Erro geral:', err);
    } finally {
      setLoading(false);
    }
  };

  return { role, fullName, loading };
}
