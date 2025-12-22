import { useAgendamentos } from '@/hooks/useAgendamentos';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveis';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';

interface ClinicAppointmentBookingProps {
  clinicId?: string;
  onAppointmentCreated?: (appointment: any) => void;
}

export const ClinicAppointmentBooking: React.FC<ClinicAppointmentBookingProps> = ({
  clinicId,
  onAppointmentCreated
}) => {
  // Hook para criação de agendamentos (Sistema interno)
  const { criarAgendamento, loading: agendamentoLoading } = useAgendamentos();
  // Hook para horários disponíveis (Sistema interno)
  const { obterHorariosDisponiveis, loading: horariosLoading } = useHorariosDisponiveis(clinicId || '');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  
  const [formData, setFormData] = useState({
    patient_name: '',
    mobile_phone: '',
    email: '',
    scheduling_reason: 'Consulta Odontológica',
    notes_patient: '',
  });



  // Carregar dias disponíveis do sistema interno
  useEffect(() => {
    const initializeBookingSystem = async () => {
      if (!clinicId) return;
      
      console.log('[ClinicAppointmentBooking] Inicializando sistema interno de agendamentos');
      
      // Carregar dias disponíveis (próximos 30 dias, excluindo fins de semana)
      const futureDates = [];
      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        // Pular fins de semana por padrão
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          futureDates.push(date);
        }
      }
      setAvailableDays(futureDates);
    };

    initializeBookingSystem();
  }, [clinicId]);

  // Carregar horários quando uma data é selecionada
  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimes();
    }
  }, [selectedDate]);

  const loadAvailableTimes = async () => {
    if (!selectedDate) return;
    
    console.log('[ClinicAppointmentBooking] === INICIANDO loadAvailableTimes ===');
    console.log('[ClinicAppointmentBooking] selectedDate:', selectedDate);
    console.log('[ClinicAppointmentBooking] clinicId:', clinicId);
    
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      console.log('[ClinicAppointmentBooking] Carregando horários via sistema interno para data:', dateStr);
      console.log('[ClinicAppointmentBooking] Tipo de selectedDate:', typeof selectedDate);
      console.log('[ClinicAppointmentBooking] Formatando data para:', dateStr);
      
      const times = await obterHorariosDisponiveis(dateStr);
      console.log('[ClinicAppointmentBooking] Horários do sistema interno (raw):', times);
      console.log('[ClinicAppointmentBooking] Tipo de times:', typeof times);
      console.log('[ClinicAppointmentBooking] Array.isArray(times):', Array.isArray(times));
      
      if (times && Array.isArray(times)) {
        console.log('[ClinicAppointmentBooking] Quantidade de horários recebidos:', times.length);
        
        // Filtrar apenas horários disponíveis e extrair a propriedade 'horario'
        const availableTimeSlots = times
          .filter(slot => {
            console.log('[ClinicAppointmentBooking] Verificando slot:', slot);
            console.log('[ClinicAppointmentBooking] Slot disponivel:', slot?.disponivel);
            return slot?.disponivel;
          })
          .map(slot => {
            console.log('[ClinicAppointmentBooking] Extraindo horario do slot:', slot);
            return slot.horario;
          });
        
        console.log('[ClinicAppointmentBooking] Horários disponíveis filtrados:', availableTimeSlots);
        console.log('[ClinicAppointmentBooking] Quantidade de horários disponíveis:', availableTimeSlots.length);
        
        const formattedTimes = availableTimeSlots.map(time => ({
          From: time,
          To: time
        }));
        
        console.log('[ClinicAppointmentBooking] Horários formatados:', formattedTimes);
        setAvailableTimes(formattedTimes);
      } else {
        console.log('[ClinicAppointmentBooking] Nenhum horário recebido ou formato inválido');
        setAvailableTimes([]);
      }
      
      setSelectedTime('');
    } catch (error) {
      console.error('[ClinicAppointmentBooking] ❌ Erro ao carregar horários:', error);
      setAvailableTimes([]);
      toast({
        title: "Erro",
        description: "Erro ao carregar horários disponíveis",
        variant: "destructive"
      });
    } finally {
      console.log('[ClinicAppointmentBooking] === FINALIZANDO loadAvailableTimes ===');
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma data e horário",
        variant: "destructive"
      });
      return;
    }

    if (!formData.patient_name || !formData.mobile_phone || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    // Validar se clinicId existe
    if (!clinicId) {
      toast({
        title: "Erro",
        description: "ID da clínica não encontrado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('📅 Criando agendamento via sistema interno');
      
      // Criar agendamento no sistema interno
      const agendamentoData = {
        paciente_id: user.id,
        clinica_id: clinicId,
        servico_id: 'default-service',
        profissional_id: undefined,
        data_hora: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`,
        status: 'pendente' as const,
        observacoes: formData.notes_patient || '',
        valor: 0
      };
      
      const result = await criarAgendamento(agendamentoData);
      
      if (result) {
        toast({
          title: "Sucesso!",
          description: "Agendamento criado com sucesso!"
        });
      }
      
      if (result) {
        // Reset form
        setFormData({
          patient_name: '',
          mobile_phone: '',
          email: '',
          scheduling_reason: 'Consulta Odontológica',
          notes_patient: '',
        });
        setSelectedDate(undefined);
        setSelectedTime('');
        setAvailableTimes([]);
        
        onAppointmentCreated?.(result);
      }
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto space-y-6 max-h-[80vh] overflow-y-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Agendar Consulta
        </h2>
        <p className="text-gray-600">
          Selecione uma data e horário disponível para sua consulta
        </p>
      </div>
      
      {/* Seleção de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Selecione a Data
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              // Desabilitar datas passadas e dias não disponíveis
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              if (date < today) return true;
              
              // Se temos dias disponíveis específicos, usar eles
              if (availableDays.length > 0) {
                return !availableDays.some(availableDay => 
                  availableDay.toDateString() === date.toDateString()
                );
              }
              
              return false;
            }}
            locale={ptBR}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dados do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Horários Disponíveis */}
            {selectedDate && (
              <div>
                <Label>Horários Disponíveis</Label>
                {console.log('[ClinicAppointmentBooking] Renderizando horários - selectedDate:', selectedDate)}
                {console.log('[ClinicAppointmentBooking] Renderizando horários - availableTimes:', availableTimes)}
                {console.log('[ClinicAppointmentBooking] Renderizando horários - loading:', loading)}
                {loading ? (
                  <div className="text-muted-foreground">Carregando horários...</div>
                ) : availableTimes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {availableTimes.map((time: any, index: number) => {
                      console.log('[ClinicAppointmentBooking] Renderizando botão de horário:', time);
                      return (
                        <Button
                          key={`${time.From}-${index}`}
                          type="button"
                          variant={selectedTime === time.From ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time.From)}
                        >
                          {time.From}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground">Nenhum horário disponível para esta data</div>
                )}
              </div>
            )}

            {/* Dados do Paciente */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <Label>Dados do Paciente</Label>
              </div>
              
              <div>
                <Label htmlFor="patient_name">Nome Completo *</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  placeholder="Nome completo do paciente"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobile_phone">Telefone *</Label>
                <Input
                  id="mobile_phone"
                  value={formData.mobile_phone}
                  onChange={(e) => handleInputChange('mobile_phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="scheduling_reason">Motivo da Consulta</Label>
                <Select 
                  value={formData.scheduling_reason} 
                  onValueChange={(value) => handleInputChange('scheduling_reason', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta Odontológica">Consulta Odontológica</SelectItem>
                    <SelectItem value="Limpeza">Limpeza</SelectItem>
                    <SelectItem value="Obturação">Obturação</SelectItem>
                    <SelectItem value="Extração">Extração</SelectItem>
                    <SelectItem value="Canal">Canal</SelectItem>
                    <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                    <SelectItem value="Prótese">Prótese</SelectItem>
                    <SelectItem value="Implante">Implante</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes_patient">Observações</Label>
                <Textarea
                  id="notes_patient"
                  value={formData.notes_patient}
                  onChange={(e) => handleInputChange('notes_patient', e.target.value)}
                  placeholder="Observações adicionais sobre o agendamento"
                  rows={3}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={agendamentoLoading || !selectedDate || !selectedTime}
              className="w-full"
            >
              {agendamentoLoading ? 'Confirmando Agendamento...' : 'Confirmar Agendamento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};