import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

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
  };
}

function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Primeiro buscar o profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        toast.error('Erro ao carregar perfil do usuário');
        return;
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clinics (
            id,
            name,
            phone,
            address,
            rating
          )
        `)
        .eq('paciente_id', user.id)
        .order('data_hora', { ascending: true });

      if (error) throw error;
      setAppointments((data || []) as any);
    } catch (error: any) {
      console.error('Erro ao carregar consultas:', error);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'default' as const },
      confirmado: { label: 'Confirmado', variant: 'secondary' as const },
      concluido: { label: 'Concluído', variant: 'outline' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const },
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

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="container mx-auto py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Minhas Consultas</h1>
              <p className="text-muted-foreground">
                Carregando suas consultas...
              </p>
            </div>
            
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Minhas Consultas</h1>
            <p className="text-muted-foreground">
              Acompanhe suas consultas agendadas e histórico de atendimentos
            </p>
          </div>

          {appointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma consulta encontrada</h3>
                <p className="text-muted-foreground">
                  Você ainda não possui consultas agendadas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">
                          {appointment.clinics.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{appointment.clinics.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">
                              {format(new Date(appointment.data_hora), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.data_hora), 'yyyy')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">
                              {format(new Date(appointment.data_hora), 'HH:mm')}
                            </p>
                            <p className="text-sm text-muted-foreground">Horário agendado</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{appointment.tipo_consulta || 'Consulta'}</p>
                            <p className="text-sm text-muted-foreground">Tipo de atendimento</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-primary mt-1" />
                          <div>
                            <p className="font-medium">Endereço da clínica</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.clinics.address ? 
                                `${appointment.clinics.address.street || ''}, ${appointment.clinics.address.number || ''} - ${appointment.clinics.address.neighborhood || ''}, ${appointment.clinics.address.city || ''} - ${appointment.clinics.address.state || ''}` :
                                'Endereço não informado'
                              }
                            </p>
                          </div>
                        </div>

                        {appointment.clinics.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium">{appointment.clinics.phone}</p>
                              <p className="text-sm text-muted-foreground">Telefone da clínica</p>
                            </div>
                          </div>
                        )}

                        {appointment.valor && (
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-xs text-white font-bold">R$</span>
                            </div>
                            <div>
                              <p className="font-medium">{formatPrice(appointment.valor)}</p>
                              <p className="text-sm text-muted-foreground">Valor da consulta</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {appointment.observacoes && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Observações</h4>
                        <p className="text-sm text-muted-foreground">{appointment.observacoes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      {(appointment.status === 'pendente' || appointment.status === 'confirmado') && (
                        <>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Reagendar
                          </Button>
                          <Button variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      {appointment.status === 'concluido' && (
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-2" />
                          Avaliar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientAppointments;