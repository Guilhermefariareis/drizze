import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClinicorpPatients } from '@/hooks/useClinicorpPatients';
import { useClinicorpAppointments } from '@/hooks/useClinicorpAppointments';
import { useClinicorpFinancial } from '@/hooks/useClinicorpFinancial';
import ClinicorpStatusBadge from './ClinicorpStatusBadge';
import ClinicorpPatientsManager from './ClinicorpPatientsManager';
import ClinicorpAppointmentsManager from './ClinicorpAppointmentsManager';
import ClinicorpFinancialManager from './ClinicorpFinancialManager';
import ClinicorpCredentialsForm from './ClinicorpCredentialsForm';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Plus,
  FileText
} from 'lucide-react';

interface ClinicorpDashboardProps {
  clinicId?: string;
}

export default function ClinicorpDashboard({ clinicId }: ClinicorpDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    patients: { total: 0, new: 0 },
    appointments: { today: 0, pending: 0 },
    financial: { revenue: 0, pending: 0 }
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { 
    patients, 
    loading: patientsLoading, 
    listPatients,
    getUpcomingBirthdays 
  } = useClinicorpPatients();

  const { 
    appointments, 
    loading: appointmentsLoading, 
    getTodayAppointments,
    listAppointments 
  } = useClinicorpAppointments();

  const { 
    loading: financialLoading, 
    getFinancialSummary,
    getOverdueInvoices 
  } = useClinicorpFinancial();

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // Reativar carregamento com suppressToast
      await Promise.allSettled([
        loadPatientData(),
        loadAppointmentData(),
        loadFinancialData()
      ]);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    // Reativar carregamento automático com suppressToast
    loadDashboardData();
  }, [clinicId]);

  const loadPatientData = async () => {
    try {
      const patientsData = await listPatients(undefined, clinicId, true); // suppressToast = true
      const birthdays = await getUpcomingBirthdays(7, clinicId, true); // suppressToast = true
      
      const patientsArray = Array.isArray(patientsData) 
        ? patientsData 
        : (patientsData?.list || []);
        
      const birthdaysArray = Array.isArray(birthdays) 
        ? birthdays 
        : (birthdays?.list || []);
      
      setDashboardData(prev => ({
        ...prev,
        patients: {
          total: patientsArray?.length || 0,
          new: birthdaysArray?.length || 0
        }
      }));
    } catch (error: any) {
      console.error('Error loading patient data:', error);
      // Silencioso - não mostra toast
    }
  };

  const loadAppointmentData = async () => {
    try {
      const todayAppointments = await getTodayAppointments(clinicId);
      const allAppointments = await listAppointments(undefined, clinicId, true); // suppressToast = true
      
      const todayArray = Array.isArray(todayAppointments) 
        ? todayAppointments 
        : ((todayAppointments as any)?.list || []);
        
      const allArray = Array.isArray(allAppointments) 
        ? allAppointments 
        : ((allAppointments as any)?.list || []);
      
      const pendingAppointments = allArray?.filter(
        (apt: any) => apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'scheduled'
      ) || [];

      setDashboardData(prev => ({
        ...prev,
        appointments: {
          today: todayArray?.length || 0,
          pending: pendingAppointments.length
        }
      }));
    } catch (error) {
      console.error('Error loading appointment data:', error);
    }
  };

  const loadFinancialData = async () => {
    try {
      const summary = await getFinancialSummary(undefined, undefined, clinicId, true); // suppressToast = true
      const overdueInvoices = await getOverdueInvoices(clinicId, true); // suppressToast = true
      
      const summaryData = summary || {};
      const overdueArray = Array.isArray(overdueInvoices) 
        ? overdueInvoices 
        : ((overdueInvoices as any)?.list || []);
      
      const overdueAmount = overdueArray.reduce((acc: number, inv: any) => acc + (inv.amount || 0), 0);
      
      setDashboardData(prev => ({
        ...prev,
        financial: {
          revenue: summaryData.month_revenue || 0,
          pending: overdueAmount
        }
      }));
    } catch (error: any) {
      console.error('Error loading financial data:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const isLoading = patientsLoading || appointmentsLoading || financialLoading;

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clinicorp Dashboard</h2>
          <p className="text-muted-foreground">
            Acompanhe os dados da sua clínica em tempo real
          </p>
        </div>
        <ClinicorpStatusBadge />
      </div>

      {/* Overview Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="w-full">
          <CardContent className="w-full p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Pacientes
                </p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : dashboardData.patients.total}
                </p>
                {dashboardData.patients.new > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.patients.new} aniversários esta semana
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="w-full p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Agendamentos Hoje
                </p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : dashboardData.appointments.today}
                </p>
                {dashboardData.appointments.pending > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.appointments.pending} pendentes
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="w-full p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receita do Mês
                </p>
                <p className="text-xl font-bold">
                  {isLoading ? '...' : formatCurrency(dashboardData.financial.revenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="w-full p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Valores em Atraso
                </p>
                <p className="text-xl font-bold">
                  {isLoading ? '...' : formatCurrency(dashboardData.financial.pending)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="w-full">
        <CardHeader className="w-full">
          <CardTitle className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ações Rápidas
            </div>
            <Button 
              onClick={loadDashboardData} 
              disabled={isLoadingData}
              variant="default"
              size="sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {isLoadingData ? 'Carregando...' : 'Atualizar Dados'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex-col w-full"
              onClick={() => setActiveTab('patients')}
            >
              <Plus className="h-5 w-5 mb-1" />
              Novo Paciente
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col w-full"
              onClick={() => setActiveTab('appointments')}
            >
              <Calendar className="h-5 w-5 mb-1" />
              Novo Agendamento
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col w-full"
              onClick={() => setActiveTab('financial')}
            >
              <FileText className="h-5 w-5 mb-1" />
              Nova Fatura
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-none grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="w-full space-y-4">
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle>Resumo Rápido</CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <div className="w-full space-y-2">
                <h4 className="font-medium mb-2">Pacientes Recentes:</h4>
                {dashboardData.patients.total > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Total de {dashboardData.patients.total} pacientes cadastrados
                    </p>
                    {dashboardData.patients.new > 0 && (
                      <p className="text-sm text-green-600">
                        {dashboardData.patients.new} com aniversário esta semana
                      </p>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('patients')}>
                      Ver Gerenciador de Pacientes
                    </Button>
                  </div>
                ) : patients.length > 0 ? (
                  <div className="space-y-2">
                    {patients.slice(0, 3).map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.email}</p>
                        </div>
                        <Badge variant="outline">
                          {patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </Badge>
                      </div>
                    ))}
                    
                    {patients.length > 3 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('patients')}>
                          Ver todos os {patients.length} pacientes
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhum paciente encontrado. 
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadPatientData}
                    >
                      Carregar Pacientes do Clinicorp
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="w-full space-y-4">
          <ClinicorpPatientsManager clinicId={clinicId} />
        </TabsContent>

        <TabsContent value="appointments" className="w-full space-y-4">
          <ClinicorpAppointmentsManager clinicId={clinicId} />
        </TabsContent>

        <TabsContent value="financial" className="w-full space-y-4">
          <ClinicorpFinancialManager clinicId={clinicId} />
        </TabsContent>

        <TabsContent value="settings" className="w-full space-y-4">
          <ClinicorpCredentialsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}