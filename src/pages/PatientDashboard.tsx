import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import {
  Plus,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  User,
  TrendingUp,
  ArrowRight,
  Activity,
  DollarSign,
  Building2,
  ChevronRight,
  ShieldCheck,
  Bell,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';

interface CreditRequest {
  id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  status: string;
  created_at: string;
  updated_at: string;
  clinics: {
    name: string;
    city: string;
  };
}

interface Appointment {
  id: string;
  data_hora: string;
  status: string;
  tipo_consulta?: string;
  clinics: {
    id: string;
    name: string;
  };
}

type ActivityItem =
  | { type: 'credit'; data: CreditRequest; date: string }
  | { type: 'appointment'; data: Appointment; date: string };

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  totalApprovedAmount: number;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalApprovedAmount: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login-paciente');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile) {
        setUserName(profile.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
      } else if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }

      // Se não tiver perfil, não tem requests vinculados a ele ainda
      if (!profile) {
        setCreditRequests([]);
        setLoading(false);
        return;
      }

      const { data: requests, error: requestsError } = await (supabase
        .from('credit_requests' as any) as any)
        .select(`
          id,
          clinic_id,
          requested_amount,
          installments,
          treatment_description,
          status,
          created_at,
          updated_at,
          clinics (
            name,
            city
          )
        `)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      const formattedRequests = (requests || []).map(r => ({
        ...r,
        clinics: r.clinics || { name: 'Clínica não informada', city: 'N/A' }
      })) as CreditRequest[];

      setCreditRequests(formattedRequests);

      // BUSCAR AGENDAMENTOS
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          tipo_consulta,
          clinics (
            id,
            name
          )
        `)
        .eq('paciente_id', user!.id)
        .order('data_hora', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      const formattedAppointments = (appointmentsData || []).map(a => ({
        ...a,
        clinics: a.clinics || { id: '', name: 'Clínica não informada' }
      })) as unknown as Appointment[];

      setAppointments(formattedAppointments);

      // UNIFICAR ATIVIDADES
      // Usando created_at para agendamentos também, para refletir "Atividade Recente" (quando foi criado)
      // Se preferir data do evento, usar a.data_hora. Mas para "Log de Atividades", created_at é mais preciso.
      // Vou usar data_hora para appointments pois é o que o usuário espera ver (próximos compromissos)
      // MAS vou garantir que a ordenação seja estritamente por DATA DE REFERÊNCIA.

      const allActivities: ActivityItem[] = [
        ...formattedRequests.map(r => ({ type: 'credit' as const, data: r, date: r.created_at })),
        ...formattedAppointments.map(a => ({ type: 'appointment' as const, data: a, date: a.data_hora }))
      ].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        // Proteção contra datas inválidas
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA; // Decrescente (Mais recente no topo)
      });

      setActivities(allActivities);

      // Calcular estatísticas
      const totalRequests = formattedRequests.length;
      const pendingRequests = formattedRequests.filter((r: any) => ['pending', 'clinic_reviewing', 'sent_to_admin', 'admin_analyzing'].includes(r.status)).length;
      const approvedRequests = formattedRequests.filter((r: any) => ['approved', 'admin_approved', 'patient_accepted'].includes(r.status)).length;
      const totalApprovedAmount = formattedRequests
        .filter((r: any) => ['approved', 'admin_approved', 'patient_accepted'].includes(r.status))
        .reduce((sum: number, r: any) => sum + (r.requested_amount || 0), 0);

      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        totalApprovedAmount
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);

      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      pending: { label: 'Em Análise', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Clock },
      clinic_approved: { label: 'Aprovado Clínica', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: CheckCircle },
      admin_approved: { label: 'Aprovado Final', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: ShieldCheck },
      approved: { label: 'Aprovado', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle },
      rejected: { label: 'Rejeitado', color: 'text-rose-400', bg: 'bg-rose-400/10', icon: XCircle },
      admin_rejected: { label: 'Rejeitado', color: 'text-rose-400', bg: 'bg-rose-400/10', icon: XCircle },
    };
    return configs[status] || { label: status, color: 'text-white/40', bg: 'bg-white/5', icon: Activity };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-muted-foreground font-medium">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
      <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-6 lg:p-10 relative overflow-hidden`}>
        {/* Background Gradients/Aurora */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-glow">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                </div>
                <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase">Dashboard Executivo</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent active:scale-95 transition-transform inline-block cursor-default">
                  {userName || 'Paciente'}
                </span>
                <span className="inline-block animate-bounce ml-2">👋</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium mt-2 max-w-xl">
                Gerencie sua saúde financeira e seus tratamentos com a inteligência da <span className="text-foreground">Doutorizze</span>.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" className="w-14 h-14 rounded-2xl glass-effect p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border-none">
                <Bell className="w-6 h-6" />
              </Button>
              <Button
                onClick={() => navigate('/patient/credit-request')}
                className="bg-primary hover:bg-primary-hover text-white font-bold h-14 px-8 rounded-2xl transition-all shadow-glow shadow-primary/20 flex items-center gap-3 active:scale-95"
              >
                <Plus className="w-6 h-6" />
                Nova Solicitação
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total de Pedidos', value: stats.totalRequests, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Em Análise', value: stats.pendingRequests, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
              { label: 'Aprovadas', value: stats.approvedRequests, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Disponível', value: formatCurrency(stats.totalApprovedAmount), icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
            ].map((stat, i) => (
              <Card key={i} className="glass-effect rounded-[2.5rem] overflow-hidden group hover:translate-y-[-4px] transition-all border-none">
                <CardContent className="p-8">
                  <div className="flex flex-col gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                      <p className="text-3xl font-black text-white mt-1 font-outfit">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Recent Requests */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-black flex items-center gap-3 text-white">
                  <Activity className="w-8 h-8 text-primary" />
                  Atividades Recentes
                </h2>
                <Button variant="link" className="text-primary font-bold hover:text-primary-hover" onClick={() => navigate('/patient/credit')}>
                  Ver todas <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {activities.length === 0 ? (
                <Card className="glass-effect rounded-[3rem] border-dashed border-primary/20 bg-primary/5">
                  <CardContent className="p-16 text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-glow shadow-primary/20">
                      <Activity className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Nenhuma atividade recente</h3>
                    <p className="text-muted-foreground mb-10 max-w-sm mx-auto text-lg leading-relaxed">Você ainda não possui solicitações de crédito ou agendamentos realizados.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button onClick={() => navigate('/patient/credit-request')} className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-6 rounded-2xl transition-all shadow-glow shadow-primary/30 active:scale-95">
                        Solicitar Crédito
                      </Button>
                      <Button onClick={() => navigate('/search')} variant="outline" className="border-white/10 text-white font-bold px-8 py-6 rounded-2xl hover:bg-white/5">
                        Agendar Consulta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => {
                    if (activity.type === 'credit') {
                      const request = activity.data;
                      const config = getStatusConfig(request.status);
                      const StatusIcon = config.icon;
                      return (
                        <Card key={`credit-${request.id}`} className="glass-effect rounded-[2.5rem] overflow-hidden hover:bg-primary/5 transition-all cursor-pointer group border-none shadow-lg">
                          <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                              <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                  <StatusIcon className={`w-8 h-8 ${config.color}`} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                    {request.treatment_description || 'Solicitação de Crédito'}
                                  </h3>
                                  <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                      <Building2 className="w-4 h-4" />
                                      <span>{request.clinics.name}</span>
                                    </div>
                                    <Badge className={`${config.bg} ${config.color} border-none rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider`}>
                                      CRÉDITO: {config.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3 border-t md:border-t-0 pt-6 md:pt-0 border-white/5">
                                <div className="text-2xl font-black text-white font-outfit">{formatCurrency(request.requested_amount)}</div>
                                <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                                  {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    } else {
                      const appointment = activity.data;
                      return (
                        <Card key={`appointment-${appointment.id}`} className="glass-effect rounded-[2.5rem] overflow-hidden hover:bg-primary/5 transition-all cursor-pointer group border-none shadow-lg" onClick={() => navigate('/patient/appointments')}>
                          <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <Calendar className="w-8 h-8 text-blue-500" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                    {appointment.tipo_consulta || 'Consulta Agendada'}
                                  </h3>
                                  <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                      <Building2 className="w-4 h-4" />
                                      <span>{appointment.clinics?.name || 'Clínica'}</span>
                                    </div>
                                    <Badge className="bg-blue-500/10 text-blue-500 border-none rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                                      AGENDAMENTO: {appointment.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3 border-t md:border-t-0 pt-6 md:pt-0 border-white/5">
                                <div className="text-xl font-black text-white font-outfit">
                                  {new Date(appointment.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                                  {new Date(appointment.data_hora).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions & Tips */}
            <div className="space-y-10">
              <h2 className="text-2xl font-black px-2 text-white">Ações Rápidas</h2>

              <div className="grid grid-cols-1 gap-5">
                {[
                  { label: 'Agendar Consulta', desc: 'Marque um novo horário', icon: Plus, color: 'text-primary', action: () => navigate('/search') },
                  { label: 'Buscar Clínicas', desc: 'Encontre dentistas perto de você', icon: Search, color: 'text-blue-400', action: () => navigate('/search') },
                  { label: 'Meus Agendamentos', desc: 'Gerencie suas consultas', icon: Calendar, color: 'text-warning', action: () => navigate('/patient/appointments') },
                  { label: 'Meus Documentos', desc: 'Arquivos e exames', icon: FileText, color: 'text-success', action: () => navigate('/patient/documents') },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={action.action}
                    className="h-auto p-8 rounded-[2.5rem] glass-effect flex items-center gap-5 text-left hover:bg-white/[0.08] hover:border-primary/30 transition-all group border-none"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <action.icon className={`w-7 h-7 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg">{action.label}</p>
                      <p className="text-muted-foreground text-xs mt-1 leading-tight">{action.desc}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                  </Button>
                ))}
              </div>

              {/* Tips Card */}
              <div className="relative group p-1 rounded-[3rem] bg-gradient-to-br from-primary/40 to-accent/40 shadow-glow shadow-primary/10">
                <div className="bg-[#0F0F23] rounded-[2.9rem] p-10 relative overflow-hidden h-full">
                  <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-primary/20 rounded-full blur-[40px] -z-10 group-hover:bg-primary/30 transition-all"></div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 shadow-inner">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-2xl font-black mb-4 text-white">Dica do Especialista</h4>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8">
                    Mantenha seus documentos sempre atualizados. Isso agiliza a aprovação de qualquer procedimento em até <span className="text-primary font-bold">48 horas</span>.
                  </p>
                  <Button variant="link" className="text-primary font-bold p-0 h-auto hover:text-primary-hover flex items-center group-hover:translate-x-1 transition-transform" onClick={() => navigate('/patient/documents')}>
                    Verificar documentos <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);