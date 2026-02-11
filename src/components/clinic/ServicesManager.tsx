import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  category: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface ServicesManagerProps {
  clinicId?: string;
  isMaster?: boolean;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({ clinicId, isMaster = false }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    category: 'Clínica Geral',
    is_active: true,
    is_featured: false
  });

  const categories = [
    'Clínica Geral',
    'Ortodontia',
    'Endodontia',
    'Periodontia',
    'Cirurgia',
    'Implantodontia',
    'Prótese',
    'Estética',
    'Pediatria',
    'Radiologia'
  ];

  useEffect(() => {
    if (clinicId) {
      console.log('🔧 [ServicesManager] Carregando serviços para clínica:', clinicId);
      fetchServices();
    } else {
      console.warn('⚠️ [ServicesManager] clinicId não fornecido');
      setLoading(false);
    }
  }, [clinicId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinic_services')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('service_name');

      if (error) {
        console.error('❌ [ServicesManager] Erro detalhado Supabase:', error);
        throw error;
      }

      // Mapear campos do banco para o estado do componente
      const mappedServices: Service[] = (data || []).map(item => ({
        id: item.id,
        name: item.service_name,
        description: item.service_description || '',
        price: item.price || 0,
        duration: item.duration_minutes || 60,
        category: 'Clínica Geral', // DB não tem categoria, usando padrão
        is_active: item.is_active || false,
        is_featured: false, // DB não tem featured
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));

      console.log('✅ [ServicesManager] Serviços carregados:', mappedServices.length);
      setServices(mappedServices);
    } catch (error: any) {
      console.error('❌ [ServicesManager] Erro ao carregar serviços:', error);
      toast({
        title: "Erro de Conexão",
        description: error.message || "Não foi possível carregar os serviços da clínica.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewService({
      name: '',
      description: '',
      price: 0,
      duration: 60,
      category: '',
      is_active: true,
      is_featured: false
    });
    setEditingService(null);
  };

  const addService = async () => {
    if (!newService.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clinic_services')
        .insert([{
          clinic_id: clinicId,
          service_name: newService.name,
          service_description: newService.description,
          price: newService.price,
          duration_minutes: newService.duration,
          is_active: newService.is_active
        }])
        .select()
        .single();

      if (error) throw error;

      const mappedService: Service = {
        id: data.id,
        name: data.service_name,
        description: data.service_description || '',
        price: data.price || 0,
        duration: data.duration_minutes || 60,
        category: 'Clínica Geral',
        is_active: data.is_active || false,
        is_featured: false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };

      setServices(prev => [mappedService, ...prev]);
      resetForm();
      setShowAddService(false);

      toast({
        title: 'Sucesso',
        description: 'Serviço adicionado com sucesso!'
      });
    } catch (error: any) {
      console.error('❌ [ServicesManager] Erro ao adicionar serviço:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o serviço.',
        variant: 'destructive'
      });
    }
  };

  const updateService = async () => {
    if (!editingService || !newService.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clinic_services')
        .update({
          service_name: newService.name,
          service_description: newService.description,
          price: newService.price,
          duration_minutes: newService.duration,
          is_active: newService.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingService.id);

      if (error) throw error;

      setServices(prev => prev.map(service =>
        service.id === editingService.id
          ? { ...service, ...newService, updated_at: new Date().toISOString() }
          : service
      ));

      resetForm();
      setShowAddService(false);

      toast({
        title: 'Sucesso',
        description: 'Serviço atualizado com sucesso!'
      });
    } catch (error: any) {
      console.error('❌ [ServicesManager] Erro ao atualizar serviço:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o serviço.',
        variant: 'destructive'
      });
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('clinic_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== serviceId));
      toast({
        title: 'Sucesso',
        description: 'Serviço removido com sucesso!'
      });
    } catch (error: any) {
      console.error('❌ [ServicesManager] Erro ao deletar serviço:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o serviço.',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      const newStatus = !service.is_active;
      const { error } = await supabase
        .from('clinic_services')
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.map(s =>
        s.id === serviceId
          ? { ...s, is_active: newStatus, updated_at: new Date().toISOString() }
          : s
      ));
    } catch (error: any) {
      console.error('❌ [ServicesManager] Erro ao alternar status do serviço:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive'
      });
    }
  };

  const startEdit = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      is_active: service.is_active,
      is_featured: service.is_featured
    });
    setShowAddService(true);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    averagePrice: services.length > 0 ?
      (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(0) : '0'
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800">Total de Serviços</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-green-800">Serviços Ativos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">R$ {stats.averagePrice}</div>
              <div className="text-sm text-gray-800">Preço Médio</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestão de Serviços */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Serviços e Produtos
            </CardTitle>
            {isMaster && (
              <Dialog open={showAddService} onOpenChange={(open) => {
                setShowAddService(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Serviço
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Nome do Serviço *</label>
                        <Input
                          placeholder="Ex: Consulta Odontológica"
                          value={newService.name}
                          onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Categoria *</label>
                        <Select value={newService.category} onValueChange={(value) => setNewService(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea
                        placeholder="Descreva o serviço oferecido..."
                        value={newService.description}
                        onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Preço (R$)</label>
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={newService.price}
                          onChange={(e) => setNewService(prev => ({ ...prev, price: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Duração (minutos)</label>
                        <Input
                          type="number"
                          placeholder="60"
                          value={newService.duration}
                          onChange={(e) => setNewService(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newService.is_active}
                          onCheckedChange={(checked) => setNewService(prev => ({ ...prev, is_active: checked }))}
                        />
                        <label className="text-sm font-medium">Serviço ativo</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newService.is_featured}
                          onCheckedChange={(checked) => setNewService(prev => ({ ...prev, is_featured: checked }))}
                        />
                        <label className="text-sm font-medium">Destacar serviço</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={editingService ? updateService : addService}>
                        {editingService ? 'Atualizar' : 'Adicionar'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddService(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Serviços */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {services.length === 0 ? 'Nenhum serviço cadastrado' : 'Nenhum serviço encontrado'}
              </div>
            ) : (
              filteredServices.map((service) => (
                <Card key={service.id} className={`relative ${!service.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        {service.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      {isMaster && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <Badge variant="outline" className="mb-2">
                      {service.category}
                    </Badge>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-bold">R$ {service.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{service.duration}min</span>
                        </div>
                      </div>

                      {isMaster && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant={service.is_active ? "default" : "outline"}
                            onClick={() => toggleActive(service.id)}
                            className="flex-1"
                          >
                            {service.is_active ? 'Ativo' : 'Inativo'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};