import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useClinicorpAppointments } from '@/hooks/useClinicorpAppointments';
import { useClinicorpApi } from '@/hooks/useClinicorpApi';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ClinicorpAppointmentsManagerProps {
  clinicId?: string;
}

export default function ClinicorpAppointmentsManager({ clinicId }: ClinicorpAppointmentsManagerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const {
    appointments,
    professionals,
    loading,
    listAppointments,
    listProfessionals,
    getAppointmentsByDateRange
  } = useClinicorpAppointments();

  const { credentials, reloadCredentials } = useClinicorpApi();

  useEffect(() => {
    if (credentials) {
  
      loadInitialData();
    } else {
  
      reloadCredentials();
    }
  }, [credentials, clinicId]);

  useEffect(() => {

    loadAppointmentsByDate();
  }, [selectedDate]);

  const loadInitialData = async () => {
    await Promise.all([
      listProfessionals(undefined, clinicId),
      loadAppointmentsByDate()
    ]);
  };

  const loadAppointmentsByDate = async () => {
    const result = await getAppointmentsByDateRange(selectedDate, selectedDate, clinicId);
  };



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Visualizar Agendamentos Clinicorp</h3>
          <p className="text-muted-foreground">
            {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} para {new Date(selectedDate).toLocaleDateString('pt-BR')} (Somente Leitura)
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Label htmlFor="date-filter">Data:</Label>
          <Input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
        <Button variant="outline" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
          Hoje
        </Button>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendamentos do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando agendamentos...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum agendamento para esta data
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horário</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {appointment.appointment_time}
                      </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-1">
                           <User className="h-3 w-3" />
                           {appointment.patient_name || 'Paciente'}
                         </div>
                       </TableCell>
                       <TableCell>{appointment.procedure}</TableCell>
                       <TableCell>
                         {appointment.professional_name || 'Não especificado'}
                       </TableCell>
                       <TableCell>{appointment.duration}min</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}