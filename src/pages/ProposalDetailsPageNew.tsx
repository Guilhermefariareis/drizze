import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Building2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { Navbar } from '@/components/Navbar';
import { AppSidebar } from '@/components/clinic/AppSidebar';

interface CreditRequest {
  id: string;
  patient_id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  patient_name: string;
  patient_cpf: string;
  patient_email: string;
  patient_phone: string;
  patient_birth_date?: string;
  patient_address_cep?: string;
  patient_address_state?: string;
  patient_address_city?: string;
  patient_address_neighborhood?: string;
  patient_address_street?: string;
  patient_address_number?: string;
  treatment_type?: string;
  urgency_level?: string;
  requested_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_amount?: number;
  interest_rate?: number;
  monthly_payment?: number;
  total_amount?: number;
  fidc_name?: string;
  payment_conditions?: any;
}

interface CreditOffer {
  id: string;
  credit_request_id: string;
  bank_name: string;
  approved_amount: number;
  interest_rate: number;
  installments: number;
  conditions: string;
  monthly_payment: number | null;
  total_amount: number | null;
  created_at: string;
}

export const ProposalDetailsPageNew: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumo');
  const [request, setRequest] = useState<CreditRequest | null>(null);
  const [offers, setOffers] = useState<CreditOffer[]>([]);
  const [clinicName, setClinicName] = useState('');
  const [clinicCnpj, setClinicCnpj] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 [ProposalDetailsPage] useEffect executado com requestId:', requestId);
    if (requestId) {
      fetchProposalData(requestId);
    } else {
      console.error('❌ [ProposalDetailsPage] requestId não encontrado na URL');
      setError('ID da proposta não encontrado na URL');
      setLoading(false);
    }
  }, [requestId]);

  const fetchProposalData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [ProposalDetailsPage] Buscando proposta com ID:', id);

      // Buscar todos os dados diretamente da tabela credit_requests
      const { data: requestData, error: requestError } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('id', id)
        .single();

      console.log('📊 [ProposalDetailsPage] Resultado da query credit_requests:', { requestData, requestError });

      if (requestError) {
        console.error('❌ [ProposalDetailsPage] Erro na query credit_requests:', requestError);
        throw new Error(`Proposta não encontrada: ${requestError.message}`);
      }

      if (!requestData) {
        console.error('❌ [ProposalDetailsPage] Nenhum dado retornado para ID:', id);
        throw new Error('Proposta não encontrada - dados vazios');
      }

      console.log('✅ [ProposalDetailsPage] Dados da proposta carregados:', requestData);

      // Fallback: completar endereço e nascimento do paciente quando não informados na proposta
      let mergedRequest: any = { ...requestData };
      const needsCep = !requestData.patient_address_cep;
      const needsCity = !requestData.patient_address_city;
      const needsState = !requestData.patient_address_state;
      const needsBirth = !requestData.patient_birth_date;

      if ((needsCep || needsCity || needsState || needsBirth) && requestData.patient_id) {
        try {
          const [{ data: profileData }, { data: patientData }] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', requestData.patient_id).maybeSingle(),
            supabase.from('patients').select('*').eq('id', requestData.patient_id).maybeSingle()
          ]);

          const fallbackCity = (profileData as any)?.city ?? (patientData as any)?.city ?? null;
          const fallbackState = (profileData as any)?.state ?? (patientData as any)?.state ?? null;
          const fallbackZip = ((profileData as any)?.zip_code ?? (patientData as any)?.zip_code ?? '')
            ?.toString()
            .replace(/\D/g, '') || null;
          const fallbackBirth = (profileData as any)?.birth_date ?? (patientData as any)?.birth_date ?? null;

          mergedRequest = {
            ...mergedRequest,
            patient_address_cep: mergedRequest.patient_address_cep ?? fallbackZip,
            patient_address_city: mergedRequest.patient_address_city ?? fallbackCity,
            patient_address_state: mergedRequest.patient_address_state ?? fallbackState,
            patient_birth_date: mergedRequest.patient_birth_date ?? fallbackBirth,
          };

          console.log('[ProposalDetailsPageNew] Endereço/Nascimento após fallback:', {
            cep: mergedRequest.patient_address_cep,
            city: mergedRequest.patient_address_city,
            state: mergedRequest.patient_address_state,
            birth: mergedRequest.patient_birth_date,
          });
        } catch (fallbackErr) {
          console.warn('⚠️ [ProposalDetailsPageNew] Falha ao aplicar fallback:', fallbackErr);
        }
      }

      setRequest(mergedRequest);

      // Buscar ofertas relacionadas
      const { data: offersData } = await supabase
        .from('credit_offers')
        .select('*')
        .eq('credit_request_id', id);

      if (offersData) {
        setOffers(offersData);
      }

      // Buscar dados da clínica
      if (requestData.clinic_id) {
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('name, cnpj')
          .eq('id', requestData.clinic_id)
          .single();

        if (clinicData) {
          setClinicName(clinicData.name || '');
          setClinicCnpj(clinicData.cnpj || '');
        }
      }
    } catch (err) {
      console.error('💥 [ProposalDetailsPage] Erro capturado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados da proposta';
      console.error('💥 [ProposalDetailsPage] Mensagem de erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 ml-0 md:ml-64 pt-16 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados da proposta...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 ml-0 md:ml-64 pt-16 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposta não encontrada</h1>
              <p className="text-gray-600 mb-6">{error || 'A proposta solicitada não foi encontrada.'}</p>
              <Button onClick={() => navigate('/clinic-dashboard')} className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 ml-0 md:ml-64 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Detalhes da Proposta</h1>
              <p className="text-gray-600">Proposta ID: {request.id}</p>
              <p className="text-gray-600">Cliente: {request.patient_name}</p>
              <p className="text-gray-600">Status: {request.status}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Data de Nascimento</div>
                  <div className="font-medium">
                    {request.patient_birth_date ? new Date(request.patient_birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">CEP</div>
                  <div className="font-medium">{request.patient_address_cep || 'Não informado'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Cidade</div>
                  <div className="font-medium">{request.patient_address_city || 'Não informado'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Estado</div>
                  <div className="font-medium">{request.patient_address_state || 'Não informado'}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};