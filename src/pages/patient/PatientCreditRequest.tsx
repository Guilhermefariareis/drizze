import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ValueSlider } from '@/components/ui/value-slider';
import { toast } from 'sonner';
import {
  Loader2,
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Clinic {
  id: string;
  name: string;
  cnpj?: string;
  address?: any;
  city?: string;
}

const PatientCreditRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    clinic_id: '',
    requested_amount: '1000',
    installments: '12',
    treatment_description: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login-paciente');
      return;
    }
    fetchClinics();
  }, [user, navigate]);

  const fetchClinics = async () => {
    try {
      setLoadingClinics(true);
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, cnpj, address, city')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error);
      toast.error('Erro ao carregar clínicas disponíveis');
    } finally {
      setLoadingClinics(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.clinic_id) {
      toast.error('Selecione uma clínica para continuar');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const checkProfileCompleteness = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          const address = (profile.address as any) || {};
          const isComplete =
            profile.full_name &&
            profile.cpf &&
            address.city &&
            address.state;

          if (!isComplete) {
            toast.error('Complete seu cadastro para solicitar crédito', {
              description: 'Você será redirecionado para a página de perfil.',
              duration: 5000,
            });
            setTimeout(() => navigate('/patient/profile'), 2000);
          }
        } else {
          toast.warning('Perfil não encontrado. Por favor, preencha seus dados.');
          setTimeout(() => navigate('/patient/profile'), 2000);
        }
      } catch (err) {
        console.error('Erro ao verificar perfil:', err);
      }
    };

    checkProfileCompleteness();
  }, [user, navigate]);

  const validateForm = () => {
    if (!formData.clinic_id) {
      toast.error('Selecione uma clínica');
      return false;
    }
    if (!formData.requested_amount || parseFloat(formData.requested_amount) <= 0) {
      toast.error('Informe um valor válido para o crédito');
      return false;
    }
    if (!formData.treatment_description.trim()) {
      toast.error('Descreva o tratamento desejado');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log('🔍 [DEBUG] Iniciando PatientCreditRequest para usuário:', user?.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (profileError) {
        console.error('🚨 [ERROR] Erro ao buscar perfil no Supabase:', profileError);
        throw new Error(`Erro técnico ao buscar dados do perfil: ${profileError.message}`);
      }

      if (!profile) {
        console.warn('⚠️ [WARN] Perfil não encontrado na tabela profiles. Usando dados do Auth como fallback.');
      }

      const address = (profile?.address as any) || {};

      const creditRequestData = {
        patient_id: user!.id, // Usar user.id diretamente para garantir o vínculo correto no Auth
        clinic_id: formData.clinic_id,
        requested_amount: parseFloat(formData.requested_amount),
        installments: parseInt(formData.installments),
        treatment_description: formData.treatment_description,
        status: 'pending',
        patient_name: profile?.full_name || user!.user_metadata?.full_name || user!.email || 'Nome não informado',
        patient_email: profile?.email || user!.email || '',
        patient_phone: (profile as any)?.phone || '',
        patient_cpf: profile?.cpf || '',
        patient_address_city: address.city || undefined,
        patient_address_state: address.state || undefined,
        patient_address_cep: (address.zip_code as string | undefined)?.replace(/\D/g, '') || undefined,
        created_at: new Date().toISOString()
      };

      console.log('📝 [DEBUG] Dados da solicitação de crédito preparados:', creditRequestData);

      const { error: requestError } = await (supabase
        .from('credit_requests' as any) as any)
        .insert(creditRequestData);

      if (requestError) throw requestError;

      toast.success('Solicitação de crédito enviada com sucesso!');
      navigate('/patient/credit');

    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error(error.message || 'Erro ao enviar solicitação de crédito');
    } finally {
      setLoading(false);
    }
  };

  const installmentOptions = [6, 12, 18, 24, 36];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const selectedClinicData = clinics.find(c => c.id === formData.clinic_id);

  return (
    <div className="flex min-h-screen bg-[#0F0F23] text-white">
      <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} p-6 lg:p-10`}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-blue-500 font-bold tracking-widest text-xs uppercase">Simulação e Pedido</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Solicitação de <span className="text-blue-500">Crédito</span></h1>
              <p className="text-white/40 text-lg font-medium">Financie seu tratamento com as melhores condições do mercado.</p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
              <div className={`px-4 py-2 rounded-xl transition-all ${step === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40'}`}>
                <span className="font-bold">1</span> Clínicas
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
              <div className={`px-4 py-2 rounded-xl transition-all ${step === 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40'}`}>
                <span className="font-bold">2</span> Proposta
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {step === 1 ? (
                <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      Selecione a Clínica Parceira
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    {loadingClinics ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                        <p className="text-white/40 font-medium">Carregando clínicas parceiras...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {clinics.map((clinic) => (
                          <div
                            key={clinic.id}
                            onClick={() => handleInputChange('clinic_id', clinic.id)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer group ${formData.clinic_id === clinic.id
                              ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                              : 'bg-white/5 border-white/10 hover:border-white/30'
                              }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`font-bold transition-colors ${formData.clinic_id === clinic.id ? 'text-blue-400' : 'text-white'}`}>
                                {clinic.name}
                              </h3>
                              {formData.clinic_id === clinic.id && (
                                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-white/40 text-sm">
                              <MapPin className="w-3 h-3" />
                              <span>{clinic.city || 'Cidade não informada'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-8 flex justify-end">
                      <Button
                        onClick={() => validateStep1() && setStep(2)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-2xl transition-all"
                      >
                        Próximo Passo <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      Detalhes da Solicitação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Valor do Crédito */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-bold text-white/60 uppercase tracking-widest">Valor do Crédito</Label>
                          <span className="text-3xl font-black text-blue-500">{formatCurrency(parseFloat(formData.requested_amount))}</span>
                        </div>
                        <ValueSlider
                          value={parseFloat(formData.requested_amount)}
                          onChange={(value) => handleInputChange('requested_amount', value.toString())}
                          min={300}
                          max={50000}
                          step={100}
                        />
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                          <span>MÍN: R$ 300</span>
                          <span>MÁX: R$ 50.000</span>
                        </div>
                      </div>

                      {/* Parcelas */}
                      <div className="space-y-4">
                        <Label className="text-sm font-bold text-white/60 uppercase tracking-widest">Plano de Pagamento</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                          {installmentOptions.map((opt) => (
                            <div
                              key={opt}
                              onClick={() => handleInputChange('installments', opt.toString())}
                              className={`py-3 text-center rounded-xl border transition-all cursor-pointer font-bold ${formData.installments === opt.toString()
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105'
                                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                                }`}
                            >
                              {opt}x
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Descrição */}
                      <div className="space-y-4">
                        <Label className="text-sm font-bold text-white/60 uppercase tracking-widest">O que você vai realizar no tratamento?</Label>
                        <Textarea
                          value={formData.treatment_description}
                          onChange={(e) => handleInputChange('treatment_description', e.target.value)}
                          placeholder="Ex: Implante dentário, limpeza geral, clareamento..."
                          className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] focus:border-blue-500/50 transition-all text-white placeholder:text-white/20"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setStep(1)}
                          className="flex-1 py-6 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                        >
                          {loading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</>
                          ) : (
                            'Confirmar Solicitação'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar de Informações */}
            <div className="space-y-6">
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-sm font-medium">Clínica:</span>
                      <span className="text-sm font-bold text-white text-right">{selectedClinicData?.name || 'Não selecionada'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-sm font-medium">Valor Total:</span>
                      <span className="text-sm font-bold text-white">{formatCurrency(parseFloat(formData.requested_amount))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-sm font-medium">Parcelas:</span>
                      <span className="text-sm font-bold text-white">{formData.installments}x</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-white/40 text-sm font-medium">Parcela Estimada:</span>
                      <span className="text-xl font-black text-amber-500">
                        {formatCurrency(parseFloat(formData.requested_amount) / parseInt(formData.installments))}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-white/60">
                        O tempo médio de aprovação é de <strong>24 horas úteis</strong>. Após o envio, a clínica irá avaliar seu caso e entrar em contato.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dicas */}
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-8 rounded-[2rem] border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -z-10"></div>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Dica Doutorizze
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Descreva detalhadamente o seu tratamento. Solicitações com descrições claras têm <strong>30% mais chance</strong> de aprovação rápida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientCreditRequest;
