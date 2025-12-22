import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicorpContext } from '@/contexts/ClinicorpContext';

export type ClinicorpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ClinicorpRequestOptions {
  query?: Record<string, any>;
  body?: any;
  clinic_id?: string;
  suppressToast?: boolean;
  retries?: number;
  timeout?: number;
}

export function useClinicorpApi() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { credentials, reloadCredentials } = useClinicorpContext();

  const request = useCallback(async (
    path: string,
    method: ClinicorpMethod = 'GET',
    options: ClinicorpRequestOptions = {}
  ) => {
    const { 
      query, 
      body, 
      clinic_id, 
      suppressToast = true, // Mudado para true por padrão para evitar spam
      retries = 1, // Reduzido de 2 para 1 para evitar logs excessivos
      timeout = 15000 // Reduzido de 30s para 15s
    } = options;

    setLoading(true);
    
    try {
      // Validate session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Validate credentials - fail silently if not configured
      if (!credentials) {
        console.log('[useClinicorpApi] No credentials found, skipping request');
        // Não recarregar credenciais automaticamente para evitar loops
        throw new Error('Credenciais Clinicorp não configuradas');
      }

      // Validate path
      if (!path || !path.startsWith('/')) {
        throw new Error('Caminho de API inválido');
      }

      console.log('[useClinicorpApi] Making Clinicorp request:', { 
        path, 
        method, 
        query: query || {}, 
        hasBody: !!body,
        clinic_id 
      });

      const makeRequest = async (): Promise<any> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const requestBody = {
            path: path.replace(/^\/+/, '/'), // Ensure single leading slash
            method,
            query: query || {},
            body: body || null,
            clinic_id,
            credentials: {
              api_key: credentials.api_key,
              subscriber_id: credentials.subscriber_id,
              base_url: credentials.base_url
            }
          };

          console.log('[useClinicorpApi] Sending to edge function:', JSON.stringify(requestBody, null, 2));

          const { data, error } = await supabase.functions.invoke('clinicorp-api', {
            body: requestBody
          });

          clearTimeout(timeoutId);

          if (error) {
            console.warn('[useClinicorpApi] Supabase function error:', error.message);
            throw new Error('Erro na comunicação com o servidor');
          }

          if (!data) {
            throw new Error('Resposta vazia do servidor');
          }

          if (!data.success) {
            const errorMessage = data.error 
              || data.data?.message 
              || data.data?.Message 
              || data.data?.error 
              || 'Erro na API Clinicorp';
              
            console.warn('[useClinicorpApi] Clinicorp API error:', errorMessage);
            throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Erro na API Clinicorp');
          }

          console.log('[useClinicorpApi] Clinicorp response success');
          return data.data;

        } catch (err: any) {
          clearTimeout(timeoutId);
          
          if (err.name === 'AbortError') {
            throw new Error('Tempo limite da requisição excedido');
          }
          
          throw err;
        }
      };

      // Retry logic com menos tentativas
      let lastError: Error;
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await makeRequest();
          return result;
        } catch (error: any) {
          lastError = error;
          
          if (attempt < retries) {
            const delay = 2000; // Delay fixo de 2s em vez de exponencial
            console.warn(`[useClinicorpApi] Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError!;

    } catch (error: any) {
      // Log apenas como warning para reduzir ruído no console
      console.warn('[useClinicorpApi] Clinicorp API error:', error.message);
      
      // NUNCA mostrar toasts de erro do Clinicorp para evitar spam de notificações
      // Erros são tratados silenciosamente
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, credentials, reloadCredentials]);

  // Helper methods with CORRECTED endpoints
  const listUsers = (query?: Record<string, any>, clinic_id?: string) => 
    request('/security/list_users', 'GET', { query, clinic_id, suppressToast: true });

  const listSubscribersClinics = (query?: Record<string, any>, clinic_id?: string) => 
    request('/group/list_subscribers_clinics', 'GET', { query, clinic_id, suppressToast: true });

  const listClinics = (query?: Record<string, any>, clinic_id?: string) => 
    request('/group/list_subscribers_clinics', 'GET', { query, clinic_id, suppressToast: true });

  const listProfessionals = (query?: Record<string, any>, clinic_id?: string) => 
    request('/security/list_users', 'GET', { query, clinic_id, suppressToast: true });

  const listAvailableTimes = (query?: Record<string, any>, clinic_id?: string) => 
    request('/appointment/get_avaliable_times_calendar', 'GET', { query, clinic_id, suppressToast: true });

  // Removed createAppointment and createPatient - Clinicorp is read-only
  // Use Doutorizze/Supabase system for creating appointments and patients

  return {
    loading,
    credentials,
    reloadCredentials,
    request,
    listUsers,
    listSubscribersClinics,
    listClinics,
    listProfessionals,
    listAvailableTimes,
    // createAppointment and createPatient removed - Clinicorp is read-only
  };
}