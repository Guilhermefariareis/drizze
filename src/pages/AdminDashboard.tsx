import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PlansManager } from '@/components/admin/PlansManager';

import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !roleLoading) {
      if (!user) {
        navigate('/clinic-login');
        return;
      }
      
      if (role !== 'admin') {
        navigate('/');
        return;
      }
    }
  }, [user, role, loading, roleLoading, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  const stats = [
    {
      title: "Total de Usuários",
      value: "12,345",
      change: "+12%",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Clínicas Ativas",
      value: "856",
      change: "+8%",
      icon: Building2,
      color: "text-success"
    },
    {
      title: "Consultas Hoje",
      value: "2,341",
      change: "+15%",
      icon: Calendar,
      color: "text-warning"
    },
    {
      title: "Receita Mensal",
      value: "R$ 124.500",
      change: "+25%",
      icon: DollarSign,
      color: "text-accent"
    }
  ];

  const recentUsers = [
    { id: 1, name: "João Silva", email: "joao@email.com", status: "ativo", createdAt: "2024-01-15" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", status: "ativo", createdAt: "2024-01-14" },
    { id: 3, name: "Carlos Lima", email: "carlos@email.com", status: "pendente", createdAt: "2024-01-13" }
  ];

  const recentClinics = [
    { id: 1, name: "Clínica Dental doltorizze", city: "São Paulo", status: "aprovada", createdAt: "2024-01-15" },
    { id: 2, name: "Odonto Excellence", city: "Rio de Janeiro", status: "pendente", createdAt: "2024-01-14" },
    { id: 3, name: "Sorriso Perfeito", city: "Belo Horizonte", status: "aprovada", createdAt: "2024-01-13" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
      case 'aprovada': return 'bg-success text-success-foreground';
      case 'pendente': return 'bg-warning text-warning-foreground';
      case 'inativo':
      case 'rejeitada': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'} min-h-screen`}>
        <AdminHeader />
        
        <div className="p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                        {stat.title}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold truncate">{stat.value}</p>
                      <p className="text-xs text-success font-medium">
                        {stat.change} vs mês anterior
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="plans" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-1 min-w-max">
                <TabsTrigger value="plans" className="text-xs sm:text-sm">Planos</TabsTrigger>
              </TabsList>
            </div>



            {/* Plans */}
            <TabsContent value="plans" className="space-y-6">
              <PlansManager />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}