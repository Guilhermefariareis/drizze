import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Heart,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions: string;
  allergies: string;
  medications: string;
  insurance_provider: string;
  insurance_number: string;
  avatar_url?: string;
}

export default function PatientProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});

  useEffect(() => {
    if (!user) {
      navigate('/patient-login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Buscar perfil do paciente
      const { data: profileData, error: profileError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
        setFormData(profileData);
      } else {
        // Criar perfil básico se não existir
        const basicProfile: Partial<PatientProfile> = {
          id: user?.id,
          full_name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          phone: '',
          birth_date: '',
          gender: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          medical_conditions: '',
          allergies: '',
          medications: '',
          insurance_provider: '',
          insurance_number: ''
        };
        setProfile(basicProfile as PatientProfile);
        setFormData(basicProfile);
      }

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('patients')
        .upsert({
          id: user?.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile(formData as PatientProfile);
      setEditing(false);
      toast.success('Perfil atualizado com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setEditing(false);
  };

  const handleInputChange = (field: keyof PatientProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
              <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais e médicas</p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>

          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profile?.full_name || 'Nome não informado'}</h2>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {profile?.birth_date && (
                      <Badge variant="outline">
                        {calculateAge(profile.birth_date)} anos
                      </Badge>
                    )}
                    {profile?.gender && (
                      <Badge variant="outline">
                        {profile.gender === 'male' ? 'Masculino' : profile.gender === 'female' ? 'Feminino' : 'Outro'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    {editing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name || ''}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profile?.full_name || 'Não informado'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <p className="text-sm p-2 bg-muted rounded">{profile?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profile?.phone || 'Não informado'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    {editing ? (
                      <Input
                        id="birth_date"
                        type="date"
                        value={formData.birth_date || ''}
                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profile?.birth_date ? formatDate(profile.birth_date) : 'Não informado'}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  {editing ? (
                    <Select value={formData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">
                      {profile?.gender === 'male' ? 'Masculino' : profile?.gender === 'female' ? 'Feminino' : profile?.gender === 'other' ? 'Outro' : 'Não informado'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  {editing ? (
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, número, complemento"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{profile?.address || 'Não informado'}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    {editing ? (
                      <Input
                        id="city"
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profile?.city || 'Não informado'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    {editing ? (
                      <Input
                        id="state"
                        value={formData.state || ''}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="SP"
                      />
                    ) : (
                      <p className="text-sm p-2 bg-muted rounded">{profile?.state || 'Não informado'}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  {editing ? (
                    <Input
                      id="zip_code"
                      value={formData.zip_code || ''}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      placeholder="00000-000"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{profile?.zip_code || 'Não informado'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contato de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Nome do Contato</Label>
                  {editing ? (
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name || ''}
                      onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{profile?.emergency_contact_name || 'Não informado'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Telefone do Contato</Label>
                  {editing ? (
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone || ''}
                      onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{profile?.emergency_contact_phone || 'Não informado'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Informações Médicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medical_conditions">Condições Médicas</Label>
                {editing ? (
                  <Textarea
                    id="medical_conditions"
                    value={formData.medical_conditions || ''}
                    onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                    placeholder="Descreva condições médicas relevantes"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded min-h-[80px]">{profile?.medical_conditions || 'Nenhuma condição médica informada'}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                {editing ? (
                  <Textarea
                    id="allergies"
                    value={formData.allergies || ''}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    placeholder="Descreva alergias conhecidas"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded min-h-[80px]">{profile?.allergies || 'Nenhuma alergia informada'}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medications">Medicamentos em Uso</Label>
                {editing ? (
                  <Textarea
                    id="medications"
                    value={formData.medications || ''}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    placeholder="Liste medicamentos que está tomando"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded min-h-[80px]">{profile?.medications || 'Nenhum medicamento informado'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informações do Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_provider">Operadora do Plano</Label>
                  {editing ? (
                    <Input
                      id="insurance_provider"
                      value={formData.insurance_provider || ''}
                      onChange={(e) => handleInputChange('insurance_provider', e.target.value)}
                      placeholder="Nome da operadora"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{profile?.insurance_provider || 'Não informado'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance_number">Número do Plano</Label>
                  {editing ? (
                    <Input
                      id="insurance_number"
                      value={formData.insurance_number || ''}
                      onChange={(e) => handleInputChange('insurance_number', e.target.value)}
                      placeholder="Número da carteirinha"
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{profile?.insurance_number || 'Não informado'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}