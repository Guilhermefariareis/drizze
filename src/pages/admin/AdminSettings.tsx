import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Bell, Shield, Mail, Globe, CreditCard, Save } from 'lucide-react';

export default function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
            <p className="text-muted-foreground">Gerencie as configurações globais da plataforma</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="email">E-mail</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Configurações Gerais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="platform-name">Nome da Plataforma</Label>
                      <Input id="platform-name" defaultValue="Doutorizze" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="platform-description">Descrição</Label>
                      <Textarea 
                        id="platform-description" 
                        defaultValue="Conectando pacientes e dentistas de forma fácil e segura"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="support-email">E-mail de Suporte</Label>
                      <Input id="support-email" type="email" defaultValue="suporte@doutorizze.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="support-phone">Telefone de Suporte</Label>
                      <Input id="support-phone" defaultValue="(11) 99999-9999" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <Select defaultValue="america/sao_paulo">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="america/sao_paulo">América/São Paulo (GMT-3)</SelectItem>
                          <SelectItem value="america/rio_branco">América/Rio Branco (GMT-5)</SelectItem>
                          <SelectItem value="america/manaus">América/Manaus (GMT-4)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Funcionalidades</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-registration">Permitir novos cadastros</Label>
                          <p className="text-sm text-muted-foreground">Usuários podem se cadastrar na plataforma</p>
                        </div>
                        <Switch id="enable-registration" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-reviews">Sistema de avaliações</Label>
                          <p className="text-sm text-muted-foreground">Pacientes podem avaliar clínicas</p>
                        </div>
                        <Switch id="enable-reviews" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-chat">Chat em tempo real</Label>
                          <p className="text-sm text-muted-foreground">Sistema de mensagens integrado</p>
                        </div>
                        <Switch id="enable-chat" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Configurações de Notificação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notificações por E-mail</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-new-user">Novo usuário cadastrado</Label>
                          <p className="text-sm text-muted-foreground">Notificar quando um novo usuário se cadastrar</p>
                        </div>
                        <Switch id="email-new-user" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-new-clinic">Nova clínica cadastrada</Label>
                          <p className="text-sm text-muted-foreground">Notificar quando uma nova clínica se cadastrar</p>
                        </div>
                        <Switch id="email-new-clinic" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-appointment">Nova consulta agendada</Label>
                          <p className="text-sm text-muted-foreground">Notificar sobre novos agendamentos</p>
                        </div>
                        <Switch id="email-appointment" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notificações Push</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-payments">Pagamentos processados</Label>
                          <p className="text-sm text-muted-foreground">Notificar sobre pagamentos recebidos</p>
                        </div>
                        <Switch id="push-payments" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-errors">Erros do sistema</Label>
                          <p className="text-sm text-muted-foreground">Notificar sobre erros críticos</p>
                        </div>
                        <Switch id="push-errors" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Configurações de Segurança</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Políticas de Senha</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="min-password-length">Tamanho mínimo da senha</Label>
                        <Select defaultValue="8">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 caracteres</SelectItem>
                            <SelectItem value="8">8 caracteres</SelectItem>
                            <SelectItem value="12">12 caracteres</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="require-special-chars">Exigir caracteres especiais</Label>
                          <p className="text-sm text-muted-foreground">Senhas devem conter símbolos especiais</p>
                        </div>
                        <Switch id="require-special-chars" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="require-numbers">Exigir números</Label>
                          <p className="text-sm text-muted-foreground">Senhas devem conter pelo menos um número</p>
                        </div>
                        <Switch id="require-numbers" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Autenticação</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-2fa">Autenticação de dois fatores</Label>
                          <p className="text-sm text-muted-foreground">Exigir 2FA para administradores</p>
                        </div>
                        <Switch id="enable-2fa" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="session-timeout">Timeout de sessão</Label>
                          <p className="text-sm text-muted-foreground">Tempo limite para sessões inativas</p>
                        </div>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Configurações de E-mail</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-host">Servidor SMTP</Label>
                      <Input id="smtp-host" placeholder="smtp.gmail.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-port">Porta SMTP</Label>
                      <Input id="smtp-port" placeholder="587" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-user">Usuário SMTP</Label>
                      <Input id="smtp-user" type="email" placeholder="noreply@doutorizze.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="smtp-password">Senha SMTP</Label>
                      <Input id="smtp-password" type="password" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smtp-ssl">Usar SSL/TLS</Label>
                        <p className="text-sm text-muted-foreground">Conexão segura com o servidor</p>
                      </div>
                      <Switch id="smtp-ssl" defaultChecked />
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Configurações de Pagamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Comissões</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="commission-rate">Taxa de comissão (%)</Label>
                        <Input id="commission-rate" type="number" defaultValue="10" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="min-withdrawal">Valor mínimo para saque</Label>
                        <Input id="min-withdrawal" type="number" defaultValue="50" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Métodos de Pagamento</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-credit">Cartão de Crédito</Label>
                          <p className="text-sm text-muted-foreground">Aceitar pagamentos via cartão</p>
                        </div>
                        <Switch id="enable-credit" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-debit">Cartão de Débito</Label>
                          <p className="text-sm text-muted-foreground">Aceitar pagamentos via débito</p>
                        </div>
                        <Switch id="enable-debit" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-pix">PIX</Label>
                          <p className="text-sm text-muted-foreground">Aceitar pagamentos via PIX</p>
                        </div>
                        <Switch id="enable-pix" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Configurações de API</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Rate Limiting</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rate-limit">Limite de requisições por minuto</Label>
                        <Input id="rate-limit" type="number" defaultValue="100" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-cors">Habilitar CORS</Label>
                          <p className="text-sm text-muted-foreground">Cross-Origin Resource Sharing</p>
                        </div>
                        <Switch id="enable-cors" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Chaves de API</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="api-key">Chave de API Principal</Label>
                        <div className="flex space-x-2">
                          <Input id="api-key" defaultValue="dk_live_..." className="font-mono" readOnly />
                          <Button variant="outline">Regenerar</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}