import { useState } from 'react';
import { Edit, Save, X, Eye, EyeOff, Shield, Bell, CreditCard, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SettingsPage() {
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-05-15',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567'
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="birthDate">Data de nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={profile.birthDate}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      disabled={!editMode}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Select value={profile.state} disabled={!editMode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={profile.zipCode}
                        disabled={!editMode}
                        onChange={(e) => setProfile({...profile, zipCode: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {editMode && (
                    <div className="flex gap-2">
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
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
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua nova senha"
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
                      onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
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
                      onCheckedChange={(checked) => setSecurity({...security, loginAlerts: checked})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="passwordExpiry">Expiração da senha</Label>
                    <Select value={security.passwordExpiry}>
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
                  
                  <Button>Atualizar Configurações de Segurança</Button>
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
                      <Label htmlFor="emailNotif">Notificações por e-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações importantes por e-mail
                      </p>
                    </div>
                    <Switch
                      id="emailNotif"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotif">Notificações por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes por mensagem de texto
                      </p>
                    </div>
                    <Switch
                      id="smsNotif"
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="whatsappNotif">Notificações por WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba confirmações e lembretes via WhatsApp
                      </p>
                    </div>
                    <Switch
                      id="whatsappNotif"
                      checked={notifications.whatsapp}
                      onCheckedChange={(checked) => setNotifications({...notifications, whatsapp: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotif">Notificações push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações no navegador
                      </p>
                    </div>
                    <Switch
                      id="pushNotif"
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingNotif">E-mails de marketing</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba ofertas especiais e novidades
                      </p>
                    </div>
                    <Switch
                      id="marketingNotif"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="remindersNotif">Lembretes de consulta</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes antes das consultas
                      </p>
                    </div>
                    <Switch
                      id="remindersNotif"
                      checked={notifications.reminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, reminders: checked})}
                    />
                  </div>
                  
                  <Button>Salvar Preferências</Button>
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
                    <Select value={privacy.profileVisibility}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="friends">Apenas contatos</SelectItem>
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
                      onCheckedChange={(checked) => setPrivacy({...privacy, shareData: checked})}
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
                      onCheckedChange={(checked) => setPrivacy({...privacy, analytics: checked})}
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
                      onCheckedChange={(checked) => setPrivacy({...privacy, locationTracking: checked})}
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
                  
                  <Button>Salvar Configurações de Privacidade</Button>
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