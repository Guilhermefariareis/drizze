import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientSettings {
  id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminders: boolean;
  marketing_emails: boolean;
  dark_mode: boolean;
  language: string;
  timezone: string;
  two_factor_enabled: boolean;
  data_sharing: boolean;
  analytics_tracking: boolean;
}

export default function PatientSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<PatientSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/patient-login');
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Buscar configurações do paciente
      const { data: settingsData, error: settingsError } = await supabase
        .from('patient_settings')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Criar configurações padrão se não existir
        const defaultSettings: PatientSettings = {
          id: user?.id || '',
          email_notifications: true,
          sms_notifications: true,
          appointment_reminders: true,
          marketing_emails: false,
          dark_mode: false,
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          two_factor_enabled: false,
          data_sharing: false,
          analytics_tracking: true
        };
        setSettings(defaultSettings);
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof PatientSettings, value: boolean | string) => {
    if (!settings) return;

    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    try {
      setSaving(true);

      const { error } = await supabase
        .from('patient_settings')
        .upsert({
          ...updatedSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Configuração atualizada!');

    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
      // Reverter mudança em caso de erro
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setChangingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Senha alterada com sucesso!');

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Primeiro buscar o profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        toast.error('Erro ao buscar dados do perfil');
        return;
      }

      // Buscar todos os dados do paciente
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', profile.id)
        .single();

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', profile.id);

      if (patientError || appointmentsError) {
        throw new Error('Erro ao buscar dados');
      }

      const exportData = {
        profile: patientData,
        appointments: appointmentsData,
        settings: settings,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-doutorizze-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!');

    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão permanentemente removidos.'
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'Esta é sua última chance. Confirma a exclusão permanente da sua conta?'
    );

    if (!doubleConfirmed) return;

    try {
      // Aqui você implementaria a lógica de exclusão da conta
      // Por segurança, isso geralmente requer confirmação por email
      toast.error('Funcionalidade em desenvolvimento. Entre em contato com o suporte.');

    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Gerencie suas preferências e configurações de conta</p>
            </div>
            {saving && (
              <Badge variant="outline" className="animate-pulse">
                <Save className="h-3 w-3 mr-1" />
                Salvando...
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações importantes por email</p>
                  </div>
                  <Switch
                    checked={settings?.email_notifications || false}
                    onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">Receber lembretes por mensagem de texto</p>
                  </div>
                  <Switch
                    checked={settings?.sms_notifications || false}
                    onCheckedChange={(checked) => handleSettingChange('sms_notifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembretes de Consulta</Label>
                    <p className="text-sm text-muted-foreground">Receber lembretes antes das consultas</p>
                  </div>
                  <Switch
                    checked={settings?.appointment_reminders || false}
                    onCheckedChange={(checked) => handleSettingChange('appointment_reminders', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emails de Marketing</Label>
                    <p className="text-sm text-muted-foreground">Receber ofertas e novidades</p>
                  </div>
                  <Switch
                    checked={settings?.marketing_emails || false}
                    onCheckedChange={(checked) => handleSettingChange('marketing_emails', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Aparência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Usar tema escuro na interface</p>
                  </div>
                  <Switch
                    checked={settings?.dark_mode || false}
                    onCheckedChange={(checked) => handleSettingChange('dark_mode', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select 
                    value={settings?.language || 'pt-BR'} 
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select 
                    value={settings?.timezone || 'America/Sao_Paulo'} 
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">Adicionar uma camada extra de segurança</p>
                </div>
                <Switch
                  checked={settings?.two_factor_enabled || false}
                  onCheckedChange={(checked) => handleSettingChange('two_factor_enabled', checked)}
                />
              </div>
              
              <Separator />
              
              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alterar Senha</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {changingPassword ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartilhamento de Dados</Label>
                  <p className="text-sm text-muted-foreground">Permitir compartilhamento de dados para pesquisa médica</p>
                </div>
                <Switch
                  checked={settings?.data_sharing || false}
                  onCheckedChange={(checked) => handleSettingChange('data_sharing', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rastreamento de Analytics</Label>
                  <p className="text-sm text-muted-foreground">Permitir coleta de dados para melhorar a experiência</p>
                </div>
                <Switch
                  checked={settings?.analytics_tracking || false}
                  onCheckedChange={(checked) => handleSettingChange('analytics_tracking', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Gerenciamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exportar Meus Dados</Label>
                  <p className="text-sm text-muted-foreground">Baixar uma cópia de todos os seus dados</p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Excluir Conta</Label>
                  <p className="text-sm text-muted-foreground">Excluir permanentemente sua conta e todos os dados</p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}