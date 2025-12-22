import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AppointmentMetrics {
  total: number;
  thisMonth: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  revenue: {
    total: number;
    thisMonth: number;
    pending: number;
  };
  growth: {
    appointments: number;
    revenue: number;
  };
  upcomingAppointments: Array<{
    id: string;
    patient_name: string;
    appointment_date: string;
    service: string;
    status: string;
  }>;
  monthlyData: Array<{
    month: string;
    appointments: number;
    revenue: number;
  }>;
}

export const useAppointmentMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AppointmentMetrics>({
    total: 0,
    thisMonth: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    revenue: {
      total: 0,
      thisMonth: 0,
      pending: 0,
    },
    growth: {
      appointments: 0,
      revenue: 0,
    },
    upcomingAppointments: [],
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointmentMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Primeiro buscar a clínica do usuário
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (clinicError) throw clinicError;
      if (!clinicData) {
        setMetrics({
          total: 0,
          thisMonth: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          revenue: { total: 0, thisMonth: 0, pending: 0 },
          growth: { appointments: 0, revenue: 0 },
          upcomingAppointments: [],
          monthlyData: [],
        });
        return;
      }

      const clinicId = clinicData.id;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      const firstDayOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastDayOfLastMonth = new Date(currentYear, currentMonth, 0);

      // Buscar todos os agendamentos da clínica
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_date,
          status,
          price,
          patient_id
        `)
        .eq('clinic_id', clinicId)
        .order('scheduled_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      const appointmentsList = appointments || [];

      // Calcular métricas do mês atual
      const thisMonthAppointments = appointmentsList.filter(apt => {
        const aptDate = new Date(apt.scheduled_date);
        return aptDate >= firstDayOfMonth && aptDate <= lastDayOfMonth;
      });

      // Calcular métricas do mês anterior para comparação
      const lastMonthAppointments = appointmentsList.filter(apt => {
        const aptDate = new Date(apt.scheduled_date);
        return aptDate >= firstDayOfLastMonth && aptDate <= lastDayOfLastMonth;
      });

      // Contar por status
      const pending = thisMonthAppointments.filter(apt => apt.status === 'scheduled').length;
      const confirmed = thisMonthAppointments.filter(apt => apt.status === 'confirmed').length;
      const cancelled = thisMonthAppointments.filter(apt => apt.status === 'cancelled').length;
      const completed = thisMonthAppointments.filter(apt => apt.status === 'completed').length;

      // Calcular receita
      const thisMonthRevenue = thisMonthAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      const lastMonthRevenue = lastMonthAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      const totalRevenue = appointmentsList
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      const pendingRevenue = appointmentsList
        .filter(apt => ['scheduled', 'confirmed'].includes(apt.status))
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      // Calcular crescimento
      const appointmentGrowth = lastMonthAppointments.length > 0 
        ? ((thisMonthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100
        : 0;

      const revenueGrowth = lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      // Próximos agendamentos (próximos 7 dias)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingAppointments = appointmentsList
        .filter(apt => {
          const aptDate = new Date(apt.scheduled_date);
          return aptDate >= now && aptDate <= nextWeek && ['scheduled', 'confirmed'].includes(apt.status);
        })
        .slice(0, 5)
        .map(apt => ({
          id: apt.id,
          patient_name: 'Paciente',
          appointment_date: apt.scheduled_date,
          service: 'Consulta',
          status: apt.status,
        }));

      // Dados mensais para gráficos (últimos 6 meses)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentYear, currentMonth - i, 1);
        const nextMonthDate = new Date(currentYear, currentMonth - i + 1, 0);
        
        const monthAppointments = appointmentsList.filter(apt => {
          const aptDate = new Date(apt.scheduled_date);
          return aptDate >= monthDate && aptDate <= nextMonthDate;
        });

        const monthRevenue = monthAppointments
          .filter(apt => apt.status === 'completed')
          .reduce((sum, apt) => sum + (apt.price || 0), 0);

        monthlyData.push({
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short' }),
          appointments: monthAppointments.length,
          revenue: monthRevenue,
        });
      }

      setMetrics({
        total: appointmentsList.length,
        thisMonth: thisMonthAppointments.length,
        pending,
        confirmed,
        cancelled,
        completed,
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          pending: pendingRevenue,
        },
        growth: {
          appointments: appointmentGrowth,
          revenue: revenueGrowth,
        },
        upcomingAppointments,
        monthlyData,
      });

    } catch (err) {
      console.error('Erro ao buscar métricas de agendamentos:', err);
      setError('Erro ao carregar dados de agendamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentMetrics();
  }, [user]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchAppointmentMetrics,
  };
};