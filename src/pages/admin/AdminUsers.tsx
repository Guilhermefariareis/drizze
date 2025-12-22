import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, MoreHorizontal, Users, UserCheck, UserX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'clinic' | 'patient';
  created_at: string;
  updated_at: string;
};

export default function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    clinics: 0,
    patients: 0
  });

  useEffect(() => {
    fetchProfiles();
    fetchStats();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles((data || []) as any);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Total users
      const { data: totalData } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      // Users by role
      const { data: adminsData } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin');

      const { data: clinicsData } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'clinic');

      const { data: patientsData } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'patient');

      setStats({
        total: totalData?.length || 0,
        admins: adminsData?.length || 0,
        clinics: clinicsData?.length || 0,
        patients: patientsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'clinic' | 'patient') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Função do usuário atualizada com sucesso');
      fetchProfiles();
      fetchStats();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar função do usuário');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Usuário removido com sucesso');
      fetchProfiles();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'clinic': return 'bg-primary text-primary-foreground';
      case 'patient': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'clinic': return 'Clínica';
      case 'patient': return 'Paciente';
      default: return role;
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Visualize e gerencie todos os usuários da plataforma</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <UserCheck className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold">{stats.admins}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Users className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Clínicas</p>
                    <p className="text-2xl font-bold">{stats.clinics}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <UserX className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pacientes</p>
                    <p className="text-2xl font-bold">{stats.patients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Lista de Usuários</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome ou e-mail..." 
                    className="pl-10" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as funções</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="patient">Paciente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Carregando usuários...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Atualizado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map(profile => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{profile.full_name}</p>
                              <p className="text-sm text-muted-foreground">ID: {profile.user_id.slice(0, 8)}...</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{profile.email}</p>
                              <p className="text-sm text-muted-foreground">{profile.phone || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(profile.role)}>
                              {getRoleLabel(profile.role)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(profile.updated_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                {profile.role !== 'admin' && (
                                  <DropdownMenuItem 
                                    onClick={() => updateUserRole(profile.user_id, 'admin')}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Tornar Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => deleteUser(profile.user_id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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