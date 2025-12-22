import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, MapPin, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Clinic {
  id: string;
  name: string;
}

// Mock de clínicas para Trindade/GO
const mockClinics: Clinic[] = [
  { id: '1', name: 'Clínica Trindade' },
  { id: '2', name: 'Centro Médico Trindade' },
  { id: '3', name: 'Clínica Odontológica Trindade' },
  { id: '4', name: 'Hospital Municipal Trindade' },
  { id: '5', name: 'Clínica de Especialidades Trindade' }
];

const CreditSimulator = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [treatmentValue, setTreatmentValue] = useState([0]); // Valor inicial R$ 0,00
  const [installments, setInstallments] = useState([2]); // 12x inicial (índice 2 do array)
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Opções de parcelas disponíveis
  const installmentOptions = [3, 6, 12, 18, 24, 36];

  // Buscar clínicas do banco de dados
  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoadingClinics(true);
      
      // Buscar apenas id e name das clínicas (colunas que existem)
      const { data: clinicsData, error } = await supabase
        .from('clinics')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Erro ao buscar clínicas:', error);
        // Usar clínicas mock em caso de erro
        setClinics(mockClinics);
        return;
      }

      // Se tiver dados, usar eles. Senão, usar mocks
      if (clinicsData && clinicsData.length > 0) {
        setClinics(clinicsData);
      } else {
        setClinics(mockClinics);
      }
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error);
      toast.error('Erro ao carregar clínicas');
      // Fallback para mocks
      setClinics(mockClinics);
    } finally {
      setLoadingClinics(false);
    }
  };

  // Formatar valor em reais
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular valor da parcela
  const calculateInstallmentValue = (): number => {
    const selectedInstallments = installmentOptions[installments[0]];
    return treatmentValue[0] / selectedInstallments;
  };

  // Simular crédito
  const handleSimulate = () => {
    if (!selectedClinic) {
      toast.error('Por favor, selecione uma clínica');
      return;
    }

    setShowResult(true);
    toast.success('Simulação realizada com sucesso!');
      
      // Redirecionar para a página de solicitação de crédito após 3 segundos
      setTimeout(() => {
        navigate('/patient/credit-request');
      }, 3000);
    };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Título e Descrição */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Simulador de Crédito
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubra como financiar seu tratamento de forma simples e acessível
            </p>
          </div>

          {/* Aviso de pré-simulação */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center text-yellow-800">
              <span className="text-sm">
                ⚠️ Pré-simulação: Os valores apresentados são estimativas e dependem de validação interna de crédito ou validação direta pela clínica.
              </span>
            </div>
          </div>

          {/* Layout de duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda - Simulação de Parcelas */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-blue-600 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Simulação de Parcelas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* Seletor de Clínica */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Selecione a Clínica *
                </label>
                <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Escolha uma clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingClinics ? (
                      <SelectItem value="loading" disabled>
                        Carregando clínicas...
                      </SelectItem>
                    ) : clinics.length > 0 ? (
                      clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Nenhuma clínica encontrada.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {clinics.length === 0 && !loadingClinics && (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma clínica disponível no momento.
                  </p>
                )}
              </div>

                {/* Valor do Tratamento */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Valor do Tratamento
                  </label>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(treatmentValue[0])}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Entre R$ 300 e R$ 50.000
                  </div>
                  <Slider
                    value={treatmentValue}
                    onValueChange={setTreatmentValue}
                    max={50000}
                    min={300}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* Número de Parcelas */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Número de Parcelas
                  </label>
                  <div className="text-xl font-bold text-green-600 mb-3">
                    {installmentOptions[installments[0]]}x
                  </div>
                  <Slider
                    value={installments}
                    onValueChange={setInstallments}
                    max={5}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                  {/* Resultado da Simulação */}
                  {showResult && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Resultado da Simulação
                        </h3>
                        <div className="grid grid-cols-1 gap-2 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Valor da Parcela</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {formatCurrency(calculateInstallmentValue())}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botão Simular */}
                  <div className="text-center pt-4">
                    <Button 
                      onClick={handleSimulate}
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      🧮 Simular Crédito
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Coluna Direita - Vantagens do Crédito Doutorizze */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-green-600 flex items-center gap-2">
                    ✅ Vantagens do Crédito Doutorizze
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lista de Vantagens */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Aprovação rápida em até 24 horas</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Sem consulta ao SPC/Serasa</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Parcelas fixas sem surpresas</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">Atendimento humanizado</span>
                    </div>
                  </div>

                  {/* Seção de Segurança */}
                  <div className="border-t pt-4 mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                        <span className="text-gray-700">100% Seguro e Confiável</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                        <span className="text-gray-700">Processo 100% Digital</span>
                      </div>
                    </div>
                  </div>

                  {/* Texto de Rodapé */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-yellow-800">
                      💡 Para solicitar seu crédito, entre em contato com uma de nossas clínicas parceiras ou utilize nosso sistema de agendamento.
                    </p>
                  </div>

                  {/* Texto de Disclaimer */}
                  <div className="text-xs text-gray-500 text-center mt-4">
                    * Sujeito à análise de crédito. Valores e condições podem variar conforme perfil do cliente.
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aviso de Responsabilidade */}
            <div className="mt-12 text-center">
              <div className="max-w-4xl mx-auto bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">Aviso de responsabilidade:</strong> Os resultados apresentados são meramente ilustrativos e podem sofrer alteração após a análise de crédito, vinculada ao CPF do solicitante, avaliação de risco, políticas internas e documentos comprobatórios.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">
                  As condições finais — incluindo taxas, CET, entrada, prazos e parcelas — serão definidas somente após a validação cadastral.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">
                  Esta simulação não constitui proposta, reserva de condições, nem garantia de aprovação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

export default CreditSimulator;
