import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ClinicPermissions {
  access_agenda: boolean;
  access_reports: boolean;
  access_patients: boolean;
  access_financial: boolean;
  access_advanced_services: boolean;
}

export interface ClinicRole {
  id: string;
  role: string;
  permissions: ClinicPermissions;
  is_active: boolean;
  clinic_id: string;
  is_master: boolean;
}

export function useClinicPermissions(clinicId?: string) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<ClinicPermissions | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !clinicId) {
      setLoading(false);
      return;
    }

    fetchPermissions();
  }, [user, clinicId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro, verificar se é master user da clínica
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('master_user_id, owner_id')
        .eq('id', clinicId)
        .single();

      if (clinicError) throw clinicError;

      const isClinicMaster = clinicData.master_user_id === user.id || clinicData.owner_id === user.id;
      setIsMaster(isClinicMaster);

      if (isClinicMaster) {
        // Master user tem todas as permissões
        setPermissions({
          access_agenda: true,
          access_reports: true,
          access_patients: true,
          access_financial: true,
          access_advanced_services: true
        });
        setRole('master');
      } else {
        // Buscar permissões na tabela clinic_professionals
        const { data: professionalData, error: professionalError } = await supabase
          .from('clinic_professionals')
          .select('role, permissions, is_active')
          .eq('clinic_id', clinicId)
          .eq('user_id', user.id)
          .single();

        if (professionalError && professionalError.code !== 'PGRST116') {
          throw professionalError;
        }

        if (professionalData) {
          setPermissions(professionalData.permissions as unknown as ClinicPermissions);
          setRole(professionalData.role);
        } else {
          // Usuário não tem acesso à clínica
          setPermissions(null);
          setRole(null);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: keyof ClinicPermissions): boolean => {
    if (isMaster) return true;
    return permissions?.[permission] || false;
  };

  const canAccessAdvancedServices = (): boolean => {
    return isMaster || hasPermission('access_advanced_services');
  };

  const canManageFinancials = (): boolean => {
    return isMaster || hasPermission('access_financial');
  };

  const canAccessPatients = (): boolean => {
    return isMaster || hasPermission('access_patients');
  };

  const canAccessReports = (): boolean => {
    return isMaster || hasPermission('access_reports');
  };

  const canAccessAgenda = (): boolean => {
    return isMaster || hasPermission('access_agenda');
  };

  return {
    permissions,
    role,
    isMaster,
    loading,
    error,
    hasPermission,
    canAccessAdvancedServices,
    canManageFinancials,
    canAccessPatients,
    canAccessReports,
    canAccessAgenda,
    refetch: fetchPermissions
  };
}