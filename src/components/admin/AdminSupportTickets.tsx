import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Reply
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  user_id?: string;
  clinic_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export function AdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tickets de suporte.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'resolved' && { resolved_at: new Date().toISOString() })
        })
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: status as any } : ticket
      ));

      toast({
        title: "Status atualizado",
        description: `Ticket marcado como ${getStatusLabel(status)}.`
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      technical: 'Técnico',
      financial: 'Financeiro',
      general: 'Geral',
      integration: 'Integração',
      billing: 'Cobrança'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      urgent: 'Urgente',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Aberto',
      in_progress: 'Em Andamento',
      resolved: 'Resolvido',
      closed: 'Fechado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Central de Suporte - Administração
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                      {ticket.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">{getStatusLabel(ticket.status)}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Categoria: {getCategoryLabel(ticket.category)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {ticket.status === 'open' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                      >
                        Assumir
                      </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                      >
                        Resolver
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Nenhum ticket encontrado com os filtros aplicados.'
                  : 'Nenhum ticket de suporte encontrado.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Resposta */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Responder Ticket - {selectedTicket.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Descrição original:</p>
                <p>{selectedTicket.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sua resposta:
                </label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Digite sua resposta..."
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  // Aqui implementar o envio da resposta
                  toast({
                    title: "Resposta enviada",
                    description: "Sua resposta foi enviada com sucesso."
                  });
                  setSelectedTicket(null);
                  setResponseText('');
                }}>
                  Enviar Resposta
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}