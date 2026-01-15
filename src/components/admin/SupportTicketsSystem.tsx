import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Plus,
  ArrowRight,
  Calendar,
  Building2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  clinic_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  clinics?: {
    name: string;
    email: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  message: string;
  is_admin_reply: boolean;
  sender_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export const SupportTicketsSystem = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          clinics:clinic_id (name, email),
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data as any || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          profiles:sender_id (full_name)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, messages: data as any } : t
      ));

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, messages: data as any } : null);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    await fetchMessages(ticket.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'waiting_response': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'waiting_response': return 'Aguardando Resposta';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical': return 'Técnico';
      case 'billing': return 'Financeiro';
      case 'feature_request': return 'Novo Recurso';
      case 'general': return 'Geral';
      default: return category;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clinics?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filter.status === 'all' || ticket.status === filter.status;
    const matchesPriority = filter.priority === 'all' || ticket.priority === filter.priority;
    const matchesCategory = filter.category === 'all' || ticket.category === filter.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          message: newMessage,
          is_admin_reply: true,
          sender_id: user.id
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Resposta enviada com sucesso!');
      await fetchMessages(selectedTicket.id);

      // Se o ticket estiver aberto, mudar para em andamento
      if (selectedTicket.status === 'open') {
        await updateTicketStatus(selectedTicket.id, 'in_progress');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, status: newStatus as any } : t
      ));

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any } : null);
      }

      toast.success('Status do ticket atualizado!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Tickets de Suporte</h2>
          <p className="text-muted-foreground">Gerencie as solicitações de suporte das clínicas</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTickets} size="icon">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="waiting_response">Aguardando</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Abertos</p>
                <p className="text-xl font-bold">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-xl font-bold">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
                <p className="text-xl font-bold">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Lista de Tickets</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loading && tickets.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-muted border-primary/50' : ''}`}
                onClick={() => handleSelectTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{ticket.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {ticket.clinics?.name || 'Clínica desconhecida'} • {ticket.profiles?.full_name || 'Usuário'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={`text-[10px] px-1.5 py-0 h-5 ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityText(ticket.priority)}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {ticket.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {getCategoryText(ticket.category)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
            {!loading && filteredTickets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum ticket encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>
              {selectedTicket ? 'Conversação' : 'Selecione um ticket'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {selectedTicket ? (
              <div className="flex flex-col h-full gap-4">
                <div className="border-b pb-4 shrink-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{selectedTicket.title}</h3>
                    <div className="flex gap-1">
                      <Badge className={`text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                        {getPriorityText(selectedTicket.priority)}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(selectedTicket.status)}`}>
                        {getStatusText(selectedTicket.status)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{selectedTicket.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {selectedTicket.clinics?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedTicket.profiles?.full_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedTicket.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-muted">
                  {selectedTicket.messages?.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg max-w-[90%] ${message.is_admin_reply ? 'bg-primary/10 ml-auto' : 'bg-muted'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          {message.is_admin_reply ? 'Suporte Admin' : (message.profiles?.full_name || 'Clínica')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(message.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))}
                  {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground italic text-sm">
                      Nenhuma mensagem enviada ainda.
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-auto space-y-3 shrink-0">
                  <div className="flex gap-2">
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-40 h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="waiting_response">Aguardando</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                      className="resize-none h-20 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="h-20 w-20 flex flex-col gap-1 p-0"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                      <span className="text-[10px]">Enviar</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 opacity-50">
                <MessageSquare className="h-16 w-16" />
                <p className="text-lg">Selecione um ticket para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
