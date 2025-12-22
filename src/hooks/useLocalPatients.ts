import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface LocalPatient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: any;
  role: string;
  account_type: string;
  avatar_url?: string;
  gender?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  isLocal: boolean;
}

export function useLocalPatients() {
  const { toast } = useToast();
  const [localPatients, setLocalPatients] = useState<LocalPatient[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar pacientes locais (perfis com role 'patient')
  const listLocalPatients = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .order('full_name');

      if (error) throw error;

      const patients = data?.map(profile => ({
        ...profile,
        isLocal: true as const
      })) || [];
      
      setLocalPatients(patients);
      return patients;
    } catch (error: any) {
      console.error('Error fetching local patients:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao buscar pacientes locais',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar paciente específico
  const getLocalPatient = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'patient')
        .single();

      if (error) throw error;

      return data ? { ...data, isLocal: true as const } : null;
    } catch (error: any) {
      console.error('Error fetching local patient:', error);
      return null;
    }
  }, []);

  // Buscar por nome/email
  const searchLocalPatients = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('full_name');

      if (error) throw error;

      const patients = data?.map(profile => ({
        ...profile,
        isLocal: true as const
      })) || [];
      
      setLocalPatients(patients);
      return patients;
    } catch (error: any) {
      console.error('Error searching local patients:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    localPatients,
    loading,
    listLocalPatients,
    getLocalPatient,
    searchLocalPatients
  };
}