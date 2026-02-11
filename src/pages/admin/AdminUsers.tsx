import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
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

// Admin client to bypass RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'master' | 'clinic' | 'patient' | 'professional';
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

export default function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: ''
  });
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
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProfiles = (data || []).map((profile: any) => ({
        ...profile,
        role: profile.role || profile.user_type || 'patient',
        full_name: profile.full_name || profile.name || 'Usuário'
      }));

      setProfiles(formattedProfiles as any);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: totalCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: adminsCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).in('user_type', ['admin', 'master']);
      const { count: clinicsCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'clinic');
      const { count: patientsCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'patient');

      setStats({
        total: totalCount || 0,
        admins: adminsCount || 0,
        clinics: clinicsCount || 0,
        patients: patientsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await adminSupabase
        .from('profiles')
        .update({ user_type: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Função do usuário atualizada com sucesso');
      fetchProfiles();
      fetchStats();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar função do usuário');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await adminSupabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'bloqueado'} com sucesso`);
      fetchProfiles();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Erro ao atualizar status do usuário');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Você tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await adminSupabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário removido com sucesso');
      fetchProfiles();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  const handleEditOpen = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditFormData({
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone || '',
      role: profile.role
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProfile) return;

    try {
      const { error } = await adminSupabase
        .from('profiles')
        .update({
          full_name: editFormData.full_name,
          email: editFormData.email,
          phone: editFormData.phone,
          user_type: editFormData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso');
      setIsEditOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'master': return 'bg-destructive text-destructive-foreground';
      case 'clinic': return 'bg-primary text-primary-foreground';
      case 'patient': return 'bg-secondary text-secondary-foreground';
      case 'professional': return 'bg-indigo-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'master': return 'Master';
      case 'clinic': return 'Clínica';
      case 'patient': return 'Paciente';
      case 'professional': return 'Profissional';
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
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="patient">Paciente</SelectItem>
                    <SelectItem value="professional">Profissional</SelectItem>
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
                              <p className="font-medium flex items-center gap-2">
                                {profile.full_name}
                                {profile.is_active === false && (
                                  <Badge variant="destructive" className="text-[10px] h-4 px-1">Bloqueado</Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">ID: {profile.id.slice(0, 8)}...</p>
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
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProfile(profile);
                                  setIsViewOpen(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditOpen(profile)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                {profile.role !== 'admin' && profile.role !== 'master' && (
                                  <DropdownMenuItem
                                    onClick={() => updateUserRole(profile.id, 'admin')}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Tornar Admin
                                  </DropdownMenuItem>
                                )}
                                {profile.role !== 'master' && (
                                  <DropdownMenuItem
                                    onClick={() => updateUserRole(profile.id, 'master')}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Tornar Master
                                  </DropdownMenuItem>
                                )}
                                {profile.role !== 'clinic' && (
                                  <DropdownMenuItem
                                    onClick={() => updateUserRole(profile.id, 'clinic')}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Tornar Clínica
                                  </DropdownMenuItem>
                                )}
                                {profile.role !== 'patient' && (
                                  <DropdownMenuItem
                                    onClick={() => updateUserRole(profile.id, 'patient')}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Tornar Paciente
                                  </DropdownMenuItem>
                                )}
                                {profile.role !== 'professional' && (
                                  <DropdownMenuItem
                                    onClick={() => updateUserRole(profile.id, 'professional')}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Tornar Profissional
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteUser(profile.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleUserStatus(profile.id, profile.is_active ?? true)}
                                >
                                  {profile.is_active === false ? (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                      Desbloquear
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="h-4 w-4 mr-2 text-red-600" />
                                      Bloquear
                                    </>
                                  )}
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

        {/* View Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            {selectedProfile && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold text-sm">Nome</Label>
                  <div className="col-span-3 text-sm">{selectedProfile.full_name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold text-sm">E-mail</Label>
                  <div className="col-span-3 text-sm">{selectedProfile.email}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold text-sm">Telefone</Label>
                  <div className="col-span-3 text-sm">{selectedProfile.phone || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold text-sm">Função</Label>
                  <div className="col-span-3">
                    <Badge className={getRoleColor(selectedProfile.role)}>
                      {getRoleLabel(selectedProfile.role)}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold text-sm">Status</Label>
                  <div className="col-span-3">
                    {selectedProfile.is_active === false ? (
                      <Badge variant="destructive">Bloqueado</Badge>
                    ) : (
                      <Badge className="bg-green-500 text-white hover:bg-green-600">Ativo</Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold text-sm">Criado em</Label>
                  <div className="col-span-3 text-sm">{new Date(selectedProfile.created_at).toLocaleString('pt-BR')}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold text-sm">ID</Label>
                  <div className="col-span-3 text-xs text-muted-foreground font-mono">{selectedProfile.id}</div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select value={editFormData.role} onValueChange={(val: any) => setEditFormData({ ...editFormData, role: val })}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="patient">Paciente</SelectItem>
                    <SelectItem value="professional">Profissional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}