import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AdminPermissions {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  checkPermissions: () => Promise<boolean>;
}

export const useAdminPermissions = (): AdminPermissions => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  console.log('🔥🔥🔥 [useAdminPermissions] HOOK INICIADO');
  console.log('🔥🔥🔥 [useAdminPermissions] User:', user);
  console.log('🔥🔥🔥 [useAdminPermissions] Estado atual:', { isAdmin, isLoading, error });

  const checkPermissions = async (): Promise<boolean> => {
    console.log('🔥🔥🔥 [useAdminPermissions] INICIANDO checkPermissions');
    
    if (!user) {
      console.log('🔥🔥🔥 [useAdminPermissions] Usuário não encontrado');
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }

    console.log('🔥🔥🔥 [useAdminPermissions] Usuário encontrado:', user.id, user.email);

    try {
      setIsLoading(true);
      setError(null);

      // Buscar o perfil do usuário na tabela profiles
      console.log('🔥🔥🔥 [useAdminPermissions] Buscando perfil na tabela profiles...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      console.log('🔥🔥🔥 [useAdminPermissions] Resultado da busca do perfil:', { profile, profileError });

      if (profileError) {
        console.log('🔥🔥🔥 [useAdminPermissions] Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      if (profile && (profile.role === 'admin' || profile.role === 'master')) {
        console.log('🔥🔥🔥 [useAdminPermissions] ADMIN CONFIRMADO pelo perfil! Role:', profile.role);
        setIsAdmin(true);
        return true;
      }

      console.log('🔥🔥🔥 [useAdminPermissions] Role do perfil não é admin/master:', profile?.role);

      // Fallback: verificar se o email está na lista de emails master
      const masterEmails = [
        'master@doutorizze.com.br',
        'admin@doutorizze.com.br',
        'suporte@doutorizze.com.br'
      ];

      console.log('🔥🔥🔥 [useAdminPermissions] Verificando fallback por email...');
      console.log('🔥🔥🔥 [useAdminPermissions] Email do usuário:', user.email);
      console.log('🔥🔥🔥 [useAdminPermissions] Emails master:', masterEmails);

      if (user.email && masterEmails.includes(user.email)) {
        console.log('🔥🔥🔥 [useAdminPermissions] ADMIN CONFIRMADO pelo fallback de email!');
        setIsAdmin(true);
        return true;
      }

      console.log('🔥🔥🔥 [useAdminPermissions] Usuário NÃO é admin');
      setIsAdmin(false);
      return false;

    } catch (err: any) {
      console.error('🔥🔥🔥 [useAdminPermissions] ERRO ao verificar permissões:', err);
      setError(err.message || 'Erro ao verificar permissões');
      setIsAdmin(false);
      return false;
    } finally {
      console.log('🔥🔥🔥 [useAdminPermissions] FINALIZANDO checkPermissions');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔥🔥🔥 [useAdminPermissions] useEffect EXECUTADO');
    checkPermissions();
  }, [user]);

  console.log('🔥🔥🔥 [useAdminPermissions] RETORNANDO:', { isAdmin, isLoading, error });

  return {
    isAdmin,
    isLoading,
    error,
    checkPermissions
  };
};