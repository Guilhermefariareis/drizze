import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, Phone, X, Star, Plus, AlertCircle, Building2, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Appointment {
  id: string;
  data_hora: string;
  status: string;
  tipo_consulta?: string;
  observacoes?: string;
  valor?: number;
  clinics: {
    id: string;
    name: string;
    phone?: string;
    address?: any;
    rating?: number;
    city?: string;
  };
}

function PatientAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clinics (
            id,
            name,
            phone,
            address,
            rating,
            city
          )
        `)
        .eq('paciente_id', user.id)
        .order('data_hora', { ascending: false }); // Show newest first

      if (error) throw error;

      const appointmentsData = (data || []) as Appointment[];

      // Ordenação Personalizada:
      // 1. Não cancelados primeiro
      // 2. Data mais recente primeiro (decrescente)
      appointmentsData.sort((a, b) => {
        const isCancelledA = a.status === 'cancelado' || a.status === 'no_show';
        const isCancelledB = b.status === 'cancelado' || b.status === 'no_show';

        if (isCancelledA && !isCancelledB) return 1; // A vai para baixo
        if (!isCancelledA && isCancelledB) return -1; // B vai para baixo

        // Se ambos forem do mesmo "grupo" (cancelados ou não), ordena por data
        return new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime();
      });

      setAppointments(appointmentsData);
    } catch (error: any) {
      console.error('Erro ao carregar consultas:', error);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCancelId(id);
  }

  const confirmCancel = async () => {
    if (!cancelId) return;
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({
          status: 'cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('id', cancelId);

      if (error) throw error;

      toast.success('Consulta cancelada com sucesso');
      loadAppointments(); // Refresh list
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cancelar consulta');
    } finally {
      setCancelId(null);
    }
  };

  const handleReschedule = (appointment: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    // Redirect to booking page for this clinic
    // Ideally we could pass data to pre-fill, but a fresh booking is safer for logic
    toast.info('Redirecionando para agendar nova data...');
    navigate(`/booking/${appointment.clinics.id}`);
  };

  const handleClinicClick = (clinicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/clinic/${clinicId}`);
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pendente: { label: 'Aguardando Confirmação', variant: 'outline', className: 'text-amber-500 border-amber-500/20 bg-amber-500/10' },
      confirmado: { label: 'Confirmado', variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' },
      concluido: { label: 'Concluído', variant: 'secondary', className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-0' },
      cancelado: { label: 'Cancelado', variant: 'destructive', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      no_show: { label: 'Não Compareceu', variant: 'outline', className: 'text-gray-500 border-gray-500/20' }
    };

    const config = statusConfig[status] || statusConfig.pendente;
    return <Badge variant={config.variant} className={`${config.className} font-medium px-3 py-1`}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Carregando consultas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-6 lg:p-10 relative overflow-hidden`}>
        {/* Background Aurora */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Minhas Consultas</h1>
              <p className="text-muted-foreground text-lg">Gerencie seus agendamentos e histórico médico.</p>
            </div>
            <Button
              onClick={() => navigate('/search')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-8"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Consulta
            </Button>
          </div>

          {appointments.length === 0 ? (
            <Card className="border-dashed border-2 border-muted bg-muted/20 rounded-[2rem]">
              <CardContent className="py-16 text-center space-y-6">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Calendar className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Nenhuma consulta encontrada</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Você ainda não possui consultas agendadas. Que tal marcar sua primeira avaliação?
                  </p>
                </div>
                <Button onClick={() => navigate('/search')} variant="default" className="rounded-xl px-8">
                  Agendar agora
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-primary/5 cursor-default"
                >
                  <CardHeader className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/40">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
                        onClick={(e) => handleClinicClick(appointment.clinics.id, e)}
                      >
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <div
                          className="flex items-center gap-2 mb-1 group-hover:text-primary transition-colors cursor-pointer"
                          onClick={(e) => handleClinicClick(appointment.clinics.id, e)}
                        >
                          <CardTitle className="text-2xl font-bold">{appointment.clinics.name}</CardTitle>
                          <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground text-sm">
                          {appointment.clinics.city && (
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {appointment.clinics.city}</span>
                          )}
                          {appointment.clinics.rating && (
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {appointment.clinics.rating.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(appointment.status)}
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider opacity-60">ID: {appointment.id.slice(0, 8)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 md:p-8 grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-0.5 capitalize">
                            {format(new Date(appointment.data_hora), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <p className="text-muted-foreground">Data da consulta</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-0.5">
                            {format(new Date(appointment.data_hora), 'HH:mm')}
                          </p>
                          <p className="text-muted-foreground">Horário agendado</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-bold text-lg mb-0.5">
                            {appointment.tipo_consulta ? appointment.tipo_consulta.charAt(0).toUpperCase() + appointment.tipo_consulta.slice(1) : 'Consulta Geral'}
                          </p>
                          <p className="text-muted-foreground">Tipo de atendimento</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <MapPin className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium text-base mb-1">
                            {appointment.clinics.address && typeof appointment.clinics.address === 'object' ?
                              `${appointment.clinics.address.street || ''}, ${appointment.clinics.address.number || ''}` :
                              'Endereço não informado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.clinics.address && typeof appointment.clinics.address === 'object' ?
                              `${appointment.clinics.address.neighborhood || ''} - ${appointment.clinics.address.city || ''}/${appointment.clinics.address.state || ''}` :
                              ''}
                          </p>
                        </div>
                      </div>

                      {appointment.observacoes && (
                        <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Observações</p>
                          <p className="text-sm italic text-foreground/80">{appointment.observacoes}</p>
                        </div>
                      )}

                      {appointment.valor && (
                        <div className="flex justify-end pt-2">
                          <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2">
                            <span className="text-xs font-bold text-primary/70 uppercase">Valor estimado</span>
                            <span className="text-xl font-bold text-primary">{formatPrice(appointment.valor)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {(appointment.status === 'pendente' || appointment.status === 'confirmado') && (
                    <CardFooter className="bg-muted/30 p-4 md:px-8 border-t border-border/40 flex flex-wrap gap-4 justify-end">
                      <Button
                        variant="outline"
                        className="rounded-xl hover:bg-background hover:text-primary hover:border-primary/50 transition-all"
                        onClick={(e) => handleReschedule(appointment, e)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Reagendar
                      </Button>
                      <Button
                        variant="destructive"
                        className="rounded-xl hover:bg-red-600 transition-all bg-red-500/10 text-red-500 hover:text-white border border-red-500/20"
                        onClick={(e) => handleCancelClick(appointment.id, e)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </CardFooter>
                  )}
                  {appointment.status === 'cancelado' && (
                    <CardFooter className="bg-red-500/5 p-4 md:px-8 border-t border-red-500/10 justify-center">
                      <p className="text-sm text-red-500/70 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Consulta cancelada
                      </p>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita e o horário será liberado para outros pacientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-500 hover:bg-red-600">
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PatientAppointments