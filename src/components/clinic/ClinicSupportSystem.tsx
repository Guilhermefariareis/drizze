import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Send, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  admin_response?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export default function ClinicSupportSystem() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClinicAndTickets();
    }
  }, [user]);

  const fetchClinicAndTickets = async () => {
    try {
      // Buscar clínica do usuário
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('owner_id', user?.id)
        .maybeSingle();

      if (clinicError) throw clinicError;
      if (!clinicData) {
        toast.error('Nenhuma clínica encontrada para este usuário');
        return;
      }
      setClinic(clinicData);

      // Buscar tickets da clínica
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('clinic_id', clinicData.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          clinic_id: clinic.id,
          title: newTicket.title,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority
        });

      if (error) throw error;

      toast.success('Ticket criado com sucesso!');
      setNewTicket({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      setIsDialogOpen(false);
      fetchClinicAndTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Erro ao criar ticket');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-primary" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'closed':
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-warning text-warning-foreground';
      case 'in_progress':
        return 'bg-primary text-primary-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="flex-1 w-full px-6 py-8 px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Central de Suporte</h1>
          <p className="text-muted-foreground">
            Comunique-se com nossa equipe de suporte
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Novo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Ticket de Suporte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticket-title">Título *</Label>
                <Input
                  id="ticket-title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({...prev, title: e.target.value}))}
                  placeholder="Descreva brevemente o problema"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ticket-category">Categoria *</Label>
                  <Select 
                    value={newTicket.category} 
                    onValueChange={(value) => setNewTicket(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="billing">Financeiro</SelectItem>
                      <SelectItem value="account">Conta</SelectItem>
                      <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                      <SelectItem value="bug">Bug/Erro</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ticket-priority">Prioridade</Label>
                  <Select 
                    value={newTicket.priority} 
                    onValueChange={(value) => setNewTicket(prev => ({...prev, priority: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="ticket-description">Descrição *</Label>
                <Textarea
                  id="ticket-description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({...prev, description: e.target.value}))}
                  placeholder="Descreva detalhadamente o problema ou solicitação..."
                  rows={5}
                />
              </div>
              
              <Button onClick={createTicket} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Abertos</p>
                <p className="text-2xl font-bold">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Em Andamento</p>
                <p className="text-2xl font-bold">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Resolvidos</p>
                <p className="text-2xl font-bold">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-foreground" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Tickets de Suporte</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum ticket encontrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro ticket para entrar em contato com o suporte
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(ticket.status)}
                        <h4 className="font-semibold">{ticket.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      {ticket.resolved_at && (
                        <p className="text-xs text-success">
                          Resolvido em {new Date(ticket.resolved_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {ticket.admin_response && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                      <p className="text-sm font-medium text-primary mb-1">
                        Resposta da Administração:
                      </p>
                      <p className="text-sm">{ticket.admin_response}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}