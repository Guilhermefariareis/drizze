import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';

import CreditSimulator, { SimulationResult } from './CreditSimulator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValueSlider } from '@/components/ui/value-slider';
import { toast } from 'sonner';
import { MapPin, Building, Phone, Plus, Loader2 } from 'lucide-react';
import parseToISO from '@/utils/dateFormatter';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface CreditRequestData {
  fullName: string;
  birthDate: string;
  cpf: string;
  income: string;
  address: string;
  zipCode: string;
  profession: string;
  phone: string;
  email: string;
  requestedAmount: string;
  clinicId: string;
}

interface CreditRequestModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CreditRequestModal({ trigger, onSuccess }: CreditRequestModalProps) {
  console.log('[CreditRequestModal] Componente renderizado');
  
  // Expor supabase no window para debug
  if (typeof window !== 'undefined') {
    (window as any).supabase = supabase;
  }
  
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [treatmentDescription, setTreatmentDescription] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const { user } = useAuth();
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  
  console.log('[CreditRequestModal] Geolocation status:', { location, locationLoading, locationError });
  const [loading, setLoading] = useState(false);
  const { latitude, longitude, city, state } = location || {};
  const [formData, setFormData] = useState<CreditRequestData>({
    fullName: '',
    birthDate: '',
    cpf: '',
    income: '',
    address: '',
    zipCode: '',
    profession: '',
    phone: '',
    email: '',
    requestedAmount: '',
    clinicId: ''
  });
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // Buscar clínicas próximas quando o modal abrir
  useEffect(() => {
    if (open) {
      fetchNearbyClinics();
    }
  }, [open, location]);

  const fetchNearbyClinics = async () => {
    try {
      setLoadingClinics(true);
      console.log('🔍 Iniciando busca por clínicas...');
      
      // Buscar clínicas ativas do banco de dados
      const { data: clinicsData, error } = await supabase
        .from('clinics')
        .select('id, name, city, address, phone, is_active')
        .eq('is_active', true);

      console.log('📊 Dados do banco:', { clinicsData, error });

      if (error) {
        console.error('❌ Erro ao buscar clínicas:', error);
        throw error;
      }

      let filteredClinics = [];

      if (clinicsData && clinicsData.length > 0) {
        console.log('✅ Clínicas encontradas no banco:', clinicsData.length);
        
        // Priorizar clínicas de Trindade, depois outras cidades de Goiás
        const trindadeClinics = clinicsData.filter(clinic => 
          clinic.city?.toLowerCase().includes('trindade')
        );
        
        // Filtrar por cidades de Goiás (baseado nos nomes das cidades)
        const goiasCities = ['goiânia', 'anápolis', 'aparecida de goiânia', 'rio verde', 'luziânia', 'águas lindas', 'valparaíso', 'novo gama', 'formosa', 'catalão', 'itumbiara', 'jataí', 'planaltina', 'senador canedo', 'trindade'];
        const goiasClinics = clinicsData.filter(clinic => 
          goiasCities.some(city => clinic.city?.toLowerCase().includes(city.toLowerCase()))
        );
        
        console.log('🏥 Clínicas de Trindade:', trindadeClinics.length);
        console.log('🏥 Clínicas de Goiás:', goiasClinics.length);
        
        filteredClinics = [...trindadeClinics, ...goiasClinics.filter(clinic => 
          !trindadeClinics.some(tc => tc.id === clinic.id)
        )];
      } else {
        console.log('⚠️ Nenhuma clínica encontrada no banco de dados');
      }

      // Se não encontrar clínicas filtradas, usar todas as clínicas ativas
      if (filteredClinics.length === 0 && clinicsData && clinicsData.length > 0) {
        console.log('🔄 Usando todas as clínicas ativas disponíveis');
        filteredClinics = clinicsData;
      }

      // Converter para o formato esperado pelo componente
      const formattedClinics = filteredClinics.map(clinic => ({
        id: clinic.id,
        name: clinic.name,
        city: clinic.city,
        state: 'GO', // Assumir Goiás como padrão
        phone: clinic.phone,
        address: typeof clinic.address === 'object' && clinic.address 
          ? `${clinic.address.street}, ${clinic.address.neighborhood}` 
          : clinic.address || 'Endereço não informado'
      }));

      console.log('🎯 Clínicas finais formatadas:', formattedClinics);
      setClinics(formattedClinics);
    } catch (error) {
      console.error('❌ Erro ao carregar clínicas:', error);
      toast.error('Erro ao carregar clínicas próximas');
    } finally {
      setLoadingClinics(false);
    }
  };



  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  const validateZipCode = (zipCode: string): boolean => {
    const cleanZip = zipCode.replace(/\D/g, '');
    return cleanZip.length === 8;
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email é opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatCPF = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatZipCode = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatPhone = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 10) {
      return cleanValue.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3');
    }
    return cleanValue.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3');
  };

  const formatCurrency = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    
    // NÃO dividir por 100 - o valor já está correto
    const numberValue = parseInt(cleanValue) || 0;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numberValue);
  };

  const handleInputChange = (field: keyof CreditRequestData, value: string) => {
    let formattedValue = value;
    
    switch (field) {
      case 'cpf':
        formattedValue = formatCPF(value);
        break;
      case 'zipCode':
        formattedValue = formatZipCode(value);
        break;
      case 'phone':
        formattedValue = formatPhone(value);
        break;
      case 'requestedAmount':
        // Para o slider, o valor já vem como número, então formatamos como moeda
        formattedValue = formatCurrency(value);
        break;
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!validateCPF(formData.cpf)) {
      toast.error('CPF inválido');
      return;
    }
    
    if (!validateZipCode(formData.zipCode)) {
      toast.error('CEP inválido');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error('Email inválido');
      return;
    }
    
    if (!formData.clinicId) {
      toast.error('Selecione uma clínica');
      return;
    }
    
    const requestedAmount = parseFloat(formData.requestedAmount.replace(/[^\d,]/g, '').replace(',', '.'));
    if (requestedAmount <= 0) {
      toast.error('Valor solicitado deve ser maior que zero');
      return;
    }
    
    if (!simulation) {
      toast.error('Aguarde o cálculo da simulação ser concluído');
      return;
    }

    try {
      setLoading(true);
      
      const currentSelectedClinic = clinics.find(c => c.id === formData.clinicId);
      
      // Primeiro, verificar se já existe um perfil para este usuário
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, cpf, city, state, zip_code, birth_date')
        .eq('user_id', user?.id)
        .single();

      const cleanCpf = formData.cpf.replace(/\D/g, '');
      let profileId = null;

      if (existingProfile) {
        // Perfil existe para este usuário - sempre atualizar
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            phone: formData.phone,
            cpf: cleanCpf,
            birth_date: formData.birthDate,
            profession: formData.profession,
            monthly_income: parseFloat(formData.income.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
            address: {
              street: formData.address,
              zipCode: formData.zipCode
            },
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
          throw profileError;
        }
        profileId = existingProfile.id;
      } else {
        // Verificar se já existe um perfil com este CPF (de outro usuário)
        const { data: cpfProfile } = await supabase
          .from('profiles')
          .select('id, user_id')
          .eq('cpf', cleanCpf)
          .single();

        if (cpfProfile) {
          // CPF já existe para outro usuário - erro
          toast.error('Este CPF já está cadastrado no sistema. Entre em contato com o suporte se este é seu CPF.');
          return;
        }

        // Criar novo perfil
        // Normalizar data de nascimento informada
        const birthISOForProfile = formData.birthDate ? parseToISO(formData.birthDate) : null;
        if (formData.birthDate && !birthISOForProfile) {
          toast.error('Data de nascimento inválida. Use um formato válido.');
          setLoading(false);
          return;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user?.id,
            user_id: user?.id,
            email: user?.email || formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            cpf: cleanCpf,
            birth_date: birthISOForProfile,
            profession: formData.profession,
            monthly_income: parseFloat(formData.income.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
            role: 'patient',
            address: {
              street: formData.address,
              zipCode: formData.zipCode
            },
            account_type: 'paciente',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          throw profileError;
        }
        profileId = user?.id;
      }
      
      // Depois, criar a solicitação de crédito usando o profileId correto
      // Normalizar data para credit_requests
      const rawBirth = formData.birthDate || (existingProfile as any)?.birth_date || null;
      const birthISO = rawBirth ? parseToISO(rawBirth) : null;
      if (rawBirth && !birthISO) {
        toast.error('Data de nascimento inválida. Use um formato válido.');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('credit_requests')
        .insert({
          patient_id: profileId,
          clinic_id: formData.clinicId,
          requested_amount: requestedAmount,
          installments: simulation?.installments || 12, // Usar valor da simulação ou 12 como fallback
          treatment_description: `Tratamento odontológico - Valor: ${formData.requestedAmount} - Profissão: ${formData.profession} - Renda: ${formData.income}`,
          status: 'pending',
          // Campos obrigatórios que estavam faltando
          patient_name: formData.fullName || user?.user_metadata?.full_name || user?.email || 'Nome não informado',
          patient_email: formData.email || user?.email || 'email@nao-informado.com',
          patient_phone: formData.phone || null,
          patient_cpf: formData.cpf || null,
          // Endereço do paciente
          patient_address_cep: (formData.zipCode || (existingProfile as any)?.zip_code || '').replace(/\D/g, '') || null,
          patient_address_city: (existingProfile as any)?.city || null,
          patient_address_state: (existingProfile as any)?.state || null,
          // Data de nascimento do paciente
          patient_birth_date: birthISO
        });

      if (error) throw error;

      toast.success('Solicitação de crédito enviada com sucesso!');
      setOpen(false);
      setFormData({
        fullName: '',
        birthDate: '',
        cpf: '',
        income: '',
        address: '',
        zipCode: '',
        profession: '',
        phone: '',
        email: '',
        requestedAmount: '',
        clinicId: ''
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação de crédito');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitação de Crédito Odontológico</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Clínica */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Selecione a Clínica</Label>
              <p className="text-xs text-muted-foreground">
                Selecione uma clínica para solicitar seu crédito
              </p>
            </div>
            {locationLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Detectando sua localização...
              </div>
            )}
            {locationError && (
              <div className="text-sm text-amber-600">
                Não foi possível detectar sua localização. Mostrando todas as clínicas.
              </div>
            )}
            
            {loadingClinics ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {clinics.map((clinic) => (
                  <Card 
                    key={clinic.id} 
                    className={`cursor-pointer transition-all ${
                      formData.clinicId === clinic.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleInputChange('clinicId', clinic.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{clinic.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{clinic.city}</span>
                          </div>
                          {clinic.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{clinic.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>
            

            
            
            <div className="space-y-2">
              <Label htmlFor="income">Renda Mensal *</Label>
              <Input
                id="income"
                value={formData.income}
                onChange={(e) => handleInputChange('income', e.target.value)}
                placeholder="R$ 0,00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profession">Profissão *</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Celular *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Rua, número, bairro, cidade, estado"
              required
            />
          </div>


          
          <div className="space-y-4">
            <Label className="text-base font-medium">Valor Solicitado *</Label>
            <ValueSlider
              value={parseFloat(formData.requestedAmount.replace(/[^\d,]/g, '').replace(',', '.')) || 1000}
              onChange={(value) => handleInputChange('requestedAmount', value.toString())}
              min={100}
              max={50000}
              step={100}
              className="py-4"
            />
          </div>

          {/* Simulação de Crédito */}
          {formData.requestedAmount && (
            <CreditSimulator 
              requestedAmount={formData.requestedAmount}
              onSimulationChange={setSimulation}
            />
          )}

          {/* Resumo da Solicitação */}
          {formData.clinicId && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Resumo da Solicitação</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Clínica:</span>
                    <span className="font-medium">{clinics.find(c => c.id === formData.clinicId)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cidade:</span>
                    <span>{clinics.find(c => c.id === formData.clinicId)?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">{formData.requestedAmount || 'R$ 0,00'}</span>
                  </div>
                  {simulation && (
                    <div className="flex justify-between">
                      <span>Parcelas:</span>
                      <span className="font-medium">{simulation.installments}x</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Solicitação'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreditRequestModal;
