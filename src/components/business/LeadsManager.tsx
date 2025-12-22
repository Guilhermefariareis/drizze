import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp, useBusinessLogic } from '@/contexts/AppContext';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  DollarSign,
  Star,
  Plus,
  Calendar,
  Target,
  TrendingUp,
  UserPlus,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  source: 'website' | 'referral' | 'social' | 'ads' | 'walk-in';
  status: 'new' | 'contacted' | 'interested' | 'scheduled' | 'converted' | 'lost';
  estimatedValue: number;
  notes: string;
  createdAt: string;
  lastContact?: string;
}

export const LeadsManager: React.FC = () => {
  const { addNotification } = useBusinessLogic();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    source: 'website' as const,
    estimatedValue: '',
    notes: ''
  });

  // Mock leads data - in real app, this would come from Supabase
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana@email.com',
      phone: '(11) 99999-1111',
      interest: 'Implante Dental',
      source: 'website',
      status: 'new',
      estimatedValue: 3000,
      notes: 'Interessada em implante no dente 12',
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos@email.com',
      phone: '(11) 99999-2222',
      interest: 'Ortodontia',
      source: 'referral',
      status: 'contacted',
      estimatedValue: 2500,
      notes: 'Referência da Dra. Maria. Quer agendar consulta.',
      createdAt: '2024-01-19T14:30:00Z',
      lastContact: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      name: 'Fernanda Lima',
      email: 'fernanda@email.com',
      phone: '(11) 99999-3333',
      interest: 'Clareamento',
      source: 'social',
      status: 'scheduled',
      estimatedValue: 800,
      notes: 'Consulta agendada para amanhã às 14h',
      createdAt: '2024-01-18T16:45:00Z',
      lastContact: '2024-01-19T11:20:00Z'
    }
  ]);

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-orange-100 text-orange-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: Lead['source']) => {
    switch (source) {
      case 'website': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'referral': return 'bg-green-50 text-green-700 border-green-200';
      case 'social': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ads': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'walk-in': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus);

  const conversionRate = leads.length > 0 
    ? (leads.filter(l => l.status === 'converted').length / leads.length * 100).toFixed(1)
    : '0';

  const totalPipelineValue = leads
    .filter(l => ['new', 'contacted', 'interested', 'scheduled'].includes(l.status))
    .reduce((sum, lead) => sum + lead.estimatedValue, 0);

  const handleCreateLead = () => {
    if (!newLead.name || !newLead.email || !newLead.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e telefone",
        variant: "destructive"
      });
      return;
    }

    const lead: Lead = {
      id: Date.now().toString(),
      ...newLead,
      estimatedValue: parseFloat(newLead.estimatedValue) || 0,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    setLeads(prev => [lead, ...prev]);
    setNewLead({
      name: '',
      email: '',
      phone: '',
      interest: '',
      source: 'website',
      estimatedValue: '',
      notes: ''
    });
    setShowNewLeadForm(false);

    addNotification({
      title: 'Novo Lead Criado',
      message: `Lead ${lead.name} adicionado com sucesso!`,
      type: 'success',
      read: false
    });

    toast({
      title: "Lead Criado",
      description: `${lead.name} foi adicionado aos seus leads`,
    });
  };

  const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, lastContact: new Date().toISOString() }
        : lead
    ));

    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      addNotification({
        title: 'Status Atualizado',
        message: `${lead.name} agora está como "${newStatus}"`,
        type: 'info',
        read: false
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de Leads</h2>
        <Button onClick={() => setShowNewLeadForm(true)} variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Métricas de Leads */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{leads.length}</p>
                <p className="text-sm text-blue-600">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{conversionRate}%</p>
                <p className="text-sm text-green-600">Taxa Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-700">R$ {totalPipelineValue.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Pipeline Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {leads.filter(l => ['new', 'contacted'].includes(l.status)).length}
                </p>
                <p className="text-sm text-orange-600">Novos/Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">Todos os Status</option>
          <option value="new">Novos</option>
          <option value="contacted">Contatados</option>
          <option value="interested">Interessados</option>
          <option value="scheduled">Agendados</option>
          <option value="converted">Convertidos</option>
          <option value="lost">Perdidos</option>
        </select>
      </div>

      {/* Form de Novo Lead */}
      {showNewLeadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Lead</CardTitle>
            <CardDescription>Adicione um novo lead ao seu pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={newLead.name}
                  onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label>Telefone *</Label>
                <Input
                  value={newLead.phone}
                  onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label>Interesse</Label>
                <Input
                  value={newLead.interest}
                  onChange={(e) => setNewLead(prev => ({ ...prev, interest: e.target.value }))}
                  placeholder="Ex: Implante dental"
                />
              </div>
              <div>
                <Label>Origem</Label>
                <select 
                  value={newLead.source}
                  onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value as any }))}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm"
                >
                  <option value="website">Website</option>
                  <option value="referral">Indicação</option>
                  <option value="social">Redes Sociais</option>
                  <option value="ads">Anúncios</option>
                  <option value="walk-in">Presencial</option>
                </select>
              </div>
              <div>
                <Label>Valor Estimado</Label>
                <Input
                  type="number"
                  value={newLead.estimatedValue}
                  onChange={(e) => setNewLead(prev => ({ ...prev, estimatedValue: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={newLead.notes}
                onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre o lead..."
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateLead} variant="gradient">
                Criar Lead
              </Button>
              <Button 
                onClick={() => setShowNewLeadForm(false)} 
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Leads */}
      <div className="space-y-4">
        {filteredLeads.map(lead => (
          <Card key={lead.id} className="hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">{lead.name}</h3>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status === 'converted' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {lead.status === 'new' && <AlertCircle className="h-3 w-3 mr-1" />}
                      <span className="capitalize">{lead.status}</span>
                    </Badge>
                    <Badge variant="outline" className={getSourceColor(lead.source)}>
                      {lead.source}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{lead.interest}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(lead.estimatedValue)}</span>
                    </div>
                  </div>
                  
                  {lead.notes && (
                    <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      {lead.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    {lead.status === 'new' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'contacted')}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Contatar
                      </Button>
                    )}
                    {lead.status === 'contacted' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'scheduled')}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Agendar
                      </Button>
                    )}
                    {lead.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        variant="gradient"
                        onClick={() => updateLeadStatus(lead.id, 'converted')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Converter
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Criado: {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  {lead.lastContact && (
                    <p className="text-xs text-muted-foreground">
                      Último contato: {new Date(lead.lastContact).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};