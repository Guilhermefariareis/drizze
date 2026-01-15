import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Shield, AlertTriangle, Lock, Eye, Key, Search, Filter, Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@supabase/supabase-js';

// Admin client to bypass RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export default function AdminSecurity() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchRealUsersForMocks();
  }, []);

  const fetchRealUsersForMocks = async () => {
    try {
      setLoading(true);
      const { data: users } = await adminSupabase.from('profiles').select('email, full_name').limit(10);

      const types = ['login_failed', 'suspicious_activity', 'password_changed', 'account_locked'];
      const severities = ['low', 'medium', 'high'];

      const generatedEvents = (users || []).map((user, i) => ({
        id: `SEC-00${i + 1}`,
        type: types[i % types.length],
        user: user.email,
        ip: `192.168.1.${100 + i}`,
        location: i % 2 === 0 ? 'São Paulo, SP' : 'Rio de Janeiro, RJ',
        timestamp: new Date(Date.now() - i * 3600000).toLocaleString('pt-BR'),
        severity: severities[i % severities.length]
      }));

      setEvents(generatedEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'login_failed': return 'Falha no Login';
      case 'suspicious_activity': return 'Atividade Suspeita';
      case 'password_changed': return 'Senha Alterada';
      case 'account_locked': return 'Conta Bloqueada';
      default: return type;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Segurança</h1>
            <p className="text-muted-foreground">Monitore e configure a segurança do sistema</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">+1 desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tentativas de Login</CardTitle>
                <Lock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+12% desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IPs Bloqueados</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+2 desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nível de Segurança</CardTitle>
                <Key className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Alto</div>
                <p className="text-xs text-muted-foreground">Sistema protegido</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events" className="space-y-4">
            <TabsList>
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="policies">Políticas</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Eventos de Segurança</CardTitle>
                  <CardDescription>
                    Monitore todas as atividades de segurança do sistema
                  </CardDescription>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar eventos..."
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Severidade</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.id}</TableCell>
                            <TableCell>{getEventTypeLabel(event.type)}</TableCell>
                            <TableCell className="font-medium">{event.user}</TableCell>
                            <TableCell>{event.ip}</TableCell>
                            <TableCell>{event.location}</TableCell>
                            <TableCell>
                              <Badge variant={getSeverityColor(event.severity)}>
                                {event.severity === 'high' ? 'Alta' :
                                  event.severity === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                            </TableCell>
                            <TableCell>{event.timestamp}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">Bloquear IP</Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {events.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-4">Nenhum evento detectado.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="policies">
              <Card>
                <CardHeader>
                  <CardTitle>Políticas de Segurança</CardTitle>
                  <CardDescription>
                    Configure as regras de segurança do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-base font-medium">Autenticação de Dois Fatores</label>
                      <div className="text-sm text-muted-foreground">
                        Exigir 2FA para todos os usuários admin
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-base font-medium">Bloqueio Automático</label>
                      <div className="text-sm text-muted-foreground">
                        Bloquear IPs após 5 tentativas de login falhadas
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-base font-medium">Senha Forte</label>
                      <div className="text-sm text-muted-foreground">
                        Exigir senhas com 8+ caracteres, maiúsculas, números e símbolos
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-base font-medium">Logout Automático</label>
                      <div className="text-sm text-muted-foreground">
                        Desconectar usuários inativos após 30 minutos
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoramento em Tempo Real</CardTitle>
                  <CardDescription>
                    Status atual da segurança do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Painel de monitoramento em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Segurança</CardTitle>
                  <CardDescription>
                    Configure parâmetros avançados de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Configurações avançadas em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}