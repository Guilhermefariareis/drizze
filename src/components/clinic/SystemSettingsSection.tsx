import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ResponsiveGrid } from "@/components/responsive/ResponsiveGrid";
import { 
  Settings, Shield, Bell, Database, Users, 
  Key, Clock, Smartphone, Mail, Globe,
  Download, Upload, RefreshCw, AlertTriangle
} from "lucide-react";

export function SystemSettingsSection() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      appointmentReminders: true,
      paymentAlerts: true,
      systemUpdates: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: "30",
      passwordPolicy: "strong",
      loginNotifications: true
    },
    system: {
      timezone: "America/Sao_Paulo",
      language: "pt-BR",
      dateFormat: "DD/MM/YYYY",
      currency: "BRL",
      autoBackup: true,
      backupFrequency: "daily"
    }
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  const handleSystemChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações gerais da plataforma
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Shield className="h-4 w-4 mr-1" />
            Sistema Seguro
          </Badge>
          <Button variant="gradient">
            Salvar Alterações
          </Button>
        </div>
      </div>

      <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como você deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por e-mail
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(value) => handleNotificationChange("email", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS</p>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(value) => handleNotificationChange("sms", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push</p>
                  <p className="text-sm text-muted-foreground">
                    Notificações push no navegador
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(value) => handleNotificationChange("push", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lembretes de Consulta</p>
                  <p className="text-sm text-muted-foreground">
                    Enviar lembretes automáticos
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.appointmentReminders}
                  onCheckedChange={(value) => handleNotificationChange("appointmentReminders", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de Pagamento</p>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre pagamentos
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.paymentAlerts}
                  onCheckedChange={(value) => handleNotificationChange("paymentAlerts", value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">
                  Adicionar camada extra de segurança
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactor}
                onCheckedChange={(value) => handleSecurityChange("twoFactor", value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSecurityChange("sessionTimeout", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordPolicy">Política de Senhas</Label>
              <select
                id="passwordPolicy"
                value={settings.security.passwordPolicy}
                onChange={(e) => handleSecurityChange("passwordPolicy", e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2"
              >
                <option value="simple">Simples</option>
                <option value="medium">Média</option>
                <option value="strong">Forte</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações de Login</p>
                <p className="text-sm text-muted-foreground">
                  Alertar sobre novos logins
                </p>
              </div>
              <Switch
                checked={settings.security.loginNotifications}
                onCheckedChange={(value) => handleSecurityChange("loginNotifications", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Sistema
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <select
                id="timezone"
                value={settings.system.timezone}
                onChange={(e) => handleSystemChange("timezone", e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2"
              >
                <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                <option value="America/Manaus">Manaus (UTC-4)</option>
                <option value="America/Rio_Branco">Rio Branco (UTC-5)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <select
                id="language"
                value={settings.system.language}
                onChange={(e) => handleSystemChange("language", e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Formato de Data</Label>
              <select
                id="dateFormat"
                value={settings.system.dateFormat}
                onChange={(e) => handleSystemChange("dateFormat", e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Automático</p>
                <p className="text-sm text-muted-foreground">
                  Fazer backup dos dados automaticamente
                </p>
              </div>
              <Switch
                checked={settings.system.autoBackup}
                onCheckedChange={(value) => handleSystemChange("autoBackup", value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Gestão de Dados
            </CardTitle>
            <CardDescription>
              Backup, exportação e importação de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Importar Dados
              </Button>
              
              <Button variant="outline" className="justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Fazer Backup Manual
              </Button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Último Backup
                  </p>
                  <p className="text-sm text-amber-700">
                    Hoje às 03:00 - Sucesso
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Quick Actions */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <Users className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Usuários</h3>
            <p className="text-sm text-muted-foreground">
              Gerenciar usuários do sistema
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <Key className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Permissões</h3>
            <p className="text-sm text-muted-foreground">
              Configurar níveis de acesso
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <Globe className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Integrações</h3>
            <p className="text-sm text-muted-foreground">
              APIs e serviços externos
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <Smartphone className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Mobile App</h3>
            <p className="text-sm text-muted-foreground">
              Configurações do app mobile
            </p>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </div>
  );
}