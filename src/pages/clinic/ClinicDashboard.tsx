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
import { Eye, FileText, Clock, CheckCircle, XCircle, X, Building2, Calendar, User, Phone, Mail, CreditCard, Edit, Send, Trash2, MessageSquare, Upload, Plus, Loader2, DollarSign, Menu, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  const [clinicData, setClinicData] = useState<{ name: string; cnpj: string } | null>(null);

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
        return { label: 'Aprovado', color: 'bg-success/20 text-success', textColor: 'text-success' };
      case 'sent_to_patient':
        return { label: 'Em Negociação', color: 'bg-primary/20 text-primary', textColor: 'text-primary' };
      case 'clinic_reviewing':
      case 'admin_analyzing':
        return { label: 'Em Análise', color: 'bg-warning/20 text-warning', textColor: 'text-warning' };
      case 'rejected':
      case 'admin_rejected':
      case 'patient_rejected':
        return { label: 'Reprovado', color: 'bg-destructive/20 text-destructive', textColor: 'text-destructive' };
      case 'pending':
        return { label: 'Pendente', color: 'bg-muted-foreground/20 text-muted-foreground', textColor: 'text-muted-foreground' };
      default:
        return { label: 'Pendente', color: 'bg-muted-foreground/20 text-muted-foreground', textColor: 'text-muted-foreground' };
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 pb-20">
      {/* Background Gradients/Aurora */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px] -z-10"></div>

      <div className="container mx-auto px-4 sm:px-8 py-10 relative">
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-glow">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase">Portal do Parceiro</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight font-outfit">
              Solicitações de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Crédito</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium mt-3 max-w-2xl">
              Gerencie as solicitações da <span className="text-foreground">{clinicData?.name || 'sua clínica'}</span> com transparência e agilidade.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-primary-hover text-white font-bold h-14 px-8 rounded-2xl transition-all shadow-glow shadow-primary/20 flex items-center gap-3 active:scale-95"
            >
              <Plus className="w-6 h-6" />
              <span className="text-lg">Simular Proposta</span>
            </Button>
          </div>
        </div>

        {/* Tabela de Solicitações */}
        {(() => {
          if (creditRequests.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-24 glass-effect rounded-[3rem] border-dashed border-primary/20 bg-primary/5 shadow-inner">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 shadow-glow shadow-primary/20">
                  <FileText className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Nenhuma solicitação encontrada</h3>
                <p className="text-muted-foreground text-lg text-center max-w-md">Não há solicitações de crédito pendentes para esta unidade no momento.</p>
              </div>
            );
          }

          return (
            <>
              <div className="hidden sm:block glass-effect rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full lg:table-fixed text-white">
                  <thead className="bg-primary/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Nº</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Cliente</th>
                      <th className="hidden xl:table-cell px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">CPF</th>
                      <th className="hidden xl:table-cell px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Clínica</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Valor</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Taxa</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Parc.</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Parcela</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total</th>
                      <th className="hidden xl:table-cell px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">FIDC</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-transparent">
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
                          className="hover:bg-primary/5 cursor-pointer transition-all border-b border-white/5 group"
                          onClick={() => openDetailsModal(request)}
                        >
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                              {proposalNumber}
                            </div>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm font-bold text-white truncate max-w-[180px]">
                              {request.patient_name}
                            </div>
                          </td>

                          <td className="hidden 2xl:table-cell px-6 py-5 whitespace-nowrap">
                            <div className="text-xs text-muted-foreground">
                              {formatCPF(request.patient_cpf)}
                            </div>
                          </td>

                          <td className="hidden 2xl:table-cell px-6 py-5 whitespace-nowrap">
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {clinicName}
                            </div>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm font-black text-white font-outfit">
                              R$ {requestedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap text-xs text-muted-foreground">
                            {interestRate.toFixed(2)}%
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap text-xs text-muted-foreground">
                            {installments}x
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-xs font-bold text-white">
                              R$ {monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-xs font-bold text-white">
                              R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>

                          <td className="hidden 2xl:table-cell px-6 py-5 whitespace-nowrap text-xs text-muted-foreground">
                            {fidcName}
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap">
                            <Badge className={`${statusDisplay.color} border-none rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider`}>
                              {statusDisplay.label}
                            </Badge>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary-hover hover:bg-primary/10 font-bold text-xs rounded-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetailsModal(request);
                              }}
                            >
                              Ver Detalhes
                              <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table >
              </div >
              <div className="block sm:hidden space-y-6">
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
                  const clinicName = clinicData?.name || "Clínica Odontológica";
                  return (
                    <Card key={request.id} className="glass-effect border-none rounded-[2.5rem] overflow-hidden shadow-xl">
                      <CardHeader className="pb-4 p-8 bg-primary/5">
                        <CardTitle className="text-xl flex items-center justify-between">
                          <span className="truncate max-w-[70%] text-white">{request.patient_name}</span>
                          <Badge className={`${statusDisplay.color} border-none rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider`}>
                            {statusDisplay.label}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Proposta</span>
                          <span className="font-bold text-white text-sm">{proposalNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Valor</span>
                          <span className="font-black text-white text-base font-outfit">R$ {requestedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Parcelas</span>
                          <span className="font-bold text-white text-sm">{installments}x</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Total Geral</span>
                          <span className="font-black text-primary text-lg font-outfit">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="pt-6">
                          <Button
                            onClick={() => openDetailsModal(request)}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-14 rounded-2xl transition-all shadow-glow shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                          >
                            Ver Detalhes da Proposta
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          );
        })()}

        {/* Overlay */}
        {
          showSidebar && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeSidebar}
            />
          )
        }

        {/* Sidebar deslizante */}
        <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#0A0514] border-l border-white/5 shadow-2xl transform transition-transform duration-500 ease-in-out z-50 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            {/* Header da sidebar */}
            <div className="px-8 py-8 border-b border-white/5 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-[20px] -z-10 animate-pulse"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white font-outfit">Ofertas Bancárias</h2>
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1">Análise em Tempo Real</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSidebar}
                  className="h-12 w-12 text-white/40 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Conteúdo da sidebar */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {selectedRequest && (
                <div className="space-y-10">
                  {/* Informações do Cliente */}
                  <div className="glass-effect p-8 rounded-[2.5rem] border-none shadow-xl bg-primary/5">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <User className="w-6 h-6 text-primary" />
                      Perfil do Cliente
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Nome</span>
                        <span className="text-white font-bold">{selectedRequest.patient_name}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">CPF</span>
                        <span className="text-white font-bold">{formatCPF(selectedRequest.patient_cpf)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Contato</span>
                        <span className="text-white font-bold">{selectedRequest.patient_phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Valor Solicitado</span>
                        <span className="text-primary font-black text-lg font-outfit">R$ {selectedRequest.requested_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ofertas Bancárias */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3 ml-2">
                      <CreditCard className="w-6 h-6 text-primary" />
                      Ofertas Disponíveis
                    </h3>

                    {creditOffers[selectedRequest.id] && creditOffers[selectedRequest.id].length > 0 ? (
                      <div className="space-y-5">
                        {creditOffers[selectedRequest.id].map((offer) => (
                          <div key={offer.id} className={cn(
                            "glass-effect p-8 rounded-[2.5rem] border-none transition-all group relative overflow-hidden",
                            selectedRequest.status === 'clinic_approved' ? "bg-success/10 shadow-glow shadow-success/10" : "hover:bg-primary/10"
                          )}>
                            {selectedRequest.status === 'clinic_approved' && (
                              <div className="absolute top-4 right-4 animate-bounce">
                                <Badge className="bg-success text-white border-none rounded-full px-4 py-1 font-bold text-[10px]">SELECIONADA</Badge>
                              </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <span className="text-lg font-black text-white font-outfit">{offer.bank_name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                                  <span className="text-[10px] font-bold text-success uppercase tracking-widest">Crédito Disponível</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8 pt-4 border-t border-white/5">
                              <div>
                                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Valor Aprovado</p>
                                <p className="text-lg font-black text-white font-outfit">R$ {offer.approved_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Parcelas</p>
                                <p className="text-lg font-black text-white font-outfit">{offer.installments}x de R$ {offer.monthly_payment?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              </div>
                            </div>

                            <div className="pt-2">
                              {selectedRequest.status === 'admin_approved' ? (
                                <div className="grid grid-cols-1 gap-3">
                                  <Button
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-12 rounded-xl transition-all shadow-glow shadow-primary/20"
                                    onClick={() => selectOffer(offer.id, selectedRequest.id)}
                                  >
                                    Escolher Esta Oferta
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="w-full text-primary hover:bg-primary/10 font-bold h-12 rounded-xl"
                                    onClick={() => sendOffersToPatient(selectedRequest.id)}
                                  >
                                    Encaminhar para Paciente
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Status: <span className="text-white">{getStatusDisplay(selectedRequest.status).label}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 mx-2">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Aguardando Bancos...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Detalhes da Oferta */}
        {
          showOfferModal && selectedOffer && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
              <div className="bg-[#0A0514] border border-white/5 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-success/5 to-transparent -z-10"></div>

                <div className="flex items-center justify-between p-10 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white font-outfit">
                        {selectedOffer.bank_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        <span className="text-[10px] font-bold text-success uppercase tracking-widest">OFERTA ATIVA</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeOfferModal}
                    className="h-12 w-12 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="p-10 space-y-8">
                  {/* Resumo Financeiro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-effect p-8 rounded-[2rem] border-none bg-success/5">
                      <p className="text-success text-[10px] font-bold uppercase tracking-widest mb-2">Crédito Aprovado</p>
                      <p className="text-3xl font-black text-white font-outfit">
                        R$ {selectedOffer.approved_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="glass-effect p-8 rounded-[2rem] border-none bg-white/5">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">Taxa Aplicada</p>
                      <p className="text-3xl font-black text-white font-outfit">{selectedOffer.interest_rate || 0}% <span className="text-sm font-bold text-muted-foreground uppercase ml-1">a.m.</span></p>
                    </div>
                  </div>

                  {/* Detalhes do Financiamento */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Plano de Pagamento</span>
                      <span className="text-white font-black text-lg font-outfit">{selectedOffer.installments}x de R$ {selectedOffer.monthly_payment?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Montante Total</span>
                      <span className="text-white font-bold">R$ {selectedOffer.total_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Condições */}
                  {selectedOffer.conditions && (
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest mb-3">Observações Adicionais</p>
                      <p className="text-sm text-white/80 leading-relaxed">{selectedOffer.conditions}</p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-4 pt-4">
                    {(() => {
                      const relatedRequest = creditRequests.find(req => req.id === selectedOffer.credit_request_id);
                      if (relatedRequest?.status === 'admin_approved') {
                        return (
                          <>
                            <Button
                              className="flex-[2] h-14 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-glow shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                              onClick={() => {
                                sendOffersToPatient(selectedOffer.credit_request_id);
                                closeOfferModal();
                              }}
                            >
                              <Send className="w-5 h-5" />
                              Encaminhar para Paciente
                            </Button>
                            <Button
                              variant="ghost"
                              className="flex-1 h-14 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/5"
                              onClick={closeOfferModal}
                            >
                              Fechar
                            </Button>
                          </>
                        );
                      } else {
                        return (
                          <Button
                            variant="ghost"
                            className="w-full h-14 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/5"
                            onClick={closeOfferModal}
                          >
                            Fechar Detalhes
                          </Button>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Modal de Nova Solicitação */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-[#0A0514] border-white/5 rounded-[3rem] shadow-2xl max-w-4xl p-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>

            <DialogHeader className="p-10 pb-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-white font-outfit uppercase tracking-tight">Simular Novo Crédito</DialogTitle>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Análise Instatânea Partners</p>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmitCreditRequest} className="p-10 space-y-10 custom-scrollbar max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {/* Nome */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nome do Paciente</label>
                  <Input
                    placeholder="Ex: João Silva"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="bg-white/5 border-white/10 rounded-2xl h-14 px-6 text-white focus:border-primary/50 transition-all"
                  />
                </div>

                {/* CPF */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">CPF</label>
                  <Input
                    placeholder="000.000.000-00"
                    value={formData.patient_cpf}
                    onChange={(e) => setFormData({ ...formData, patient_cpf: formatCPF(e.target.value) })}
                    className="bg-white/5 border-white/10 rounded-2xl h-14 px-6 text-white"
                  />
                </div>

                {/* Valor */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Valor do Procedimento</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                    <Input
                      type="number"
                      placeholder="5.000,00"
                      value={formData.requested_amount}
                      onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-2xl h-14 pl-14 pr-6 text-white"
                    />
                  </div>
                </div>

                {/* Parcelas */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Parcelamento Desejado</label>
                  <Select
                    value={formData.installments}
                    onValueChange={(v) => setFormData({ ...formData, installments: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-14 px-6 text-white">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10 text-white rounded-2xl">
                      {[6, 12, 18, 24, 36].map(n => (
                        <SelectItem key={n} value={n.toString()} className="focus:bg-primary/20">{n}x Fixas</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descrição do Tratamento</label>
                <Textarea
                  placeholder="Descreva brevemente o procedimento..."
                  value={formData.treatment_description}
                  onChange={(e) => setFormData({ ...formData, treatment_description: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-3xl p-6 text-white min-h-[120px]"
                />
              </div>

              {/* LGPD */}
              <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-start gap-4">
                <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 text-primary" required />
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                  Confirmo que possuo autorização do paciente para processar estes dados em conformidade com a LGPD e as políticas de crédito da Doutorizze Partners.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold h-14 rounded-2xl shadow-glow shadow-primary/20 transition-all active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : 'Confirmar e Simular'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="px-8 h-14 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/5"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div >
    </div >
  );
};

export default ClinicDashboard;
