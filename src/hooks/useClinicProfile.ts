import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Clinic {
  id: string;
  name: string;
  email?: string;
  master_user_id?: string;
  owner_id?: string;
  clinicorp_enabled?: boolean;
  clinicorp_base_url?: string;
}

export function useClinicProfile() {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  // Log imediato para verificar se o hook está sendo executado
  console.log('🚨🚨🚨 [useClinicProfile] HOOK EXECUTADO - VERSÃO 6');
  console.log('🚨🚨🚨 [useClinicProfile] User:', user?.id, user?.email);

  useEffect(() => {
    console.log('🚨🚨🚨 [useClinicProfile] useEffect EXECUTADO');
    console.log('🚨🚨🚨 [useClinicProfile] User no useEffect:', user?.id, user?.email);
    
    // Executar a busca
    console.log('🚨🚨🚨 [useClinicProfile] CHAMANDO fetchClinicProfile');
    fetchClinicProfile();
  }, [user]);

  const fetchClinicProfile = async () => {
    try {
      console.log('🚨🚨🚨 [useClinicProfile] DENTRO DO fetchClinicProfile');
      console.log('🚨🚨🚨 [useClinicProfile] Buscando para usuário:', user?.id);

      if (!user?.id) {
        console.warn('⚠️ [useClinicProfile] Usuário não disponível, definindo clinic = null');
        setClinic(null);
        return;
      }

      // Buscar por owner_id primeiro
      console.log('🔎 [useClinicProfile] Buscando clínica por owner_id...');
      const { data: byOwner, error: ownerErr } = await supabase
        .from('clinics')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (byOwner && !ownerErr) {
        console.log('✅ [useClinicProfile] Clínica encontrada por owner_id:', byOwner.id);
        setClinic(byOwner);
        return;
      }

      if (ownerErr && ownerErr.code !== 'PGRST116') {
        console.warn('⚠️ [useClinicProfile] Erro ao buscar por owner_id:', ownerErr);
      }

      // Buscar por master_user_id
      console.log('🔎 [useClinicProfile] Buscando clínica por master_user_id...');
      const { data: byMaster, error: masterErr } = await supabase
        .from('clinics')
        .select('*')
        .eq('master_user_id', user.id)
        .maybeSingle();

      if (byMaster && !masterErr) {
        console.log('✅ [useClinicProfile] Clínica encontrada por master_user_id:', byMaster.id);
        setClinic(byMaster);
        return;
      }

      if (masterErr && masterErr.code !== 'PGRST116') {
        console.warn('⚠️ [useClinicProfile] Erro ao buscar por master_user_id:', masterErr);
      }

      // Nenhuma clínica encontrada
      console.log('🚫 [useClinicProfile] Nenhuma clínica encontrada para o usuário');
      setClinic(null);
    } catch (error) {
      console.error('🚨🚨🚨 [useClinicProfile] ERRO GERAL:', error);
    } finally {
      console.log('🚨🚨🚨 [useClinicProfile] FINALIZANDO - setLoading(false)');
      setLoading(false);
    }
  };

  return {
    clinic,
    loading,
    refreshClinic: fetchClinicProfile
  };
}