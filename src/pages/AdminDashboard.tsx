import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  Crown,
  Activity,
  Search,
  ArrowUpRight,
  Stethoscope,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PlansManager } from '@/components/admin/PlansManager';
import { supabase } from '@/integrations/supabase/client';

import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

// Admin client to bypass RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dbStats, setDbStats] = useState({
    users: 0,
    clinics: 0,
    activeClinics: 0,
    subscriptions: 0,
    appointmentsToday: 0
  });

  useEffect(() => {
    if (!loading && !roleLoading) {
      if (user && role === 'admin') {
        fetchRealStats();
      }
    }
  }, [user, role, loading, roleLoading]);

  const fetchRealStats = async () => {
    try {
      // Users
      const { count: usersCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true });

      // Clinics (Active vs Total)
      const { count: totalClinics } = await adminSupabase.from('clinics').select('*', { count: 'exact', head: true });
      const { count: activeClinics } = await adminSupabase.from('clinics').select('*', { count: 'exact', head: true }).eq('is_active', true);

      // Subscription estimate (those with a plan)
      const { count: subCount } = await adminSupabase.from('clinics').select('*', { count: 'exact', head: true }).not('subscription_plan', 'is', null);

      // Appointments Today
      const today = new Date().toISOString().split('T')[0];
      const { count: appointmentsToday } = await adminSupabase.from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .gte('data_hora', `${today}T00:00:00`)
        .lte('data_hora', `${today}T23:59:59`);

      setDbStats({
        users: usersCount || 0,
        clinics: totalClinics || 0,
        activeClinics: activeClinics || 0,
        subscriptions: subCount || 0,
        appointmentsToday: appointmentsToday || 0
      });

    } catch (e) {
      console.error("Error fetching admin stats", e);
    }
  };

  if (loading || roleLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'} min-h-screen`}>
        <AdminHeader />

        <div className="p-4 sm:p-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
              <p className="text-muted-foreground mt-1">Bem-vindo ao painel administrativo central.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => fetchRealStats()}>Atualizar Dados</Button>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary cursor-pointer" onClick={() => navigate('/admin/users')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbStats.users}</div>
                <p className="text-xs text-muted-foreground mt-1">Registrados na plataforma</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500 cursor-pointer" onClick={() => navigate('/admin/clinics')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Clínicas Ativas</CardTitle>
                <Building2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbStats.activeClinics} <span className="text-sm text-muted-foreground font-normal">/ {dbStats.clinics}</span></div>
                <p className="text-xs text-muted-foreground mt-1">Clínicas operando</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500 cursor-pointer" onClick={() => navigate('/admin/subscriptions')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Assinaturas</CardTitle>
                <Crown className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbStats.subscriptions}</div>
                <p className="text-xs text-muted-foreground mt-1">Planos contratados</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 cursor-pointer" onClick={() => navigate('/admin/appointments')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Consultas Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dbStats.appointmentsToday}</div>
                <p className="text-xs text-muted-foreground mt-1">Agendadas para hoje</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Command Center */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-indigo-500" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>Gerencie o sistema com um clique</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="secondary" className="h-24 flex flex-col gap-2" onClick={() => navigate('/admin/credentialing')}>
                  <Stethoscope className="h-6 w-6" />
                  Aprovar Médicos
                </Button>
                <Button variant="secondary" className="h-24 flex flex-col gap-2" onClick={() => navigate('/admin/credit-management')}>
                  <CreditCard className="h-6 w-6" />
                  Análise de Crédito
                </Button>
                <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 border-red-100 dark:border-red-900" onClick={() => navigate('/admin/users')}>
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                  Bloquear Usuários
                </Button>
                <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 border-purple-100 dark:border-purple-900" onClick={() => navigate('/admin/subscriptions')}>
                  <Crown className="h-6 w-6 text-purple-600" />
                  Gerenciar Planos
                </Button>
              </CardContent>
            </Card>

            {/* System Overview - Placeholder Removed */}
          </div>

          <Tabs defaultValue="plans">
            <TabsList>
              <TabsTrigger value="plans">Gestão de Planos</TabsTrigger>
            </TabsList>
            <TabsContent value="plans" className="mt-4">
              <PlansManager />
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}