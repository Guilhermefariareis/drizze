import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowUp, 
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppointmentMetrics } from '@/hooks/useAppointmentMetrics';
import { useClinicorpPatients } from '@/hooks/useClinicorpPatients';

interface MetricsProps {
  clinicId?: string;
}

export const ClinicDashboardMetrics: React.FC<MetricsProps> = ({ clinicId }) => {
  const { metrics: appointmentMetrics, loading: appointmentsLoading, error } = useAppointmentMetrics();
  const { patients, listPatients, loading: patientsLoading } = useClinicorpPatients();
  
  const [patientMetrics, setPatientMetrics] = useState({
    total: 0,
    new: 0,
    growth: 0,
    returning: 0
  });

  // Carregar dados de pacientes do Clinicorp
  useEffect(() => {
    const loadPatientData = async () => {
      if (clinicId) {
        try {
          await listPatients(undefined, clinicId);
        } catch (error) {
          console.error('Erro ao carregar dados de pacientes:', error);
        }
      }
    };
    
    loadPatientData();
  }, [clinicId, listPatients]);

  // Calcular métricas de pacientes
  useEffect(() => {
    // Verificação de segurança para evitar erro de undefined
    if (!patients || !Array.isArray(patients)) {
      return;
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calcular estatísticas de pacientes
    const totalPatients = patients.length;
    const newPatients = patients.filter(patient => {
      if (!patient.created_at) return false;
      const createdDate = new Date(patient.created_at);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    setPatientMetrics({
      total: totalPatients,
      new: newPatients,
      growth: 0, // Não temos dados históricos para calcular crescimento
      returning: Math.max(0, totalPatients - newPatients)
    });
  }, [patients]);

  // Dados dos gráficos baseados em dados reais
  const appointmentData = (appointmentMetrics?.monthlyData || []).map(data => ({
    name: data.month,
    agendamentos: data.appointments,
    receita: data.revenue
  }));

  // Dados fictícios para especialidades (pode ser implementado futuramente)
  const specialtyData = [
    { name: 'Clínica Geral', value: 40, color: '#0088FE' },
    { name: 'Ortodontia', value: 25, color: '#00C49F' },
    { name: 'Endodontia', value: 20, color: '#FFBB28' },
    { name: 'Periodontia', value: 15, color: '#FF8042' }
  ];

  // Mostrar loading se ainda estiver carregando
  if (appointmentsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Erro ao carregar dados: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{appointmentMetrics?.thisMonth || 0}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {(appointmentMetrics?.growth?.appointments || 0) > 0 ? (
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={(appointmentMetrics?.growth?.appointments || 0) > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(appointmentMetrics?.growth?.appointments || 0)}%
                </span>
                <span className="ml-1">vs mês anterior</span>
              </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientMetrics.total}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">{patientMetrics.growth}%</span>
              <span className="ml-1">novos este mês: {patientMetrics.new}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                R$ {(appointmentMetrics?.revenue?.thisMonth || 0).toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-500">{Math.abs(appointmentMetrics?.growth?.revenue || 0)}%</span>
                <span className="ml-1">vs mês anterior</span>
              </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Satisfação média</span>
              </div>
            </CardContent>
        </Card>
      </div>



      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos e Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="agendamentos" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Especialidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};