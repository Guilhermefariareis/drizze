import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ClinicorpCredentials {
  id: string;
  user_id: string;
  api_key: string;
  subscriber_id: string;
  base_url: string;
  is_active: boolean;
  default_api_user: string;
  default_api_token: string;
  inserted_at: string;
}

interface ClinicorpContextType {
  credentials: ClinicorpCredentials | null;
  loading: boolean;
  reloadCredentials: () => Promise<void>;
}

const ClinicorpContext = createContext<ClinicorpContextType>({
  credentials: null,
  loading: false,
  reloadCredentials: async () => {},
});

export const useClinicorpContext = () => {
  const context = useContext(ClinicorpContext);
  if (!context) {
    throw new Error('useClinicorpContext must be used within a ClinicorpProvider');
  }
  return context;
};

interface ClinicorpProviderProps {
  children: React.ReactNode;
}

export const ClinicorpProvider: React.FC<ClinicorpProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<ClinicorpCredentials | null>(null);
  const [loading, setLoading] = useState(false);

  const reloadCredentials = useCallback(async () => {
    if (!user?.id) {
      setCredentials(null);
      return;
    }

    try {
      setLoading(true);
      console.log('[ClinicorpContext] Loading credentials for user:', user.id);
      
      const { data, error } = await supabase
        .from('clinics')
        .select('id, clinicorp_api_user, clinicorp_api_token, clinicorp_subscriber_id, clinicorp_base_url, clinicorp_enabled')
        .or(`master_user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .eq('clinicorp_enabled', true)
        .maybeSingle();

      if (!error && data) {
        // Transformar os dados para o formato esperado
        const transformedCredentials = {
          id: data.id,
          user_id: user.id,
          api_key: data.clinicorp_api_token ? '[ENCRYPTED]' : '',
          subscriber_id: data.clinicorp_subscriber_id || '',
          base_url: data.clinicorp_base_url || 'https://api.clinicorp.com/rest/v1',
          is_active: data.clinicorp_enabled,
          default_api_user: data.clinicorp_api_user || '',
          default_api_token: data.clinicorp_api_token ? '[ENCRYPTED]' : '',
          inserted_at: new Date().toISOString()
        };
        
        setCredentials(transformedCredentials);
        console.log('[ClinicorpContext] Credentials loaded successfully for clinic:', data.id);
      } else {
        console.log('[ClinicorpContext] No credentials found or error:', error);
        setCredentials(null);
      }
    } catch (error) {
      console.error('[ClinicorpContext] Error loading credentials:', error);
      setCredentials(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    reloadCredentials();
  }, [reloadCredentials]);

  const value: ClinicorpContextType = {
    credentials,
    loading,
    reloadCredentials,
  };

  return (
    <ClinicorpContext.Provider value={value}>
      {children}
    </ClinicorpContext.Provider>
  );
};