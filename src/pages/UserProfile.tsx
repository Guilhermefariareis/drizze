import { useState, useEffect, useRef } from 'react';
import { User, ArrowLeft, Edit, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ---- Tipos auxiliares ----
interface Address {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface ClinicData {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  address?: any;
  city?: string;
  website?: string;
  social_media?: any;
  operating_hours?: any;
  clinic_slug?: string;
  hero_image_url?: string;
  whatsapp_url?: string;
  agenda_link_url?: string;
}

const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
];

export default function UserProfile() {
  const { user: authUser } = useAuth();
  const { role } = useUserRole();

  // Perfil simples (dados da tabela profiles)
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '/placeholder.svg',
    birthDate: ''
  });

  // Clínica e endereço
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [clinicAddress, setClinicAddress] = useState<Address>({
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: ''
  });

  // Estado de UI
  const [activeTab, setActiveTab] = useState<'perfil' | 'clinica'>('perfil');
  const [loading, setLoading] = useState(true);
  const [editingClinic, setEditingClinic] = useState(false);

  // Upload refs/flags
  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputHeroRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // ---- Carregar perfil + clínica ----
  useEffect(() => {
    const fetchData = async () => {
      if (!authUser?.id) return;
      try {
        setLoading(true);

        // Perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        const profile = profileData || ({} as any);
        setUser({
          name: profile.full_name || authUser.email?.split('@')[0] || '',
          email: profile.email || authUser.email || '',
          phone: profile.phone || '',
          avatar: profile.avatar_url || '/placeholder.svg',
          birthDate: profile.birth_date || ''
        });

        // Clínica (owner OU master)
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('*')
          .or(`owner_id.eq.${authUser.id},master_user_id.eq.${authUser.id}`)
          .maybeSingle();
        if (clinicError && clinicError.code !== 'PGRST116') throw clinicError;

        if (clinicData) {
          // Buscar dados do perfil da clínica (imagens)
          const { data: profileData, error: profileError } = await supabase
            .from('clinic_profiles')
            .select('logo_url, cover_image_url')
            .eq('clinic_id', clinicData.id)
            .maybeSingle();
          
          // Combinar dados da clínica com dados do perfil
          const combinedData = {
            ...clinicData,
            logo_url: profileData?.logo_url || clinicData.logo_url,
            hero_image_url: profileData?.cover_image_url || clinicData.hero_image_url
          };
          
          setClinic(combinedData as ClinicData);
          const addr = typeof clinicData.address === 'string'
            ? safeParseJSON(clinicData.address)
            : clinicData.address;
          if (addr) {
            setClinicAddress({
              street: addr.street || '',
              number: addr.number || '',
              complement: addr.complement || '',
              neighborhood: addr.neighborhood || '',
              city: addr.city || '',
              state: addr.state || '',
              zip: addr.zip || ''
            });
          }
        }
      } catch (e) {
        console.error(e);
        toast.error('Erro ao carregar dados de perfil/clínica');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authUser?.id]);

  // Definir aba padrão baseada no papel do usuário e se tem clínica
  useEffect(() => {
    if (role === 'patient' || (role && !clinic)) {
      setActiveTab('perfil');
    } else if (clinic && (role === 'clinic' || role === 'admin')) {
      setActiveTab('clinica');
    }
  }, [role, clinic]);

  function safeParseJSON(v: any) {
    try { return JSON.parse(v); } catch { return null; }
  }

  // ---- Handlers ----
  const handleClinicChange = (field: keyof ClinicData, value: any) => {
    if (!clinic) return;
    setClinic({ ...clinic, [field]: value });
  };
  const handleAddressChange = (field: keyof Address, value: string) => {
    setClinicAddress(prev => ({ ...prev, [field]: value }));
  };

  // ---- Salvar clínica ----
  const saveClinicProfile = async () => {
    if (!authUser?.id || !clinic?.id) return;

    if (!clinic.name?.trim()) return toast.error('Nome da clínica é obrigatório');
    if (!clinic.email?.trim()) return toast.error('E-mail da clínica é obrigatório');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clinic.email)) return toast.error('Formato de e-mail inválido');
    if (clinic.clinic_slug && !/^[a-z0-9-]+$/.test(clinic.clinic_slug)) {
      return toast.error('Slug deve conter apenas letras minúsculas, números e hífens');
    }

    try {
      const payload: Partial<ClinicData> & { address: Address } = {
        name: clinic.name,
        cnpj: clinic.cnpj,
        email: clinic.email,
        phone: clinic.phone,
        description: clinic.description,
        website: clinic.website,
        address: clinicAddress,
        city: clinicAddress.city,
        logo_url: clinic.logo_url,
        clinic_slug: clinic.clinic_slug,
        hero_image_url: clinic.hero_image_url,
        whatsapp_url: clinic.whatsapp_url,
        agenda_link_url: clinic.agenda_link_url,
        social_media: clinic.social_media,
        operating_hours: clinic.operating_hours,
      };

      const { data, error } = await supabase
        .from('clinics')
        .update(payload)
        .eq('id', clinic.id) // ⚠️ apenas por ID
        .select('id')
        .maybeSingle();

      if (error) {
        console.error(error);
        return toast.error(`Erro ao salvar dados da clínica: ${error.message}`);
      }
      if (!data) return toast.error('Nenhuma clínica foi atualizada. Verifique RLS/ID.');

      toast.success('Dados da clínica atualizados com sucesso!');
      setEditingClinic(false);
    } catch (e: any) {
      console.error(e);
      toast.error(`Erro ao salvar dados da clínica: ${e?.message || 'Erro desconhecido'}`);
    }
  };

  // ---- Upload (Supabase Storage -> bucket profile-images) ----
  const uploadClinicImage = async (kind: 'logo' | 'hero') => {
    if (!clinic?.id) return toast.error('Clínica não carregada');
    const ref = kind === 'logo' ? fileInputLogoRef.current : fileInputHeroRef.current;
    const setUploading = kind === 'logo' ? setIsUploadingLogo : setIsUploadingHero;
    if (!ref?.files || ref.files.length === 0) return toast.error('Nenhum arquivo selecionado');

    const file = ref.files[0];
    const bucket = 'profile-images';
    const path = `clinics/${clinic.id}/${kind}-${Date.now()}-${file.name}`; // ⬅️ caminho exigido pelas policies

    try {
      setUploading(true);
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error('Não foi possível obter a URL pública');

      const field = kind === 'logo' ? 'logo_url' : (kind === 'hero' ? 'cover_image_url' : 'hero_image_url');
      setClinic(prev => (prev ? { ...prev, [field]: publicUrl } as ClinicData : prev));

      // Atualizar na tabela clinic_profiles em vez de clinics
      const { error: updErr } = await supabase
        .from('clinic_profiles')
        .upsert({ 
          clinic_id: clinic.id,
          [field]: publicUrl 
        }, {
          onConflict: 'clinic_id'
        });
      if (updErr) throw updErr;

      toast.success(kind === 'logo' ? 'Logo atualizada!' : 'Imagem de capa atualizada!');
    } catch (e: any) {
      console.error(e);
      toast.error(`Falha no upload: ${e?.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
      if (ref) (ref as HTMLInputElement).value = '' as any;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Carregando...</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={() => window.history.back()} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> 
              {clinic && (role === 'clinic' || role === 'admin') ? 'Meu Perfil & Clínica' : 'Meu Perfil'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList>
                <TabsTrigger value="perfil">Perfil Pessoal</TabsTrigger>
                {clinic && (role === 'clinic' || role === 'admin') && (
                  <TabsTrigger value="clinica">Minha Clínica</TabsTrigger>
                )}
              </TabsList>

              {/* PERFIL */}
              <TabsContent value="perfil" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Data de Nascimento</Label>
                    <Input type="date" value={user.birthDate} onChange={(e) => setUser({ ...user, birthDate: e.target.value })} />
                  </div>
                </div>
              </TabsContent>

              {/* CLÍNICA */}
              <TabsContent value="clinica" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" /> Dados da Clínica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Uploader LOGO */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={clinic?.logo_url || '/placeholder.svg'} alt={clinic?.name || 'Logo da clínica'} />
                        <AvatarFallback>CL</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-3">
                        <input ref={fileInputLogoRef} type="file" accept="image/*" className="hidden" onChange={() => uploadClinicImage('logo')} />
                        <Button variant="secondary" onClick={() => fileInputLogoRef.current?.click()} disabled={isUploadingLogo}>
                          {isUploadingLogo ? 'Enviando...' : 'Trocar logo'}
                        </Button>
                        {clinic?.logo_url && (
                          <a href={clinic.logo_url} target="_blank" rel="noreferrer" className="text-sm underline">ver logo</a>
                        )}
                      </div>
                    </div>

                    {/* Uploader HERO/CAPA */}
                    <div className="flex flex-col gap-2">
                      <Label>Imagem de capa (hero)</Label>
                      {clinic?.hero_image_url && (
                        <img src={clinic.hero_image_url} alt="Capa da clínica" className="w-full max-w-xl rounded-2xl shadow" />
                      )}
                      <div className="flex items-center gap-3">
                        <input ref={fileInputHeroRef} type="file" accept="image/*" className="hidden" onChange={() => uploadClinicImage('hero')} />
                        <Button variant="secondary" onClick={() => fileInputHeroRef.current?.click()} disabled={isUploadingHero}>
                          {isUploadingHero ? 'Enviando...' : 'Trocar capa'}
                        </Button>
                        {clinic?.hero_image_url && (
                          <a href={clinic.hero_image_url} target="_blank" rel="noreferrer" className="text-sm underline">ver capa</a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">As imagens são enviadas para o bucket <strong>profile-images</strong> em <code>clinics/{clinic?.id}/</code>. Certifique-se de que o bucket é público (ou adaptamos para URL assinada).</p>
                    </div>

                    {/* Campos principais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome da Clínica</Label>
                        <Input value={clinic?.name || ''} onChange={(e) => handleClinicChange('name', e.target.value)} />
                      </div>
                      <div>
                        <Label>CNPJ</Label>
                        <Input value={clinic?.cnpj || ''} onChange={(e) => handleClinicChange('cnpj', e.target.value)} />
                      </div>
                      <div>
                        <Label>E-mail</Label>
                        <Input value={clinic?.email || ''} onChange={(e) => handleClinicChange('email', e.target.value)} />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input value={clinic?.phone || ''} onChange={(e) => handleClinicChange('phone', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Descrição</Label>
                        <Input value={clinic?.description || ''} onChange={(e) => handleClinicChange('description', e.target.value)} />
                      </div>
                    </div>

                    {/* Links/slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Website</Label>
                        <Input value={clinic?.website || ''} onChange={(e) => handleClinicChange('website', e.target.value)} />
                      </div>
                      <div>
                        <Label>Slug da Clínica</Label>
                        <Input value={clinic?.clinic_slug || ''} onChange={(e) => handleClinicChange('clinic_slug', e.target.value)} placeholder="ex: sorriso-saude" />
                      </div>
                      <div>
                        <Label>WhatsApp (URL)</Label>
                        <Input value={clinic?.whatsapp_url || ''} onChange={(e) => handleClinicChange('whatsapp_url', e.target.value)} />
                      </div>
                      <div>
                        <Label>Link da Agenda</Label>
                        <Input value={clinic?.agenda_link_url || ''} onChange={(e) => handleClinicChange('agenda_link_url', e.target.value)} />
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Rua</Label>
                        <Input value={clinicAddress.street || ''} onChange={(e) => handleAddressChange('street', e.target.value)} />
                      </div>
                      <div>
                        <Label>Número</Label>
                        <Input value={clinicAddress.number || ''} onChange={(e) => handleAddressChange('number', e.target.value)} />
                      </div>
                      <div>
                        <Label>Bairro</Label>
                        <Input value={clinicAddress.neighborhood || ''} onChange={(e) => handleAddressChange('neighborhood', e.target.value)} />
                      </div>
                      <div>
                        <Label>Cidade</Label>
                        <Input value={clinicAddress.city || ''} onChange={(e) => handleAddressChange('city', e.target.value)} />
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <Select value={clinicAddress.state || ''} onValueChange={(v) => handleAddressChange('state', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRAZILIAN_STATES.map((s) => (
                              <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>CEP</Label>
                        <Input value={clinicAddress.zip || ''} onChange={(e) => handleAddressChange('zip', e.target.value)} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!editingClinic ? (
                        <Button onClick={() => setEditingClinic(true)} variant="secondary">
                          <Edit className="w-4 h-4 mr-2" /> Editar
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Button onClick={saveClinicProfile}>Salvar Dados da Clínica</Button>
                          <Button variant="outline" onClick={() => setEditingClinic(false)}>Cancelar</Button>
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
