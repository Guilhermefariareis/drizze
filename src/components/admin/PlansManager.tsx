import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  User,
  Building2,
  Crown,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  plan_type: 'patient' | 'clinic' | 'clinic_advanced';
  display_order: number;
  created_at: string;
}

interface PlanFormData {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string;
  is_popular: boolean;
  is_active: boolean;
  plan_type: 'patient' | 'clinic' | 'clinic_advanced';
  display_order: string;
}

const initialFormData: PlanFormData = {
  name: '',
  description: '',
  price: '',
  period: 'mensal',
  features: '',
  is_popular: false,
  is_active: true,
  plan_type: 'clinic',
  display_order: '1'
};

export const PlansManager: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('patient');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('plan_type', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Converter os dados do banco para o formato esperado
      const formattedPlans: Plan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        period: plan.period,
        features: Array.isArray(plan.features) 
          ? (plan.features as string[]).filter(f => typeof f === 'string')
          : [],
        is_popular: plan.is_popular,
        is_active: plan.is_active,
        plan_type: (plan.plan_type || 'clinic') as 'patient' | 'clinic' | 'clinic_advanced',
        display_order: plan.display_order,
        created_at: plan.created_at
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos: ' + error.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      if (!formData.name.trim() || !formData.price || !formData.description.trim()) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const planData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        period: formData.period,
        features: formData.features.split('\n').filter(f => f.trim()),
        is_popular: formData.is_popular,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order),
        plan_type: formData.plan_type
      };

      console.log('Dados do plano:', planData);

      if (selectedPlan) {
        // Atualizar plano existente
        console.log('Atualizando plano ID:', selectedPlan.id);
        const { data, error } = await supabase
          .from('pricing_plans')
          .update(planData)
          .eq('id', selectedPlan.id)
          .select();

        if (error) {
          console.error('Erro na atualização:', error);
          throw error;
        }
        console.log('Plano atualizado:', data);
        toast.success('Plano atualizado com sucesso!');
      } else {
        // Criar novo plano
        console.log('Criando novo plano');
        const { data, error } = await supabase
          .from('pricing_plans')
          .insert([planData])
          .select();

        if (error) {
          console.error('Erro na criação:', error);
          throw error;
        }
        console.log('Plano criado:', data);
        toast.success('Plano criado com sucesso!');
      }

      setIsDialogOpen(false);
      setSelectedPlan(null);
      setFormData(initialFormData);
      fetchPlans();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano: ' + (error?.message || 'Erro desconhecido'));
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      period: plan.period,
      features: plan.features.join('\n'),
      is_popular: plan.is_popular,
      is_active: plan.is_active,
      plan_type: plan.plan_type,
      display_order: plan.display_order.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      console.log('Tentando excluir plano com ID:', planId);
      const { data, error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', planId)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }
      
      console.log('Plano excluído:', data);
      toast.success('Plano excluído com sucesso!');
      fetchPlans();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast.error('Erro ao excluir plano: ' + (error?.message || 'Erro desconhecido'));
    }
  };

  const handleNewPlan = (planType: 'patient' | 'clinic' | 'clinic_advanced') => {
    setSelectedPlan(null);
    setFormData({
      ...initialFormData,
      plan_type: planType
    });
    setIsDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="h-4 w-4" />;
      case 'clinic':
        return <Building2 className="h-4 w-4" />;
      case 'clinic_advanced':
        return <Crown className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'patient':
        return 'Paciente';
      case 'clinic':
        return 'Clínica';
      case 'clinic_advanced':
        return 'Avançado';
      default:
        return type;
    }
  };

  const filteredPlans = plans.filter(plan => plan.plan_type === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Planos</h2>
          <p className="text-muted-foreground">Configure os planos disponíveis na plataforma</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patient" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Planos Paciente
          </TabsTrigger>
          <TabsTrigger value="clinic" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Planos Clínica
          </TabsTrigger>
          <TabsTrigger value="clinic_advanced" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Serviços Avançados
          </TabsTrigger>
        </TabsList>

        {/* Paciente */}
        <TabsContent value="patient" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Planos para Pacientes
                </CardTitle>
                <Button onClick={() => handleNewPlan('patient')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {plan.name}
                          {plan.is_popular && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>R$ {plan.price.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>{plan.period}</TableCell>
                      <TableCell>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clínica */}
        <TabsContent value="clinic" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Planos para Clínicas
                </CardTitle>
                <Button onClick={() => handleNewPlan('clinic')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {plan.name}
                          {plan.is_popular && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>R$ {plan.price.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>{plan.period}</TableCell>
                      <TableCell>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Serviços Avançados */}
        <TabsContent value="clinic_advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Serviços Avançados
                </CardTitle>
                <Button onClick={() => handleNewPlan('clinic_advanced')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Serviço
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {plan.name}
                          {plan.is_popular && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>R$ {plan.price.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>{plan.period}</TableCell>
                      <TableCell>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar/editar plano */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan ? 'Edite as informações do plano' : 'Crie um novo plano na plataforma'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Plano Premium"
              />
            </div>

            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="único">Pagamento Único</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="display_order">Ordem de Exibição</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: e.target.value }))}
                placeholder="1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que está incluído neste plano..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="features">Recursos (um por linha)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                placeholder="Recurso 1&#10;Recurso 2&#10;Recurso 3"
                rows={5}
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                />
                <Label htmlFor="is_popular">Marcar como mais popular</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Plano ativo</Label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSavePlan}>
              <Save className="h-4 w-4 mr-2" />
              {selectedPlan ? 'Atualizar' : 'Criar'} Plano
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};