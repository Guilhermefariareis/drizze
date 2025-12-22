import { useState, useCallback } from 'react';
import { useClinicorpApi } from './useClinicorpApi';
import { useToast } from './use-toast';

export interface ClinicorpPatient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePatientData {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface PatientAnamnesis {
  id: string;
  patient_id: string;
  questions: Record<string, any>;
  created_at: string;
}

export interface PatientDocument {
  id: string;
  patient_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export function useClinicorpPatients() {
  const { request, loading } = useClinicorpApi();
  const { toast } = useToast();
  const [patients, setPatients] = useState<ClinicorpPatient[]>([]);

  // List all patients (using correct Clinicorp endpoint)
  const listPatients = useCallback(async (query?: Record<string, any>, clinic_id?: string, suppressToast = true) => {
    try {
      // Use the correct Clinicorp endpoint for users/patients
      const data = await request('/security/list_users', 'GET', { query, clinic_id, suppressToast: true });
      console.log('[useClinicorpPatients] Raw API response:', data);
      
      // Handle both array and object with list property
      let rawPatientsArray = [];
      if (Array.isArray(data)) {
        rawPatientsArray = data;
      } else if (data?.list && Array.isArray(data.list)) {
        rawPatientsArray = data.list;
      } else {
        console.warn('[useClinicorpPatients] Unexpected data format:', data);
        return [];
      }
      
      // Map Clinicorp API fields to expected component fields
      const mappedPatients = rawPatientsArray.map((patient: any) => ({
        id: patient.id?.toString() || patient.UserName || '',
        name: patient.FullName || patient.UserName || 'Nome não informado',
        email: patient.Email || patient.email || '',
        phone: patient.Phone || patient.phone || patient.Telefone || '',
        cpf: patient.CPF || patient.cpf || patient.Document || '',
        birth_date: patient.BirthDate || patient.birth_date || patient.DataNascimento || '',
        address: patient.Address || patient.address || patient.Endereco || '',
        city: patient.City || patient.city || patient.Cidade || '',
        state: patient.State || patient.state || patient.Estado || '',
        zip_code: patient.ZipCode || patient.zip_code || patient.CEP || '',
        created_at: patient.created_at || patient.CreatedAt || '',
        updated_at: patient.updated_at || patient.UpdatedAt || '',
        // Additional Clinicorp fields
        UserName: patient.UserName,
        FullName: patient.FullName,
        Active: patient.Active
      }));
      
      console.log('[useClinicorpPatients] Mapped patients:', mappedPatients);
      setPatients(mappedPatients);
      return data; // Return original data for compatibility
    } catch (error) {
      // Log apenas como warning para reduzir ruído no console
      console.warn('[useClinicorpPatients] Error listing patients:', (error as Error).message);
      
      // Enhanced error handling for upstream server issues
      const errorMessage = (error as Error).message;
      if (errorMessage?.includes('upstream server') || 
          errorMessage?.includes('invalid response') ||
          errorMessage?.includes('Credenciais Clinicorp não configuradas')) {
        // Fail silently for configuration issues
        console.log('[useClinicorpPatients] Clinicorp not configured or unavailable, returning empty list');
        setPatients([]);
        return [];
      }
      
      // NUNCA mostrar toasts de erro para evitar spam
      // Apenas retornar lista vazia
      setPatients([]);
      return [];
    }
  }, [request, toast]);

  // Get patient by ID
  const getPatient = useCallback(async (patientId: string, clinic_id?: string) => {
    try {
      const data = await request(`/security/get_user/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      
      // Map Clinicorp API fields to expected component fields
      const mappedPatient = {
        id: data.id?.toString() || data.UserName || '',
        name: data.FullName || data.UserName || 'Nome não informado',
        email: data.Email || data.email || '',
        phone: data.Phone || data.phone || data.Telefone || '',
        cpf: data.CPF || data.cpf || data.Document || '',
        birth_date: data.BirthDate || data.birth_date || data.DataNascimento || '',
        address: data.Address || data.address || data.Endereco || '',
        city: data.City || data.city || data.Cidade || '',
        state: data.State || data.state || data.Estado || '',
        zip_code: data.ZipCode || data.zip_code || data.CEP || '',
        created_at: data.created_at || data.CreatedAt || '',
        updated_at: data.updated_at || data.UpdatedAt || '',
      };
      
      return mappedPatient;
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient:', (error as Error).message);
      throw error;
    }
  }, [request]);

  // Search patients by name, email, or CPF
  const searchPatients = useCallback(async (searchTerm: string, clinic_id?: string) => {
    try {
      const query = {
        search: searchTerm,
        // Add additional search parameters if needed
        name: searchTerm,
        email: searchTerm,
        cpf: searchTerm
      };
      
      return await listPatients(query, clinic_id, true);
    } catch (error) {
      console.warn('[useClinicorpPatients] Error searching patients:', (error as Error).message);
      return [];
    }
  }, [listPatients]);

  // Get patient anamnesis
  const getPatientAnamnesis = useCallback(async (patientId: string, clinic_id?: string): Promise<PatientAnamnesis[]> => {
    try {
      const data = await request(`/patient/anamnesis/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient anamnesis:', (error as Error).message);
      return [];
    }
  }, [request]);

  // Get patient documents
  const getPatientDocuments = useCallback(async (patientId: string, clinic_id?: string): Promise<PatientDocument[]> => {
    try {
      const data = await request(`/patient/documents/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient documents:', (error as Error).message);
      return [];
    }
  }, [request]);

  // Create patient anamnesis
  const createPatientAnamnesis = useCallback(async (patientId: string, questions: Record<string, any>, clinic_id?: string) => {
    try {
      const data = await request('/patient/anamnesis', 'POST', {
        body: { patient_id: patientId, questions },
        clinic_id,
        suppressToast: true
      });
      return data;
    } catch (error) {
      console.warn('[useClinicorpPatients] Error creating patient anamnesis:', (error as Error).message);
      throw error;
    }
  }, [request]);

  // Upload patient document
  const uploadPatientDocument = useCallback(async (
    patientId: string, 
    file: File, 
    documentType: string, 
    clinic_id?: string
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patient_id', patientId);
      formData.append('document_type', documentType);

      const data = await request('/patient/documents', 'POST', {
        body: formData,
        clinic_id,
        suppressToast: true
      });
      return data;
    } catch (error) {
      console.warn('[useClinicorpPatients] Error uploading patient document:', (error as Error).message);
      throw error;
    }
  }, [request]);

  // Get patient appointments
  const getPatientAppointments = useCallback(async (patientId: string, clinic_id?: string) => {
    try {
      const data = await request(`/appointment/patient/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient appointments:', (error as Error).message);
      return [];
    }
  }, [request]);

  // Get patient medical history
  const getPatientMedicalHistory = useCallback(async (patientId: string, clinic_id?: string) => {
    try {
      const data = await request(`/patient/medical-history/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient medical history:', (error as Error).message);
      return [];
    }
  }, [request]);

  // Get patient prescriptions
  const getPatientPrescriptions = useCallback(async (patientId: string, clinic_id?: string) => {
    try {
      const data = await request(`/patient/prescriptions/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient prescriptions:', (error as Error).message);
      return [];
    }
  }, [request]);

  // Get patient exam results
  const getPatientExamResults = useCallback(async (patientId: string, clinic_id?: string) => {
    try {
      const data = await request(`/patient/exam-results/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient exam results:', (error as Error).message);
      return [];
    }
  }, [request]);

  // Get patient billing
  const getPatientBilling = useCallback(async (patientId: string, clinic_id?: string) => {
    try {
      const data = await request(`/patient/billing/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient billing:', (error as Error).message);
      return [];
    }
  }, [request]);

  // Get patient insurance
  const getPatientInsurance = useCallback(async (patientId: string, clinic_id?: string) => {
    try {
      const data = await request(`/patient/insurance/${patientId}`, 'GET', { clinic_id, suppressToast: true });
      return data || {};
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient insurance:', (error as Error).message);
      return {};
    }
  }, [request]);

  // Get patient statistics
  const getPatientStatistics = useCallback(async (clinic_id?: string) => {
    try {
      const data = await request('/patient/statistics', 'GET', { clinic_id, suppressToast: true });
      return data || {};
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient statistics:', (error as Error).message);
      return {};
    }
  }, [request]);

  // Get patient by CPF
  const getPatientByCPF = useCallback(async (cpf: string, clinic_id?: string) => {
    try {
      const data = await request(`/security/get_user_by_cpf/${cpf}`, 'GET', { clinic_id, suppressToast: true });
      
      if (!data) {
        return null;
      }
      
      // Map Clinicorp API fields to expected component fields
      const mappedPatient = {
        id: data.id?.toString() || data.UserName || '',
        name: data.FullName || data.UserName || 'Nome não informado',
        email: data.Email || data.email || '',
        phone: data.Phone || data.phone || data.Telefone || '',
        cpf: data.CPF || data.cpf || data.Document || '',
        birth_date: data.BirthDate || data.birth_date || data.DataNascimento || '',
        address: data.Address || data.address || data.Endereco || '',
        city: data.City || data.city || data.Cidade || '',
        state: data.State || data.state || data.Estado || '',
        zip_code: data.ZipCode || data.zip_code || data.CEP || '',
        created_at: data.created_at || data.CreatedAt || '',
        updated_at: data.updated_at || data.UpdatedAt || '',
      };
      
      return mappedPatient;
    } catch (error) {
      console.warn('[useClinicorpPatients] Error getting patient by CPF:', (error as Error).message);
      return null;
    }
  }, [request]);

  return {
    patients,
    loading,
    listPatients,
    getPatient,
    searchPatients,
    getPatientAnamnesis,
    getPatientDocuments,
    createPatientAnamnesis,
    uploadPatientDocument,
    getPatientAppointments,
    getPatientMedicalHistory,
    getPatientPrescriptions,
    getPatientExamResults,
    getPatientBilling,
    getPatientInsurance,
    getPatientStatistics,
    getPatientByCPF,
  };
}