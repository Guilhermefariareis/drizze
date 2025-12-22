import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, CreditCard, TrendingUp, Shield, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SimulatorConfig {
  maxValue: number;
  minValue: number;
  maxInstallments: number;
  minInstallments: number;
  interestRate: number;
  title: string;
  description: string;
  benefits: string[];
}

interface Clinic {
  id: string;
  name: string;
}

export default function LoanSimulatorFixed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClinic, setSelectedClinic] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [treatmentValue, setTreatmentValue] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [installments, setInstallments] = useState('12');
  
  // Ref para debounce
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [config, setConfig] = useState<SimulatorConfig>({
    maxValue: 50000,
    minValue: 300,
    maxInstallments: 24,
    minInstallments: 3,
    interestRate: 2.5,
    title: 'Simulador de Crédito',
    description: 'Descubra como financiar seu tratamento de forma simples e acessível',
    benefits: [
      'Aprovação rápida em até 24 horas',
      'Sem consulta ao SPC/Serasa',
      'Parcelas fixas sem surpresas',
      'Atendimento humanizado'
    ]
  });
  const [result, setResult] = useState<{
    monthlyValue: number;
    totalValue: number;
    interestRate: number;
  } | null>(null);

  useEffect(() => {
    fetchSimulatorConfig();
    fetchClinics();
  }, []);

  // Cleanup do timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching clinics:', error);
        return;
      }

      setClinics(data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const fetchSimulatorConfig = async () => {
    try {
      const { data } = await supabase
        .from('site_configurations')
        .select('config_value')
        .eq('config_key', 'loan_simulator_config')
        .single();

      if (data?.config_value && typeof data.config_value === 'object') {
        setConfig(prevConfig => ({ ...prevConfig, ...(data.config_value as Partial<SimulatorConfig>) }));
      }
    } catch (error) {
      console.error('Error fetching simulator config:', error);
    }
  };

  const calculateLoan = () => {
    // Verificar se a clínica foi selecionada
    if (!selectedClinic) {
      alert('Por favor, selecione uma clínica antes de simular.');
      return;
    }

    const value = parseFloat(treatmentValue.replace(/[^\d,]/g, '').replace(',', '.'));
    const months = parseInt(installments);
    
    if (!value || value < config.minValue || value > config.maxValue) {
      alert(`Valor deve estar entre R$ ${config.minValue.toLocaleString()} e R$ ${config.maxValue.toLocaleString()}`);
      return;
    }

    if (months < config.minInstallments || months > config.maxInstallments) {
      alert(`Número de parcelas deve estar entre ${config.minInstallments} e ${config.maxInstallments}`);
      return;
    }

    // Verificar se o usuário está logado
    if (!user) {
      // Redirecionar para página de cadastro/login
      navigate('/patient-login');
      return;
    }

    // Cálculo com juros compostos
    const monthlyRate = config.interestRate / 100;
    const totalValue = value * Math.pow(1 + monthlyRate, months);
    const monthlyValue = totalValue / months;

    setResult({
      monthlyValue,
      totalValue,
      interestRate: config.interestRate
    });
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Se não há valor, retorna vazio
    if (!numericValue) return '';
    
    // Converte para número e formata (sem dividir por 100)
    const numberValue = parseInt(numericValue);
    
    const formattedValue = numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    
    // Atualiza o valor interno (sem formatação)
    setTreatmentValue(rawValue);
    
    // Durante a digitação, mostra apenas os números
    setDisplayValue(rawValue);
    setIsTyping(true);
    
    // Limpa o timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Define um novo timeout para formatar após parar de digitar
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (rawValue) {
        setDisplayValue(formatCurrency(rawValue));
      }
    }, 800);
  };

  const handleValueBlur = () => {
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (treatmentValue) {
      setDisplayValue(formatCurrency(treatmentValue));
    }
  };

  const handleValueFocus = () => {
    if (treatmentValue) {
      setDisplayValue(treatmentValue);
      setIsTyping(true);
    }
  };

  const installmentOptions = [];
  for (let i = config.minInstallments; i <= config.maxInstallments; i++) {
    installmentOptions.push(i);
  }

  return (
    <section id="loan-simulator" className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">{config.title}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {config.description}
          </p>
          <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Pré-simulação:</strong> Os valores apresentados são estimativas e dependem de validação interna de crédito ou validação direta pela clínica.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Simulador */}
          <Card className="shadow-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calculator className="h-6 w-6 text-primary" />
                Simulação de Parcelas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="clinic-select" className="text-base font-medium">
                  Selecione a Clínica *
                </Label>
                <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Escolha uma clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment-value" className="text-base font-medium">
                  Valor do Tratamento
                </Label>
                <Input
                  id="treatment-value"
                  placeholder="Digite o valor (ex: 1500)"
                  value={isTyping ? displayValue : (displayValue || formatCurrency(treatmentValue))}
                  onChange={handleValueChange}
                  onBlur={handleValueBlur}
                  onFocus={handleValueFocus}
                  className="text-lg h-12"
                />
                <p className="text-sm text-muted-foreground">
                  Entre R$ {config.minValue.toLocaleString()} e R$ {config.maxValue.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments" className="text-base font-medium">
                  Número de Parcelas
                </Label>
                <Select value={installments} onValueChange={setInstallments}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {installmentOptions.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={calculateLoan} 
                className="w-full h-11 sm:h-12 text-sm sm:text-base lg:text-lg font-semibold px-2 sm:px-4"
                size="lg"
              >
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="truncate">Simular Crédito</span>
              </Button>

              {result && (
                <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-lg mb-4 text-center">Resultado da Pré-Simulação</h3>
                  
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4">
                    <div className="text-center p-3 sm:p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Valor Solicitado</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {parseFloat(treatmentValue.replace(/[^\d,]/g, '').replace(',', '.')).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 sm:p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Nº de Parcelas</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {installments}x
                      </p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Taxa de Juros</p>
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        {result.interestRate}% a.m.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="text-center p-3 sm:p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Valor Total a Pagar</p>
                      <p className="text-lg sm:text-xl font-bold text-success">
                        {result.totalValue.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 sm:p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Valor da Parcela</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {result.monthlyValue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vantagens */}
          <Card className="shadow-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6 text-success" />
                Vantagens do Crédito Doutorizze
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="grid gap-3 sm:gap-4">
                {config.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 sm:space-y-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">100% Seguro e Confiável</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Processo 100% Digital</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center font-medium">
                  💡 Para solicitar seu crédito, entre em contato com uma de nossas clínicas parceiras ou utilize nosso sistema de agendamento.
                </p>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                * Sujeito à análise de crédito. Valores e condições podem variar conforme perfil do cliente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}