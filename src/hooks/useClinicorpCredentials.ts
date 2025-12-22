import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ClinicorpCredentials {
  id?: string;
  api_user: string;
  api_token: string;
  subscriber_id: string;
  base_url: string;
  is_active: boolean;
}

export function useClinicorpCredentials() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<ClinicorpCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // Carregar credenciais ao montar o componente
  const loadCredentials = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Buscar a clínica do usuário
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('id, clinicorp_api_user, clinicorp_api_token, clinicorp_subscriber_id, clinicorp_base_url, clinicorp_enabled')
        .eq('master_user_id', user.id)
        .single();

      if (clinicError) {
        console.error('❌ [useClinicorpCredentials] Error loading clinic:', clinicError);
        
        // CORREÇÃO CRÍTICA: NÃO CRIAR NOVA CLÍNICA AUTOMATICAMENTE
        // Se não existe clínica, apenas retornar sem criar uma nova
        if (clinicError.code === 'PGRST116') {
          console.log('⚠️ [useClinicorpCredentials] No clinic found for user:', user.id);
          console.log('⚠️ [useClinicorpCredentials] NOT creating new clinic - this was causing the bug!');
          // Tentar buscar por owner_id também
          const { data: clinicByOwner, error: ownerError } = await supabase
            .from('clinics')
            .select('id, clinicorp_api_user, clinicorp_api_token, clinicorp_subscriber_id, clinicorp_base_url, clinicorp_enabled')
            .eq('owner_id', user.id)
            .single();
            
          if (ownerError || !clinicByOwner) {
            console.log('⚠️ [useClinicorpCredentials] No clinic found by owner_id either');
            return;
          }
          
          console.log('✅ [useClinicorpCredentials] Found clinic by owner_id:', clinicByOwner.id);
          
          if (clinicByOwner && clinicByOwner.clinicorp_enabled) {
            setCredentials({
              id: clinicByOwner.id,
              api_user: clinicByOwner.clinicorp_api_user || '',
              api_token: '[ENCRYPTED]', // Não mostrar o token real
              subscriber_id: clinicByOwner.clinicorp_subscriber_id || '',
              base_url: clinicByOwner.clinicorp_base_url || 'https://api.clinicorp.com/rest/v1',
              is_active: clinicByOwner.clinicorp_enabled
            });
          }
        }
        return;
      }

      if (clinic && clinic.clinicorp_enabled) {
        setCredentials({
          id: clinic.id,
          api_user: clinic.clinicorp_api_user || '',
          api_token: '[ENCRYPTED]', // Não mostrar o token real
          subscriber_id: clinic.clinicorp_subscriber_id || '',
          base_url: clinic.clinicorp_base_url || 'https://api.clinicorp.com/rest/v1',
          is_active: clinic.clinicorp_enabled
        });
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Carregar credenciais quando o usuário muda
  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  // Salvar credenciais
  const saveCredentials = useCallback(async (newCredentials: Omit<ClinicorpCredentials, 'id'>) => {
    if (!user?.id) {
      // toast({
      //   title: 'Erro',
      //   description: 'Usuário não autenticado',
      //   variant: 'destructive'
      // });
      return false;
    }

    try {
      setLoading(true);

      // Buscar a clínica do usuário
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('id')
        .eq('master_user_id', user.id)
        .single();

      if (clinicError) {
        console.error('Error finding clinic:', clinicError);
        // toast({
        //   title: 'Erro',
        //   description: 'Clínica não encontrada',
        //   variant: 'destructive'
        // });
        return false;
      }

      // Atualizar as credenciais na clínica
      const { error } = await supabase
        .from('clinics')
        .update({
          clinicorp_api_user: newCredentials.api_user,
          clinicorp_api_token: newCredentials.api_token,
          clinicorp_subscriber_id: newCredentials.subscriber_id,
          clinicorp_base_url: newCredentials.base_url,
          clinicorp_enabled: true
        })
        .eq('id', clinic.id);

      if (error) {
        console.error('Error saving credentials:', error);
        // toast({
        //   title: 'Erro',
        //   description: 'Erro ao salvar credenciais',
        //   variant: 'destructive'
        // });
        return false;
      }

      // Atualizar o estado local
      setCredentials({
        id: clinic.id,
        api_user: newCredentials.api_user,
        api_token: '[ENCRYPTED]',
        subscriber_id: newCredentials.subscriber_id,
        base_url: newCredentials.base_url,
        is_active: true
      });

      toast({
        title: 'Sucesso',
        description: 'Credenciais salvas com sucesso!'
      });
      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      // toast({
      //   title: 'Erro',
      //   description: 'Erro ao salvar credenciais',
      //   variant: 'destructive'
      // });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Testar conexão
  const testConnection = useCallback(async (testCredentials?: Omit<ClinicorpCredentials, 'id'>) => {
    const credsToTest = testCredentials || credentials;
    
    if (!credsToTest?.api_token || !credsToTest?.subscriber_id) {
      // toast({
      //   title: 'Erro',
      //   description: 'Credenciais incompletas',
      //   variant: 'destructive'
      // });
      return false;
    }

    try {
      setTesting(true);

      // Fazer chamada real para testar a conexão
      const { data, error } = await supabase.functions.invoke('clinicorp-api', {
        body: {
          path: '/group/list_subscribers_clinics',
          method: 'GET',
          query: {},
          credentials: {
            api_user: credsToTest.api_user,
            api_token: credsToTest.api_token,
            subscriber_id: credsToTest.subscriber_id,
            base_url: credsToTest.base_url
          }
        }
      });

      if (error || !data?.success) {
        console.error('Connection test failed:', error || data);
        // toast({
        //   title: 'Erro',
        //   description: 'Falha na conexão com Clinicorp',
        //   variant: 'destructive'
        // });
        return false;
      }

      toast({
        title: 'Sucesso',
        description: 'Conexão testada com sucesso!'
      });
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      // toast({
      //   title: 'Erro',
      //   description: 'Erro ao testar conexão',
      //   variant: 'destructive'
      // });
      return false;
    } finally {
      setTesting(false);
    }
  }, [credentials, toast]);

  // Deletar credenciais
  const deleteCredentials = useCallback(async () => {
    if (!user?.id || !credentials?.id) return false;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('clinics')
        .update({
          clinicorp_api_user: null,
          clinicorp_api_token: null,
          clinicorp_subscriber_id: null,
          clinicorp_base_url: 'https://api.clinicorp.com/rest/v1',
          clinicorp_enabled: false
        })
        .eq('id', credentials.id)
        .eq('master_user_id', user.id);

      if (error) {
        console.error('Error deleting credentials:', error);
        // toast({
        //   title: 'Erro',
        //   description: 'Erro ao deletar credenciais',
        //   variant: 'destructive'
        // });
        return false;
      }

      setCredentials(null);
      toast({
        title: 'Sucesso',
        description: 'Credenciais removidas com sucesso!'
      });
      return true;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      // toast({
      //   title: 'Erro',
      //   description: 'Erro ao deletar credenciais',
      //   variant: 'destructive'
      // });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, credentials?.id, toast]);

  return {
    credentials,
    loading,
    testing,
    saveCredentials,
    testConnection,
    deleteCredentials,
    reloadCredentials: loadCredentials
  };
}