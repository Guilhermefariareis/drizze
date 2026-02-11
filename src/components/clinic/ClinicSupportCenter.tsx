import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Send
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  created_at: string;
  updated_at: string;
}

interface ClinicSupportCenterProps {
  clinicId: string;
}

export default function ClinicSupportCenter({ clinicId }: ClinicSupportCenterProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (clinicId) {
      console.log('🎫 [ClinicSupportCenter] Carregando tickets para clínica:', clinicId);
      fetchTickets();
    } else {
      console.warn('⚠️ [ClinicSupportCenter] clinicId não fornecido');
      setLoading(false);
    }
  }, [clinicId]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [ClinicSupportCenter] Erro detalhado Supabase:', error);
        throw error;
      }

      console.log('✅ [ClinicSupportCenter] Tickets carregados:', data?.length || 0);
      setTickets(data || []);
    } catch (error: any) {
      console.error('❌ [ClinicSupportCenter] Erro ao buscar tickets:', error);
      toast({
        title: "Erro de Conexão",
        description: error.message || "Não foi possível carregar os tickets de suporte.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          ...ticketForm,
          clinic_id: clinicId,
          status: 'open'
        }]);

      if (error) throw error;

      toast({
        title: "Ticket criado",
        description: "Seu ticket de suporte foi criado com sucesso."
      });

      setTicketForm({ title: '', description: '', category: 'general', priority: 'medium' });
      setIsTicketModalOpen(false);
      fetchTickets();
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="w-full flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Central de Suporte
          </CardTitle>

          <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Ticket de Suporte</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                    placeholder="Descreva brevemente o problema"
                  />
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Técnico</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="integration">Integração</SelectItem>
                        <SelectItem value="billing">Cobrança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    placeholder="Descreva detalhadamente o problema ou solicitação"
                    rows={4}
                  />
                </div>

                <Button onClick={createTicket} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Criar Ticket
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-full flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="w-full border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="w-full flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{ticket.title}</h3>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1">{ticket.status}</span>
                  </Badge>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {ticket.description}
              </p>

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Categoria: {ticket.category}</span>
                <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum ticket de suporte encontrado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}