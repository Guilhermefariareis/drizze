import React, { useState } from 'react';
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
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature_request' | 'general';
  clinic_name: string;
  clinic_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  message: string;
  sender_type: 'admin' | 'clinic';
  sender_name: string;
  created_at: string;
  attachments?: string[];
}

export const SupportTicketsSystem = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      title: 'Erro na integração com Clinicorp',
      description: 'Não consigo conectar minha conta do Clinicorp ao sistema. Sempre dá erro de autenticação.',
      status: 'open',
      priority: 'high',
      category: 'technical',
      clinic_name: 'Clínica Sorriso Feliz',
      clinic_id: 'clinic_123',
      user_name: 'Dr. João Silva',
      user_email: 'joao@clinicasorriso.com',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      messages: [
        {
          id: 'msg_1',
          message: 'Olá, estou tentando configurar a integração com o Clinicorp mas sempre recebo erro de autenticação. Já verifiquei as credenciais várias vezes.',
          sender_type: 'clinic',
          sender_name: 'Dr. João Silva',
          created_at: '2024-01-15T10:30:00Z'
        }
      ]
    },
    {
      id: '2',
      title: 'Solicitação de novo recurso de relatórios',
      description: 'Gostaria de ter relatórios mais detalhados sobre o desempenho financeiro da clínica.',
      status: 'in_progress',
      priority: 'medium',
      category: 'feature_request',
      clinic_name: 'OdontoLife',
      clinic_id: 'clinic_456',
      user_name: 'Dra. Maria Santos',
      user_email: 'maria@odontolife.com',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-15T09:15:00Z',
      assigned_to: 'Admin João',
      messages: [
        {
          id: 'msg_2',
          message: 'Olá! Gostaria de solicitar relatórios mais detalhados que mostrem métricas como taxa de conversão de leads, receita por tratamento, etc.',
          sender_type: 'clinic',
          sender_name: 'Dra. Maria Santos',
          created_at: '2024-01-14T14:20:00Z'
        },
        {
          id: 'msg_3',
          message: 'Olá Dra. Maria! Obrigado pelo feedback. Estamos analisando a possibilidade de implementar essas métricas. Vou encaminhar para nossa equipe de desenvolvimento.',
          sender_type: 'admin',
          sender_name: 'Suporte Doutorizze',
          created_at: '2024-01-15T09:15:00Z'
        }
      ]
    },
    {
      id: '3',
      title: 'Dúvida sobre cobrança',
      description: 'Recebi uma cobrança que não reconheço na minha conta.',
      status: 'waiting_response',
      priority: 'medium',
      category: 'billing',
      clinic_name: 'Dental Care',
      clinic_id: 'clinic_789',
      user_name: 'Dr. Carlos Mendes',
      user_email: 'carlos@dentalcare.com',
      created_at: '2024-01-13T16:45:00Z',
      updated_at: '2024-01-14T11:30:00Z',
      assigned_to: 'Admin Ana',
      messages: [
        {
          id: 'msg_4',
          message: 'Olá, recebi uma cobrança de R$ 197,00 que não reconheço. Podem me explicar?',
          sender_type: 'clinic',
          sender_name: 'Dr. Carlos Mendes',
          created_at: '2024-01-13T16:45:00Z'
        },
        {
          id: 'msg_5',
          message: 'Olá Dr. Carlos! Essa cobrança se refere ao plano Premium que foi ativado no dia 10/01. Você solicitou upgrade para ter acesso ao módulo de marketing digital. Posso enviar o detalhamento por email?',
          sender_type: 'admin',
          sender_name: 'Suporte Financeiro',
          created_at: '2024-01-14T11:30:00Z'
        }
      ]
    }
  ]);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

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
                         ticket.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filter.status === 'all' || ticket.status === filter.status;
    const matchesPriority = filter.priority === 'all' || ticket.priority === filter.priority;
    const matchesCategory = filter.category === 'all' || ticket.category === filter.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const newMsg: TicketMessage = {
      id: `msg_${Date.now()}`,
      message: newMessage,
      sender_type: 'admin',
      sender_name: 'Suporte Doutorizze',
      created_at: new Date().toISOString()
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { ...ticket, messages: [...ticket.messages, newMsg], updated_at: new Date().toISOString() }
        : ticket
    ));

    setNewMessage('');
    toast.success('Mensagem enviada com sucesso!');
  };

  const updateTicketStatus = (ticketId: string, newStatus: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus as any, updated_at: new Date().toISOString() }
        : ticket
    ));
    toast.success('Status do ticket atualizado!');
  };

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Tickets de Suporte</h2>
          <p className="text-muted-foreground">Gerencie as solicitações de suporte das clínicas</p>
        </div>
        
        <div className="flex gap-2">
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
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="waiting_response">Aguardando</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tickets Abertos</p>
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
                <p className="text-sm text-muted-foreground">Resolvidos Hoje</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-xl font-bold">2.4h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{ticket.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {ticket.clinic_name} • {ticket.user_name}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityText(ticket.priority)}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {ticket.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {getCategoryText(ticket.category)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detalhes do Ticket Selecionado */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedTicket ? 'Detalhes do Ticket' : 'Selecione um ticket'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-4">
                {/* Header do Ticket */}
                <div className="border-b pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{selectedTicket.title}</h3>
                    <div className="flex gap-1">
                      <Badge className={`text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                        {getPriorityText(selectedTicket.priority)}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(selectedTicket.status)}`}>
                        {getStatusText(selectedTicket.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {selectedTicket.clinic_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedTicket.user_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedTicket.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${message.sender_type === 'admin' ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.sender_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {message.sender_type === 'admin' ? 'Admin' : 'Clínica'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>

                {/* Resposta */}
                <div className="border-t pt-4 space-y-3">
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSendMessage} size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enviar Resposta
                    </Button>
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-40">
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
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um ticket para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};