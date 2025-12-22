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
import { ValueSlider } from '@/components/ui/value-slider';
import { toast } from 'sonner';
import { Loader2, CreditCard, FileText, DollarSign, Calendar } from 'lucide-react';
import { Database } from '@/lib/supabase';

interface Clinic {
  id: string;
  name: string;
  cnpj: string;
  address: string;
}

interface CreditRequestData {
  patient_id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  status: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  patient_cpf?: string;
  patient_address_cep?: string;
  patient_address_city?: string;
  patient_address_state?: string;
}

const PatientCreditRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  
  const [formData, setFormData] = useState({
    clinic_id: '',
    requested_amount: '',
    installments: '12',
    treatment_description: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login-paciente');
      return;
    }
    fetchClinics();
  }, [user, navigate]);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, cnpj, address')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error);
      toast.error('Erro ao carregar clínicas disponíveis');
    } finally {
      setLoadingClinics(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.clinic_id) {
      toast.error('Selecione uma clínica');
      return false;
    }
    if (!formData.requested_amount || parseFloat(formData.requested_amount) <= 0) {
      toast.error('Informe um valor válido para o crédito');
      return false;
    }
    if (!formData.treatment_description.trim()) {
      toast.error('Descreva o tratamento desejado');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando submissão do formulário...');
    console.log('👤 Usuário logado:', { id: user?.id, email: user?.email });
    console.log('📝 Dados do formulário:', formData);
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Buscar dados do perfil do usuário para preencher campos obrigatórios
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, cpf, city, state, zip_code')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil do usuário:', profileError);
        throw new Error('Erro ao buscar dados do perfil. Tente novamente.');
      }

      // Criar a solicitação de crédito usando o profile.id
      const creditRequestData: CreditRequestData = {
        patient_id: profile.id, // Usar o ID do perfil, não o auth.uid()
        clinic_id: formData.clinic_id,
        requested_amount: parseFloat(formData.requested_amount),
        installments: parseInt(formData.installments),
        treatment_description: formData.treatment_description,
        status: 'pending',
        patient_name: profile.full_name || user!.email || 'Nome não informado',
        patient_email: profile.email || user!.email || '',
        patient_phone: profile.phone || '',
        patient_cpf: profile.cpf || '',
        // Endereço do paciente vindo do perfil
        patient_address_city: (profile as any).city || undefined,
        patient_address_state: (profile as any).state || undefined,
        patient_address_cep: ((profile as any).zip_code as string | undefined)?.replace(/\D/g, '') || undefined,
      };

      console.log('💾 Dados que serão inseridos:', creditRequestData);

      const { data: insertedData, error: requestError } = await supabase
        .from('credit_requests')
        .insert(creditRequestData)
        .select();

      if (requestError) {
        console.error('❌ Erro detalhado ao inserir:', requestError);
        throw requestError;
      }

      console.log('✅ Solicitação inserida com sucesso:', insertedData);
      toast.success('Solicitação de crédito enviada com sucesso!');
      navigate('/patient/credit', { replace: true });
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar solicitação:', error);
      toast.error(error.message || 'Erro ao enviar solicitação de crédito');
    } finally {
      setLoading(false);
    }
  };

  const installmentOptions = [
    { value: '6', label: '6x' },
    { value: '12', label: '12x' },
    { value: '18', label: '18x' },
    { value: '24', label: '24x' },
    { value: '36', label: '36x' }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Solicitação de Crédito
            </h1>
            <p className="text-gray-600">
              Solicite crédito para financiar seu tratamento odontológico
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dados da Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seleção da Clínica */}
                <div className="space-y-2">
                  <Label htmlFor="clinic">Clínica *</Label>
                  {loadingClinics ? (
                    <div className="flex items-center gap-2 p-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Carregando clínicas...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.clinic_id}
                      onValueChange={(value) => handleInputChange('clinic_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a clínica" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Valor Solicitado */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-base font-medium">
                    <DollarSign className="h-5 w-5" />
                    Valor Solicitado *
                  </Label>
                  <ValueSlider
                    value={parseFloat(formData.requested_amount) || 1000}
                    onChange={(value) => handleInputChange('requested_amount', value.toString())}
                    min={100}
                    max={50000}
                    step={100}
                    className="py-4"
                  />
                </div>

                {/* Número de Parcelas */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Número de Parcelas *
                  </Label>
                  <Select
                    value={formData.installments}
                    onValueChange={(value) => handleInputChange('installments', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {installmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Descrição do Tratamento */}
                <div className="space-y-2">
                  <Label htmlFor="treatment" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrição do Tratamento *
                  </Label>
                  <Textarea
                    id="treatment"
                    placeholder="Descreva detalhadamente o tratamento que deseja realizar..."
                    value={formData.treatment_description}
                    onChange={(e) => handleInputChange('treatment_description', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    Seja específico sobre o tratamento para agilizar a análise
                  </p>
                </div>

                {/* Simulação de Parcelas */}
                {formData.requested_amount && formData.installments && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Simulação de Parcelas</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Valor Total:</span>
                        <p className="font-semibold text-blue-900">
                          R$ {parseFloat(formData.requested_amount).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700">Parcela Estimada:</span>
                        <p className="font-semibold text-blue-900">
                          R$ {(parseFloat(formData.requested_amount) / parseInt(formData.installments)).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      * Valores aproximados. A taxa de juros será definida após análise.
                    </p>
                  </div>
                )}

                {/* Aviso */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">Importante</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Sua solicitação será analisada pela clínica selecionada</li>
                    <li>• Após aprovação da clínica, passará por análise administrativa</li>
                    <li>• Você será notificado sobre o status da sua solicitação</li>
                    <li>• Documentos adicionais podem ser solicitados</li>
                  </ul>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/patient/credit', { replace: true })}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Solicitação'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientCreditRequest;
