import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Clock, User, Building2, Search, Filter, Download, Eye, MoreHorizontal, TrendingUp, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Admin client to bypass RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

type Appointment = {
  id: string;
  patient_id: string;
  clinica_id: string;
  profissional_id: string | null;
  data_hora: string;
  tipo_consulta: string;
  status: string;
  valor: number | null;
  observacoes: string | null;
  profiles?: {
    full_name: string;
  };
  clinics?: {
    name: string;
  };
  clinic_professionals?: {
    name: string;
  };
};

export default function AdminAppointments() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let query = adminSupabase
        .from('agendamentos')
        .select(`
          *,
          clinics (name)
        `)
        .order('data_hora', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('data_hora', today.toISOString());
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('data_hora', weekAgo.toISOString());
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('data_hora', monthAgo.toISOString());
      }

      const { data: appointmentsData, error: appointmentsError } = await query;

      if (appointmentsError) throw appointmentsError;

      let enrichedAppointments = appointmentsData;

      // 1. Manually fetch profiles for patients
      if (enrichedAppointments && enrichedAppointments.length > 0) {
        const patientIds = [...new Set(enrichedAppointments.map(a => a.paciente_id).filter(Boolean))];

        const { data: profilesData } = await adminSupabase
          .from('profiles')
          .select('id, full_name')
          .in('id', patientIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        enrichedAppointments = enrichedAppointments.map(app => ({
          ...app,
          profiles: profilesMap.get(app.paciente_id) || { full_name: 'Desconhecido' }
        }));

        // 2. Manually fetch professionals
        // profissional_id might point to 'clinic_professionals' table
        const professionalIds = [...new Set(enrichedAppointments.map(a => a.profissional_id).filter(Boolean))];

        if (professionalIds.length > 0) {
          // Fetch clinic_professionals to get user_id
          const { data: proData, error: proError } = await adminSupabase
            .from('clinic_professionals')
            .select('id, user_id')
            .in('id', professionalIds);

          // Note: If agendamentos points to 'professionals' table instead, we might need a fallback
          // But checking previous errors, it seems ambiguous. 
          // If clinic_professionals returns empty, maybe it's the 'professionals' table which we don't know schema of.
          // Let's assume clinic_professionals for now as per migration found.

          if (proData && proData.length > 0) {
            const userIds = [...new Set(proData.map(p => p.user_id).filter(Boolean))];

            // Fetch profiles for these professionals
            const { data: proProfiles } = await adminSupabase
              .from('profiles')
              .select('id, full_name')
              .in('id', userIds);

            const proProfilesMap = new Map(proProfiles?.map(p => [p.id, p]) || []);
            const clinicProMap = new Map(proData.map(p => [p.id, p]));

            enrichedAppointments = enrichedAppointments.map(app => {
              const proRecord = clinicProMap.get(app.profissional_id);
              const proProfile = proRecord ? proProfilesMap.get(proRecord.user_id) : null;

              return {
                ...app,
                clinic_professionals: proProfile ? { name: proProfile.full_name } : { name: 'Não atribuído' }
              };
            });
          } else {
            // Fallback: maybe profissional_id IS the user_id (direct link)?
            // Let's try to fetch profiles directly with these IDs just in case
            const { data: potentialProProfiles } = await adminSupabase
              .from('profiles')
              .select('id, full_name')
              .in('id', professionalIds);

            if (potentialProProfiles && potentialProProfiles.length > 0) {
              const directProMap = new Map(potentialProProfiles.map(p => [p.id, p]));
              enrichedAppointments = enrichedAppointments.map(app => ({
                ...app,
                clinic_professionals: directProMap.get(app.profissional_id) ? { name: directProMap.get(app.profissional_id)!.full_name } : (app.clinic_professionals || { name: 'Não atribuído' })
              }));
            }
          }
        }
      }

      setAppointments(enrichedAppointments as any);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: todayCount },
        { count: pendingCount },
        { count: completedCount },
        { count: cancelledCount }
      ] = await Promise.all([
        adminSupabase.from('agendamentos').select('id', { count: 'exact', head: true }).gte('data_hora', today.toISOString()),
        adminSupabase.from('agendamentos').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
        adminSupabase.from('agendamentos').select('id', { count: 'exact', head: true }).eq('status', 'concluida'),
        adminSupabase.from('agendamentos').select('id', { count: 'exact', head: true }).eq('status', 'cancelada')
      ]);

      setStats({
        today: todayCount || 0,
        pending: pendingCount || 0,
        completed: completedCount || 0,
        cancelled: cancelledCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await adminSupabase
        .from('agendamentos')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      const appointment = appointments.find(app => app.id === id);
      if (appointment?.patient_id) {
        const statusMap: Record<string, string> = {
          confirmada: 'confirmada',
          cancelada: 'cancelada',
          concluida: 'concluída'
        };

        const statusLabel = statusMap[newStatus] || newStatus;

        await adminSupabase.from('notifications').insert({
          user_id: appointment.patient_id,
          type: newStatus === 'confirmada' ? 'success' : newStatus === 'cancelada' ? 'error' : 'info',
          title: `Consulta ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}`,
          message: `Sua consulta para o dia ${new Date(appointment.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} foi ${statusLabel}.`,
          read: false
        });
      }

      toast.success(`Consulta ${newStatus} com sucesso`);
      fetchAppointments();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'confirmada': return 'bg-primary text-primary-foreground';
      case 'pendente': return 'bg-warning text-warning-foreground';
      case 'concluida': return 'bg-success text-success-foreground';
      case 'cancelada': return 'bg-destructive text-destructive-foreground';
      case 'reagendada': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredAppointmentsList = appointments.filter(appointment => {
    const searchLower = searchQuery.toLowerCase();
    const patientName = appointment.profiles?.full_name?.toLowerCase() || '';
    const clinicName = appointment.clinics?.name?.toLowerCase() || '';
    const professionalName = appointment.clinic_professionals?.name?.toLowerCase() || '';

    return patientName.includes(searchLower) ||
      clinicName.includes(searchLower) ||
      professionalName.includes(searchLower);
  });

  const statsData = [
    { title: "Consultas Hoje", value: stats.today.toString(), icon: Calendar, color: "text-primary" },
    { title: "Pendentes", value: stats.pending.toString(), icon: Clock, color: "text-warning" },
    { title: "Concluídas", value: stats.completed.toString(), icon: TrendingUp, color: "text-success" },
    { title: "Canceladas", value: stats.cancelled.toString(), icon: AlertCircle, color: "text-destructive" }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Consultas</h1>
            <p className="text-muted-foreground">Monitore e gerencie todas as consultas da plataforma</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsData.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Lista de Consultas</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" onClick={fetchAppointments}>
                    <Download className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente, profissional ou clínica..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="reagendada">Reagendada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Carregando consultas...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Consulta</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Clínica</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointmentsList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Nenhuma consulta encontrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAppointmentsList.map(appointment => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{appointment.tipo_consulta}</p>
                                <p className="text-xs text-muted-foreground">ID: {appointment.id.slice(0, 8)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{appointment.profiles?.full_name || 'Usuário'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">{appointment.clinic_professionals?.name || 'Não atribuído'}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{appointment.clinics?.name || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(appointment.data_hora).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(appointment.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">
                                {appointment.valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appointment.valor) : 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status?.toUpperCase() || 'PENDENTE'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => updateStatus(appointment.id, 'confirmada')}>
                                    <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                                    Confirmar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateStatus(appointment.id, 'concluida')}>
                                    <TrendingUp className="h-4 w-4 mr-2 text-success" />
                                    Concluir
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => updateStatus(appointment.id, 'cancelada')}>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}