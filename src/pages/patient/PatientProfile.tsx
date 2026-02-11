import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Loader2,
  FileText,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf: string; // New field
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [searchingCep, setSearchingCep] = useState(false);

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

      // 1. Buscar perfil base (informações pessoais)
      const { data: profileBase, error: profileBaseError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileBaseError && profileBaseError.code !== 'PGRST116') {
        throw profileBaseError;
      }

      // 2. Buscar dados de paciente (informações médicas)
      let patientBase = null;
      if (profileBase) {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('profile_id', profileBase.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar dados médicos:', error);
        } else {
          patientBase = data;
        }
      }

      const addressData = (profileBase?.address as any) || {};

      const combinedProfile: PatientProfile = {
        id: profileBase?.id || user?.id,
        full_name: profileBase?.full_name || user?.user_metadata?.full_name || '',
        email: profileBase?.email || user?.email || '',
        phone: profileBase?.phone || '',
        cpf: profileBase?.cpf || '',
        birth_date: profileBase?.birth_date || '',
        gender: profileBase?.gender || '',
        avatar_url: profileBase?.avatar_url || '',
        address: addressData.street || '',
        city: addressData.city || '',
        state: addressData.state || '',
        zip_code: addressData.zip_code || '',
        emergency_contact_name: (patientBase?.emergency_contact as any)?.name || '',
        emergency_contact_phone: (patientBase?.emergency_contact as any)?.phone || '',
        medical_conditions: (patientBase?.medical_history as any)?.conditions || '',
        allergies: Array.isArray(patientBase?.allergies) ? patientBase.allergies.join(', ') : '',
        medications: Array.isArray(patientBase?.medications) ? patientBase.medications.join(', ') : '',
        insurance_provider: (patientBase?.insurance_info as any)?.provider || '',
        insurance_number: (patientBase?.insurance_info as any)?.policy_number || '',
      };

      setProfile(combinedProfile);
      setFormData(combinedProfile);

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
      if (!user) return;

      // 1. Atualizar Profile (Dados Pessoais)
      const addressJson = {
        street: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        zip_code: formData.zip_code || ''
      };

      const profileUpdates = {
        full_name: formData.full_name,
        phone: formData.phone,
        cpf: formData.cpf, // Save CPF
        birth_date: formData.birth_date,
        gender: formData.gender,
        address: addressJson,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString()
      };

      let profileId = profile?.id;

      // 1. Fetch current profile to discover available columns
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil para verificação de colunas:', fetchError);
      }

      // Filter updates based on what actually exists in the DB Row
      const safeProfileUpdates: any = { ...profileUpdates };

      if (existingProfile) {
        const existingKeys = Object.keys(existingProfile);
        Object.keys(safeProfileUpdates).forEach(key => {
          if (!existingKeys.includes(key)) {
            console.warn(`⚠️ [PatientProfile] Coluna "${key}" não encontrada na tabela profiles. Removendo do update.`);
            delete safeProfileUpdates[key];
          }
        });
      }

      let updatedProfile;
      const attemptUpdate: any = async (payload: any) => {
        const { data, error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', user.id)
          .select()
          .maybeSingle();

        if (error) {
          // If update fails due to a missing column, try to identify it and retry
          const missingColumnMatch = error.message?.match(/column "(.+)" does not exist/);
          if (missingColumnMatch && missingColumnMatch[1]) {
            const missingCol = missingColumnMatch[1];
            console.warn(`⚠️ [PatientProfile] Retentativa: Removendo "${missingCol}" que gerou erro.`);
            const nextPayload = { ...payload };
            delete nextPayload[missingCol];
            return attemptUpdate(nextPayload);
          }
          throw error;
        }
        return data;
      };

      const attemptInsert: any = async (payload: any) => {
        const { data, error } = await supabase
          .from('profiles')
          .insert([{ ...payload, id: user.id, email: user.email }])
          .select()
          .maybeSingle();

        if (error) {
          const missingColumnMatch = error.message?.match(/column "(.+)" does not exist/);
          if (missingColumnMatch && missingColumnMatch[1]) {
            const missingCol = missingColumnMatch[1];
            console.warn(`⚠️ [PatientProfile] Retentativa (Insert): Removendo "${missingCol}" que gerou erro.`);
            const nextPayload = { ...payload };
            delete nextPayload[missingCol];
            return attemptInsert(nextPayload);
          }
          throw error;
        }
        return data;
      };

      if (existingProfile) {
        updatedProfile = await attemptUpdate(safeProfileUpdates);
      } else {
        updatedProfile = await attemptInsert(safeProfileUpdates);
      }

      profileId = updatedProfile?.id || user.id;

      // 2. Atualizar ou Criar Patient (Dados Médicos)
      const patientData = {
        profile_id: profileId,
        medical_history: { conditions: formData.medical_conditions },
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
        medications: formData.medications ? formData.medications.split(',').map(s => s.trim()) : [],
        emergency_contact: {
          name: formData.emergency_contact_name,
          phone: formData.emergency_contact_phone
        },
        insurance_info: {
          provider: formData.insurance_provider,
          policy_number: formData.insurance_number
        },
        updated_at: new Date().toISOString()
      };

      const { error: patientError } = await supabase
        .from('patients')
        .upsert(patientData, { onConflict: 'profile_id' });

      if (patientError) throw patientError;

      setProfile(formData as PatientProfile);
      setEditing(false);
      toast.success('Perfil atualizado com sucesso!');

    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer o upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`; // Folder per user

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update state immediately for preview
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Foto carregada! Clique em Salvar para persistir a mudança.');

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
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
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Masking helpers
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      setSearchingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: `${data.logradouro}${data.bairro ? ` - ${data.bairro}` : ''}`,
        city: data.localidade,
        state: data.uf,
        zip_code: maskCEP(cleanCep)
      }));

      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setSearchingCep(false);
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
    <div className="flex min-h-screen bg-background text-foreground">
      <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} p-4 md:p-6 lg:p-10 relative overflow-hidden`}>
        {/* Decorative Background */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Meu Perfil</h1>
              <p className="text-muted-foreground text-lg">Gerencie suas informações pessoais e mantenha seu cadastro atualizado.</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {editing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={saving} className="rounded-xl">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="rounded-xl px-6 min-w-[120px]">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)} size="lg" className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>

          {/* Profile Card (Avatar & Info) */}
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
            <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8 px-4 md:px-8">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="relative group">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-2xl">
                    <AvatarImage src={editing ? (formData.avatar_url || '') : (profile?.avatar_url || '')} className="object-cover" />
                    <AvatarFallback className="text-3xl md:text-4xl font-bold bg-primary/10 text-primary">
                      {getInitials(formData.full_name || '')}
                    </AvatarFallback>
                  </Avatar>

                  {editing && (
                    <>
                      <Label
                        htmlFor="avatar-upload"
                        className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-5 w-5" />}
                      </Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">{formData.full_name || 'Nome não informado'}</h2>
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
                    <Mail className="h-4 w-4" /> {formData.email}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mt-4">
                    {formData.birth_date && (
                      <Badge variant="secondary" className="px-2 md:px-3 py-1 text-xs md:text-sm bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-0">
                        🎂 {calculateAge(formData.birth_date)} anos
                      </Badge>
                    )}
                    {formData.gender && (
                      <Badge variant="secondary" className="px-2 md:px-3 py-1 text-xs md:text-sm bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-0 capitalize">
                        ⚧ {formData.gender === 'male' ? 'Masculino' : formData.gender === 'female' ? 'Feminino' : 'Outro'}
                      </Badge>
                    )}
                    {formData.cpf && (
                      <Badge variant="outline" className="px-2 md:px-3 py-1 text-xs md:text-sm border-dashed">
                        🆔 {maskCPF(formData.cpf)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-3xl h-full">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="h-5 w-5" /></div>
                  Informações Pessoais
                </CardTitle>
                <CardDescription>Seus dados básicos de identificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input id="full_name" value={formData.full_name || ''} disabled className="bg-muted opacity-80" />
                  <p className="text-xs text-muted-foreground">O nome não pode ser alterado por segurança.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf ? maskCPF(formData.cpf) : ''}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      disabled={!editing}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular / WhatsApp</Label>
                    <Input
                      id="phone"
                      value={formData.phone ? maskPhone(formData.phone) : ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!editing}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date || ''}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select
                      value={formData.gender || ''}
                      onValueChange={(value) => handleInputChange('gender', value)}
                      disabled={!editing}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card >

            {/* Address Information */}
            < Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-3xl h-full">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><MapPin className="h-5 w-5" /></div>
                  Endereço Residencial
                </CardTitle>
                <CardDescription>Para correspondências e localização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="zip_code">CEP</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 group/cep">
                        <Input
                          id="zip_code"
                          value={formData.zip_code ? maskCEP(formData.zip_code) : ''}
                          onChange={(e) => handleInputChange('zip_code', e.target.value)}
                          onBlur={(e) => handleCepSearch(e.target.value)}
                          disabled={!editing || searchingCep}
                          placeholder="00000-000"
                          maxLength={9}
                          className={`transition-all duration-300 ${searchingCep ? 'opacity-70' : ''}`}
                        />
                        {searchingCep && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      {editing && !searchingCep && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCepSearch(formData.zip_code || '')}
                          className="h-10 px-3 font-bold text-primary border-primary/20 hover:bg-primary/5 rounded-xl transition-all whitespace-nowrap"
                        >
                          Buscar
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!editing}
                      placeholder="Rua, Av..."
                      className="transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado (UF)</Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!editing}
                      placeholder="SP"
                      maxLength={2}

                    />
                  </div>
                </div>
              </CardContent>
            </Card >

            {/* Medical Info */}
            < Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm rounded-3xl lg:col-span-2">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Heart className="h-5 w-5" /></div>
                  Ficha Médica & Emergência
                </CardTitle>
                <CardDescription>Informações cruciais para o seu atendimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Phone className="h-4 w-4" /> Contato de Emergência</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_name">Nome</Label>
                        <Input
                          id="emergency_name"
                          value={formData.emergency_contact_name || ''}
                          onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                          disabled={!editing}
                          placeholder="Ex: Mãe, Esposo(a)..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_phone">Telefone</Label>
                        <Input
                          id="emergency_phone"
                          value={formData.emergency_contact_phone ? maskPhone(formData.emergency_contact_phone) : ''}
                          onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                          disabled={!editing}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="font-semibold flex items-center gap-2 mb-3"><Shield className="h-4 w-4" /> Convênio Médico</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="insurance_provider">Operadora</Label>
                          <Input
                            id="insurance_provider"
                            value={formData.insurance_provider || ''}
                            onChange={(e) => handleInputChange('insurance_provider', e.target.value)}
                            disabled={!editing}
                            placeholder="Ex: Unimed, Bradesco..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insurance_number">Carteirinha</Label>
                          <Input
                            id="insurance_number"
                            value={formData.insurance_number || ''}
                            onChange={(e) => handleInputChange('insurance_number', e.target.value)}
                            disabled={!editing}
                            placeholder="Nº do cartão"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-l pl-0 md:pl-6 border-border/40">
                    <div className="space-y-2">
                      <Label htmlFor="medical_conditions">Condições Médicas / Histórico</Label>
                      <Textarea
                        id="medical_conditions"
                        value={formData.medical_conditions || ''}
                        onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                        disabled={!editing}
                        placeholder="Diabetes, Hipertensão, Cirurgias prévias..."
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Alergias</Label>
                      <Textarea
                        id="allergies"
                        value={formData.allergies || ''}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                        disabled={!editing}
                        placeholder="Medicamentos, Alimentos, Latex..."
                        className="resize-none bg-red-500/5 focus:bg-background transition-colors"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medications">Medicamentos em Uso</Label>
                      <Textarea
                        id="medications"
                        value={formData.medications || ''}
                        onChange={(e) => handleInputChange('medications', e.target.value)}
                        disabled={!editing}
                        placeholder="Liste o nome e dosagem"
                        className="resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}