import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Edit, MapPin, Lock, Building2, Camera, Phone, Mail, Globe, MessageCircle, Clock, Share2, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { 
  processImageComplete, 
  ImageValidationOptions, 
  ImageProcessingOptions, 
  ProcessedImage,
  cleanupPreviewUrl
} from '@/utils/imageProcessor';

interface ClinicData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  hero_image_url?: string;
  description?: string;
  website?: string;
  whatsapp_url?: string;
  social_media?: any;
  operating_hours?: any;
  address?: any;
  city?: string;
  owner_id?: string;
  master_user_id?: string;
}

interface AddressData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface SocialMediaData {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

interface OperatingHoursData {
  monday?: { open: string; close: string; closed: boolean };
  tuesday?: { open: string; close: string; closed: boolean };
  wednesday?: { open: string; close: string; closed: boolean };
  thursday?: { open: string; close: string; closed: boolean };
  friday?: { open: string; close: string; closed: boolean };
  saturday?: { open: string; close: string; closed: boolean };
  sunday?: { open: string; close: string; closed: boolean };
}

// Lista de estados brasileiros
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
  { code: 'TO', name: 'Tocantins' }
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

export default function ClinicProfileManager() {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroUploadProgress, setHeroUploadProgress] = useState(0);
  
  // Estados de edição
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [editingSocial, setEditingSocial] = useState(false);
  const [editingHours, setEditingHours] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  
  // Dados do formulário
  const [clinicName, setClinicName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [socialMedia, setSocialMedia] = useState<SocialMediaData>({
    instagram: '',
    facebook: '',
    linkedin: ''
  });
  const [operatingHours, setOperatingHours] = useState<OperatingHoursData>({
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '18:00', closed: false },
    saturday: { open: '08:00', close: '12:00', closed: false },
    sunday: { open: '08:00', close: '12:00', closed: true }
  });
  const [address, setAddress] = useState<AddressData>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      fetchClinicData();
    }
  }, [user]);

  const fetchClinicData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 [fetchClinicData] INICIANDO BUSCA DA CLÍNICA');
      console.log('👤 [fetchClinicData] USER ID:', user?.id);
      console.log('📧 [fetchClinicData] USER EMAIL:', user?.email);
      
      // CORREÇÃO CRÍTICA: Buscar primeiro por owner_id (mais comum)
      console.log('🔎 [fetchClinicData] Buscando por owner_id primeiro...');
      const { data: clinicByOwner, error: ownerError } = await supabase
        .from('clinics')
        .select('*')
        .eq('owner_id', user?.id)
        .maybeSingle();

      console.log('📊 [fetchClinicData] RESULTADO owner_id:', {
        found: !!clinicByOwner,
        error: ownerError,
        clinicId: clinicByOwner?.id,
        clinicName: clinicByOwner?.name,
        clinicEmail: clinicByOwner?.email
      });

      if (clinicByOwner && !ownerError) {
        console.log('✅ [fetchClinicData] CLÍNICA ENCONTRADA POR owner_id:', clinicByOwner.id);
        setClinic(clinicByOwner);
        loadClinicData(clinicByOwner);
        return;
      }
      
      // Se não encontrou por owner_id, tentar por master_user_id
      console.log('🔎 [fetchClinicData] Buscando por master_user_id...');
      const { data: clinicByMaster, error: masterError } = await supabase
        .from('clinics')
        .select('*')
        .eq('master_user_id', user?.id)
        .maybeSingle();

      console.log('📊 [fetchClinicData] RESULTADO master_user_id:', {
        found: !!clinicByMaster,
        error: masterError,
        clinicId: clinicByMaster?.id,
        clinicName: clinicByMaster?.name,
        clinicEmail: clinicByMaster?.email
      });
      
      if (clinicByMaster && !masterError) {
        console.log('✅ [fetchClinicData] CLÍNICA ENCONTRADA POR master_user_id:', clinicByMaster.id);
        setClinic(clinicByMaster);
        loadClinicData(clinicByMaster);
        return;
      }
      
      // Se não encontrou por nenhum dos dois campos
      console.error('❌ [fetchClinicData] CLÍNICA NÃO ENCONTRADA EM NENHUM CAMPO!');
      console.error('❌ [fetchClinicData] owner_id error:', ownerError);
      console.error('❌ [fetchClinicData] master_user_id error:', masterError);
      toast.error('Clínica não encontrada. Verifique se você tem permissão para acessar esta clínica.');
      
    } catch (error) {
      console.error('❌ [fetchClinicData] ERRO GERAL:', error);
      toast.error('Erro ao carregar dados da clínica');
    } finally {
      setLoading(false);
    }
  };

  const loadClinicData = (clinicData: ClinicData) => {
    setClinicName(clinicData.name || '');
    setDescription(clinicData.description || '');
    setPhone(clinicData.phone || '');
    setEmail(clinicData.email || '');
    setWebsite(clinicData.website || '');
    setWhatsappUrl(clinicData.whatsapp_url || '');
    
    // Carregar redes sociais
    if (clinicData.social_media) {
      const socialData = typeof clinicData.social_media === 'string' 
        ? JSON.parse(clinicData.social_media) 
        : clinicData.social_media;
      setSocialMedia({
        instagram: socialData.instagram || '',
        facebook: socialData.facebook || '',
        linkedin: socialData.linkedin || ''
      });
    }
    
    // Carregar horários de funcionamento
    if (clinicData.operating_hours) {
      const hoursData = typeof clinicData.operating_hours === 'string' 
        ? JSON.parse(clinicData.operating_hours) 
        : clinicData.operating_hours;
      setOperatingHours(hoursData);
    }
    
    loadAddressData(clinicData);
  };

  const loadAddressData = (clinicData: ClinicData) => {
    if (clinicData.address) {
      const addressData = typeof clinicData.address === 'string' 
        ? JSON.parse(clinicData.address) 
        : clinicData.address;
      
      setAddress({
        street: addressData.street || '',
        number: addressData.number || '',
        neighborhood: addressData.neighborhood || '',
        city: clinicData.city || addressData.city || '',
        state: addressData.state || '',
        zip_code: addressData.zip_code || ''
      });
    }
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    // VALIDAÇÃO CRÍTICA DE SEGURANÇA
    if (!clinic?.id) {
      console.error('❌ [handleHeroImageUpload] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado. Não é possível fazer upload.');
      return;
    }
    
    // Validar se a clínica pertence ao usuário
    if (clinic.master_user_id !== user?.id && clinic.owner_id !== user?.id) {
      console.error('❌ [handleHeroImageUpload] USUÁRIO NÃO TEM PERMISSÃO!');
      console.error('❌ [handleHeroImageUpload] clinic.master_user_id:', clinic.master_user_id);
      console.error('❌ [handleHeroImageUpload] clinic.owner_id:', clinic.owner_id);
      console.error('❌ [handleHeroImageUpload] user.id:', user?.id);
      toast.error('Erro: Você não tem permissão para editar esta clínica.');
      return;
    }
    
    try {
      console.log('🔄 [handleHeroImageUpload] Fazendo upload de imagem de capa para clínica ID:', clinic.id);
      console.log('👤 [handleHeroImageUpload] USER ID:', user?.id);
      console.log('📧 [handleHeroImageUpload] USER EMAIL:', user?.email);
      setUploadingHero(true);
      setHeroUploadProgress(10);
      
      // Configurações de validação e processamento para hero image
      const validationOptions: ImageValidationOptions = {
        maxWidth: 3840,
        maxHeight: 2160,
        minWidth: 800,
        minHeight: 400,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
      };
      
      const processingOptions: ImageProcessingOptions = {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'jpeg'
      };
      
      setHeroUploadProgress(20);
      
      // Processar imagem
      const processedImage = await processImageComplete(
        file,
        validationOptions,
        processingOptions
      );
      
      setHeroUploadProgress(50);
      
      // Upload da imagem principal
      const timestamp = Date.now();
      const mainFileName = `${clinic.id}-hero-${timestamp}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(mainFileName, processedImage.file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }
      
      setHeroUploadProgress(85);

      // Obter URL pública da imagem principal
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(mainFileName);

      // Atualizar banco de dados
      const { error } = await supabase
        .from('clinics')
        .update({ hero_image_url: publicUrl })
        .eq('id', clinic.id);
      
      if (error) {
        throw new Error(`Erro ao salvar imagem de capa: ${error.message}`);
      }
      
      setHeroUploadProgress(100);
      
      // Limpar preview
      cleanupPreviewUrl(processedImage.preview);
      
      toast.success('Imagem de capa atualizada com sucesso!');
      
      // Atualizar dados da clínica imediatamente
      setClinic(prev => prev ? { ...prev, hero_image_url: publicUrl } : null);
      
      // Buscar dados atualizados do servidor
      setTimeout(() => {
        fetchClinicData();
        setHeroUploadProgress(0);
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem de capa:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem de capa');
      setHeroUploadProgress(0);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    // VALIDAÇÃO CRÍTICA DE SEGURANÇA
    if (!clinic?.id) {
      console.error('❌ [handleImageUpload] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado. Não é possível fazer upload.');
      return;
    }
    
    // Validar se a clínica pertence ao usuário
    if (clinic.master_user_id !== user?.id && clinic.owner_id !== user?.id) {
      console.error('❌ [handleImageUpload] USUÁRIO NÃO TEM PERMISSÃO!');
      console.error('❌ [handleImageUpload] clinic.master_user_id:', clinic.master_user_id);
      console.error('❌ [handleImageUpload] clinic.owner_id:', clinic.owner_id);
      console.error('❌ [handleImageUpload] user.id:', user?.id);
      toast.error('Erro: Você não tem permissão para editar esta clínica.');
      return;
    }
    
    try {
      console.log('🔄 [handleImageUpload] Fazendo upload de logo para clínica ID:', clinic.id);
      console.log('👤 [handleImageUpload] USER ID:', user?.id);
      console.log('📧 [handleImageUpload] USER EMAIL:', user?.email);
      setUploading(true);
      setUploadProgress(10);
      
      // Configurações de validação e processamento
      const validationOptions: ImageValidationOptions = {
        maxWidth: 2048,
        maxHeight: 2048,
        minWidth: 200,
        minHeight: 200,
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
      };
      
      const processingOptions: ImageProcessingOptions = {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.85,
        format: 'jpeg'
      };
      
      setUploadProgress(20);
      
      // Processar imagem
      const processedImage = await processImageComplete(
        file,
        validationOptions,
        processingOptions
      );
      
      setUploadProgress(50);
      
      // Upload da imagem principal
      const timestamp = Date.now();
      const mainFileName = `${clinic.id}-logo-${timestamp}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(mainFileName, processedImage.file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }
      
      setUploadProgress(70);
      
      setUploadProgress(85);

      // Obter URL pública da imagem principal
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(mainFileName);

      // Atualizar banco de dados
      const updateData = { logo_url: publicUrl };
      
      const { error } = await supabase
        .from('clinics')
        .update(updateData)
        .eq('id', clinic.id);
      
      if (error) {
        throw new Error(`Erro ao salvar logo: ${error.message}`);
      }
      
      setUploadProgress(100);
      
      // Limpar preview
      cleanupPreviewUrl(processedImage.preview);
      
      toast.success('Logo atualizado com sucesso!');
      
      // Atualizar dados da clínica imediatamente
      setClinic(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      
      // Buscar dados atualizados do servidor
      setTimeout(() => {
        fetchClinicData();
        setUploadProgress(0);
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const saveDescription = async () => {
    // VALIDAÇÃO CRÍTICA DE SEGURANÇA
    if (!clinic?.id) {
      console.error('❌ [saveDescription] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado. Não é possível salvar.');
      return;
    }
    
    // Validar se a clínica pertence ao usuário
    if (clinic.master_user_id !== user?.id && clinic.owner_id !== user?.id) {
      console.error('❌ [saveDescription] USUÁRIO NÃO TEM PERMISSÃO!');
      console.error('❌ [saveDescription] clinic.master_user_id:', clinic.master_user_id);
      console.error('❌ [saveDescription] clinic.owner_id:', clinic.owner_id);
      console.error('❌ [saveDescription] user.id:', user?.id);
      toast.error('Erro: Você não tem permissão para editar esta clínica.');
      return;
    }
    
    try {
      console.log('🔄 [saveDescription] Salvando descrição para clínica ID:', clinic.id);
      console.log('📝 [saveDescription] Nova descrição:', description.trim());
      console.log('👤 [saveDescription] USER ID:', user?.id);
      console.log('📧 [saveDescription] USER EMAIL:', user?.email);
      
      const { error } = await supabase
        .from('clinics')
        .update({ description: description.trim() })
        .eq('id', clinic.id);
      
      if (error) throw error;

      console.log('✅ [saveDescription] Descrição salva com sucesso!');
      toast.success('Descrição atualizada com sucesso!');
      setEditingDescription(false);
      
      // Forçar invalidação de cache e recarregar dados
      await invalidateClinicCache();
      await fetchClinicData();
    } catch (error) {
      console.error('❌ [saveDescription] Erro ao salvar descrição:', error);
      toast.error('Erro ao salvar descrição');
    }
  };

  const saveContact = async () => {
    // VALIDAÇÃO CRÍTICA DE SEGURANÇA
    if (!clinic?.id) {
      console.error('❌ [saveContact] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado. Não é possível salvar.');
      return;
    }
    
    // Validar se a clínica pertence ao usuário
    if (clinic.master_user_id !== user?.id && clinic.owner_id !== user?.id) {
      console.error('❌ [saveContact] USUÁRIO NÃO TEM PERMISSÃO!');
      console.error('❌ [saveContact] clinic.master_user_id:', clinic.master_user_id);
      console.error('❌ [saveContact] clinic.owner_id:', clinic.owner_id);
      console.error('❌ [saveContact] user.id:', user?.id);
      toast.error('Erro: Você não tem permissão para editar esta clínica.');
      return;
    }
    
    try {
      console.log('🔄 [saveContact] Salvando contato para clínica ID:', clinic.id);
      console.log('📞 [saveContact] Novo telefone:', phone.trim());
      console.log('📧 [saveContact] Novo email:', email.trim());
      console.log('👤 [saveContact] USER ID:', user?.id);
      console.log('📧 [saveContact] USER EMAIL:', user?.email);
      
      const { error } = await supabase
        .from('clinics')
        .update({ 
          phone: phone.trim(),
          email: email.trim()
        })
        .eq('id', clinic.id);
      
      if (error) throw error;

      console.log('✅ [saveContact] Contato salvo com sucesso!');
      toast.success('Informações de contato atualizadas com sucesso!');
      setEditingContact(false);
      
      // Forçar invalidação de cache e recarregar dados
      await invalidateClinicCache();
      await fetchClinicData();
    } catch (error) {
      console.error('❌ [saveContact] Erro ao salvar contato:', error);
      toast.error('Erro ao salvar informações de contato');
    }
  };

  const saveWebsite = async () => {
    // VALIDAÇÃO CRÍTICA DE SEGURANÇA
    if (!clinic?.id) {
      console.error('❌ [saveWebsite] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado. Não é possível salvar.');
      return;
    }
    
    // Validar se a clínica pertence ao usuário
    if (clinic.master_user_id !== user?.id && clinic.owner_id !== user?.id) {
      console.error('❌ [saveWebsite] USUÁRIO NÃO TEM PERMISSÃO!');
      console.error('❌ [saveWebsite] clinic.master_user_id:', clinic.master_user_id);
      console.error('❌ [saveWebsite] clinic.owner_id:', clinic.owner_id);
      console.error('❌ [saveWebsite] user.id:', user?.id);
      toast.error('Erro: Você não tem permissão para editar esta clínica.');
      return;
    }
    
    try {
      console.log('🔄 [saveWebsite] Salvando website para clínica ID:', clinic.id);
      console.log('🌐 [saveWebsite] Novo website:', website.trim());
      console.log('💬 [saveWebsite] Nova URL WhatsApp:', whatsappUrl.trim());
      console.log('👤 [saveWebsite] USER ID:', user?.id);
      console.log('📧 [saveWebsite] USER EMAIL:', user?.email);
      
      const { error } = await supabase
        .from('clinics')
        .update({ 
          website: website.trim(),
          whatsapp_url: whatsappUrl.trim()
        })
        .eq('id', clinic.id);
      
      if (error) throw error;

      console.log('✅ [saveWebsite] Website salvo com sucesso!');
      toast.success('Informações de website atualizadas com sucesso!');
      setEditingWebsite(false);
      
      // Forçar invalidação de cache e recarregar dados
      await invalidateClinicCache();
      await fetchClinicData();
    } catch (error) {
      console.error('❌ [saveWebsite] Erro ao salvar website:', error);
      toast.error('Erro ao salvar informações de website');
    }
  };

  const saveSocialMedia = async () => {
    // VALIDAÇÃO CRÍTICA DE SEGURANÇA
    if (!clinic?.id) {
      console.error('❌ [saveSocialMedia] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado. Não é possível salvar.');
      return;
    }
    
    // Validar se a clínica pertence ao usuário
    if (clinic.master_user_id !== user?.id && clinic.owner_id !== user?.id) {
      console.error('❌ [saveSocialMedia] USUÁRIO NÃO TEM PERMISSÃO!');
      console.error('❌ [saveSocialMedia] clinic.master_user_id:', clinic.master_user_id);
      console.error('❌ [saveSocialMedia] clinic.owner_id:', clinic.owner_id);
      console.error('❌ [saveSocialMedia] user.id:', user?.id);
      toast.error('Erro: Você não tem permissão para editar esta clínica.');
      return;
    }
    
    try {
      console.log('🔄 [saveSocialMedia] Salvando redes sociais para clínica ID:', clinic.id);
      console.log('📱 [saveSocialMedia] Novas redes sociais:', socialMedia);
      console.log('👤 [saveSocialMedia] USER ID:', user?.id);
      console.log('📧 [saveSocialMedia] USER EMAIL:', user?.email);
      
      const { error } = await supabase
        .from('clinics')
        .update({ social_media: socialMedia })
        .eq('id', clinic.id);
      
      if (error) throw error;

      console.log('✅ [saveSocialMedia] Redes sociais salvas com sucesso!');
      toast.success('Redes sociais atualizadas com sucesso!');
      setEditingSocial(false);
      
      // Forçar invalidação de cache e recarregar dados
      await invalidateClinicCache();
      await fetchClinicData();
    } catch (error) {
      console.error('❌ [saveSocialMedia] Erro ao salvar redes sociais:', error);
      toast.error('Erro ao salvar redes sociais');
    }
  };

  const saveOperatingHours = async () => {
    // VALIDAÇÃO CRÍTICA DE SEGURANÇA
    if (!clinic?.id) {
      console.error('❌ [saveOperatingHours] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado. Não é possível salvar.');
      return;
    }
    
    // Validar se a clínica pertence ao usuário
    if (clinic.master_user_id !== user?.id && clinic.owner_id !== user?.id) {
      console.error('❌ [saveOperatingHours] USUÁRIO NÃO TEM PERMISSÃO!');
      console.error('❌ [saveOperatingHours] clinic.master_user_id:', clinic.master_user_id);
      console.error('❌ [saveOperatingHours] clinic.owner_id:', clinic.owner_id);
      console.error('❌ [saveOperatingHours] user.id:', user?.id);
      toast.error('Erro: Você não tem permissão para editar esta clínica.');
      return;
    }
    
    try {
      console.log('🔄 [saveOperatingHours] Salvando horários para clínica ID:', clinic.id);
      console.log('🕐 [saveOperatingHours] Novos horários:', operatingHours);
      console.log('👤 [saveOperatingHours] USER ID:', user?.id);
      console.log('📧 [saveOperatingHours] USER EMAIL:', user?.email);
      
      const { error } = await supabase
        .from('clinics')
        .update({ operating_hours: operatingHours })
        .eq('id', clinic.id);
      
      if (error) throw error;

      console.log('✅ [saveOperatingHours] Horários salvos com sucesso!');
      toast.success('Horários de funcionamento atualizados com sucesso!');
      setEditingHours(false);
      
      // Forçar invalidação de cache e recarregar dados
      await invalidateClinicCache();
      await fetchClinicData();
    } catch (error) {
      console.error('❌ [saveOperatingHours] Erro ao salvar horários:', error);
      toast.error('Erro ao salvar horários de funcionamento');
    }
  };

  const saveClinicName = async () => {
    if (!clinic?.id) {
      console.error('❌ [saveClinicName] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado');
      return;
    }
    
    if (!clinicName.trim()) {
      toast.error('Nome da clínica é obrigatório');
      return;
    }
    
    try {
      console.log('🔄 [saveClinicName] SALVANDO NOME DA CLÍNICA');
      console.log('🏥 [saveClinicName] CLINIC ID:', clinic.id);
      console.log('📝 [saveClinicName] NOVO NOME:', clinicName.trim());
      console.log('👤 [saveClinicName] USER ID:', user?.id);
      console.log('📧 [saveClinicName] USER EMAIL:', user?.email);
      
      const { error } = await supabase
        .from('clinics')
        .update({ name: clinicName.trim() })
        .eq('id', clinic.id);
      
      if (error) {
        console.error('❌ [saveClinicName] ERRO DETALHADO:', error);
        throw error;
      }

      console.log('✅ [saveClinicName] NOME SALVO COM SUCESSO!');
      toast.success('Nome da clínica atualizado com sucesso!');
      setEditingName(false);
      fetchClinicData();
    } catch (error) {
      console.error('❌ [saveClinicName] ERRO AO SALVAR NOME:', error);
      toast.error(`Erro ao salvar nome da clínica: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const saveAddress = async () => {
    // VALIDAÇÃO CRÍTICA DE SEGURANÇA
    if (!clinic?.id) {
      console.error('❌ [saveAddress] CLINIC ID NÃO ENCONTRADO!');
      toast.error('Erro: ID da clínica não encontrado. Não é possível salvar.');
      return;
    }
    
    // Validar se a clínica pertence ao usuário
    if (clinic.master_user_id !== user?.id && clinic.owner_id !== user?.id) {
      console.error('❌ [saveAddress] USUÁRIO NÃO TEM PERMISSÃO!');
      console.error('❌ [saveAddress] clinic.master_user_id:', clinic.master_user_id);
      console.error('❌ [saveAddress] clinic.owner_id:', clinic.owner_id);
      console.error('❌ [saveAddress] user.id:', user?.id);
      toast.error('Erro: Você não tem permissão para editar esta clínica.');
      return;
    }
    
    try {
      console.log('🔄 [saveAddress] Salvando endereço para clínica ID:', clinic.id);
      console.log('📍 [saveAddress] Novo endereço:', address);
      console.log('👤 [saveAddress] USER ID:', user?.id);
      console.log('📧 [saveAddress] USER EMAIL:', user?.email);
      
      const { error } = await supabase
        .from('clinics')
        .update({ 
          address: address,
          city: address.city
        })
        .eq('id', clinic.id);

      if (error) {
        console.error('❌ [saveAddress] Erro detalhado ao salvar endereço:', error);
        throw error;
      }

      console.log('✅ [saveAddress] Endereço salvo com sucesso!');
      toast.success('Endereço atualizado com sucesso!');
      setEditingAddress(false);
      fetchClinicData();
    } catch (error) {
      console.error('❌ [saveAddress] Erro ao salvar endereço:', error);
      toast.error(`Erro ao salvar endereço: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Função para invalidar cache da clínica
  const invalidateClinicCache = async () => {
    try {
      console.log('🗑️ Invalidando cache da clínica...');
      
      // Adicionar timestamp para forçar revalidação
      const timestamp = Date.now();
      localStorage.setItem(`clinic_cache_invalidated_${clinic?.id}`, timestamp.toString());
      
      // Limpar possíveis caches do Supabase
      if (clinic?.id) {
        // Forçar uma nova consulta com cache bypass
        await supabase
          .from('clinics')
          .select('updated_at')
          .eq('id', clinic.id)
          .single();
      }
      
      console.log('✅ Cache invalidado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao invalidar cache:', error);
    }
  };

  const changePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Preencha todos os campos de senha');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      setEditingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados da clínica...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Clínica não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full px-6 py-8 px-4 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Perfil da Clínica</h1>
      </div>

      {/* Logo da Clínica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Logo da Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageSelect={handleImageUpload}
            currentImageUrl={clinic.logo_url}
            uploading={uploading}
            uploadProgress={uploadProgress}
            maxSizeMB={5}
            previewSize="lg"
            label="Logo da Clínica"
            description="Selecione uma imagem para o logo (PNG, JPG, WebP até 5MB)"
            showPreview={true}
          />
        </CardContent>
      </Card>

      {/* Imagem de Capa/Hero */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Imagem de Capa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageSelect={handleHeroImageUpload}
            currentImageUrl={clinic.hero_image_url}
            uploading={uploadingHero}
            uploadProgress={heroUploadProgress}
            maxSizeMB={10}
            previewSize="xl"
            label="Imagem de Capa"
            description="Selecione uma imagem para a capa da clínica (PNG, JPG, WebP até 10MB)"
            showPreview={true}
          />
        </CardContent>
      </Card>

      {/* Nome da Clínica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Nome da Clínica
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingName(!editingName)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingName ? (
            <div className="space-y-4">
              <Input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Nome da clínica"
              />
              <div className="flex gap-2">
                <Button onClick={saveClinicName}>
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingName(false);
                    setClinicName(clinic.name || '');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-lg font-medium">{clinic.name || 'Nome não informado'}</p>
          )}
        </CardContent>
      </Card>

      {/* Descrição da Clínica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Descrição da Clínica
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingDescription(!editingDescription)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingDescription ? (
            <div className="space-y-4">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva sua clínica, especialidades, diferenciais..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={saveDescription}>
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingDescription(false);
                    setDescription(clinic.description || '');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {clinic.description || 'Nenhuma descrição informada. Clique em "Editar" para adicionar uma descrição da sua clínica.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contato
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingContact(!editingContact)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingContact ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@clinica.com"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveContact}>
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingContact(false);
                    setPhone(clinic.phone || '');
                    setEmail(clinic.email || '');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Telefone:</strong> {clinic.phone || 'Não informado'}</p>
              <p><strong>Email:</strong> {clinic.email || 'Não informado'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Website e WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website e WhatsApp
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingWebsite(!editingWebsite)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingWebsite ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.clinica.com"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp (Link)</Label>
                <Input
                  id="whatsapp"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder="https://wa.me/5511999999999"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveWebsite}>
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingWebsite(false);
                    setWebsite(clinic.website || '');
                    setWhatsappUrl(clinic.whatsapp_url || '');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Website:</strong> {clinic.website || 'Não informado'}</p>
              <p><strong>WhatsApp:</strong> {clinic.whatsapp_url || 'Não informado'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redes Sociais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Redes Sociais
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingSocial(!editingSocial)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingSocial ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={socialMedia.instagram}
                  onChange={(e) => setSocialMedia(prev => ({...prev, instagram: e.target.value}))}
                  placeholder="https://instagram.com/clinica"
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={socialMedia.facebook}
                  onChange={(e) => setSocialMedia(prev => ({...prev, facebook: e.target.value}))}
                  placeholder="https://facebook.com/clinica"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={socialMedia.linkedin}
                  onChange={(e) => setSocialMedia(prev => ({...prev, linkedin: e.target.value}))}
                  placeholder="https://linkedin.com/company/clinica"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveSocialMedia}>
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingSocial(false);
                    if (clinic.social_media) {
                      const socialData = typeof clinic.social_media === 'string' 
                        ? JSON.parse(clinic.social_media) 
                        : clinic.social_media;
                      setSocialMedia({
                        instagram: socialData.instagram || '',
                        facebook: socialData.facebook || '',
                        linkedin: socialData.linkedin || ''
                      });
                    }
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Instagram:</strong> {socialMedia.instagram || 'Não informado'}</p>
              <p><strong>Facebook:</strong> {socialMedia.facebook || 'Não informado'}</p>
              <p><strong>LinkedIn:</strong> {socialMedia.linkedin || 'Não informado'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horários de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários de Funcionamento
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingHours(!editingHours)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingHours ? (
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <Label className="font-medium">{day.label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!operatingHours[day.key]?.closed}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        [day.key]: {
                          ...prev[day.key],
                          closed: !e.target.checked
                        }
                      }))}
                    />
                    <span className="text-sm">Aberto</span>
                  </div>
                  {!operatingHours[day.key]?.closed && (
                    <>
                      <Input
                        type="time"
                        value={operatingHours[day.key]?.open || '08:00'}
                        onChange={(e) => setOperatingHours(prev => ({
                          ...prev,
                          [day.key]: {
                            ...prev[day.key],
                            open: e.target.value
                          }
                        }))}
                      />
                      <Input
                        type="time"
                        value={operatingHours[day.key]?.close || '18:00'}
                        onChange={(e) => setOperatingHours(prev => ({
                          ...prev,
                          [day.key]: {
                            ...prev[day.key],
                            close: e.target.value
                          }
                        }))}
                      />
                    </>
                  )}
                  {operatingHours[day.key]?.closed && (
                    <div className="col-span-2 text-muted-foreground text-sm">
                      Fechado
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button onClick={saveOperatingHours}>
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingHours(false);
                    if (clinic.operating_hours) {
                      const hoursData = typeof clinic.operating_hours === 'string' 
                        ? JSON.parse(clinic.operating_hours) 
                        : clinic.operating_hours;
                      setOperatingHours(hoursData);
                    }
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.key} className="flex justify-between">
                  <span className="font-medium">{day.label}:</span>
                  <span>
                    {operatingHours[day.key]?.closed 
                      ? 'Fechado' 
                      : `${operatingHours[day.key]?.open || '08:00'} - ${operatingHours[day.key]?.close || '18:00'}`
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endereço Completo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço Completo
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingAddress(!editingAddress)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingAddress ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Rua/Avenida</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => setAddress(prev => ({...prev, street: e.target.value}))}
                    placeholder="Nome da rua ou avenida"
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={address.number}
                    onChange={(e) => setAddress(prev => ({...prev, number: e.target.value}))}
                    placeholder="Número"
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={address.neighborhood}
                    onChange={(e) => setAddress(prev => ({...prev, neighborhood: e.target.value}))}
                    placeholder="Nome do bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    value={address.zip_code}
                    onChange={(e) => setAddress(prev => ({...prev, zip_code: e.target.value}))}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress(prev => ({...prev, city: e.target.value}))}
                    placeholder="Nome da cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Select 
                    value={address.state} 
                    onValueChange={(value) => setAddress(prev => ({...prev, state: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name} ({state.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveAddress}>
                  Salvar Endereço
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingAddress(false);
                    loadAddressData(clinic);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Endereço:</strong> {address.street} {address.number}</p>
              <p><strong>Bairro:</strong> {address.neighborhood}</p>
              <p><strong>Cidade:</strong> {address.city}</p>
              <p><strong>Estado:</strong> {BRAZILIAN_STATES.find(s => s.code === address.state)?.name || address.state}</p>
              <p><strong>CEP:</strong> {address.zip_code}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Alterar Senha
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingPassword(!editingPassword)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Alterar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingPassword ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                  placeholder="Digite a nova senha"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                  placeholder="Confirme a nova senha"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={changePassword}>
                  Alterar Senha
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Clique em "Alterar" para modificar sua senha de acesso.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}