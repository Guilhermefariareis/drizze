import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import { Building2, MapPin, Star, ArrowLeft } from 'lucide-react';
import parseToISO from '@/utils/dateFormatter';

interface ClinicData {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  clinic_profiles?: {
    logo_url?: string;
    specialties?: string[];
  };
}

export default function LoanRequestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const clinicId = searchParams.get('clinic');
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState(''); // Para exibição durante digitação
  const [isTyping, setIsTyping] = useState(false); // Para controlar se está digitando
  const [installments, setInstallments] = useState('');
  const [treatmentDescription, setTreatmentDescription] = useState('');

  // Refs para debounce
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Client data states
  const [clientFullName, setClientFullName] = useState('');
  const [clientCpf, setClientCpf] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientBirthDate, setClientBirthDate] = useState('');
  const [clientCep, setClientCep] = useState('');

  useEffect(() => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para solicitar um crédito",
        variant: "destructive"
      });
      navigate('/patient-login');
      return;
    }

    if (!clinicId) {
      navigate('/');
      return;
    }

    // Client data pre-filling removed - not needed for credit_requests table

    fetchClinic();
  }, [clinicId, user, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const fetchClinic = async () => {
    try {
      // First get clinic data
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .eq('is_active', true)
        .single();

      if (clinicError) throw clinicError;

      if (clinicData) {
        // Get clinic profile
        const { data: profileData } = await supabase
          .from('clinic_profiles')
          .select('*')
          .eq('clinic_id', clinicData.id)
          .single();

        setClinic({
          ...clinicData,
          clinic_profiles: profileData
        } as any);
      }
    } catch (error) {
      console.error('Erro ao buscar clínica:', error);
      toast({
        title: "Erro",
        description: "Clínica não encontrada",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clinic || !user) return;

    setSubmitting(true);

    try {
      // Primeiro buscar o profile do usuário logado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, city, state, zip_code, birth_date')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      // Normalizar data de nascimento do perfil (se vier em outro formato)
      const rawBirth = (profile as any)?.birth_date as string | undefined;
      const birthISO = rawBirth ? parseToISO(rawBirth) : undefined;
      if (rawBirth && !birthISO) {
        throw new Error('Data de nascimento inválida no perfil do paciente');
      }

      console.log('Enviando solicitação de crédito:', {
        clinic_id: clinic.id,
        patient_id: profile.id,
        requested_amount: parseFloat(amount),
        treatment_description: treatmentDescription,
        patient_name: clientFullName,
        patient_cpf: clientCpf,
        patient_email: clientEmail,
        patient_phone: clientPhone,
        installments: parseInt(installments),
        status: 'pending',
        patient_address_cep: (profile as any)?.zip_code?.replace(/\D/g, '') || undefined,
        patient_address_city: (profile as any)?.city || undefined,
        patient_address_state: (profile as any)?.state || undefined,
        patient_birth_date: birthISO || undefined,
      });

      const { error } = await supabase
        .from('credit_requests')
        .insert({
          clinic_id: clinic.id,
          patient_id: profile.id,
          requested_amount: parseFloat(amount),
          treatment_description: treatmentDescription,
          patient_name: clientFullName,
          patient_cpf: clientCpf,
          patient_email: clientEmail,
          patient_phone: clientPhone,
          installments: parseInt(installments),
          status: 'pending',
          patient_address_cep: (profile as any)?.zip_code?.replace(/\D/g, '') || undefined,
          patient_address_city: (profile as any)?.city || undefined,
          patient_address_state: (profile as any)?.state || undefined,
          patient_birth_date: birthISO || undefined,
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de crédito foi enviada para análise da clínica",
        variant: "default"
      });

      navigate('/patient-dashboard');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');

    // Se não há valor, retorna vazio
    if (!numericValue) return '';

    // Converte para número e formata
    const numberValue = parseInt(numericValue);

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);

    return formattedValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');

    // Atualiza o valor interno (sem formatação)
    setAmount(rawValue);

    // Durante a digitação, mostra apenas os números
    setDisplayAmount(rawValue);
    setIsTyping(true);

    // Limpa o timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Define um novo timeout para formatar após parar de digitar
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (rawValue) {
        setDisplayAmount(formatCurrency(rawValue));
      }
    }, 800); // 800ms de delay
  };

  const handleAmountBlur = () => {
    // Quando sair do campo, formata imediatamente
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (amount) {
      setDisplayAmount(formatCurrency(amount));
    }
  };

  const handleAmountFocus = () => {
    // Quando focar no campo, mostra apenas os números para facilitar edição
    if (amount) {
      setDisplayAmount(amount);
      setIsTyping(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Clínica não encontrada
          </h1>
          <Button onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Solicitar Crédito
              </h1>
              <p className="text-muted-foreground">
                Preencha os dados abaixo para solicitar seu crédito
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Clinic Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{clinic.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {clinic.city}, {clinic.state}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {clinic.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{clinic.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      Avaliação da clínica
                    </span>
                  </div>

                  {clinic.clinic_profiles?.specialties && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Especialidades:</h4>
                      <div className="flex flex-wrap gap-1">
                        {clinic.clinic_profiles.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Solicitação</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Valor do Tratamento *</Label>
                        <Input
                          id="amount"
                          value={isTyping ? displayAmount : (displayAmount || formatCurrency(amount))}
                          onChange={handleAmountChange}
                          onBlur={handleAmountBlur}
                          onFocus={handleAmountFocus}
                          placeholder="Digite o valor (ex: 1500)"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Valor total do tratamento que você deseja financiar
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="installments">Número de Parcelas *</Label>
                        <Select value={installments} onValueChange={setInstallments} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {[3, 6, 9, 12, 15, 18, 21, 24].map((months) => (
                              <SelectItem key={months} value={months.toString()}>
                                {months}x
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="treatment">Descrição do Tratamento *</Label>
                      <Textarea
                        id="treatment"
                        value={treatmentDescription}
                        onChange={(e) => setTreatmentDescription(e.target.value)}
                        placeholder="Descreva brevemente o tratamento que você precisa realizar..."
                        rows={4}
                        required
                      />
                    </div>

                    {/* Client Data Section */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="font-medium text-lg">Dados Pessoais</h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientFullName">Nome Completo *</Label>
                          <Input
                            id="clientFullName"
                            value={clientFullName}
                            onChange={(e) => setClientFullName(e.target.value)}
                            placeholder="Seu nome completo"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="clientCpf">CPF *</Label>
                          <Input
                            id="clientCpf"
                            value={clientCpf}
                            onChange={(e) => setClientCpf(e.target.value)}
                            placeholder="000.000.000-00"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientEmail">E-mail *</Label>
                          <Input
                            id="clientEmail"
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="clientPhone">Telefone *</Label>
                          <Input
                            id="clientPhone"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="(11) 99999-9999"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientBirthDate">Data de Nascimento *</Label>
                          <Input
                            id="clientBirthDate"
                            type="date"
                            value={clientBirthDate}
                            onChange={(e) => setClientBirthDate(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="clientCep">CEP *</Label>
                          <Input
                            id="clientCep"
                            value={clientCep}
                            onChange={(e) => setClientCep(e.target.value)}
                            placeholder="00000-000"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    {amount && installments && (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h4 className="font-medium mb-2">Resumo da Solicitação:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Valor total:</span>
                            <span className="font-medium">{formatCurrency(amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Parcelas:</span>
                            <span className="font-medium">{installments}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor estimado por parcela:</span>
                            <span className="font-medium">
                              {formatCurrency((parseInt(amount) / parseInt(installments)).toString())}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          * Valores aproximados. O valor final será definido após análise.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting || !amount || !installments || !treatmentDescription || !clientFullName || !clientCpf || !clientEmail || !clientPhone || !clientBirthDate || !clientCep}
                        className="flex-1"
                        variant="gradient"
                      >
                        {submitting ? 'Enviando...' : 'Solicitar Crédito'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
