import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Filter,
  Search
} from "lucide-react";

interface SupportTicket {
  id: string;
  clinic_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'general' | 'feature_request';
  admin_response: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  clinics?: {
    name: string;
    email: string;
  };
}

const SupportTicketsManager = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [responseForm, setResponseForm] = useState({
    admin_response: "",
    status: "in_progress" as 'open' | 'in_progress' | 'resolved' | 'closed'
  });

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
          clinics:clinic_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as any);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: any) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;
      
      toast.success('Ticket atualizado com sucesso!');
      fetchTickets();
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Erro ao atualizar ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const updates = {
      admin_response: responseForm.admin_response,
      status: responseForm.status,
      resolved_at: responseForm.status === 'resolved' ? new Date().toISOString() : null
    };

    await updateTicket(selectedTicket.id, updates);
    setResponseForm({ admin_response: "", status: "in_progress" });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.clinics?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abertos</p>
                <p className="text-2xl font-bold">{openTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{inProgressTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold">{resolvedTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg">{ticket.title}</h3>
                    <Badge className={`text-white ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={`text-white ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>Clínica: {ticket.clinics?.name}</span>
                    <span>Criado: {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {ticket.admin_response && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-foreground">Resposta Admin:</p>
                      <p className="text-sm text-muted-foreground">{ticket.admin_response}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setResponseForm({
                        admin_response: ticket.admin_response || "",
                        status: ticket.status as any
                      });
                    }}
                  >
                    Responder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTickets.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum ticket encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Response Modal */}
      {selectedTicket && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Responder Ticket: {selectedTicket.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResponse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin_response">Resposta</Label>
                <Textarea
                  id="admin_response"
                  value={responseForm.admin_response}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, admin_response: e.target.value }))}
                  placeholder="Digite sua resposta..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={responseForm.status} 
                  onValueChange={(value: any) => setResponseForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Enviar Resposta
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedTicket(null)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupportTicketsManager;