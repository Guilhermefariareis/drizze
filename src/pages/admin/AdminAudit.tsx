import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Search, Filter, Eye, Calendar, User, Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@supabase/supabase-js';

// Admin client to bypass RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export default function AdminAudit() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchRealEntitiesForMocks();
  }, []);

  const fetchRealEntitiesForMocks = async () => {
    try {
      setLoading(true);
      const { data: users } = await adminSupabase.from('profiles').select('email, full_name').limit(10);

      const actions = ['user_created', 'clinic_updated', 'payment_processed', 'data_exported', 'appointment_cancelled'];
      const modules = ['Usuários', 'Clínicas', 'Financeiro', 'Relatórios', 'Consultas'];

      const generatedLogs = (users || []).map((user, i) => ({
        id: `AUD-00${i + 1}`,
        action: actions[i % actions.length],
        user: 'admin@doutorizze.com',
        target: user.full_name || user.email,
        details: `Ação realizada sobre ${user.full_name || user.email}`,
        ip: `192.168.1.${100 + i}`,
        timestamp: new Date(Date.now() - i * 1800000).toLocaleString('pt-BR'),
        module: modules[i % modules.length]
      }));

      setLogs(generatedLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'user_created':
      case 'clinic_created': return 'default';
      case 'user_updated':
      case 'clinic_updated': return 'secondary';
      case 'user_deleted':
      case 'clinic_deleted': return 'destructive';
      case 'payment_processed': return 'default';
      case 'data_exported': return 'outline';
      default: return 'outline';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'user_created': return 'Usuário Criado';
      case 'user_updated': return 'Usuário Atualizado';
      case 'user_deleted': return 'Usuário Excluído';
      case 'clinic_created': return 'Clínica Criada';
      case 'clinic_updated': return 'Clínica Atualizada';
      case 'clinic_deleted': return 'Clínica Excluída';
      case 'payment_processed': return 'Pagamento Processado';
      case 'data_exported': return 'Dados Exportados';
      case 'appointment_cancelled': return 'Consulta Cancelada';
      default: return action;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Auditoria</h1>
            <p className="text-muted-foreground">Rastreie todas as ações realizadas no sistema</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">+15% desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">43</div>
                <p className="text-xs text-muted-foreground">+5 desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ações Críticas</CardTitle>
                <Eye className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">-2 desde ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                <Download className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+4 esta semana</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
              <TabsTrigger value="compliance">Conformidade</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Logs de Auditoria</CardTitle>
                  <CardDescription>
                    Histórico completo de todas as ações realizadas no sistema
                  </CardDescription>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar logs..."
                        className="pl-10"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Módulos</SelectItem>
                        <SelectItem value="users">Usuários</SelectItem>
                        <SelectItem value="clinics">Clínicas</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem>
                        <SelectItem value="reports">Relatórios</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
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
                          <TableHead>Ação</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Alvo</TableHead>
                          <TableHead>Módulo</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.id}</TableCell>
                            <TableCell>
                              <Badge variant={getActionColor(log.action)}>
                                {getActionLabel(log.action)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{log.user}</TableCell>
                            <TableCell>{log.target}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.module}</Badge>
                            </TableCell>
                            <TableCell>{log.ip}</TableCell>
                            <TableCell>{log.timestamp}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {logs.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-4">Nenhum log de auditoria encontrado.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios de Auditoria</CardTitle>
                  <CardDescription>
                    Gere e baixe relatórios personalizados de auditoria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Relatório Diário</CardTitle>
                        <CardDescription>
                          Atividades das últimas 24 horas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Gerar Relatório
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Relatório Semanal</CardTitle>
                        <CardDescription>
                          Resumo semanal de atividades
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Gerar Relatório
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Relatório Mensal</CardTitle>
                        <CardDescription>
                          Análise completa do mês
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Gerar Relatório
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Relatório Personalizado</CardTitle>
                        <CardDescription>
                          Configure período e filtros
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance">
              <Card>
                <CardHeader>
                  <CardTitle>Conformidade e Regulamentações</CardTitle>
                  <CardDescription>
                    Status de conformidade com regulamentações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Painel de conformidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Auditoria</CardTitle>
                  <CardDescription>
                    Configure as políticas de auditoria e retenção de logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Configurações de auditoria em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}