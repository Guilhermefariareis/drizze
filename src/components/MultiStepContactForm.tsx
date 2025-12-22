import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Funções utilitárias para formatação
const formatCNPJ = (value: string): string => {
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '');
  
  // Aplica a máscara 00.000.000/0000-00
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 5) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`;
  if (cleanValue.length <= 8) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`;
  if (cleanValue.length <= 12) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`;
  return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`;
};

const formatCRO = (value: string): string => {
  // Remove tudo que não é dígito ou letra
  const cleanValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Se não começar com CRO, adiciona
  if (!cleanValue.startsWith('CRO')) {
    if (cleanValue.length === 0) return '';
    // Se começar com números, adiciona CRO-
    if (/^\d/.test(cleanValue)) {
      return `CRO-${cleanValue.slice(0, 7)}`;
    }
    return `CRO${cleanValue.slice(0, 8)}`;
  }
  
  // Se já tem CRO, formata como CRO-UF 00000
  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 5) return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
  if (cleanValue.length <= 7) return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 5)} ${cleanValue.slice(5)}`;
  return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 5)} ${cleanValue.slice(5, 10)}`;
};

const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

interface FormData {
  // Etapa 1 - Dados da Clínica
  razaoSocial: string;
  cnpj: string;
  nomeFantasia: string;
  croResponsavel: string;
  croCarteirinha: File | null;
  instagram: string;
  site: string;
  uf: string;
  cidade: string;
  bairro: string;
  
  // Etapa 2 - Perfil da Clínica
  numeroCadeiras: string;
  orcamentosMes: string;
  ticketMedio: string;
  faturamento: string;
  localClinica: string;
  especialidades: string[];
  
  // Etapa 3 - Sobre Crédito
  ofereceCreditoHoje: string;
  percentualOrcamentosPerdidos: string;
  preferenciaRepasse: string;
  trajetoPago: string;
  possuiContador: string;
  
  // Etapa 4 - Dados de Contato
  nomeResponsavel: string;
  cargo: string;
  email: string;
  whatsapp: string;
  aceitaLGPD: boolean;
}

const MultiStepContactForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Etapa 1
    razaoSocial: '',
    cnpj: '',
    nomeFantasia: '',
    croResponsavel: '',
    croCarteirinha: null,
    instagram: '',
    site: '',
    uf: '',
    cidade: '',
    bairro: '',
    
    // Etapa 2
    numeroCadeiras: '',
    orcamentosMes: '',
    ticketMedio: '',
    faturamento: '',
    localClinica: '',
    especialidades: [],
    
    // Etapa 3
    ofereceCreditoHoje: '',
    percentualOrcamentosPerdidos: '',
    preferenciaRepasse: '',
    trajetoPago: '',
    possuiContador: '',
    
    // Etapa 4
    nomeResponsavel: '',
    cargo: '',
    email: '',
    whatsapp: '',
    aceitaLGPD: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      let formattedValue = value;
      
      // Aplicar máscaras específicas
      if (name === 'cnpj') {
        formattedValue = formatCNPJ(value);
      } else if (name === 'croResponsavel') {
        formattedValue = formatCRO(value);
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos JPG, JPEG e PNG são permitidos.');
        return;
      }
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB.');
        return;
      }
      setFormData(prev => ({ ...prev, croCarteirinha: file }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, croCarteirinha: null }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(specialty)
        ? prev.especialidades.filter(s => s !== specialty)
        : [...prev.especialidades, specialty]
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Remover máscaras antes de salvar no banco
      const cleanCNPJ = removeMask(formData.cnpj);
      const cleanCRO = removeMask(formData.croResponsavel);
      
      // Upload da imagem da carteirinha CRO se existir
      let carteirinhaUrl = null;
      if (formData.croCarteirinha) {
        const fileExt = formData.croCarteirinha.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('clinic-documents')
          .upload(`cro-carteirinhas/${fileName}`, formData.croCarteirinha);
        
        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          toast.error('Erro no upload da imagem. Continuando sem a imagem.');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('clinic-documents')
            .getPublicUrl(uploadData.path);
          carteirinhaUrl = publicUrl;
        }
      }
      
      const { error } = await supabase
        .from('clinic_leads')
        .insert({
          // Campos básicos (já existentes)
          nome: formData.nomeResponsavel || 'Nome não informado',
          email: formData.email,
          telefone: formData.whatsapp || 'Não informado',
          nome_clinica: formData.nomeFantasia || formData.razaoSocial || 'Clínica não informada',
          especialidade: formData.especialidades?.join(', ') || 'Não informado',
          cidade: formData.cidade || 'Não informada',
          status: 'novo',
          
          // Campos individuais - Etapa 1
          razao_social: formData.razaoSocial,
          cnpj: cleanCNPJ,
          nome_fantasia: formData.nomeFantasia,
          cro_responsavel: cleanCRO,
          carteirinha_cro_url: carteirinhaUrl,
          instagram: formData.instagram,
          site: formData.site,
          uf: formData.uf,
          bairro: formData.bairro,
          
          // Campos individuais - Etapa 2
          numero_cadeiras: formData.numeroCadeiras ? parseInt(formData.numeroCadeiras) : null,
          orcamentos_mes: formData.orcamentosMes ? parseInt(formData.orcamentosMes) : null,
          ticket_medio: formData.ticketMedio ? Math.min(parseFloat(formData.ticketMedio.replace(/[^\d.,]/g, '').replace(',', '.')), 99999999.99) : null,
          faturamento_mensal: formData.faturamento ? Math.min(parseFloat(formData.faturamento.replace(/[^\d.,]/g, '').replace(',', '.')), 9999999999.99) : null,
          local_clinica: formData.localClinica,
          
          // Campos individuais - Etapa 3
          tem_credito: formData.ofereceCreditoHoje === 'sim',
          tem_outros_servicos: formData.possuiContador === 'sim',
          
          // Campos individuais - Etapa 4
          cargo: formData.cargo,
          como_conheceu: formData.trajetoPago,
          
          // Array de especialidades
          especialidades: formData.especialidades || [],
          
          // Mensagem para compatibilidade
          mensagem: `Formulário completo enviado com todos os campos individuais`
        });

      if (error) throw error;

      toast.success('Formulário enviado com sucesso! Entraremos em contato em breve.');
      
      // Reset form
      setFormData({
        razaoSocial: '',
        cnpj: '',
        nomeFantasia: '',
        croResponsavel: '',
        instagram: '',
        site: '',
        uf: '',
        cidade: '',
        bairro: '',
        numeroCadeiras: '',
        orcamentosMes: '',
        ticketMedio: '',
        faturamento: '',
        localClinica: '',
        especialidades: [],
        ofereceCreditoHoje: '',
        percentualOrcamentosPerdidos: '',
        preferenciaRepasse: '',
        trajetoPago: '',
        possuiContador: '',
        nomeResponsavel: '',
        cargo: '',
        email: '',
        whatsapp: '',
        aceitaLGPD: false
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast.error('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? 'bg-blue-500 text-white'
                : step < currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b border-gray-200 pb-4">
        1ª ETAPA: DADOS DA CLÍNICA
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="razaoSocial" className="text-sm font-medium text-gray-700">
            Razão Social *
          </Label>
          <Input
            id="razaoSocial"
            name="razaoSocial"
            value={formData.razaoSocial}
            onChange={handleInputChange}
            required
            placeholder="Digite a razão social da clínica"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
            CNPJ *
          </Label>
          <Input
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleInputChange}
            required
            placeholder="00.000.000/0000-00"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="nomeFantasia" className="text-sm font-medium text-gray-700">
            Nome Fantasia *
          </Label>
          <Input
            id="nomeFantasia"
            name="nomeFantasia"
            value={formData.nomeFantasia}
            onChange={handleInputChange}
            required
            placeholder="Nome fantasia da clínica"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="croResponsavel" className="text-sm font-medium text-gray-700">
            CRO Responsável *
          </Label>
          <Input
            id="croResponsavel"
            name="croResponsavel"
            value={formData.croResponsavel}
            onChange={handleInputChange}
            required
            placeholder="CRO-UF 00000"
            className="mt-1"
          />
        </div>
      </div>
      
      {/* Campo de upload da carteirinha CRO em linha separada */}
      <div className="mt-6">
        <Label className="text-sm font-medium text-gray-700">
          Upload da Carteirinha CRO
        </Label>
        <div className="mt-2">
          {!formData.croCarteirinha ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="croCarteirinha"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="croCarteirinha"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Clique para fazer upload da carteirinha CRO
                </span>
                <span className="text-xs text-gray-400">
                  JPG, JPEG ou PNG (máx. 5MB)
                </span>
              </label>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {formData.croCarteirinha.name}
                </span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden">
                  <img
                    src={URL.createObjectURL(formData.croCarteirinha)}
                    alt="Preview da carteirinha CRO"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p>Tamanho: {(formData.croCarteirinha.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p>Tipo: {formData.croCarteirinha.type}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Continuação do grid para os demais campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        
        <div>
          <Label htmlFor="instagram" className="text-sm font-medium text-gray-700">
            Instagram
          </Label>
          <Input
            id="instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            placeholder="@suaclinica"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="site" className="text-sm font-medium text-gray-700">
            Site
          </Label>
          <Input
            type="url"
            id="site"
            name="site"
            value={formData.site}
            onChange={handleInputChange}
            placeholder="www.suaclinica.com.br"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="uf" className="text-sm font-medium text-gray-700">
            UF
          </Label>
          <Select value={formData.uf} onValueChange={(value) => setFormData(prev => ({ ...prev, uf: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AC">Acre</SelectItem>
              <SelectItem value="AL">Alagoas</SelectItem>
              <SelectItem value="AP">Amapá</SelectItem>
              <SelectItem value="AM">Amazonas</SelectItem>
              <SelectItem value="BA">Bahia</SelectItem>
              <SelectItem value="CE">Ceará</SelectItem>
              <SelectItem value="DF">Distrito Federal</SelectItem>
              <SelectItem value="ES">Espírito Santo</SelectItem>
              <SelectItem value="GO">Goiás</SelectItem>
              <SelectItem value="MA">Maranhão</SelectItem>
              <SelectItem value="MT">Mato Grosso</SelectItem>
              <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
              <SelectItem value="MG">Minas Gerais</SelectItem>
              <SelectItem value="PA">Pará</SelectItem>
              <SelectItem value="PB">Paraíba</SelectItem>
              <SelectItem value="PR">Paraná</SelectItem>
              <SelectItem value="PE">Pernambuco</SelectItem>
              <SelectItem value="PI">Piauí</SelectItem>
              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
              <SelectItem value="RN">Rio Grande do Norte</SelectItem>
              <SelectItem value="RS">Rio Grande do Sul</SelectItem>
              <SelectItem value="RO">Rondônia</SelectItem>
              <SelectItem value="RR">Roraima</SelectItem>
              <SelectItem value="SC">Santa Catarina</SelectItem>
              <SelectItem value="SP">São Paulo</SelectItem>
              <SelectItem value="SE">Sergipe</SelectItem>
              <SelectItem value="TO">Tocantins</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
            Cidade *
          </Label>
          <Input
            id="cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleInputChange}
            required
            placeholder="Digite a cidade"
            className="mt-1"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="bairro" className="text-sm font-medium text-gray-700">
            Bairro *
          </Label>
          <Input
            id="bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleInputChange}
            required
            placeholder="Digite o bairro"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b border-gray-200 pb-4">
        2ª ETAPA: PERFIL DA CLÍNICA
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Número de Cadeiras *
          </Label>
          <Select value={formData.numeroCadeiras} onValueChange={(value) => setFormData(prev => ({ ...prev, numeroCadeiras: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2">1-2 cadeiras</SelectItem>
              <SelectItem value="3-5">3-5 cadeiras</SelectItem>
              <SelectItem value="6-10">6-10 cadeiras</SelectItem>
              <SelectItem value="11-20">11-20 cadeiras</SelectItem>
              <SelectItem value="20+">Mais de 20 cadeiras</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Orçamentos por mês *
          </Label>
          <Select value={formData.orcamentosMes} onValueChange={(value) => setFormData(prev => ({ ...prev, orcamentosMes: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="0-50">0-50 orçamentos</SelectItem>
               <SelectItem value="51-100">51-100 orçamentos</SelectItem>
               <SelectItem value="101-200">101-200 orçamentos</SelectItem>
               <SelectItem value="201-500">201-500 orçamentos</SelectItem>
               <SelectItem value="500+">Mais de 500 orçamentos</SelectItem>
             </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-2">
          <Label className="text-sm font-medium text-gray-700">
            Ticket Médio *
          </Label>
          <Select value={formData.ticketMedio} onValueChange={(value) => setFormData(prev => ({ ...prev, ticketMedio: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="0-500">R$ 0 - R$ 500</SelectItem>
               <SelectItem value="501-1000">R$ 501 - R$ 1.000</SelectItem>
               <SelectItem value="1001-2000">R$ 1.001 - R$ 2.000</SelectItem>
               <SelectItem value="2001-5000">R$ 2.001 - R$ 5.000</SelectItem>
               <SelectItem value="5000+">Acima de R$ 5.000</SelectItem>
             </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            ⦁ Faturamento Anual da Clínica*
          </Label>
          <Select value={formData.faturamento} onValueChange={(value) => setFormData(prev => ({ ...prev, faturamento: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="0-50000">Até R$ 50.000</SelectItem>
               <SelectItem value="50001-100000">R$ 50.001 - R$ 100.000</SelectItem>
               <SelectItem value="100001-200000">R$ 100.001 - R$ 200.000</SelectItem>
               <SelectItem value="200001-500000">R$ 200.001 - R$ 500.000</SelectItem>
               <SelectItem value="500000+">Acima de R$ 500.000</SelectItem>
             </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Local da Clínica *
          </Label>
          <Select value={formData.localClinica} onValueChange={(value) => setFormData(prev => ({ ...prev, localClinica: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="shopping">Shopping</SelectItem>
               <SelectItem value="rua-comercial">Rua comercial</SelectItem>
               <SelectItem value="predio-comercial">Prédio comercial</SelectItem>
               <SelectItem value="casa-comercial">Casa comercial</SelectItem>
               <SelectItem value="clinica-compartilhada">Clínica compartilhada</SelectItem>
               <SelectItem value="outros">Outros</SelectItem>
             </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-4">
          Especialidades (selecione todas que se aplicam)
        </Label>
        
        {/* Especialidades mais comuns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {[
            'Clínica Geral',
            'Ortodontia',
            'Implantodontia',
            'Periodontia',
            'Endodontia',
            'Prótese',
            'Dentística/Estética',
            'Odontopediatria',
            'Cirurgia Buco-Maxilo-Facial'
          ].map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <Checkbox
                id={specialty}
                checked={formData.especialidades.includes(specialty)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData(prev => ({
                      ...prev,
                      especialidades: [...prev.especialidades, specialty]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      especialidades: prev.especialidades.filter(esp => esp !== specialty)
                    }));
                  }
                }}
              />
              <Label htmlFor={specialty} className="text-sm text-gray-700 cursor-pointer">
                {specialty}
              </Label>
            </div>
          ))}
        </div>
        
        {/* Botão para expandir */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowAllSpecialties(!showAllSpecialties)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            {showAllSpecialties ? 'Ocultar especialidades' : 'Ver todas as especialidades'}
          </button>
        </div>
        
        {/* Lista expandida de especialidades */}
        {showAllSpecialties && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 p-4 bg-gray-50 rounded-lg">
            {[
              'Dentística (ou Odontologia Estética)',
              'Estomatologia',
              'Odontogeriatria',
              'Odontologia do Esporte',
              'Odontologia do Trabalho',
              'Odontologia Legal',
              'Ortopedia Funcional dos Maxilares',
              'Patologia Bucal',
              'Prótese Buco-Maxilo-Facial',
              'Prótese Dentária',
              'Radiologia Odontológica e Imaginologia',
              'Saúde Coletiva (Odontologia em Saúde Pública)',
              'Cirurgia e Traumatologia Buco-Maxilo-Facial',
              'Odontologia para Pacientes com Necessidades Especiais'
            ].map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <Checkbox
                  id={specialty}
                  checked={formData.especialidades.includes(specialty)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        especialidades: [...prev.especialidades, specialty]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        especialidades: prev.especialidades.filter(esp => esp !== specialty)
                      }));
                    }
                  }}
                />
                <Label htmlFor={specialty} className="text-sm text-gray-700 cursor-pointer">
                  {specialty}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b border-gray-200 pb-4">
        3ª ETAPA: Sobre Crédito e Outros serviços
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Sua clínica já oferece crédito hoje? *
          </Label>
          <Select value={formData.ofereceCreditoHoje} onValueChange={(value) => setFormData(prev => ({ ...prev, ofereceCreditoHoje: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
              <SelectItem value="parcialmente">Parcialmente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Qual % de orçamentos são perdidos por preço? *
          </Label>
          <Select value={formData.percentualOrcamentosPerdidos} onValueChange={(value) => setFormData(prev => ({ ...prev, percentualOrcamentosPerdidos: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="0-10">0-10%</SelectItem>
               <SelectItem value="11-20">11-20%</SelectItem>
               <SelectItem value="21-30">21-30%</SelectItem>
               <SelectItem value="31-40">31-40%</SelectItem>
               <SelectItem value="40+">Mais de 40%</SelectItem>
             </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Preferência de repasse *
          </Label>
          <Select value={formData.preferenciaRepasse} onValueChange={(value) => setFormData(prev => ({ ...prev, preferenciaRepasse: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="d0">D+0 (no mesmo dia)</SelectItem>
              <SelectItem value="d1">D+1 (1 dia útil)</SelectItem>
              <SelectItem value="d7">D+7 (7 dias úteis)</SelectItem>
              <SelectItem value="d14">D+14 (14 dias úteis)</SelectItem>
              <SelectItem value="d30">D+30 (30 dias)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Já atuou com trajeto pago? *
          </Label>
          <Select value={formData.trajetoPago} onValueChange={(value) => setFormData(prev => ({ ...prev, trajetoPago: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Possui contador? *
          </Label>
          <Select value={formData.possuiContador} onValueChange={(value) => setFormData(prev => ({ ...prev, possuiContador: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b border-gray-200 pb-4">
        4ª ETAPA: DADOS DE CONTATO
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Nome do Responsável *
          </Label>
          <Input
            type="text"
            name="nomeResponsavel"
            value={formData.nomeResponsavel}
            onChange={handleInputChange}
            required
            className="mt-1"
            placeholder="Digite o nome completo"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Cargo *
          </Label>
          <Select value={formData.cargo} onValueChange={(value) => setFormData(prev => ({ ...prev, cargo: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dentista">Dentista</SelectItem>
              <SelectItem value="proprietario">Proprietário</SelectItem>
              <SelectItem value="diretor">Diretor</SelectItem>
              <SelectItem value="gerente">Gerente</SelectItem>
              <SelectItem value="coordenador">Coordenador</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            E-mail *
          </Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1"
            placeholder="seu@email.com"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700">
            WhatsApp *
          </Label>
          <Input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            required
            className="mt-1"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <Checkbox
          id="aceitaLGPD"
          checked={formData.aceitaLGPD}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aceitaLGPD: checked }))}
          required
        />
        <Label htmlFor="aceitaLGPD" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
          Aceito receber comunicações da Doutorizze e concordo com os{' '}
          <a href="/termos" className="text-blue-600 hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacidade" className="text-blue-600 hover:underline">
            Política de Privacidade
          </a>
          .
        </Label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {step < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${
                        step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 text-center font-medium">
              Etapa {currentStep} de 4
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <Button
                 type="button"
                 variant="outline"
                 onClick={prevStep}
                 disabled={currentStep === 1}
                 className="px-8 py-2 border-gray-300 text-gray-600 hover:bg-gray-50"
               >
                 Anterior
               </Button>
               
               {currentStep < 4 ? (
                 <Button
                   type="button"
                   onClick={nextStep}
                   className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                 >
                   Próximo
                 </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white shadow-lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Formulário'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MultiStepContactForm;