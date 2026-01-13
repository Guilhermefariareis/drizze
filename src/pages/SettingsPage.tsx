import { useState, useEffect } from 'react';
import { Edit, Save, X, Eye, EyeOff, Shield, Bell, CreditCard, Users, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    push: true,
    marketing: false,
    reminders: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    shareData: false,
    analytics: true,
    locationTracking: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    passwordExpiry: '90'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData) {
        const addressData = (profileData.address as any) || {};
        setProfile({
          name: profileData.full_name || profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          birthDate: profileData.birth_date || '',
          address: addressData.street || '',
          city: addressData.city || '',
          state: addressData.state || '',
          zipCode: addressData.zip_code || ''
        });
      }

      // Fetch Preferences (using JSONB from profiles or new table if already migrated)
      // For now, let's try to fetch from user_preferences table
      const { data: prefData, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (prefError && prefError.code !== 'PGRST116') {
        console.warn('user_preferences table might not exist yet:', prefError.message);
      }

      if (prefData) {
        setNotifications({
          email: prefData.email_notifications,
          sms: prefData.sms_notifications,
          whatsapp: prefData.whatsapp_notifications,
          push: prefData.push_notifications,
          marketing: prefData.marketing_emails,
          reminders: prefData.appointment_reminders
        });
        setPrivacy({
          profileVisibility: prefData.profile_visibility,
          shareData: prefData.share_data,
          analytics: prefData.analytics_enabled,
          locationTracking: prefData.location_tracking
        });
        setSecurity({
          twoFactor: prefData.two_factor_enabled,
          loginAlerts: prefData.login_alerts_enabled,
          passwordExpiry: String(prefData.password_expiry_days)
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.name,
          phone: profile.phone,
          birth_date: profile.birthDate,
          address: {
            street: profile.address,
            city: profile.city,
            state: profile.state,
            zip_code: profile.zipCode
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (error: any) {
      toast.error('Erro ao salvar perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (updatedNotifications?: typeof notifications) => {
    try {
      setSaving(true);
      const currentNotifs = updatedNotifications || notifications;
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          email_notifications: currentNotifs.email,
          sms_notifications: currentNotifs.sms,
          whatsapp_notifications: currentNotifs.whatsapp,
          push_notifications: currentNotifs.push,
          marketing_emails: currentNotifs.marketing,
          appointment_reminders: currentNotifs.reminders,
          profile_visibility: privacy.profileVisibility,
          share_data: privacy.shareData,
          analytics_enabled: privacy.analytics,
          location_tracking: privacy.locationTracking,
          two_factor_enabled: security.twoFactor,
          login_alerts_enabled: security.loginAlerts,
          password_expiry_days: security.passwordExpiry === 'never' ? null : parseInt(security.passwordExpiry),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Preferências salvas com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar preferências: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('As senhas não coincidem!');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;
      toast.success('Senha alterada com sucesso!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error('Erro ao alterar senha: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      setSaving(true);
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setProfile(prev => ({
        ...prev,
        address: `${data.logradouro}${data.bairro ? ` - ${data.bairro}` : ''}`,
        city: data.localidade,
        state: data.uf,
        zipCode: cleanCep
      }));

      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências de conta, privacidade e notificações
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
              <TabsTrigger value="privacy">Privacidade</TabsTrigger>
              <TabsTrigger value="billing">Cobrança</TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Informações Pessoais</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        disabled={!editMode}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled={!editMode}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        disabled={!editMode}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="birthDate">Data de nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={profile.birthDate}
                        disabled={!editMode}
                        onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      disabled={!editMode}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        disabled={!editMode}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        value={profile.state}
                        onValueChange={(value) => setProfile({ ...profile, state: value })}
                        disabled={!editMode}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={profile.zipCode}
                        disabled={!editMode}
                        onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                        onBlur={(e) => handleCepSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Salvar Alterações
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Segurança da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Digite sua nova senha"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua nova senha"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactor">Autenticação de dois fatores</Label>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança
                      </p>
                    </div>
                    <Switch
                      id="twoFactor"
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => setSecurity({ ...security, twoFactor: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="loginAlerts">Alertas de login</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações sobre novos logins
                      </p>
                    </div>
                    <Switch
                      id="loginAlerts"
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="passwordExpiry">Expiração da senha</Label>
                    <Select
                      value={security.passwordExpiry}
                      onValueChange={(value) => setSecurity({ ...security, passwordExpiry: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                        <SelectItem value="never">Nunca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handlePasswordChange} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Atualizar Configurações de Segurança
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Preferências de Notificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotif">Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações importantes por email
                      </p>
                    </div>
                    <Switch
                      id="emailNotif"
                      checked={notifications.email}
                      onCheckedChange={(checked) => {
                        const newNotifs = { ...notifications, email: checked };
                        setNotifications(newNotifs);
                        handleSavePreferences(newNotifs);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotif">Notificações por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber lembretes por mensagem de texto
                      </p>
                    </div>
                    <Switch
                      id="smsNotif"
                      checked={notifications.sms}
                      onCheckedChange={(checked) => {
                        const newNotifs = { ...notifications, sms: checked };
                        setNotifications(newNotifs);
                        handleSavePreferences(newNotifs);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="whatsappNotif">Notificações por WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber confirmações e lembretes via WhatsApp
                      </p>
                    </div>
                    <Switch
                      id="whatsappNotif"
                      checked={notifications.whatsapp}
                      onCheckedChange={(checked) => {
                        const newNotifs = { ...notifications, whatsapp: checked };
                        setNotifications(newNotifs);
                        handleSavePreferences(newNotifs);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotif">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações instantâneas no seu dispositivo
                      </p>
                    </div>
                    <Switch
                      id="pushNotif"
                      checked={notifications.push}
                      onCheckedChange={(checked) => {
                        const newNotifs = { ...notifications, push: checked };
                        setNotifications(newNotifs);
                        handleSavePreferences(newNotifs);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="remindersNotif">Lembretes de Consulta</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber lembretes antes das consultas agendadas
                      </p>
                    </div>
                    <Switch
                      id="remindersNotif"
                      checked={notifications.reminders}
                      onCheckedChange={(checked) => {
                        const newNotifs = { ...notifications, reminders: checked };
                        setNotifications(newNotifs);
                        handleSavePreferences(newNotifs);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingNotif">Emails de Marketing</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber ofertas exclusivas, novidades e promoções
                      </p>
                    </div>
                    <Switch
                      id="marketingNotif"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => {
                        const newNotifs = { ...notifications, marketing: checked };
                        setNotifications(newNotifs);
                        handleSavePreferences(newNotifs);
                      }}
                    />
                  </div>

                  <Button onClick={handleSavePreferences} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Salvar Preferências
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Configurações de Privacidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="profileVisibility">Visibilidade do perfil</Label>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) => setPrivacy({ ...privacy, profileVisibility: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="contacts">Apenas contatos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="shareData">Compartilhar dados para pesquisa</Label>
                      <p className="text-sm text-muted-foreground">
                        Ajude a melhorar nossos serviços compartilhando dados anônimos
                      </p>
                    </div>
                    <Switch
                      id="shareData"
                      checked={privacy.shareData}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, shareData: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Análise de uso</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir coleta de dados de uso para melhorar a experiência
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={privacy.analytics}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, analytics: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="locationTracking">Rastreamento de localização</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir acesso à localização para melhorar sugestões
                      </p>
                    </div>
                    <Switch
                      id="locationTracking"
                      checked={privacy.locationTracking}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, locationTracking: checked })}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Gerenciar dados</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        Baixar meus dados
                      </Button>
                      <Button variant="outline" size="sm">
                        Solicitar exclusão de conta
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleSavePreferences} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Salvar Configurações de Privacidade
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Informações de Cobrança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="cardNumber">Cartão de crédito</Label>
                    <Input
                      id="cardNumber"
                      placeholder="**** **** **** 1234"
                      disabled
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Validade</Label>
                      <Input id="expiry" placeholder="MM/AA" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingAddress">Endereço de cobrança</Label>
                    <Textarea
                      id="billingAddress"
                      placeholder="Digite seu endereço de cobrança"
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4">Histórico de pagamentos</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">Consulta - Clínica Dental doltorizze</p>
                          <p className="text-sm text-muted-foreground">15/01/2024</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R$ 120,00</p>
                          <p className="text-xs text-success">Pago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button>Atualizar Informações de Cobrança</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}