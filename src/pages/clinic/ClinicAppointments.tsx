import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  clinica_id: string;
  paciente_id?: string;
  paciente_dados_id?: string;
  data_hora: string;
  status: string;
  observacoes?: string;
  valor?: number;
  tipo_consulta?: string;
  pacientes?: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
  };
}

export default function ClinicAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  console.warn('🔄 CLINIC APPOINTMENTS COMPONENT LOADED');
  console.warn('👤 User ID:', user?.id);
  console.warn('📊 Appointments count:', appointments.length);
  console.warn('🌐 Current URL:', window.location.pathname);

  useEffect(() => {
    console.log('🔄 useEffect executado. User:', user?.id);
    if (user) {
      loadAppointments();
    } else {
      console.log('❌ Usuário não logado');
      setLoading(false);
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      console.log('🔍 Iniciando carregamento de agendamentos...');
      console.log('👤 User ID:', user?.id);
      
      // Primeiro buscar a clínica do usuário
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('id, name, owner_id')
        .eq('owner_id', user?.id)
        .single();

      console.log('🏥 Clinic data:', clinicData);
      console.log('❌ Clinic error:', clinicError);

      if (clinicError) {
        console.log('⚠️ Erro ao buscar clínica. Tentando buscar todas as clínicas...');
        const { data: allClinics } = await supabase
          .from('clinics')
          .select('id, name, owner_id');
        console.log('🏥 Todas as clínicas:', allClinics);
        throw clinicError;
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          pacientes:paciente_dados_id (
            id,
            nome,
            email,
            telefone
          )
        `)
        .eq('clinica_id', clinicData.id)
        .order('data_hora', { ascending: true });

      console.log('📅 Agendamentos data:', data);
      console.log('❌ Agendamentos error:', error);
      console.log('📊 Total agendamentos encontrados:', data?.length || 0);

      if (error) throw error;
      setAppointments((data || []) as any);
      console.log('✅ Agendamentos carregados com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao carregar consultas:', error);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: newStatus as any })
        .eq('id', appointmentId);

      if (error) throw error;
      
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, status: newStatus } : app
        )
      );

      const statusMessages = {
        'confirmado': 'confirmada',
        'cancelado': 'cancelada',
        'concluido': 'concluída',
        'pendente': 'agendada'
      };
      const message = statusMessages[newStatus as keyof typeof statusMessages] || 'atualizada';
      toast.success(`Consulta ${message} com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da consulta');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'default' as const },
      confirmado: { label: 'Confirmada', variant: 'secondary' as const },
      concluido: { label: 'Concluída', variant: 'outline' as const },
      cancelado: { label: 'Cancelada', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const todayAppointments = appointments.filter(app => {
    const today = new Date();
    const appointmentDate = new Date(app.data_hora);
    return appointmentDate.toDateString() === today.toDateString();
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Consultas</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as consultas da sua clínica
        </p>
      </div>

      {/* Resumo do dia */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'confirmado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'pendente').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'cancelado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todas
        </Button>
        <Button
          variant={filter === 'pendente' ? 'default' : 'outline'}
          onClick={() => setFilter('pendente')}
          size="sm"
        >
          Pendentes
        </Button>
        <Button
          variant={filter === 'confirmado' ? 'default' : 'outline'}
          onClick={() => setFilter('confirmado')}
          size="sm"
        >
          Confirmadas
        </Button>
        <Button
          variant={filter === 'concluido' ? 'default' : 'outline'}
          onClick={() => setFilter('concluido')}
          size="sm"
        >
          Concluídas
        </Button>
      </div>

      {/* Lista de consultas */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma consulta encontrada</h3>
            <p className="text-muted-foreground">
              Não há consultas {filter !== 'all' ? 'com este status' : 'agendadas'}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {appointment.pacientes?.nome || 'Nome não informado'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {appointment.tipo_consulta || 'Consulta'}
                    </p>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">
                        {format(new Date(appointment.data_hora), "dd/MM/yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.data_hora), "EEEE", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">
                        {format(new Date(appointment.data_hora), 'HH:mm')}
                      </p>
                      <p className="text-sm text-muted-foreground">Horário</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{appointment.pacientes?.telefone || 'Não informado'}</p>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                    </div>
                  </div>
                </div>

                {appointment.valor && (
                  <div className="pt-4 border-t">
                    <p className="text-lg font-semibold text-primary">
                      {formatPrice(appointment.valor)}
                    </p>
                  </div>
                )}

                {appointment.observacoes && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Observações</h4>
                    <p className="text-sm text-muted-foreground">{appointment.observacoes}</p>
                  </div>
                )}

                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                  
                  {appointment.status === 'pendente' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmado')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelado')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}

                  {appointment.status === 'confirmado' && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => updateAppointmentStatus(appointment.id, 'concluido')}
                    >
                      Marcar como Concluída
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}