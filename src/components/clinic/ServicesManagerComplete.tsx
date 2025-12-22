import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Plus, 
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Search,
  Filter,
  Star,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
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

export const ServicesManagerComplete: React.FC<ServicesManagerProps> = ({ clinicId, isMaster = false }) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    category: '',
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
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'Consulta Odontológica',
        description: 'Consulta completa com exame clínico e orientações',
        price: 150,
        duration: 60,
        category: 'Clínica Geral',
        is_active: true,
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Limpeza Dental',
        description: 'Profilaxia completa com remoção de tártaro e polimento',
        price: 120,
        duration: 45,
        category: 'Clínica Geral',
        is_active: true,
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Tratamento de Canal',
        description: 'Endodontia completa com medicação e obturação',
        price: 800,
        duration: 120,
        category: 'Endodontia',
        is_active: true,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setServices(mockServices);
  }, []);

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

  const addService = () => {
    if (!newService.name.trim() || !newService.category) {
      toast({
        title: 'Erro',
        description: 'Nome e categoria são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    const service: Service = {
      id: Date.now().toString(),
      ...newService,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setServices(prev => [service, ...prev]);
    resetForm();
    setShowAddService(false);

    toast({
      title: 'Sucesso',
      description: 'Serviço adicionado com sucesso!'
    });
  };

  const updateService = () => {
    if (!editingService || !newService.name.trim() || !newService.category) {
      toast({
        title: 'Erro',
        description: 'Nome e categoria são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

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
  };

  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
    toast({
      title: 'Sucesso',
      description: 'Serviço removido com sucesso!'
    });
  };

  const toggleActive = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId
        ? { ...service, is_active: !service.is_active, updated_at: new Date().toISOString() }
        : service
    ));
  };

  const toggleFeatured = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId
        ? { ...service, is_featured: !service.is_featured, updated_at: new Date().toISOString() }
        : service
    ));
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
    featured: services.filter(s => s.is_featured).length,
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
              <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
              <div className="text-sm text-yellow-800">Em Destaque</div>
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
                          <Button
                            size="sm"
                            variant={service.is_featured ? "default" : "outline"}
                            onClick={() => toggleFeatured(service.id)}
                            className="flex-1"
                          >
                            {service.is_featured ? 'Destacado' : 'Destacar'}
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