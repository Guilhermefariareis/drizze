import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, RefreshCw, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SiteConfig {
  id: string;
  config_key: string;
  config_value: any;
  description: string;
}

const SiteConfigManager = () => {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState("");

  const [formData, setFormData] = useState({
    loan_simulator_rate: "",
    contact_phone: "",
    contact_email: "",
    contact_address: ""
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_configurations')
        .select('*')
        .order('config_key');

      if (error) throw error;

      setConfigs(data || []);

      // Populate form with current values
      const configMap: any = {};
      data?.forEach(config => {
        if (config.config_key === 'contact_info') {
          const contactInfo = config.config_value as any;
          configMap.contact_phone = contactInfo?.phone || "";
          configMap.contact_email = contactInfo?.email || "";
          configMap.contact_address = contactInfo?.address || "";
        } else if (config.config_key === 'site_logo') {
          const logoData = config.config_value as any;
          setCurrentLogo(logoData?.url || "");
        } else if (config.config_key === 'loan_simulator_rate') {
          configMap[config.config_key] = typeof config.config_value === 'string' 
            ? config.config_value.replace(/"/g, '') 
            : config.config_value;
        }
      });

      setFormData(prevData => ({
        ...prevData,
        ...configMap
      }));

    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveConfig = async (key: string, value: any) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('site_configurations')
        .upsert({
          config_key: key,
          config_value: value
        });

      if (error) throw error;

      toast.success('Configuração salva com sucesso!');
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const saveAllConfigs = async () => {
    try {
      setSaving(true);

      // Save basic configs
      await saveConfig('loan_simulator_rate', parseFloat(formData.loan_simulator_rate));

      // Save contact info as JSON
      const contactInfo = {
        phone: formData.contact_phone,
        email: formData.contact_email,
        address: formData.contact_address
      };
      await saveConfig('contact_info', contactInfo);

      toast.success('Todas as configurações foram salvas!');
    } catch (error) {
      console.error('Error saving all configs:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateSiteConfig = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('site_configurations')
        .upsert({
          config_key: key,
          config_value: value
        }, {
          onConflict: 'config_key'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      console.log('Starting logo upload for file:', file.name);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `site-logos/${fileName}`;

      console.log('Upload path:', filePath);
      console.log('File size:', file.size);
      console.log('File type:', file.type);

      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);

      // Upload da imagem
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      console.log('Upload response:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Atualizar configuração
      await updateSiteConfig('site_logo', { url: publicUrl, fileName });

      toast.success('Logo atualizado com sucesso!');
      setCurrentLogo(publicUrl);
      fetchConfigs();
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      toast.error(`Erro ao fazer upload do logo: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base sm:text-lg font-semibold">Configurações do Site</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={fetchConfigs} disabled={loading} size="sm" className="w-full sm:w-auto">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Atualizar</span>
          </Button>
          <Button onClick={saveAllConfigs} disabled={saving} size="sm" className="w-full sm:w-auto">
            {saving ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            )}
            <span className="text-xs sm:text-sm">Salvar Tudo</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Logo Upload */}
        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              Logo do Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Logo Atual</Label>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt="Logo atual"
                    className="h-10 w-auto max-w-[120px] sm:h-12 sm:max-w-[150px] object-contain bg-muted rounded-lg p-2"
                  />
                ) : (
                  <div className="h-10 w-20 sm:h-12 sm:w-24 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={uploading}
                    size="sm"
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    {uploading ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    )}
                    {currentLogo ? 'Alterar Logo' : 'Upload Logo'}
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Formatos aceitos: PNG, JPG, SVG. Tamanho recomendado: 200x60px.
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Loan Simulator */}
        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm sm:text-base">Simulador de Crédito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="loan_rate" className="text-xs sm:text-sm">Taxa de Juros Mensal (%)</Label>
              <Input
                id="loan_rate"
                type="number"
                step="0.1"
                value={formData.loan_simulator_rate}
                onChange={(e) => handleInputChange('loan_simulator_rate', e.target.value)}
                placeholder="2.5"
                className="text-sm"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Taxa em porcentagem (ex: 2.5 para 2.5% ao mês)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm sm:text-base">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-xs sm:text-sm">Telefone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="(11) 3456-7890"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contato@doutorizze.com"
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_address" className="text-xs sm:text-sm">Endereço</Label>
              <Input
                id="contact_address"
                value={formData.contact_address}
                onChange={(e) => handleInputChange('contact_address', e.target.value)}
                placeholder="São Paulo, SP"
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteConfigManager;