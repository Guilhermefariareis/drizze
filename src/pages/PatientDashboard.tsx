import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValueSlider } from '@/components/ui/value-slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import Navbar from '@/components/Navbar';
import { getUserLocation, filterClinicsDynamically, generateMockClinicsForLocation, type UserLocation, type ClinicWithDistance } from '@/utils/locationService';
// ChatWidget removido do site
import { 
  Plus, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  User, 
  Star, 
  ArrowRight,
  Activity,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

type LoanRequest = {
  id: string;
  treatment_description: string;
  requested_amount: number;
  installments: number;
  status: string;
  clinic_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  clinics?: { name?: string } | null;
};

type Treatment = {
  id: string;
  name: string;
  description: string;
  estimated_cost_min: number;
  estimated_cost_max: number;
  typical_installments: number;
};

type Clinic = {
  id: string;
  name: string;
  city: string;
};

function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading: subscriptionLoading, hasActiveSubscription } = useSubscriptionCheck();
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [customTreatment, setCustomTreatment] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<string>('');
  const [installments, setInstallments] = useState<number>(12);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    console.log('PatientDashboard useEffect - user:', user);
    if (user) {
      fetchLoanRequests();
      fetchTreatments();
      fetchClinics();
      fetchAppointments();
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const fetchLoanRequests = async () => {
    try {
      // Primeiro buscar o profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return;
      }

      const { data, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          clinics (name)
        `)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoanRequests((data || []) as any);
    } catch (error) {
      console.error('Error fetching loan requests:', error);
      toast.error('Erro ao carregar solicitações');
    }
  };

  const fetchTreatments = async () => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .order('name');

      if (error) throw error;
      setTreatments((data || []) as any);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    }
  };

  const fetchClinics = async () => {
    try {
      console.log('🌍 [SISTEMA DINÂMICO] Iniciando busca de clínicas...');
      
      // Obter localização do usuário
      const userLocation = await getUserLocation();
      console.log('📍 [SISTEMA DINÂMICO] Localização detectada:', userLocation);
      
      // Buscar todas as clínicas ativas do banco
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, city, state, address, latitude, longitude')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      let clinicsData: ClinicWithDistance[] = data || [];
      console.log(`🏥 [SISTEMA DINÂMICO] Total de clínicas no banco: ${clinicsData.length}`);
      
      let filteredClinics: ClinicWithDistance[] = [];
      
      if (userLocation) {
        // Usar filtragem dinâmica inteligente
        filteredClinics = filterClinicsDynamically(clinicsData, userLocation, 100);
        console.log(`✅ [SISTEMA DINÂMICO] Clínicas filtradas dinamicamente: ${filteredClinics.length}`);
      } else {
        // Fallback: usar estado do perfil do usuário
        const userState = user?.user_metadata?.state || 'GO';
        console.log(`🔄 [SISTEMA DINÂMICO] Fallback por estado: ${userState}`);
        
        filteredClinics = clinicsData.filter(clinic => 
          clinic.state === userState
        );
      }
      
      // Se não encontrou clínicas, gerar clínicas mock baseadas na localização
      if (filteredClinics.length === 0 && userLocation) {
        console.log('🔧 [SISTEMA DINÂMICO] Gerando clínicas mock para a localização...');
        filteredClinics = generateMockClinicsForLocation(userLocation);
        
        if (filteredClinics.length > 0) {
          toast.info(`Exibindo clínicas disponíveis para ${userLocation.city}, ${userLocation.state}`);
        }
      }
      
      // Fallback final para Goiás se nada foi encontrado
      if (filteredClinics.length === 0) {
        console.log('🔧 [SISTEMA DINÂMICO] Usando fallback final para Goiás...');
        const fallbackClinics: ClinicWithDistance[] = [
          {
            id: 'fallback-1',
            name: 'Clínica Odontológica Trindade',
            city: 'Trindade',
            state: 'GO',
            address: 'Centro de Trindade',
            latitude: -16.6469,
            longitude: -49.4871
          },
          {
            id: 'fallback-2', 
            name: 'Dental Care Goiânia',
            city: 'Goiânia',
            state: 'GO',
            address: 'Setor Central, Goiânia',
            latitude: -16.6869,
            longitude: -49.2648
          }
        ];
        filteredClinics = fallbackClinics;
      }
      
      console.log(`🎯 [SISTEMA DINÂMICO] Clínicas finais: ${filteredClinics.length}`);
      console.log('🎯 [SISTEMA DINÂMICO] Lista final:', filteredClinics.map(c => `${c.name} (${c.city}, ${c.state})`));
      
      setClinics(filteredClinics as any);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast.error('Erro ao carregar clínicas próximas');
    }
  };
  
  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchAppointments = async () => {
    try {
      // Primeiro buscar o profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clinics!inner(name, phone, address, rating)
        `)
        .eq('patient_id', profile.id)
        .order('scheduled_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setAppointments((data || []) as any);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLoanRequest = async () => {
    try {
      // Verificar se o usuário tem assinatura ativa
      if (!hasActiveSubscription('basic')) {
        toast.error('Você precisa de um plano ativo para solicitar empréstimos');
        navigate('/plans?type=patient');
        return;
      }

      if (!selectedClinic || !requestedAmount) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const treatmentDescription = selectedTreatment === 'custom' 
        ? customTreatment 
        : treatments.find(t => t.id === selectedTreatment)?.name || '';

      const { error } = await supabase
        .from('loan_requests')
        .insert({
          patient_id: user?.id,
          clinic_id: selectedClinic,
          treatment_description: treatmentDescription,
          requested_amount: parseFloat(requestedAmount),
          installments: installments,
          status: 'pending',
          client_cpf: user?.user_metadata?.cpf || '',
          client_full_name: user?.user_metadata?.full_name || user?.email || '',
          client_birth_date: user?.user_metadata?.birthDate ? new Date(user.user_metadata.birthDate).toISOString().split('T')[0] : '1990-01-01',
          client_email: user?.email || '',
          client_phone: user?.user_metadata?.phone || '',
          client_cep: user?.user_metadata?.address?.split(' ').pop() || '00000-000'
        });

      if (error) throw error;

      toast.success('Solicitação enviada com sucesso!');
      fetchLoanRequests();
      
      // Reset form
      setSelectedTreatment('');
      setSelectedClinic('');
      setCustomTreatment('');
      setRequestedAmount('');
      setInstallments(12);
    } catch (error) {
      console.error('Error creating loan request:', error);
      toast.error('Erro ao enviar solicitação');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_clinic': return 'bg-warning text-warning-foreground';
      case 'approved_clinic': return 'bg-primary text-primary-foreground';
      case 'rejected_clinic': return 'bg-destructive text-destructive-foreground';
      case 'pending_admin': return 'bg-secondary text-secondary-foreground';
      case 'sent_parcelamais': return 'bg-accent text-accent-foreground';
      case 'approved': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_clinic': return 'Aguardando Clínica';
      case 'approved_clinic': return 'Aprovado pela Clínica';
      case 'rejected_clinic': return 'Rejeitado pela Clínica';
      case 'pending_admin': return 'Aguardando Admin';
      case 'sent_parcelamais': return 'Enviado ao Clinicorp';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Navigation functions
  const handleMakeAppointment = () => {
    navigate('/search-clinics');
  };

  const handleViewAppointments = () => {
    navigate('/patient/appointments');
  };

  const handleViewPlan = () => {
    navigate('/plans?type=patient');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Painel do Cliente</h1>
          <p className="text-muted-foreground">Gerencie seus agendamentos, planos e solicitações de crédito</p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleMakeAppointment}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Fazer Agendamento</h3>
                  <p className="text-sm text-muted-foreground">Agende sua consulta</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewAppointments}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-3">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Meus Agendamentos</h3>
                  <p className="text-sm text-muted-foreground">{appointments.length} consultas</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewPlan}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`p-3 rounded-lg w-fit mb-3 ${
                    hasActiveSubscription('basic') ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <Star className={`h-6 w-6 ${
                      hasActiveSubscription('basic') ? 'text-green-500' : 'text-red-500'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Meu Plano</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionLoading ? 'Carregando...' : 'Nenhum plano ativo'}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            const creditTab = document.querySelector('[data-value="credit"]');
            if (creditTab) {
              (creditTab as HTMLElement).click();
            }
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-3">
                    <CreditCard className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Solicitar Empréstimo</h3>
                  <p className="text-sm text-muted-foreground">{loanRequests.length} solicitações</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consultas Realizadas</p>
                  <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próximas Consultas</p>
                  <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Star className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status do Plano</p>
                  <p className={`text-lg font-bold ${
                    subscriptionLoading ? 'text-gray-500' :
                    hasActiveSubscription('basic') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {subscriptionLoading ? 'Carregando...' :
                     hasActiveSubscription('basic') ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Créditos Pendentes</p>
                  <p className="text-2xl font-bold">
                    {loanRequests.filter(r => ['pending_clinic', 'pending_admin', 'sent_parcelamais'].includes(r.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for organized content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">Consultas Recentes</TabsTrigger>
            <TabsTrigger value="credit" data-value="credit">Solicitar Crédito</TabsTrigger>
            <TabsTrigger value="requests">Minhas Solicitações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximas Consultas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma consulta agendada
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {appointments
                        .filter(a => a.status === 'scheduled' || a.status === 'confirmed')
                        .slice(0, 3)
                        .map(appointment => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{appointment.clinics.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.scheduled_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant="secondary">{appointment.status === 'scheduled' ? 'Agendada' : 'Confirmada'}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    onClick={handleViewAppointments}
                  >
                    Ver Todas as Consultas
                  </Button>
                </CardContent>
              </Card>

              {/* Plan Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Meu Plano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptionLoading ? (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-center text-gray-600">Carregando informações do plano...</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-semibold text-red-800">Nenhum plano ativo</h3>
                        <p className="text-sm text-red-600 mt-1">Você não possui um plano ativo no momento</p>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-red-800">Para acessar os benefícios:</p>
                          <ul className="text-sm text-red-600 mt-1 space-y-1">
                            <li>• Escolha um plano</li>
                            <li>• Complete o pagamento via Stripe</li>
                            <li>• Aguarde a confirmação do pagamento</li>
                            <li>• Aproveite todos os benefícios</li>
                          </ul>
                        </div>
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs text-yellow-800">
                            ⚠️ Acesso aos benefícios requer assinatura ativa e pagamento confirmado
                          </p>
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleViewPlan}
                    >
                      {hasActiveSubscription('basic') ? 'Gerenciar Plano' : 'Escolher Plano'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma consulta encontrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map(appointment => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{appointment.clinics.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.scheduled_date).toLocaleDateString('pt-BR')} às {new Date(appointment.scheduled_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm text-muted-foreground">{appointment.service_type || 'Consulta'}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={appointment.status === 'completed' ? 'outline' : 'secondary'}>
                            {appointment.status === 'completed' ? 'Concluída' : 
                             appointment.status === 'confirmed' ? 'Confirmada' : 
                             appointment.status === 'scheduled' ? 'Agendada' : 'Cancelada'}
                          </Badge>
                          {appointment.price && (
                            <p className="text-sm font-medium mt-1">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appointment.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={handleViewAppointments}
                >
                  Ver Todas as Consultas
                </Button>
                  </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nova Solicitação de Crédito
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clinic">Clínica *</Label>
                <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map(clinic => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name} - {clinic.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="treatment">Tratamento</Label>
                <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tratamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments.map(treatment => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        {treatment.name} - {formatCurrency(treatment.estimated_cost_min)} a {formatCurrency(treatment.estimated_cost_max)}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Outro tratamento...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedTreatment === 'custom' && (
              <div>
                <Label htmlFor="customTreatment">Descrição do Tratamento *</Label>
                <Textarea
                  id="customTreatment"
                  placeholder="Descreva o tratamento necessário..."
                  value={customTreatment}
                  onChange={(e) => setCustomTreatment(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-4 block">Valor Solicitado *</Label>
                <ValueSlider
                  value={parseFloat(requestedAmount) || 1000}
                  onChange={(value) => setRequestedAmount(value.toString())}
                  min={100}
                  max={50000}
                  step={100}
                  className="py-4"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="installments">Parcelas</Label>
                  <Select value={installments.toString()} onValueChange={(value) => setInstallments(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 12, 18, 24, 36, 48].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center font-medium">
                💡 Para solicitar seu crédito, entre em contato com uma de nossas clínicas parceiras ou utilize nosso sistema de agendamento.
              </p>
            </div>

            <Button 
              onClick={createLoanRequest}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Solicitar Empréstimo
            </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Solicitações de Crédito</CardTitle>
              </CardHeader>
              <CardContent>
            {loanRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma solicitação encontrada. Faça sua primeira solicitação acima!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tratamento</TableHead>
                      <TableHead>Clínica</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.treatment_description}
                        </TableCell>
                        <TableCell>{request.clinics?.name || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(request.requested_amount)}</TableCell>
                        <TableCell>{request.installments}x</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
      
      {/* Chat Widget removido */}
    </div>
  );
}

export default PatientDashboard;