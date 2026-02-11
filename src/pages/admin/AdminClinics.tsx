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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@supabase/supabase-js';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  MapPin,
  Star,
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Admin client to bypass RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

type Clinic = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function AdminClinics() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    cities: 0,
    avgRating: 0
  });

  useEffect(() => {
    fetchClinics();
    fetchStats();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const { data, error } = await adminSupabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClinics(data as any);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast.error('Erro ao carregar clínicas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Total clinics
      const { count: totalCount } = await adminSupabase
        .from('clinics')
        .select('*', { count: 'exact', head: true });

      // Active clinics
      const { count: activeCount } = await adminSupabase
        .from('clinics')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Unique cities
      const { data: citiesData } = await adminSupabase
        .from('clinics')
        .select('city')
        .eq('is_active', true);

      // Average rating
      const { data: ratingData } = await adminSupabase
        .from('clinics')
        .select('rating')
        .eq('is_active', true)
        .gt('rating', 0);

      const uniqueCities = new Set(citiesData?.map(c => c.city) || []).size;
      const avgRating = ratingData?.length
        ? ratingData.reduce((acc, c) => acc + (c.rating || 0), 0) / ratingData.length
        : 0;

      setStats({
        total: totalCount || 0,
        active: activeCount || 0,
        cities: uniqueCities,
        avgRating: Math.round(avgRating * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching clinic stats:', error);
    }
  };

  const updateClinicStatus = async (clinicId: string, currentStatus: boolean) => {
    try {
      const { error } = await adminSupabase
        .from('clinics')
        .update({ is_active: !currentStatus })
        .eq('id', clinicId);

      if (error) throw error;

      toast.success(`Clínica ${!currentStatus ? 'ativada' : 'inativada'} com sucesso`);
      fetchClinics();
      fetchStats();
    } catch (error) {
      console.error('Error updating clinic status:', error);
      toast.error('Erro ao atualizar status da clínica');
    }
  };

  const handleEditOpen = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setEditFormData({
      name: clinic.name,
      email: clinic.email || '',
      phone: clinic.phone,
      address: typeof clinic.address === 'string' ? clinic.address : '',
      city: clinic.city,
      state: clinic.state
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedClinic) return;

    try {
      const { error } = await adminSupabase
        .from('clinics')
        .update({
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          address: editFormData.address,
          city: editFormData.city,
          state: editFormData.state,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedClinic.id);

      if (error) throw error;

      toast.success('Clínica atualizada com sucesso');
      setIsEditOpen(false);
      fetchClinics();
    } catch (error) {
      console.error('Error updating clinic:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  const deleteClinic = async (clinicId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await adminSupabase
        .from('clinics')
        .delete()
        .eq('id', clinicId);

      if (error) throw error;

      toast.success('Clínica removida com sucesso');
      fetchClinics();
      fetchStats();
    } catch (error) {
      console.error('Error deleting clinic:', error);
      toast.error('Erro ao remover clínica');
    }
  };

  const getStatusDisplay = (isActive: boolean) => {
    return isActive ? 'Ativa' : 'Inativa';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground';
  };

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && clinic.is_active) ||
      (statusFilter === 'inactive' && !clinic.is_active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Clínicas</h1>
            <p className="text-muted-foreground">Visualize e gerencie todas as clínicas da plataforma</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Star className="h-4 w-4 text-primary" />
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
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Clock className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ativas</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cidades</p>
                    <p className="text-2xl font-bold">{stats.cities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Star className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                    <p className="text-2xl font-bold">{stats.avgRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Lista de Clínicas</CardTitle>
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
                    placeholder="Buscar por nome ou cidade..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Carregando clínicas...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clínica</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Avaliação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criada em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClinics.map(clinic => (
                        <TableRow key={clinic.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{clinic.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {clinic.id.slice(0, 8)}...</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{clinic.email || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{clinic.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{clinic.city}, {clinic.state}</p>
                              <p className="text-sm text-muted-foreground">
                                {(() => {
                                  const addr = clinic.address;
                                  if (typeof addr === 'object' && addr !== null) {
                                    const addressObj = addr as { street?: string; neighborhood?: string; city?: string; state?: string };
                                    const parts = [
                                      addressObj.street,
                                      addressObj.neighborhood,
                                      addressObj.city,
                                      addressObj.state
                                    ].filter(Boolean);
                                    return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
                                  }
                                  return addr || 'Endereço não informado';
                                })()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {clinic.rating > 0 ? (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-warning text-warning" />
                                <span className="text-sm font-medium">{clinic.rating}</span>
                                <span className="text-xs text-muted-foreground">({clinic.total_reviews})</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Sem avaliações</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(clinic.is_active)}>
                              {getStatusDisplay(clinic.is_active)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
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
                                  setSelectedClinic(clinic);
                                  setIsViewOpen(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditOpen(clinic)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateClinicStatus(clinic.id, clinic.is_active)}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  {clinic.is_active ? 'Desativar' : 'Ativar'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteClinic(clinic.id)}
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
      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Clínica</DialogTitle>
          </DialogHeader>
          {selectedClinic && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-sm">Nome</Label>
                <div className="col-span-3 text-sm">{selectedClinic.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-sm">Cidade</Label>
                <div className="col-span-3 text-sm">{selectedClinic.city} - {selectedClinic.state}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-sm">Endereço</Label>
                <div className="col-span-3 text-sm">
                  {typeof selectedClinic.address === 'string'
                    ? selectedClinic.address
                    : 'Endereço complexo (ver banco de dados)'}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-sm">E-mail</Label>
                <div className="col-span-3 text-sm">{selectedClinic.email || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-sm">Telefone</Label>
                <div className="col-span-3 text-sm">{selectedClinic.phone}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-sm">Status</Label>
                <div className="col-span-3">
                  <Badge className={getStatusColor(selectedClinic.is_active)}>
                    {getStatusDisplay(selectedClinic.is_active)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-sm">Avaliação</Label>
                <div className="col-span-3 text-sm flex items-center">
                  <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                  {selectedClinic.rating} ({selectedClinic.total_reviews} avaliações)
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-sm">ID</Label>
                <div className="col-span-3 text-xs text-muted-foreground font-mono">{selectedClinic.id}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Clínica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Clínica</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">Cidade</Label>
                <Input
                  id="edit-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">Estado (UF)</Label>
                <Input
                  id="edit-state"
                  value={editFormData.state}
                  maxLength={2}
                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}