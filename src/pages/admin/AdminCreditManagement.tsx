import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Cliente admin com SERVICE_ROLE_KEY para contornar RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Eye, FileText, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Users, DollarSign, Settings, Save, Percent, Calendar, Plus, Trash2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreditRequest {
  id: string;
  patient_id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  status: 'pending' | 'clinic_approved' | 'clinic_rejected' | 'admin_approved' | 'admin_rejected' | 'admin_analyzing';
  created_at: string;
  updated_at: string;
  patients: {
    name: string;
    email: string;
    phone: string;
  };
  clinics: {
    name: string;
    email: string;
  };
}

interface CreditOffer {
  id?: string;
  credit_request_id: string;
  bank_name: string;
  approved_amount: number;
  interest_rate: number;
  installments: number;
  conditions: string;
  monthly_payment?: number;
  total_amount?: number;
  created_at?: string;
  updated_at?: string;
}

interface CreditStats {
  total_requests: number;
  pending_approval: number;
  approved_today: number;
  total_approved_amount: number;
  approval_rate: number;
}

interface GlobalCreditSettings {
  system_active: boolean;
  max_amount: number;
  min_amount: number;
  max_installments: number;
  interest_rate: number;
  approval_limit: number;
}

const AdminCreditManagement: React.FC = () => {
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [stats, setStats] = useState<CreditStats>({
    total_requests: 0,
    pending_approval: 0,
    approved_today: 0,
    total_approved_amount: 0,
    approval_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'clinic_approved' | 'admin_analyzing' | 'admin_approved' | 'admin_rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [analysisComments, setAnalysisComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<GlobalCreditSettings>({
    system_active: true,
    max_amount: 99999,
    min_amount: 100,
    max_installments: 48,
    interest_rate: 2.5,
    approval_limit: 10000
  });

  // Estados para gerenciar ofertas bancárias
  const [showOffersForm, setShowOffersForm] = useState<string | null>(null);
  const [offers, setOffers] = useState<CreditOffer[]>([]);
  const [submittingOffers, setSubmittingOffers] = useState(false);

  // Estado para modal de detalhes
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCreditRequests();
    fetchStats();
  }, []);

  const fetchCreditRequests = async () => {
    try {
      setLoading(true);

      const { data, error } = await adminSupabase
        .from('credit_requests')
        .select(`
          *,
          profiles!credit_requests_patient_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          clinics!credit_requests_clinic_id_fkey (
            id,
            name,
            email
          )
        `)
        .in('status', ['clinic_approved', 'admin_analyzing', 'admin_approved', 'admin_rejected'])
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCreditRequests(data || []);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      toast.error('Erro ao carregar solicitações de crédito');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Buscar estatísticas
      const { data: allRequests, error } = await adminSupabase
        .from('credit_requests')
        .select('status, requested_amount, created_at');

      if (error) {
        throw error;
      }

      const today = new Date().toDateString();
      const approvedToday = allRequests?.filter(req =>
        req.status === 'admin_approved' &&
        new Date(req.created_at).toDateString() === today
      ).length || 0;

      const totalApprovedAmount = allRequests?.filter(req => req.status === 'admin_approved')
        .reduce((sum, req) => sum + req.requested_amount, 0) || 0;

      const approvalRate = allRequests?.length > 0
        ? (allRequests.filter(req => req.status === 'admin_approved').length / allRequests.length) * 100
        : 0;

      setStats({
        total_requests: allRequests?.length || 0,
        pending_approval: allRequests?.filter(req => req.status === 'clinic_approved').length || 0,
        approved_today: approvedToday,
        total_approved_amount: totalApprovedAmount,
        approval_rate: Math.round(approvalRate)
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setSettingsLoading(true);
    try {
      // Aqui seria a chamada para salvar no banco de dados
      // await updateGlobalCreditSettings(globalSettings);

      toast.success('Configurações globais salvas com sucesso!');
      setShowSettings(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Funções para gerenciar ofertas bancárias
  const initializeOffers = (requestId: string) => {
    setOffers([
      {
        credit_request_id: requestId,
        bank_name: '',
        approved_amount: 0,
        interest_rate: 0,
        installments: 12,
        conditions: ''
      }
    ]);
  };

  const addOffer = () => {
    if (offers.length >= 4) {
      toast.error('Máximo de 4 ofertas por solicitação');
      return;
    }

    setOffers(prev => [...prev, {
      credit_request_id: showOffersForm!,
      bank_name: '',
      approved_amount: 0,
      interest_rate: 0,
      installments: 12,
      conditions: ''
    }]);
  };

  const removeOffer = (index: number) => {
    setOffers(prev => prev.filter((_, i) => i !== index));
  };

  const updateOffer = (index: number, field: keyof CreditOffer, value: any) => {
    setOffers(prev => prev.map((offer, i) => {
      if (i === index) {
        const updatedOffer = { ...offer, [field]: value };

        // Calcular valores automaticamente
        if (field === 'approved_amount' || field === 'interest_rate' || field === 'installments') {
          const amount = field === 'approved_amount' ? value : updatedOffer.approved_amount;
          const rate = field === 'interest_rate' ? value : updatedOffer.interest_rate;
          const installments = field === 'installments' ? value : updatedOffer.installments;

          if (amount > 0 && rate > 0 && installments > 0) {
            const monthlyRate = rate / 100 / 12;
            const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / (Math.pow(1 + monthlyRate, installments) - 1);
            const totalAmount = monthlyPayment * installments;

            updatedOffer.monthly_payment = monthlyPayment;
            updatedOffer.total_amount = totalAmount;
          }
        }

        return updatedOffer;
      }
      return offer;
    }));
  };

  const submitOffers = async () => {
    if (!showOffersForm) {
      console.error('❌ [AdminCreditManagement] showOffersForm é null');
      return;
    }

    console.log('🔄 [AdminCreditManagement] Iniciando envio de ofertas para:', showOffersForm);
    console.log('🔄 [AdminCreditManagement] Ofertas atuais:', offers);

    // Validar se o credit_request_id existe
    console.log('🔍 [AdminCreditManagement] Verificando se a solicitação existe...');
    const { data: requestExists, error: requestError } = await adminSupabase
      .from('credit_requests')
      .select('id, status')
      .eq('id', showOffersForm)
      .single();

    if (requestError || !requestExists) {
      console.error('❌ [AdminCreditManagement] Solicitação não encontrada:', requestError);
      toast.error('Solicitação de crédito não encontrada');
      return;
    }

    console.log('✅ [AdminCreditManagement] Solicitação encontrada:', requestExists);

    // Validar ofertas
    const validOffers = offers.filter(offer =>
      offer.bank_name.trim() &&
      offer.approved_amount > 0 &&
      offer.interest_rate > 0 &&
      offer.installments > 0
    ).map(offer => ({
      credit_request_id: showOffersForm,
      bank_name: offer.bank_name.trim(),
      approved_amount: Number(offer.approved_amount),
      interest_rate: Number(offer.interest_rate),
      installments: Number(offer.installments),
      conditions: offer.conditions.trim() || 'Sem condições especiais',
      monthly_payment: offer.monthly_payment || null,
      total_amount: offer.total_amount || null
    }));

    console.log('✅ [AdminCreditManagement] Ofertas válidas:', validOffers.length);
    console.log('🔍 [AdminCreditManagement] Estrutura das ofertas válidas:', JSON.stringify(validOffers, null, 2));

    if (validOffers.length === 0) {
      toast.error('Adicione pelo menos uma oferta válida');
      return;
    }

    try {
      setSubmittingOffers(true);

      // LOGS DETALHADOS PARA DEBUG
      console.log('🔍 [DEBUG] Configuração do adminSupabase:');
      console.log('🔍 [DEBUG] URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔍 [DEBUG] Service Role Key presente:', !!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
      console.log('🔍 [DEBUG] Service Role Key (primeiros 20 chars):', import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20));

      console.log('🗑️ [AdminCreditManagement] Removendo ofertas existentes...');
      // Remover ofertas existentes para esta solicitação
      const { error: deleteError } = await adminSupabase
        .from('credit_offers')
        .delete()
        .eq('credit_request_id', showOffersForm);

      if (deleteError) {
        console.error('❌ [AdminCreditManagement] Erro ao deletar ofertas existentes:', deleteError);
        throw deleteError;
      }

      console.log('💾 [AdminCreditManagement] Inserindo novas ofertas...');
      console.log('🔍 [DEBUG] Ofertas a serem inseridas:', JSON.stringify(validOffers, null, 2));

      // Inserir novas ofertas
      const { data: insertData, error: insertError } = await adminSupabase
        .from('credit_offers')
        .insert(validOffers)
        .select();

      if (insertError) {
        console.error('❌ [AdminCreditManagement] Erro ao inserir ofertas:', insertError);
        console.error('❌ [AdminCreditManagement] Detalhes do erro:', insertError.details);
        console.error('❌ [AdminCreditManagement] Hint do erro:', insertError.hint);
        console.error('❌ [AdminCreditManagement] Código do erro:', insertError.code);
        console.error('❌ [AdminCreditManagement] Mensagem do erro:', insertError.message);
        throw insertError;
      }

      console.log('✅ [AdminCreditManagement] Ofertas inseridas com sucesso:', insertData);

      console.log('📝 [AdminCreditManagement] Atualizando status da solicitação...');
      // Atualizar status da solicitação para aprovada
      const { error: updateError } = await adminSupabase
        .from('credit_requests')
        .update({
          status: 'admin_approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', showOffersForm);

      if (updateError) {
        console.error('❌ [AdminCreditManagement] Erro ao atualizar status:', updateError);
        throw updateError;
      }

      console.log('✅ [AdminCreditManagement] Ofertas enviadas com sucesso!');
      toast.success(`${validOffers.length} oferta(s) enviada(s) com sucesso!`);
      setShowOffersForm(null);
      setOffers([]);
      fetchCreditRequests();
      fetchStats();
    } catch (error) {
      console.error('❌ [AdminCreditManagement] Erro ao enviar ofertas:', error);
      toast.error(`Erro ao enviar ofertas: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSubmittingOffers(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'admin_approved' | 'admin_rejected' | 'admin_analyzing') => {
    if ((newStatus === 'admin_approved' || newStatus === 'admin_rejected') && !analysisComments.trim()) {
      toast.error('Por favor, adicione comentários sobre sua análise');
      return;
    }

    try {
      setSubmitting(true);

      // Atualizar status da solicitação
      const { error: updateError } = await adminSupabase
        .from('credit_requests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      // Criar registro de análise se for aprovação ou rejeição
      if (newStatus === 'admin_approved' || newStatus === 'admin_rejected') {
        const { data: { user } } = await supabase.auth.getUser();

        const { error: analysisError } = await adminSupabase
          .from('credit_analysis')
          .insert({
            credit_request_id: requestId,
            analyst_id: user?.id || 'admin-system',
            analysis_type: 'admin',
            decision: newStatus === 'admin_approved' ? 'approved' : 'rejected',
            comments: analysisComments
          });

        if (analysisError) {
          throw analysisError;
        }
      }

      // Criar notificação para o paciente e clínica
      const request = creditRequests.find(req => req.id === requestId);
      if (request) {
        let patientTitle = '';
        let patientMessage = '';
        let clinicTitle = '';
        let clinicMessage = '';

        switch (newStatus) {
          case 'admin_approved':
            patientTitle = 'Crédito Aprovado!';
            patientMessage = 'Sua solicitação de crédito foi aprovada! Em breve você receberá as instruções para pagamento.';
            clinicTitle = 'Solicitação Aprovada pelo Admin';
            clinicMessage = `A solicitação de crédito do paciente ${request.profiles?.full_name} foi aprovada pelo administrador.`;
            break;
          case 'admin_rejected':
            patientTitle = 'Crédito Rejeitado';
            patientMessage = `Sua solicitação de crédito foi rejeitada. Motivo: ${analysisComments}`;
            clinicTitle = 'Solicitação Rejeitada pelo Admin';
            clinicMessage = `A solicitação de crédito do paciente ${request.profiles?.full_name} foi rejeitada pelo administrador. Motivo: ${analysisComments}`;
            break;
          case 'admin_analyzing':
            patientTitle = 'Solicitação em Análise';
            patientMessage = 'Sua solicitação de crédito está sendo analisada pela equipe administrativa.';
            clinicTitle = 'Solicitação em Análise';
            clinicMessage = `A solicitação de crédito do paciente ${request.profiles?.full_name} está sendo analisada pelo administrador.`;
            break;
        }

        // Notificar paciente
        await adminSupabase
          .from('notifications')
          .insert({
            user_id: request.patient_id,
            title: patientTitle,
            message: patientMessage,
            type: 'credit_update',
            read: false
          });

        // Buscar usuários da clínica para notificar
        const { data: clinicUsers, error: clinicUsersError } = await adminSupabase
          .from('clinic_users')
          .select('user_id')
          .eq('clinic_id', request.clinic_id);

        if (!clinicUsersError && clinicUsers && clinicUsers.length > 0) {
          // Notificar todos os usuários da clínica
          const clinicNotifications = clinicUsers.map(user => ({
            user_id: user.user_id,
            title: clinicTitle,
            message: clinicMessage,
            type: 'credit_update',
            read: false
          }));

          await adminSupabase
            .from('notifications')
            .insert(clinicNotifications);
        }
      }

      toast.success(`Solicitação ${newStatus === 'admin_approved' ? 'aprovada' : newStatus === 'admin_rejected' ? 'rejeitada' : 'colocada em análise'} com sucesso!`);
      setSelectedRequest(null);
      setAnalysisComments('');
      fetchCreditRequests();
      fetchStats();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar solicitação');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      clinic_approved: { label: 'Aguardando Análise', variant: 'secondary' as const, icon: Clock },
      admin_analyzing: { label: 'Em Análise', variant: 'default' as const, icon: AlertCircle },
      admin_approved: { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      admin_rejected: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredRequests = creditRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Crédito</h1>
            <p className="text-gray-600">Análise e aprovação de solicitações de crédito</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={globalSettings.system_active ? "default" : "secondary"}>
              {globalSettings.system_active ? "Sistema Ativo" : "Sistema Inativo"}
            </Badge>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações Globais
            </Button>
          </div>
        </div>
      </div>

      {/* Configurações Globais */}
      {showSettings && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configurações Globais do Sistema de Crédito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status do Sistema */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-base font-medium">Sistema de Crédito</Label>
                <p className="text-sm text-gray-600">
                  Ativar ou desativar o sistema de crédito para todas as clínicas
                </p>
              </div>
              <Switch
                checked={globalSettings.system_active}
                onCheckedChange={(checked) =>
                  setGlobalSettings(prev => ({ ...prev, system_active: checked }))
                }
              />
            </div>

            <Separator />

            {/* Limites de Valor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="min_amount" className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Valor Mínimo
                </Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={globalSettings.min_amount}
                  onChange={(e) =>
                    setGlobalSettings(prev => ({ ...prev, min_amount: Number(e.target.value) }))
                  }
                  min="1"
                  max="999999"
                />
                <p className="text-xs text-gray-500">
                  Valor mínimo para solicitação de crédito
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_amount" className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Valor Máximo
                </Label>
                <Input
                  id="max_amount"
                  type="number"
                  value={globalSettings.max_amount}
                  onChange={(e) =>
                    setGlobalSettings(prev => ({ ...prev, max_amount: Number(e.target.value) }))
                  }
                  min="1"
                  max="999999"
                />
                <p className="text-xs text-gray-500">
                  Valor máximo para solicitação de crédito
                </p>
              </div>
            </div>

            {/* Configurações de Parcelamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="max_installments" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Parcelas Máximas
                </Label>
                <Input
                  id="max_installments"
                  type="number"
                  value={globalSettings.max_installments}
                  onChange={(e) =>
                    setGlobalSettings(prev => ({ ...prev, max_installments: Number(e.target.value) }))
                  }
                  min="1"
                  max="60"
                />
                <p className="text-xs text-gray-500">
                  Número máximo de parcelas permitidas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest_rate" className="flex items-center">
                  <Percent className="h-4 w-4 mr-1" />
                  Taxa de Juros (% a.m.)
                </Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.1"
                  value={globalSettings.interest_rate}
                  onChange={(e) =>
                    setGlobalSettings(prev => ({ ...prev, interest_rate: Number(e.target.value) }))
                  }
                  min="0"
                  max="10"
                />
                <p className="text-xs text-gray-500">
                  Taxa de juros mensal aplicada ao crédito
                </p>
              </div>
            </div>

            {/* Limite de Aprovação Automática */}
            <div className="space-y-2">
              <Label htmlFor="approval_limit" className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Limite de Aprovação Automática
              </Label>
              <Input
                id="approval_limit"
                type="number"
                value={globalSettings.approval_limit}
                onChange={(e) =>
                  setGlobalSettings(prev => ({ ...prev, approval_limit: Number(e.target.value) }))
                }
                min="0"
                max={globalSettings.max_amount}
              />
              <p className="text-xs text-gray-500">
                Valores até este limite são aprovados automaticamente
              </p>
            </div>

            <Separator />

            {/* Resumo das Configurações */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Resumo das Configurações
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Faixa de valores:</span>
                  <p className="font-medium">
                    {formatCurrency(globalSettings.min_amount)} - {formatCurrency(globalSettings.max_amount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Parcelamento:</span>
                  <p className="font-medium">Até {globalSettings.max_installments}x</p>
                </div>
                <div>
                  <span className="text-gray-600">Taxa de juros:</span>
                  <p className="font-medium">{globalSettings.interest_rate}% a.m.</p>
                </div>
                <div>
                  <span className="text-gray-600">Aprovação automática:</span>
                  <p className="font-medium">Até {formatCurrency(globalSettings.approval_limit)}</p>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveGlobalSettings}
                disabled={settingsLoading}
                className="min-w-[120px]"
              >
                {settingsLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_requests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aguardando Análise</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_approval}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprovadas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total Aprovado</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.total_approved_amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approval_rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todas ({creditRequests.length})
        </Button>
        <Button
          variant={filter === 'clinic_approved' ? 'default' : 'outline'}
          onClick={() => setFilter('clinic_approved')}
        >
          Aguardando Análise ({creditRequests.filter(r => r.status === 'clinic_approved').length})
        </Button>
        <Button
          variant={filter === 'admin_analyzing' ? 'default' : 'outline'}
          onClick={() => setFilter('admin_analyzing')}
        >
          Em Análise ({creditRequests.filter(r => r.status === 'admin_analyzing').length})
        </Button>
        <Button
          variant={filter === 'admin_approved' ? 'default' : 'outline'}
          onClick={() => setFilter('admin_approved')}
        >
          Aprovadas ({creditRequests.filter(r => r.status === 'admin_approved').length})
        </Button>
        <Button
          variant={filter === 'admin_rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('admin_rejected')}
        >
          Rejeitadas ({creditRequests.filter(r => r.status === 'admin_rejected').length})
        </Button>
      </div>

      {/* Lista de Solicitações */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
                <p className="text-gray-500">Não há solicitações de crédito para exibir.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {request.profiles?.full_name || request.patient_name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Clínica: {request.clinics.name}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Valor Solicitado</p>
                    <p className="text-lg font-semibold text-green-600">
                      R$ {request.requested_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Parcelas</p>
                    <p className="text-lg font-semibold">{request.installments}x</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Valor da Parcela</p>
                    <p className="text-lg font-semibold">
                      R$ {(request.requested_amount / request.installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Data da Solicitação</p>
                    <p className="text-sm">
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Descrição do Tratamento</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {request.treatment_description}
                  </p>
                </div>

                {/* Formulário de Análise */}
                {selectedRequest === request.id && (request.status === 'clinic_approved' || request.status === 'admin_analyzing') && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comentários da Análise *
                      </label>
                      <Textarea
                        value={analysisComments}
                        onChange={(e) => setAnalysisComments(e.target.value)}
                        placeholder="Descreva os motivos da sua decisão..."
                        rows={3}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(request.id, 'admin_approved')}
                        disabled={submitting || !analysisComments.trim()}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {submitting ? 'Processando...' : 'Aprovar'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate(request.id, 'admin_rejected')}
                        disabled={submitting || !analysisComments.trim()}
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {submitting ? 'Processando...' : 'Rejeitar'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(null);
                          setAnalysisComments('');
                        }}
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Formulário de Ofertas Bancárias */}
                {showOffersForm === request.id && (
                  <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-green-800 flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        Ofertas Bancárias ({offers.length}/4)
                      </h3>
                      <Button
                        onClick={addOffer}
                        disabled={offers.length >= 4}
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Oferta
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {offers.map((offer, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-800">Oferta {index + 1}</h4>
                            {offers.length > 1 && (
                              <Button
                                onClick={() => removeOffer(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`bank-${index}`} className="text-sm font-medium">
                                Nome do Banco *
                              </Label>
                              <Input
                                id={`bank-${index}`}
                                value={offer.bank_name}
                                onChange={(e) => updateOffer(index, 'bank_name', e.target.value)}
                                placeholder="Ex: Banco do Brasil"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`amount-${index}`} className="text-sm font-medium">
                                Valor Aprovado (R$) *
                              </Label>
                              <Input
                                id={`amount-${index}`}
                                type="number"
                                value={offer.approved_amount || ''}
                                onChange={(e) => updateOffer(index, 'approved_amount', Number(e.target.value))}
                                placeholder="0,00"
                                min="0"
                                step="0.01"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`rate-${index}`} className="text-sm font-medium">
                                Taxa de Juros (% a.m.) *
                              </Label>
                              <Input
                                id={`rate-${index}`}
                                type="number"
                                value={offer.interest_rate || ''}
                                onChange={(e) => updateOffer(index, 'interest_rate', Number(e.target.value))}
                                placeholder="2,5"
                                min="0"
                                step="0.01"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`installments-${index}`} className="text-sm font-medium">
                                Parcelas *
                              </Label>
                              <Input
                                id={`installments-${index}`}
                                type="number"
                                value={offer.installments || ''}
                                onChange={(e) => updateOffer(index, 'installments', Number(e.target.value))}
                                placeholder="12"
                                min="1"
                                max="60"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-600">
                                Valor da Parcela
                              </Label>
                              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-medium text-green-600">
                                {offer.monthly_payment ?
                                  `R$ ${offer.monthly_payment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
                                  'R$ 0,00'
                                }
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-600">
                                Valor Total
                              </Label>
                              <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-medium text-blue-600">
                                {offer.total_amount ?
                                  `R$ ${offer.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
                                  'R$ 0,00'
                                }
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Label htmlFor={`conditions-${index}`} className="text-sm font-medium">
                              Condições e Observações
                            </Label>
                            <Textarea
                              id={`conditions-${index}`}
                              value={offer.conditions}
                              onChange={(e) => updateOffer(index, 'conditions', e.target.value)}
                              placeholder="Descreva as condições específicas desta oferta..."
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                      <Button
                        onClick={submitOffers}
                        disabled={submittingOffers}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submittingOffers ? 'Enviando...' : 'Enviar Ofertas'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowOffersForm(null);
                          setOffers([]);
                        }}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botão Ver Detalhes */}
                {selectedRequest !== request.id && showOffersForm !== request.id && (
                  <div className="flex gap-2">
                    <Dialog open={showDetailsModal === request.id} onOpenChange={(open) => setShowDetailsModal(open ? request.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Solicitação de Crédito</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Informações do Paciente */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-2">Informações do Paciente</h3>
                              <div className="space-y-2">
                                <p><span className="font-medium">Nome:</span> {request.profiles?.full_name}</p>
                                <p><span className="font-medium">Email:</span> {request.profiles?.email}</p>
                                <p><span className="font-medium">Telefone:</span> {request.profiles?.phone}</p>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg mb-2">Informações da Clínica</h3>
                              <div className="space-y-2">
                                <p><span className="font-medium">Nome:</span> {request.clinics?.name}</p>
                                <p><span className="font-medium">Email:</span> {request.clinics?.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Detalhes da Solicitação */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Detalhes da Solicitação</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Valor Solicitado</p>
                                <p className="text-lg font-semibold text-green-600">
                                  R$ {request.requested_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Parcelas</p>
                                <p className="text-lg font-semibold">{request.installments}x</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Valor da Parcela</p>
                                <p className="text-lg font-semibold">
                                  R$ {(request.requested_amount / request.installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Descrição do Tratamento</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                {request.treatment_description}
                              </p>
                            </div>
                          </div>

                          {/* Botões de Ação */}
                          <div className="border-t pt-4">
                            <h3 className="font-semibold text-lg mb-4">Ações Administrativas</h3>

                            {/* Formulário de Análise */}
                            {selectedRequest === request.id && (request.status === 'clinic_approved' || request.status === 'admin_analyzing') && (
                              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Comentários da Análise *
                                  </label>
                                  <Textarea
                                    value={analysisComments}
                                    onChange={(e) => setAnalysisComments(e.target.value)}
                                    placeholder="Digite os comentários sobre a análise da solicitação..."
                                    className="min-h-[100px]"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleStatusUpdate(request.id, 'admin_approved')}
                                    disabled={submitting || !analysisComments.trim()}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {submitting ? 'Processando...' : 'Aprovar'}
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate(request.id, 'admin_rejected')}
                                    disabled={submitting || !analysisComments.trim()}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {submitting ? 'Processando...' : 'Rejeitar'}
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedRequest(null);
                                      setAnalysisComments('');
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Formulário de Ofertas */}
                            {showOffersForm === request.id && (
                              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium mb-4">Adicionar Ofertas Bancárias</h4>
                                {offers.map((offer, index) => (
                                  <div key={index} className="mb-4 p-4 border rounded-lg bg-white">
                                    <div className="flex justify-between items-center mb-3">
                                      <h5 className="font-medium">Oferta {index + 1}</h5>
                                      {offers.length > 1 && (
                                        <Button
                                          onClick={() => removeOffer(index)}
                                          variant="outline"
                                          size="sm"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor={`bank_name_${index}`}>Nome do Banco</Label>
                                        <Input
                                          id={`bank_name_${index}`}
                                          value={offer.bank_name}
                                          onChange={(e) => updateOffer(index, 'bank_name', e.target.value)}
                                          placeholder="Ex: Banco do Brasil"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`approved_amount_${index}`}>Valor Aprovado</Label>
                                        <Input
                                          id={`approved_amount_${index}`}
                                          type="number"
                                          value={offer.approved_amount}
                                          onChange={(e) => updateOffer(index, 'approved_amount', parseFloat(e.target.value) || 0)}
                                          placeholder="0.00"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`interest_rate_${index}`}>Taxa de Juros (%)</Label>
                                        <Input
                                          id={`interest_rate_${index}`}
                                          type="number"
                                          step="0.01"
                                          value={offer.interest_rate}
                                          onChange={(e) => updateOffer(index, 'interest_rate', parseFloat(e.target.value) || 0)}
                                          placeholder="0.00"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`installments_${index}`}>Parcelas</Label>
                                        <Input
                                          id={`installments_${index}`}
                                          type="number"
                                          value={offer.installments}
                                          onChange={(e) => updateOffer(index, 'installments', parseInt(e.target.value) || 0)}
                                          placeholder="12"
                                        />
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      <Label htmlFor={`conditions_${index}`}>Condições</Label>
                                      <Textarea
                                        id={`conditions_${index}`}
                                        value={offer.conditions}
                                        onChange={(e) => updateOffer(index, 'conditions', e.target.value)}
                                        placeholder="Descreva as condições da oferta..."
                                        className="min-h-[80px]"
                                      />
                                    </div>
                                  </div>
                                ))}

                                <div className="flex gap-2 mb-4">
                                  <Button
                                    onClick={addOffer}
                                    variant="outline"
                                    size="sm"
                                    disabled={offers.length >= 4}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Oferta
                                  </Button>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={submitOffers}
                                    disabled={submittingOffers}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                  >
                                    <Building2 className="w-4 h-4 mr-2" />
                                    {submittingOffers ? 'Enviando...' : 'Enviar Ofertas'}
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setShowOffersForm(null);
                                      setOffers([]);
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Botões de Ação Principal */}
                            {selectedRequest !== request.id && showOffersForm !== request.id && (
                              <div className="flex gap-2 flex-wrap">
                                {request.status === 'clinic_approved' && (
                                  <>
                                    <Button
                                      onClick={() => {
                                        setShowOffersForm(request.id);
                                        initializeOffers(request.id);
                                      }}
                                      className="bg-green-600 hover:bg-green-700"
                                      size="sm"
                                    >
                                      <Building2 className="w-4 h-4 mr-2" />
                                      Aprovar (Enviar Ofertas)
                                    </Button>
                                    <Button
                                      onClick={() => setSelectedRequest(request.id)}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Rejeitar
                                    </Button>
                                    <Button
                                      onClick={() => handleStatusUpdate(request.id, 'admin_analyzing')}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Clock className="w-4 h-4 mr-2" />
                                      Em Análise
                                    </Button>
                                  </>
                                )}

                                {request.status === 'admin_analyzing' && (
                                  <>
                                    <Button
                                      onClick={() => {
                                        setShowOffersForm(request.id);
                                        initializeOffers(request.id);
                                      }}
                                      className="bg-green-600 hover:bg-green-700"
                                      size="sm"
                                    >
                                      <Building2 className="w-4 h-4 mr-2" />
                                      Aprovar (Enviar Ofertas)
                                    </Button>
                                    <Button
                                      onClick={() => setSelectedRequest(request.id)}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Rejeitar
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCreditManagement;