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
import { Search, Filter, Download, Crown, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Admin client to bypass RLS
const adminSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

type ClinicSubscription = {
    id: string;
    name: string;
    city: string;
    state: string;
    subscription_plan: string | null;
    is_active: boolean;
    created_at: string;
};

type PlanStats = {
    name: string;
    count: number;
    revenue: number; // Estimated based on plan prices if available
};

type SubscriptionPlan = {
    id: number;
    name: string;
    price_monthly: number;
    price_annual: number;
};

export default function AdminSubscriptions() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [clinics, setClinics] = useState<ClinicSubscription[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch plans to get names and prices
            const { data: plansData, error: plansError } = await adminSupabase
                .from('subscription_plans')
                .select('*');

            if (plansError) throw plansError;
            setPlans(plansData || []);

            // Fetch clinics with their subscription info
            const { data: clinicsData, error: clinicsError } = await adminSupabase
                .from('clinics')
                .select('id, name, city, state, subscription_plan, is_active, created_at')
                .order('created_at', { ascending: false });

            if (clinicsError) throw clinicsError;
            setClinics(clinicsData as any || []);

        } catch (error) {
            console.error('Error fetching subscription data:', error);
            toast.error('Erro ao carregar dados de assinaturas');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const stats = clinics.reduce((acc, clinic) => {
        const planName = clinic.subscription_plan || 'Sem Plano';
        if (!acc[planName]) {
            acc[planName] = { count: 0, revenue: 0 };
        }
        acc[planName].count++;

        // Estimate revenue (monthly price)
        const planDetails = plans.find(p => p.name === planName);
        if (planDetails) {
            acc[planName].revenue += planDetails.price_monthly;
        }

        return acc;
    }, {} as Record<string, { count: number, revenue: number }>);

    // Helper for total revenue
    const totalMonthlyRevenue = Object.values(stats).reduce((acc, curr) => acc + curr.revenue, 0);

    const filteredClinics = clinics.filter(clinic => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            clinic.city?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = planFilter === 'all' || (clinic.subscription_plan || 'Sem Plano') === planFilter;
        return matchesSearch && matchesPlan;
    });

    const getPlanColor = (plan: string | null) => {
        if (!plan) return 'bg-gray-100 text-gray-800';
        if (plan.toLowerCase().includes('premium') || plan.toLowerCase().includes('ouro')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (plan.toLowerCase().includes('pro') || plan.toLowerCase().includes('prata')) return 'bg-gray-200 text-gray-900 border-gray-300';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="min-h-screen bg-background flex">
            <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                <AdminHeader />

                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Gestão de Assinaturas</h1>
                        <p className="text-muted-foreground">Monitore os planos ativos e receitas recorrentes</p>
                    </div>

                    {/* Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-indigo-100 font-medium mb-1">Receita Mensal Estimada</p>
                                        <h3 className="text-3xl font-bold">{formatCurrency(totalMonthlyRevenue)}</h3>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Crown className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-muted-foreground font-medium mb-1">Total de Assinantes</p>
                                        <h3 className="text-3xl font-bold">{clinics.filter(c => c.subscription_plan).length}</h3>
                                        <p className="text-xs text-green-600 mt-1 flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Ativos
                                        </p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-muted-foreground font-medium mb-1">Sem Plano</p>
                                        <h3 className="text-3xl font-bold">{clinics.filter(c => !c.subscription_plan).length}</h3>
                                        <p className="text-xs text-orange-600 mt-1 flex items-center">
                                            <XCircle className="w-3 h-3 mr-1" /> Potenciais
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <XCircle className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <CardTitle>Detalhamento por Clínica</CardTitle>
                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar Relatório
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mt-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar clínica ou cidade..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={planFilter} onValueChange={setPlanFilter}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder="Filtrar por Plano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Planos</SelectItem>
                                        <SelectItem value="Sem Plano">Sem Plano</SelectItem>
                                        {plans.map(plan => (
                                            <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Clínica</TableHead>
                                                <TableHead>Localização</TableHead>
                                                <TableHead>Plano Atual</TableHead>
                                                <TableHead>Status da Conta</TableHead>
                                                <TableHead>Desde</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredClinics.map((clinic) => (
                                                <TableRow key={clinic.id}>
                                                    <TableCell className="font-medium">{clinic.name}</TableCell>
                                                    <TableCell>{clinic.city}, {clinic.state}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`font-normal ${getPlanColor(clinic.subscription_plan)}`}>
                                                            {clinic.subscription_plan || 'Sem Plano'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <div className={`w-2 h-2 rounded-full mr-2 ${clinic.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                            {clinic.is_active ? 'Ativa' : 'Inativa'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">Gerenciar</Button>
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
            </div>
        </div>
    );
}
