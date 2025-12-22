import { useState, useCallback, useEffect } from 'react';
import { useLocalPatients, type LocalPatient } from './useLocalPatients';
import { useClinicorpPatients, type ClinicorpPatient } from './useClinicorpPatients';

export interface CombinedPatient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  source: 'local' | 'clinicorp';
  isLocal?: boolean;
  user_id?: string; // Para pacientes locais
  created_at?: string;
}

export function useCombinedPatients() {
  const { localPatients, listLocalPatients, searchLocalPatients, loading: localLoading } = useLocalPatients();
  const { patients: clinicorpPatients, listPatients, searchPatients, loading: clinicorpLoading } = useClinicorpPatients();
  const [combinedPatients, setCombinedPatients] = useState<CombinedPatient[]>([]);

  const loading = localLoading || clinicorpLoading;

  // Combinar pacientes locais e do Clinicorp
  const combinePatients = useCallback(() => {
    const combined: CombinedPatient[] = [];

    // Adicionar pacientes locais
    localPatients.forEach(patient => {
      combined.push({
        id: patient.user_id,
        name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        cpf: patient.cpf,
        birth_date: patient.birth_date,
        address: patient.address,
        source: 'local',
        isLocal: true,
        user_id: patient.user_id,
        created_at: patient.created_at
      });
    });

    // Adicionar pacientes do Clinicorp (evitar duplicatas por email/cpf)
    clinicorpPatients.forEach(patient => {
      const existsLocal = localPatients.some(local => 
        (local.email && patient.email && local.email.toLowerCase() === patient.email.toLowerCase()) ||
        (local.cpf && patient.cpf && local.cpf.replace(/\D/g, '') === patient.cpf.replace(/\D/g, ''))
      );

      if (!existsLocal) {
        combined.push({
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          cpf: patient.cpf,
          birth_date: patient.birth_date,
          address: patient.address,
          source: 'clinicorp',
          isLocal: false,
          created_at: patient.created_at
        });
      }
    });

    // Ordenar por nome
    combined.sort((a, b) => a.name.localeCompare(b.name));
    setCombinedPatients(combined);
    return combined;
  }, [localPatients, clinicorpPatients]);

  useEffect(() => {
    combinePatients();
  }, [combinePatients]);

  // Buscar em ambas as fontes
  const listAllPatients = useCallback(async (clinic_id?: string) => {
    await Promise.all([
      listLocalPatients(),
      listPatients(undefined, clinic_id)
    ]);
  }, [listLocalPatients, listPatients]);

  // Buscar por termo em ambas as fontes
  const searchAllPatients = useCallback(async (searchTerm: string, clinic_id?: string) => {
    await Promise.all([
      searchLocalPatients(searchTerm),
      searchPatients(searchTerm, clinic_id)
    ]);
  }, [searchLocalPatients, searchPatients]);

  return {
    combinedPatients,
    loading,
    listAllPatients,
    searchAllPatients,
    combinePatients
  };
}