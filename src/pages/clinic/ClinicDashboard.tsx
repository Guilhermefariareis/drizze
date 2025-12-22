import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { ValueSlider } from '../../components/ui/value-slider';
import { Eye, FileText, Clock, CheckCircle, XCircle, X, Building2, Calendar, User, Phone, Mail, CreditCard, Edit, Send, Trash2, MessageSquare, Upload, Plus, Loader2, DollarSign, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  treatment_type?: string;
  urgency_level?: string;
  requested_date?: string;
  status: 'pending' | 'clinic_reviewing' | 'sent_to_admin' | 'admin_analyzing' | 'approved' | 'rejected' | 'cancelled' | 'awaiting_documents' | 'admin_approved' | 'admin_rejected' | 'clinic_approved' | 'sent_to_patient' | 'patient_accepted' | 'patient_rejected';
  created_at: string;
  updated_at: string;
  clinic_notes?: string;
  admin_notes?: string;
  description?: string;
  analysis_status?: 'pending' | 'pre_approved' | 'denied' | 'loaned' | 'contracted';
  analyzed_at?: string;
  analyzed_by?: string;
  fidc_name?: string;
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

const ClinicDashboard: React.FC = () => {
  console.log('🏥🏥🏥 [ClinicDashboard] COMPONENTE INICIADO!');
  console.log('🏥🏥🏥 [ClinicDashboard] Timestamp:', new Date().toISOString());
  console.log('🏥🏥🏥 [ClinicDashboard] URL atual:', window.location.href);
  
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [creditOffers, setCreditOffers] = useState<Record<string, CreditOffer[]>>({});
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CreditOffer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  
  // Estados removidos - ProposalView agora é uma página dedicada
  
  // Estados para dados da clínica
  const [clinicData, setClinicData] = useState<{name: string; cnpj: string} | null>(null);
  
  console.log('🏥🏥🏥 [ClinicDashboard] Estados inicializados - clinicData:', clinicData);
  
  // Mapeamento de ID para nome completo do FIDC
  const fidcMapping: { [key: string]: string } = {
    'santander': 'FIDC Santander',
    'ease': 'FIDC Ease',
    'bv': 'FIDC BV'
  };
  
  // Estados para o modal de nova solicitação
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Dados do Cliente (PF)
    patient_name: '',
    patient_cpf: '',
    patient_birth_date: '',
    patient_mother_name: '',
    patient_phone: '',
    patient_email: '',
    patient_address: '',
    patient_cep: '',
    patient_city: '',
    patient_uf: '',
    lgpd_consent: false,
    // Dados da Operação
    requested_amount: 1000,
    installments: 12,
    treatment_description: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🚀 [ClinicDashboard] Componente montado, iniciando fetchClinicId...');
    fetchClinicId();
  }, []);

  // Debug: Monitorar mudanças no estado creditRequests
  useEffect(() => {
    console.log('🔄 [ClinicDashboard] Estado creditRequests atualizado:', creditRequests);
    console.log('🔄 [ClinicDashboard] Número de solicitações:', creditRequests?.length || 0);
    if (creditRequests && creditRequests.length > 0) {
      console.log('📋 [ClinicDashboard] Primeira solicitação:', creditRequests[0]);
    }
  }, [creditRequests]);

  // Debug: Monitorar mudanças no estado creditOffers
  useEffect(() => {
    console.log('🔄 [ClinicDashboard] Estado creditOffers atualizado:', creditOffers);
    console.log('🔄 [ClinicDashboard] Número de solicitações com ofertas:', Object.keys(creditOffers).length);
  }, [creditOffers]);

  // Debug: Monitorar mudanças no loading
  useEffect(() => {
    console.log('⏳ [ClinicDashboard] Estado loading alterado:', loading);
  }, [loading]);

  // Debug: Monitorar mudanças no clinicId
  useEffect(() => {
    console.log('🏥 [ClinicDashboard] Estado clinicId alterado:', clinicId);
  }, [clinicId]);

  // Debug: Monitorar mudanças no clinicData
  useEffect(() => {
    console.log('🏥🏥🏥 [ClinicDashboard] Estados inicializados - clinicData:', clinicData);
  }, [clinicData]);

  const fetchClinicId = async () => {
    try {
      console.log('🏥 [ClinicDashboard] === INICIANDO fetchClinicId ===');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ [ClinicDashboard] Usuário não autenticado');
        toast.error('Usuário não autenticado');
        return;
      }

      console.log('🏥 [ClinicDashboard] Usuário autenticado:', user.id, user.email);
      console.log('🏥 [ClinicDashboard] Buscando clínica para usuário...');
      
      // LOGS DETALHADOS: Primeiro vamos buscar TODAS as clínicas para debug
      console.log('🔍 [DEBUG] Buscando TODAS as clínicas para debug...');
      const { data: allClinics, error: allClinicsError } = await supabase
        .from('clinics')
        .select('id, name, cnpj, email, master_user_id, owner_id');
      
      console.log('🔍 [DEBUG] Total de clínicas encontradas:', allClinics?.length);
      console.log('🔍 [DEBUG] Clínicas com master_user_id igual ao usuário atual:');
      allClinics?.forEach(clinic => {
        if (clinic.master_user_id === user.id) {
          console.log('   ✅ MATCH por master_user_id:', {
            id: clinic.id,
            name: clinic.name,
            cnpj: clinic.cnpj,
            email: clinic.email,
            master_user_id: clinic.master_user_id
          });
        }
      });
      
      console.log('🔍 [DEBUG] Clínicas com owner_id igual ao usuário atual:');
      allClinics?.forEach(clinic => {
        if (clinic.owner_id === user.id) {
          console.log('   ✅ MATCH por owner_id:', {
            id: clinic.id,
            name: clinic.name,
            cnpj: clinic.cnpj,
            email: clinic.email,
            owner_id: clinic.owner_id
          });
        }
      });
      
      // Agora a query original
      const { data: clinicInfo, error } = await supabase
        .from('clinics')
        .select('id, name, cnpj, email, master_user_id, owner_id')
        .or(`master_user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .limit(1)
        .single();

      console.log('🏥 [ClinicDashboard] Resposta da query clinics:');
      console.log('   - Error:', error);
      console.log('   - Data completa:', clinicInfo);
      
      // Log de verificação sem expectativa fixa
      if (clinicInfo) {
        console.log('🎯 [VERIFICAÇÃO] Clínica retornada:');
        console.log('   - ID:', clinicInfo.id);
        console.log('   - Nome:', clinicInfo.name);
        console.log('   - CNPJ:', clinicInfo.cnpj);
        console.log('   - Email:', clinicInfo.email);
        console.log('   - Master User ID:', clinicInfo.master_user_id);
        console.log('   - Owner ID:', clinicInfo.owner_id);
      }

      if (error) {
        console.error('❌ [ClinicDashboard] Erro ao buscar clinic_id:', error);
        toast.error('Clínica não encontrada para este usuário');
        return;
      }

      if (clinicInfo) {
        console.log('✅ [ClinicDashboard] Dados da clínica encontrados:');
        console.log('   - ID:', clinicInfo.id);
        console.log('   - Nome:', clinicInfo.name);
        console.log('   - CNPJ:', clinicInfo.cnpj);
        
        setClinicId(clinicInfo.id);
        
        const clinicDataToSet = {
          name: clinicInfo.name || '',
          cnpj: clinicInfo.cnpj || ''
        };
        
        console.log('🏥 [ClinicDashboard] Definindo clinicData:', clinicDataToSet);
        setClinicData(clinicDataToSet);
        
        await fetchCreditRequests(clinicInfo.id);
      } else {
        console.warn('⚠️ [ClinicDashboard] Nenhuma clínica encontrada para o usuário');
        toast.error('Nenhuma clínica encontrada para este usuário');
      }
    } catch (error) {
      console.error('❌ [ClinicDashboard] Erro geral:', error);
      toast.error('Erro ao carregar dados da clínica');
    } finally {
      console.log('🏥 [ClinicDashboard] === FINALIZANDO fetchClinicId ===');
      setLoading(false);
    }
  };

  const fetchCreditRequests = async (clinicId: string) => {
    try {
      console.log('📋 [ClinicDashboard] === INICIANDO fetchCreditRequests ===');
      console.log('📋 [ClinicDashboard] clinicId recebido:', clinicId);
      console.log('📋 [ClinicDashboard] Tipo do clinicId:', typeof clinicId);
      
      // Validação do clinicId
      if (!clinicId || clinicId === 'undefined') {
        console.error('❌ [ClinicDashboard] clinicId inválido:', clinicId);
        toast.error('ID da clínica não encontrado');
        return;
      }
      
      console.log('📋 [ClinicDashboard] Buscando solicitações para clinic_id:', clinicId);
      
      const { data: requests, error } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      console.log('📋 [ClinicDashboard] Resposta da query:');
      console.log('   - Error:', error);
      console.log('   - Data:', requests);
      console.log('   - Número de registros:', requests?.length || 0);

      if (error) {
        console.error('❌ [ClinicDashboard] Erro ao buscar solicitações:', error);
        toast.error('Erro ao carregar solicitações de crédito');
        return;
      }

      console.log('✅ [ClinicDashboard] Solicitações encontradas:', requests?.length || 0);
      
      if (requests && requests.length > 0) {
        console.log('📋 [ClinicDashboard] Detalhes das solicitações:');
        requests.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.patient_name} (ID: ${req.id})`);
          console.log(`      Status: ${req.status}`);
          console.log(`      Valor: R$ ${req.requested_amount}`);
        });
      }
      
      console.log('📋 [ClinicDashboard] Chamando setCreditRequests com:', requests || []);
      setCreditRequests(requests || []);
      
      console.log('📋 [ClinicDashboard] Estado creditRequests após setCreditRequests:', creditRequests);

      // Buscar ofertas para cada solicitação
      if (requests && requests.length > 0) {
        console.log('🎯 [DEBUG] Chamando fetchCreditOffers com IDs:', requests.map(r => r.id));
        await fetchCreditOffers(requests.map(r => r.id));
      } else {
        console.log('⚠️ [DEBUG] Nenhuma solicitação encontrada para buscar ofertas');
      }
      
      console.log('📋 [ClinicDashboard] === FINALIZANDO fetchCreditRequests ===');
    } catch (error) {
      console.error('❌ [ClinicDashboard] Erro geral ao buscar solicitações:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const fetchCreditOffers = async (requestIds: string[]) => {
    try {
      console.log('🏦 [ClinicDashboard] Buscando ofertas bancárias para:', requestIds);
      
      if (!requestIds || requestIds.length === 0) {
        console.log('⚠️ [ClinicDashboard] Nenhum ID de solicitação fornecido');
        setCreditOffers({});
        return;
      }

      // Buscar ofertas específicas para as solicitações
      const { data: offers, error } = await supabase
        .from('credit_offers')
        .select('*')
        .in('credit_request_id', requestIds);

      if (error) {
        console.error('❌ [ClinicDashboard] Erro ao buscar ofertas:', error);
        toast.error('Erro ao carregar ofertas bancárias');
        return;
      }

      console.log('💰 [ClinicDashboard] Ofertas encontradas:', offers?.length || 0);

      // Agrupar ofertas por credit_request_id
      const groupedOffers = (offers || []).reduce((acc, offer) => {
        if (!acc[offer.credit_request_id]) {
          acc[offer.credit_request_id] = [];
        }
        acc[offer.credit_request_id].push(offer);
        return acc;
      }, {} as Record<string, CreditOffer[]>);

      console.log('🗂️ [ClinicDashboard] Ofertas agrupadas por solicitação:', Object.keys(groupedOffers).length);
      setCreditOffers(groupedOffers);
    } catch (error) {
      console.error('❌ [ClinicDashboard] Erro geral ao buscar ofertas:', error);
      toast.error('Erro ao carregar ofertas bancárias');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
      case 'admin_approved':
        return {
          label: 'Pré-Aprovado',
          color: 'bg-green-500 hover:bg-green-600',
          textColor: 'text-white',
          icon: CheckCircle
        };
      case 'rejected':
      case 'admin_rejected':
        return {
          label: 'Cliente negado',
          color: 'bg-red-500 hover:bg-red-600',
          textColor: 'text-white',
          icon: XCircle
        };
      case 'pending':
      case 'clinic_reviewing':
      case 'sent_to_admin':
      case 'admin_analyzing':
        return {
          label: 'Em análise',
          color: 'bg-blue-500 hover:bg-blue-600',
          textColor: 'text-white',
          icon: Clock
        };
      default:
        return {
          label: 'Em análise',
          color: 'bg-gray-500 hover:bg-gray-600',
          textColor: 'text-white',
          icon: Clock
        };
    }
  };

  const openDetailsModal = (request: CreditRequest) => {
    navigate(`/proposal/${request.id}`);
  };



  const closeSidebar = () => {
    setShowSidebar(false);
    setSelectedRequest(null);
  };

  const openOfferModal = (offer: CreditOffer) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setSelectedOffer(null);
  };

  const reloadOffers = async () => {
    if (creditRequests.length > 0) {
      console.log('🔄 [ClinicDashboard] Recarregando ofertas manualmente...');
      await fetchCreditOffers(creditRequests.map(r => r.id));
    }
  };

  // Função para enviar ofertas para o paciente
  const sendOffersToPatient = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('credit_requests')
        .update({ 
          status: 'sent_to_patient',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Erro ao enviar ofertas para paciente:', error);
        toast.error('Erro ao enviar ofertas para o paciente');
        return;
      }

      toast.success('Ofertas enviadas para o paciente com sucesso!');
      
      // Recarregar as solicitações para atualizar o status
      if (clinicId) {
        await fetchCreditRequests(clinicId);
      }
    } catch (error) {
      console.error('Erro ao enviar ofertas:', error);
      toast.error('Erro ao enviar ofertas para o paciente');
    }
  };

  // Função para escolher uma oferta específica
  const selectOffer = async (offerId: string, requestId: string) => {
    try {
      // Atualizar status da solicitação para 'clinic_approved'
      const { error: statusError } = await supabase
        .from('credit_requests')
        .update({ 
          status: 'clinic_approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (statusError) {
        console.error('Erro ao atualizar status:', statusError);
        toast.error('Erro ao atualizar status da solicitação');
        return;
      }

      toast.success('Oferta escolhida com sucesso! Retornando para o administrador.');
      
      // Recarregar dados para refletir as mudanças
      if (clinicId) {
        await fetchCreditRequests(clinicId);
      }
    } catch (error) {
      console.error('Erro ao escolher oferta:', error);
      toast.error('Erro ao escolher oferta');
    }
  };

  // Função para calcular o máximo aprovado entre as ofertas
  const getMaxApprovedAmount = (requestId: string): number => {
    const offers = creditOffers[requestId];
    if (!offers || offers.length === 0) return 0;
    const validAmounts = offers.map(offer => offer.approved_amount || 0).filter(amount => amount > 0);
    return validAmounts.length > 0 ? Math.max(...validAmounts) : 0;
  };

  // Função para obter status com cores corretas conforme a imagem
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'admin_approved':
      case 'clinic_approved':
      case 'patient_accepted':
        return { label: 'Aprovado', color: 'bg-green-500', textColor: 'text-white' };
      case 'sent_to_patient':
        return { label: 'Mais de Crédito', color: 'bg-yellow-500', textColor: 'text-white' };
      case 'clinic_reviewing':
      case 'admin_analyzing':
        return { label: 'Simulação', color: 'bg-blue-500', textColor: 'text-white' };
      case 'rejected':
      case 'admin_rejected':
      case 'patient_rejected':
        return { label: 'Reprovado', color: 'bg-red-500', textColor: 'text-white' };
      case 'pending':
        return { label: 'Pendente', color: 'bg-yellow-500', textColor: 'text-white' };
      default:
        return { label: 'Pendente', color: 'bg-yellow-500', textColor: 'text-white' };
    }
  };

  // Funções auxiliares para formatação
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(numbers[9]) !== digit) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    return parseInt(numbers[10]) === digit;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Funções de formatação para novos campos
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  };

  // Função para avançar para seleção de FIDC sem salvar ainda
  const handleSubmitCreditRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.patient_name.trim()) {
      toast.error('Nome do paciente é obrigatório');
      return;
    }

    if (!validateCPF(formData.patient_cpf)) {
      toast.error('CPF inválido');
      return;
    }

    if (!formData.patient_birth_date.trim()) {
      toast.error('Data de nascimento é obrigatória');
      return;
    }

    if (!formData.patient_mother_name.trim()) {
      toast.error('Nome da mãe é obrigatório');
      return;
    }

    if (!formData.patient_phone.trim()) {
      toast.error('Celular é obrigatório');
      return;
    }

    if (!validateEmail(formData.patient_email)) {
      toast.error('Email inválido');
      return;
    }

    if (!formData.lgpd_consent) {
      toast.error('É necessário autorizar o uso dos dados conforme a LGPD');
      return;
    }

    // Validação de valor/przo removida aqui; será definida na página de ofertas

    try {
      if (!clinicId) {
        toast.error('ID da clínica não encontrado');
        return;
      }

      // Resolver patient_id: tentar perfis por email, depois CPF; fallback para user.id ou clinicId
      const cpfClean = formData.patient_cpf.replace(/\D/g, '');
      let patientId: string | null = null;

      try {
        const { data: emailProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.patient_email);
        if (emailProfiles && emailProfiles.length > 0) {
          patientId = emailProfiles[0].id as string;
          console.log('✅ [ClinicDashboard] patient_id por email (profiles.id):', patientId);
        }
      } catch (lookupErr) {
        console.warn('⚠️ [ClinicDashboard] Falha ao buscar perfil por email:', lookupErr);
      }

      if (!patientId) {
        try {
          const { data: cpfProfiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('cpf', cpfClean);
          if (cpfProfiles && cpfProfiles.length > 0) {
            patientId = cpfProfiles[0].id as string;
            console.log('✅ [ClinicDashboard] patient_id por CPF (profiles.id):', patientId);
          }
        } catch (lookupErr2) {
          console.warn('⚠️ [ClinicDashboard] Falha ao buscar perfil por CPF:', lookupErr2);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!patientId) {
        patientId = user?.id || clinicId;
        console.log('ℹ️ [ClinicDashboard] Fallback para patient_id:', patientId);
      }

      // Não salvar ainda: navegar para página de ofertas com dados necessários
      setShowModal(false);
      navigate('/clinic-offers', { state: { formData, clinicId, patientId } });
    } catch (err) {
      console.error('❌ [ClinicDashboard] Erro inesperado ao preparar solicitação:', err);
      toast.error('Erro inesperado ao preparar solicitação.');
    }
  };





  if (loading) {
    console.log('⏳ [ClinicDashboard] Renderizando loading...');
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  console.log('🎨 [ClinicDashboard] === RENDERIZANDO COMPONENTE ===');
  console.log('🎨 [ClinicDashboard] Estado atual:');
  console.log('   - loading:', loading);
  console.log('   - clinicId:', clinicId);
  console.log('   - creditRequests.length:', creditRequests?.length || 0);
  console.log('   - creditRequests:', creditRequests);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6 flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Solicitações de Crédito</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie as solicitações de crédito dos pacientes</p>
        </div>
        <div className="w-full sm:w-auto flex justify-start sm:justify-end">
          <Button 
            onClick={() => setShowModal(true)}
            variant="default"
            className="w-full sm:w-auto flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Simular Proposta</span>
          </Button>
        </div>
      </div>

      {/* Tabela de Solicitações */}
      {(() => {
        console.log('🎨 [ClinicDashboard] Renderizando tabela de solicitações...');
        console.log('🎨 [ClinicDashboard] creditRequests.length:', creditRequests.length);
        console.log('🎨 [ClinicDashboard] Condição creditRequests.length === 0:', creditRequests.length === 0);
        
        if (creditRequests.length === 0) {
          console.log('🎨 [ClinicDashboard] Renderizando mensagem "Nenhuma solicitação encontrada"');
          return (
            <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
                <p className="text-gray-500">Não há solicitações de crédito para exibir.</p>
              </div>
            </div>
          );
        } else {
          console.log('🎨 [ClinicDashboard] Renderizando tabela com', creditRequests.length, 'solicitações');
          return (
            <>
            <div className="hidden sm:block bg-white rounded-lg border overflow-x-auto lg:overflow-x-hidden -mx-2 sm:mx-0 pb-2 pr-2 sm:pr-4">
              <table className="w-full min-w-[900px] sm:min-w-[1100px] lg:min-w-0 lg:table-fixed">
                <thead className="bg-gray-50 border-b">
                  <tr>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-20" style={{marginRight: '50px', paddingRight: '30px', minWidth: '200px'}}>
                          Nº
                        </th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-44" style={{marginLeft: '50px', paddingLeft: '50px'}}>
                          Cliente
                        </th>
                        <th className="hidden 2xl:table-cell px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">
                          CPF
                        </th>
                        <th className="hidden 2xl:table-cell px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-36">
                          Clínica
                        </th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">
                          Valor
                        </th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-20">
                          Taxa
                        </th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-16">
                          Parc.
                        </th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">
                          Parcela
                        </th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">
                          Total
                        </th>
                        <th className="hidden 2xl:table-cell px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">
                          FIDC
                        </th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24">
                          Status
                        </th>
                        <th className="px-2 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {creditRequests.map((request) => {
                        const statusDisplay = getStatusDisplay(request.status);
                        const maxApproved = getMaxApprovedAmount(request.id);
                        const bestOffer = creditOffers[request.id]?.find(offer => offer.approved_amount === maxApproved);
                        
                        // Calcular valores baseados na melhor oferta ou dados da solicitação
                        const interestRate = bestOffer?.interest_rate || 2.5; // Taxa padrão se não houver oferta
                        const installments = request.installments || 12;
                        const requestedAmount = request.requested_amount || 0;
                        
                        // Cálculo mais preciso do valor da parcela
                        let monthlyPayment = 0;
                        if (bestOffer?.monthly_payment) {
                          monthlyPayment = bestOffer.monthly_payment;
                        } else {
                          // Fórmula de juros compostos para financiamento
                          const monthlyRate = interestRate / 100;
                          if (monthlyRate > 0) {
                            monthlyPayment = requestedAmount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / (Math.pow(1 + monthlyRate, installments) - 1);
                          } else {
                            monthlyPayment = requestedAmount / installments;
                          }
                        }
                        
                        const totalAmount = monthlyPayment * installments;
                        
                        // Gerar número da proposta baseado no ID
                        const proposalNumber = `PROP-${request.id.slice(-8).toUpperCase()}`;
                        
                        // Nome da clínica dinâmico
                        const clinicName = clinicData.name || "Clínica Odontológica";
                        
                        // FIDC baseado na melhor oferta ou dados da solicitação
                        const fidcName = bestOffer?.bank_name || request.fidc_name || "FIDC Santander";
                        
                        return (
                          <tr 
                            key={request.id} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => openDetailsModal(request)}
                          >
                            <td className="px-2 py-2 whitespace-nowrap" style={{marginRight: '50px', paddingRight: '30px', minWidth: '200px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                              <div className="text-xs font-medium text-gray-900">
                                {proposalNumber}
                              </div>
                            </td>
                            
                            <td className="px-2 py-2 whitespace-nowrap" style={{marginLeft: '50px', paddingLeft: '50px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                              <div className="text-xs font-medium text-gray-900 truncate max-w-[180px]">
                                {request.patient_name}
                              </div>
                            </td>
                            
                            <td className="hidden 2xl:table-cell px-2 py-2 whitespace-nowrap">
                              <div className="text-xs text-gray-900">
                                {formatCPF(request.patient_cpf)}
                              </div>
                            </td>
                            
                            <td className="hidden 2xl:table-cell px-2 py-2 whitespace-nowrap">
                              <div className="text-xs text-gray-900 truncate max-w-[150px]">
                                {clinicName}
                              </div>
                            </td>

                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-xs font-medium text-gray-900">
                                R$ ${requestedAmount.toFixed(2).replace('.', ',')}
                              </div>
                            </td>
                            
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-xs text-gray-900">
                                {interestRate.toFixed(2)}%
                              </div>
                            </td>
                            
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-xs text-gray-900">
                                {installments}x
                              </div>
                            </td>
                            
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-xs font-medium text-gray-900">
                                R$ ${monthlyPayment.toFixed(2).replace('.', ',')}
                              </div>
                            </td>
                            
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-xs font-medium text-gray-900">
                                R$ ${totalAmount.toFixed(2).replace('.', ',')}
                              </div>
                            </td>
                            
                            <td className="hidden 2xl:table-cell px-2 py-2 whitespace-nowrap">
                              <div className="text-xs text-gray-900 truncate max-w-[120px]">
                                {fidcName}
                              </div>
                            </td>
                            
                            <td className="px-2 py-2 whitespace-nowrap">
                              <Badge className={`${statusDisplay.color} ${statusDisplay.textColor} border-0 text-[10px] px-2 py-0.5`}>
                                {statusDisplay.label}
                              </Badge>
                            </td>
                            
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetailsModal(request);
                                  }}
                                  className="text-[11px] px-2 py-1"
                                >
                                  Ver Proposta
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
            <div className="block sm:hidden space-y-3">
              {creditRequests.map((request) => {
                const statusDisplay = getStatusDisplay(request.status);
                const maxApproved = getMaxApprovedAmount(request.id);
                const bestOffer = creditOffers[request.id]?.find(offer => offer.approved_amount === maxApproved);
                const interestRate = bestOffer?.interest_rate || 2.5;
                const installments = request.installments || 12;
                const requestedAmount = request.requested_amount || 0;
                let monthlyPayment = 0;
                if (bestOffer?.monthly_payment) {
                  monthlyPayment = bestOffer.monthly_payment;
                } else {
                  const monthlyRate = interestRate / 100;
                  if (monthlyRate > 0) {
                    monthlyPayment = requestedAmount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / (Math.pow(1 + monthlyRate, installments) - 1);
                  } else {
                    monthlyPayment = requestedAmount / installments;
                  }
                }
                const totalAmount = monthlyPayment * installments;
                const proposalNumber = `PROP-${request.id.slice(-8).toUpperCase()}`;
                const clinicName = clinicData.name || "Clínica Odontológica";
                return (
                  <Card key={request.id} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="truncate max-w-[70%]">{request.patient_name}</span>
                        <Badge className={`${statusDisplay.color} ${statusDisplay.textColor} border-0 text-[10px] px-2 py-0.5`}>{statusDisplay.label}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Proposta</span>
                        <span className="font-medium">{proposalNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Clínica</span>
                        <span className="font-medium truncate max-w-[50%]">{clinicName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Valor</span>
                        <span className="font-medium">R$ ${requestedAmount.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Parcelas</span>
                        <span className="font-medium">{installments}x</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Parcela</span>
                        <span className="font-medium">R$ ${monthlyPayment.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total</span>
                        <span className="font-medium">R$ ${totalAmount.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => openDetailsModal(request)}
                        >
                          Ver Proposta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            </>
          );
        }
      })()}

      {/* Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar deslizante */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        showSidebar ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header da sidebar */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Ofertas Bancárias</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Conteúdo da sidebar */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedRequest && (
              <div className="space-y-6">
                {/* Informações do Cliente */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Nome:</span> {selectedRequest.patient_name}</div>
                <div><span className="font-medium">CPF:</span> {selectedRequest.patient_cpf}</div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium">Telefone:</span> 
                      <span className="ml-1">{selectedRequest.patient_phone || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium">Email:</span> 
                      <span className="ml-1">{selectedRequest.patient_email || 'Não informado'}</span>
                    </div>
                    <div><span className="font-medium">Valor Solicitado:</span> R$ ${(selectedRequest.requested_amount || 0).toFixed(2).replace('.', ',')}</div>
                    <div><span className="font-medium">Data:</span> {new Date(selectedRequest.created_at).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>

                {/* Ofertas Bancárias */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Ofertas Disponíveis
                  </h3>
                  
                  {creditOffers[selectedRequest.id] && creditOffers[selectedRequest.id].length > 0 ? (
                    <div className="space-y-3">
                      {creditOffers[selectedRequest.id].map((offer) => (
                        <div key={offer.id} className={`border rounded-lg p-4 transition-colors ${
                          selectedRequest.status === 'clinic_approved'
                            ? 'border-indigo-500 bg-indigo-50 hover:bg-indigo-100' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-gray-900">{offer.bank_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {selectedRequest.status === 'clinic_approved' && (
                                <Badge className="bg-indigo-500 text-white border-indigo-600">
                                  OFERTA ESCOLHIDA
                                </Badge>
                              )}
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                Aprovado
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Valor Aprovado:</span>
                              <span className="font-medium text-green-600">
                                R$ ${(offer.approved_amount || 0).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taxa de Juros:</span>
                              <span className="font-medium">{offer.interest_rate || 0}% a.m.</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Parcelas:</span>
                              <span className="font-medium">{offer.installments}x</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Valor da Parcela:</span>
                              <span className="font-medium">
                                R$ ${(offer.monthly_payment || 0).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            {offer.conditions && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-gray-600 text-xs">Condições:</span>
                                <p className="text-xs text-gray-500 mt-1">{offer.conditions}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            {selectedRequest.status === 'admin_approved' ? (
                              <div className="space-y-2">
                                <Button 
                                  className={`w-full ${
                                    selectedRequest.status === 'clinic_approved'
                                      ? 'bg-gray-400 cursor-not-allowed' 
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  } text-white`}
                                  size="sm"
                                  onClick={() => selectOffer(offer.id, selectedRequest.id)}
                                  disabled={selectedRequest.status === 'clinic_approved'}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {selectedRequest.status === 'clinic_approved' ? 'Oferta Escolhida' : 'Escolher Esta Oferta'}
                                </Button>
                                <Button 
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                  size="sm"
                                  onClick={() => sendOffersToPatient(selectedRequest.id)}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Encaminhar para Paciente
                                </Button>
                              </div>
                            ) : selectedRequest.status === 'sent_to_patient' ? (
                              <div className="w-full p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <Clock className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm text-purple-700 font-medium">
                                    Aguardando resposta do paciente
                                  </span>
                                </div>
                              </div>
                            ) : selectedRequest.status === 'patient_accepted' ? (
                              <div className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  <span className="text-sm text-emerald-700 font-medium">
                                    Aceito pelo paciente
                                  </span>
                                </div>
                              </div>
                            ) : selectedRequest.status === 'patient_rejected' ? (
                              <div className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <XCircle className="w-4 h-4 text-orange-600" />
                                  <span className="text-sm text-orange-700 font-medium">
                                    Rejeitado pelo paciente
                                  </span>
                                </div>
                              </div>
                            ) : selectedRequest.status === 'clinic_approved' ? (
                              <div className="w-full p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                                  <span className="text-sm text-indigo-700 font-medium">
                                    Oferta escolhida - Retornado para administrador
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                <span className="text-sm text-gray-600">
                                  Aguardando aprovação do administrador
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma oferta disponível</h3>
                      <p className="text-gray-500">Ainda não há ofertas bancárias para esta solicitação.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Oferta */}
      {showOfferModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">
                Oferta - {selectedOffer.bank_name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeOfferModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Resumo da Oferta */}
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="font-semibold text-green-800 text-sm sm:text-base">{selectedOffer.bank_name}</span>
                  <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">Aprovado</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-green-600">Valor Aprovado</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-800">
                      R$ ${(selectedOffer.approved_amount || 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-green-600">Taxa de Juros</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-800">{selectedOffer.interest_rate || 0}% a.m.</p>
                  </div>
                </div>
              </div>

              {/* Detalhes do Financiamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-sm sm:text-base">Detalhes do Pagamento</h4>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span>Número de Parcelas:</span>
                      <span className="font-medium">{selectedOffer.installments}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor da Parcela:</span>
                      <span className="font-medium">R$ ${selectedOffer.monthly_payment ? selectedOffer.monthly_payment.toFixed(2).replace('.', ',') : '0,00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Total:</span>
                      <span className="font-medium">R$ ${selectedOffer.total_amount ? selectedOffer.total_amount.toFixed(2).replace('.', ',') : '0,00'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-sm sm:text-base">Informações Adicionais</h4>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span>Data da Oferta:</span>
                      <span className="font-medium">
                        {new Date(selectedOffer.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">Aprovado</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Condições */}
              {selectedOffer.conditions && (
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="font-semibold text-sm sm:text-base">Condições da Oferta</h4>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border">
                    <p className="text-xs sm:text-sm text-gray-700">{selectedOffer.conditions}</p>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                {(() => {
                  const relatedRequest = creditRequests.find(req => req.id === selectedOffer.credit_request_id);
                  if (relatedRequest?.status === 'admin_approved') {
                    return (
                      <>
                        <Button 
                          className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            sendOffersToPatient(selectedOffer.credit_request_id);
                            closeOfferModal();
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Encaminhar para Paciente
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full sm:flex-1"
                          onClick={closeOfferModal}
                        >
                          Fechar
                        </Button>
                      </>
                    );
                  } else {
                    return (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={closeOfferModal}
                      >
                        Fechar
                      </Button>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Solicitação */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              Nova Solicitação de Crédito
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCreditRequest} className="space-y-4 sm:space-y-6">
            {/* Dados da Clínica */}
            <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-800">Dados da Clínica</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="clinic_name" className="text-xs sm:text-sm">Nome da Clínica</Label>
                    <Input
                      id="clinic_name"
                      value={clinicData?.name || 'Carregando...'}
                      readOnly
                      className="bg-gray-50 text-gray-600 text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="clinic_cnpj" className="text-xs sm:text-sm">CNPJ</Label>
                    <Input
                      id="clinic_cnpj"
                      value={clinicData?.cnpj ? formatCNPJ(clinicData.cnpj) : 'Carregando...'}
                      readOnly
                      className="bg-gray-50 text-gray-600 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Cliente (PF) */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-800">Dados do Cliente (PF)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">Nome Completo *</Label>
                  <Input
                    id="patient_name"
                    value={formData.patient_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                    placeholder="Nome completo do cliente"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patient_cpf">CPF *</Label>
                  <Input
                    id="patient_cpf"
                    value={formData.patient_cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_cpf: formatCPF(e.target.value) }))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient_birth_date">Data de Nascimento *</Label>
                  <Input
                    id="patient_birth_date"
                    value={formData.patient_birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_birth_date: formatDate(e.target.value) }))}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="patient_mother_name" className="text-xs sm:text-sm">Nome da Mãe * (recomendado p/ match)</Label>
                  <Input
                    id="patient_mother_name"
                    value={formData.patient_mother_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_mother_name: e.target.value }))}
                    placeholder="Nome completo da mãe"
                    className="text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="patient_phone" className="text-xs sm:text-sm">Celular * (p/ contato/OTP)</Label>
                  <Input
                    id="patient_phone"
                    value={formData.patient_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_phone: formatPhone(e.target.value) }))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="text-xs sm:text-sm"
                    required
                  />
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="patient_email" className="text-xs sm:text-sm">E-mail * (p/ contato/OTP)</Label>
                  <Input
                    id="patient_email"
                    type="email"
                    value={formData.patient_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    className="text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Endereço (opcional) */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Endereço (opcional - melhora aprovação)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="patient_cep" className="text-xs sm:text-sm">CEP</Label>
                    <Input
                      id="patient_cep"
                      value={formData.patient_cep}
                      onChange={(e) => setFormData(prev => ({ ...prev, patient_cep: formatCEP(e.target.value) }))}
                      placeholder="00000-000"
                      maxLength={9}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="patient_city" className="text-xs sm:text-sm">Cidade</Label>
                    <Input
                      id="patient_city"
                      value={formData.patient_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, patient_city: e.target.value }))}
                      placeholder="Nome da cidade"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="patient_uf" className="text-xs sm:text-sm">UF</Label>
                    <Input
                      id="patient_uf"
                      value={formData.patient_uf}
                      onChange={(e) => setFormData(prev => ({ ...prev, patient_uf: e.target.value.toUpperCase() }))}
                      placeholder="UF"
                      maxLength={2}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox LGPD */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="lgpd_consent"
                  checked={formData.lgpd_consent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lgpd_consent: !!checked }))}
                />
                <Label htmlFor="lgpd_consent" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  * Autorizo o uso dos meus dados conforme a LGPD para análise de crédito
                </Label>
              </div>
            </div>

            {/* Removido: Dados da Operação. Valor e prazo serão definidos na página de ofertas. */}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Avançando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Avançar
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ProposalView agora é uma página dedicada */}
    </div>
  );
};

export default ClinicDashboard;
