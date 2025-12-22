import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp,
  UserPlus,
  MessageSquare,
  Filter,
  Search,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  nome_clinica?: string;
  especialidade?: string;
  cidade?: string;
  mensagem?: string;
  status: 'novo' | 'contatado' | 'interessado' | 'convertido' | 'perdido';
  created_at: string;
  updated_at?: string;
}

// Interface para mapear os dados para exibição


interface LeadsManagerProps {
  clinicId?: string;
}

export const LeadsManager: React.FC<LeadsManagerProps> = ({ clinicId }) => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    nome: '',
    email: '',
    telefone: '',
    nome_clinica: '',
    especialidade: '',
    cidade: '',
    mensagem: ''
  });

  // Buscar leads reais do banco de dados
  useEffect(() => {
    fetchLeads();
  }, [clinicId]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Não buscar leads globais se clinicId estiver ausente
      if (!clinicId) {
        setLeads([]);
        setLoading(false);
        return;
      }
      
      // Se clinicId estiver disponível, filtrar por clinic_id
      const query = supabase
        .from('clinic_leads')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query.eq('clinic_id', clinicId);

      if (error) {
        console.error('Erro ao buscar leads:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar leads',
          variant: 'destructive'
        });
      } else {
        setLeads(data || []);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar leads',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800';
      case 'contatado': return 'bg-yellow-100 text-yellow-800';
      case 'interessado': return 'bg-purple-100 text-purple-800';
      case 'convertido': return 'bg-green-100 text-green-800';
      case 'perdido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'novo': return 'Novo';
      case 'contatado': return 'Contatado';
      case 'interessado': return 'Interessado';
      case 'convertido': return 'Convertido';
      case 'perdido': return 'Perdido';
      default: return status;
    }
  };

  const addLead = async () => {
    if (!newLead.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive'
      });
      return;
    }
    
    if (!clinicId) {
      toast({
        title: 'Erro',
        description: 'Clínica não identificada. Não é possível adicionar lead sem clinic_id.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clinic_leads')
        .insert([{
          ...newLead,
          status: 'novo',
          clinic_id: clinicId
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar lead:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao adicionar lead',
          variant: 'destructive'
        });
        return;
      }

      // Atualizar a lista local
      setLeads(prev => [data, ...prev]);
      setNewLead({
        nome: '',
        email: '',
        telefone: '',
        nome_clinica: '',
        especialidade: '',
        cidade: '',
        mensagem: ''
      });
      setShowAddLead(false);

      toast({
        title: 'Sucesso',
        description: 'Lead adicionado com sucesso!'
      });
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar lead',
        variant: 'destructive'
      });
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const { error } = await supabase
        .from('clinic_leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar status do lead',
          variant: 'destructive'
        });
        return;
      }

      // Atualizar a lista local
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus, updated_at: new Date().toISOString() }
          : lead
      ));

      toast({
        title: 'Status atualizado',
        description: `Status do lead alterado para ${getStatusText(newStatus)}`
      });
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do lead',
        variant: 'destructive'
      });
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.telefone?.includes(searchTerm) ||
                         lead.nome_clinica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.especialidade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'novo').length,
    contacted: leads.filter(l => l.status === 'contatado').length,
    converted: leads.filter(l => l.status === 'convertido').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'convertido').length / leads.length) * 100).toFixed(1) : '0'
  };

  if (loading) {
    return (
      <div className="w-full max-w-none space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Estatísticas */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="w-full min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-xs sm:text-sm text-blue-800 truncate">Novos Leads</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.contacted}</div>
              <div className="text-xs sm:text-sm text-yellow-800 truncate">Em Contato</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.converted}</div>
              <div className="text-xs sm:text-sm text-green-800 truncate">Convertidos</div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full min-w-0">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-600">{stats.conversionRate}%</div>
              <div className="text-xs sm:text-sm text-gray-800 truncate">Taxa de Conversão</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card className="w-full">
        <CardHeader>
          <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestão de Leads
            </CardTitle>
            <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 w-full sm:w-auto">
                  <UserPlus className="h-4 w-4" />
                  <span className="sm:inline">Novo Lead</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Lead</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome *"
                    value={newLead.nome}
                    onChange={(e) => setNewLead(prev => ({ ...prev, nome: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Telefone"
                    value={newLead.telefone}
                    onChange={(e) => setNewLead(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                  <Input
                    placeholder="Nome da Clínica"
                    value={newLead.nome_clinica}
                    onChange={(e) => setNewLead(prev => ({ ...prev, nome_clinica: e.target.value }))}
                  />
                  <Input
                    placeholder="Especialidade (Ortodontia, Implante...)"
                    value={newLead.especialidade}
                    onChange={(e) => setNewLead(prev => ({ ...prev, especialidade: e.target.value }))}
                  />
                  <Input
                    placeholder="Cidade"
                    value={newLead.cidade}
                    onChange={(e) => setNewLead(prev => ({ ...prev, cidade: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Mensagem"
                    value={newLead.mensagem}
                    onChange={(e) => setNewLead(prev => ({ ...prev, mensagem: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button onClick={addLead}>Adicionar</Button>
                    <Button variant="outline" onClick={() => setShowAddLead(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="novo">Novos</SelectItem>
                <SelectItem value="contatado">Contatados</SelectItem>
                <SelectItem value="interessado">Interessados</SelectItem>
                <SelectItem value="convertido">Convertidos</SelectItem>
                <SelectItem value="perdido">Perdidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Leads */}
          <div className="w-full space-y-4">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {leads.length === 0 ? 'Nenhum lead cadastrado' : 'Nenhum lead encontrado'}
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <Card key={lead.id} className="w-full">
                  <CardContent className="p-3 sm:p-4">
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold truncate">{lead.nome}</h3>
                          <Badge className={getStatusColor(lead.status)}>
                            {getStatusText(lead.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {lead.email && (
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                          {lead.telefone && (
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{lead.telefone}</span>
                            </div>
                          )}
                          <div className="truncate">Clínica: {lead.nome_clinica || 'Não informado'}</div>
                          <div className="truncate">Especialidade: {lead.especialidade || 'Não informado'}</div>
                          {lead.cidade && <div className="truncate">Cidade: {lead.cidade}</div>}
                        </div>
                        {lead.mensagem && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{lead.mensagem}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 self-start">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'contatado')}>
                              Marcar como Contatado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'interessado')}>
                              Marcar como Interessado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'convertido')}>
                              Marcar como Convertido
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'perdido')}>
                              Marcar como Perdido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
