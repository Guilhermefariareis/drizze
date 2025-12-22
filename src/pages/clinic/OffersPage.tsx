import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppSidebar } from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import parseToISO from '@/utils/dateFormatter';

interface FinancialDetails {
  valorFinanciado: number;
  parcelas: number;
  valorParcela: number;
  totalPagar: number;
  cet: number;
  taxaAno: number;
  iof: number;
  tarifas: number;
}

interface FidcOffer {
  id: string;
  name: string;
  subtitle: string;
  rate: string;
  rateValue: number;
  color: string;
}

const OffersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData;
  const clinicId: string | undefined = location.state?.clinicId;
  const patientId: string | undefined = location.state?.patientId;

  const [financialDetails, setFinancialDetails] = useState<FinancialDetails>(() => {
    const valorFinanciado = formData?.requested_amount || 90.00;
    const parcelas = formData?.installments || 24;
    
    const calculateInitialValues = (valor: number, numParcelas: number) => {
      const taxaAnualBase = 35.8;
      const taxaMensal = taxaAnualBase / 12 / 100;
      const iofPercentual = 0.38;
      const tarifasFixas = 50.00;
      
      const valorParcela = (valor * Math.pow(1 + taxaMensal, numParcelas) * taxaMensal) / 
                          (Math.pow(1 + taxaMensal, numParcelas) - 1);
      const totalPagar = valorParcela * numParcelas;
      const iof = (valor * iofPercentual) / 100;
      const custoTotal = totalPagar + iof + tarifasFixas - valor;
      const cet = (custoTotal / valor) * 100;
      
      return {
        valorFinanciado: valor,
        parcelas: numParcelas,
        valorParcela: Number(valorParcela.toFixed(2)),
        totalPagar: Number(totalPagar.toFixed(2)),
        cet: Number(cet.toFixed(1)),
        taxaAno: taxaAnualBase,
        iof: Number(iof.toFixed(2)),
        tarifas: tarifasFixas
      };
    };
    
    return calculateInitialValues(valorFinanciado, parcelas);
  });

  const fidcOffers: FidcOffer[] = [
    {
      id: 'santander',
      name: 'FIDC Santander',
      subtitle: 'Santander Crédito Digital',
      rate: '2.99% a.m.',
      rateValue: 2.99,
      color: 'bg-blue-500'
    },
    {
      id: 'ease',
      name: 'FIDC Ease',
      subtitle: 'Ease Crédito Digital',
      rate: '2.75% a.m.',
      rateValue: 2.75,
      color: 'bg-blue-500'
    },
    {
      id: 'bv',
      name: 'FIDC BV',
      subtitle: 'Banco BV',
      rate: '2.5% a.m.',
      rateValue: 2.5,
      color: 'bg-blue-500'
    }
  ];

  const calculateFinancialValues = (valorFinanciado: number, parcelas: number) => {
    const taxaAnualBase = 35.8;
    const taxaMensal = taxaAnualBase / 12 / 100;
    const iofPercentual = 0.38;
    const tarifasFixas = 50.00;
    
    const valorParcela = (valorFinanciado * Math.pow(1 + taxaMensal, parcelas) * taxaMensal) / 
                        (Math.pow(1 + taxaMensal, parcelas) - 1);
    
    const totalPagar = valorParcela * parcelas;
    const iof = (valorFinanciado * iofPercentual) / 100;
    const custoTotal = totalPagar + iof + tarifasFixas - valorFinanciado;
    const cet = (custoTotal / valorFinanciado) * 100;
    
    return {
      valorParcela: Number(valorParcela.toFixed(2)),
      totalPagar: Number(totalPagar.toFixed(2)),
      cet: Number(cet.toFixed(1)),
      taxaAno: taxaAnualBase,
      iof: Number(iof.toFixed(2)),
      tarifas: tarifasFixas
    };
  };

  useEffect(() => {
    if (formData) {
      const valorFinanciado = formData.requested_amount || 90.00;
      const parcelas = formData.installments || 24;
      const calculatedValues = calculateFinancialValues(valorFinanciado, parcelas);
      
      setFinancialDetails(prev => ({
        ...prev,
        valorFinanciado,
        parcelas,
        ...calculatedValues
      }));
    }
  }, [formData]);

  const handleInputChange = (field: keyof FinancialDetails, value: number) => {
    setFinancialDetails(prev => {
      const newValues = { ...prev, [field]: value };
      
      if (field === 'valorFinanciado' || field === 'parcelas') {
        const valorFinanciado = field === 'valorFinanciado' ? value : prev.valorFinanciado;
        const parcelas = field === 'parcelas' ? value : prev.parcelas;
        const calculatedValues = calculateFinancialValues(valorFinanciado, parcelas);
        
        return {
          ...newValues,
          ...calculatedValues
        };
      }
      
      return newValues;
    });
  };

  const handleSelectOffer = async (fidcId: string) => {
    try {
      if (!clinicId) {
        toast.error('ID da clínica não disponível');
        return;
      }

      // Resolver patientId (deve ser sempre um profiles.id)
      let resolvedPatientId: string | undefined = patientId;
      if (!resolvedPatientId) {
        // Tentar obter pelo email ou CPF do formData
        const email = (formData?.patient_email || '').trim();
        const cpfClean = (formData?.patient_cpf || '').replace(/\D/g, '');
        try {
          if (email) {
            const { data: emailProfiles, error: emailErr } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .limit(1);
            if (emailErr) {
              console.warn('⚠️ [OffersPage] Falha ao buscar perfil por email:', emailErr);
            }
            if (emailProfiles && emailProfiles.length > 0) {
              resolvedPatientId = emailProfiles[0].id as string;
            }
          }

          if (!resolvedPatientId && cpfClean) {
            const { data: cpfProfiles, error: cpfErr } = await supabase
              .from('profiles')
              .select('id')
              .eq('cpf', cpfClean)
              .limit(1);
            if (cpfErr) {
              console.warn('⚠️ [OffersPage] Falha ao buscar perfil por CPF:', cpfErr);
            }
            if (cpfProfiles && cpfProfiles.length > 0) {
              resolvedPatientId = cpfProfiles[0].id as string;
            }
          }
        } catch (lookupErr) {
          console.warn('⚠️ [OffersPage] Erro ao tentar resolver patient_id:', lookupErr);
        }

        if (!resolvedPatientId) {
          toast.error('Não foi possível identificar o paciente (perfil).');
          return;
        }
      }

      // Obter dados da oferta selecionada
      const offer = fidcOffers.find((o) => o.id === fidcId);
      const bankName = offer?.name || 'FIDC Santander';
      const interestRate = offer?.rateValue || 2.99;

      // Montar payload da solicitação com valores editados
      const requestedAmount = Number(
        financialDetails.valorFinanciado || formData?.requested_amount || 0
      );
      const installments = Number(
        financialDetails.parcelas || formData?.installments || 12
      );

      if (!formData?.patient_name || !formData?.patient_email) {
        toast.error('Nome e email do paciente são obrigatórios.');
        return;
      }
      if (requestedAmount <= 0) {
        toast.error('O valor solicitado deve ser maior que zero.');
        return;
      }

      // Normalizar CEP (aceita do form em diferentes nomes)
      const rawCep = (formData as any)?.patient_cep || (formData as any)?.patient_zip || '';
      const normalizedCep = typeof rawCep === 'string' ? rawCep.replace(/\D/g, '') : '';

      // Normalizar data de nascimento para ISO
      const rawBirth: string | null = (formData as any)?.patient_birth_date || null;
      const birthISO = rawBirth ? parseToISO(rawBirth) : null;
      if (rawBirth && !birthISO) {
        toast.error('Data de nascimento inválida. Use um formato válido.');
        return;
      }

      const insertPayload: any = {
        clinic_id: clinicId,
        patient_id: resolvedPatientId,
        status: 'pending',
        requested_amount: requestedAmount,
        installments,
        // Usar coluna válida de taxa definida pela clínica
        clinic_interest_rate: Number(interestRate),
        treatment_description:
          formData?.treatment_description || 'Solicitação gerada pela clínica',
        // Metadados do paciente (obrigatórios no schema)
        patient_name: formData?.patient_name,
        patient_email: formData?.patient_email,
        // Campos opcionais existentes
        patient_phone: formData?.patient_phone || null,
        patient_cpf: formData?.patient_cpf || null,
        // Endereço do paciente (se disponível no formData)
        patient_address_cep: normalizedCep || null,
        patient_address_city: (formData as any)?.patient_city || null,
        patient_address_state: (formData as any)?.patient_uf || null,
        // Data de nascimento do paciente (se disponível)
        patient_birth_date: birthISO || null,
        treatment_type: formData?.treatment_type || null,
        urgency_level: formData?.urgency_level || 'normal',
        requested_date: new Date().toISOString().split('T')[0],
        clinic_notes: 'Solicitação iniciada pela clínica',
        fidc_name: bankName,
      };

      console.log('📦 [OffersPage] Payload insert credit_requests:', insertPayload);

      const { data: created, error } = await supabase
        .from('credit_requests')
        .insert(insertPayload)
        .select('id')
        .single();

      if (error) {
        console.error('❌ [OffersPage] Erro ao salvar solicitação:', error);
        toast.error('Falha ao salvar a solicitação de crédito.');
        return;
      }

      toast.success('Solicitação criada com sucesso!');
      navigate('/clinic-dashboard?tab=credito');
    } catch (err) {
      console.error('❌ [OffersPage] Erro inesperado ao criar solicitação:', err);
      toast.error('Erro inesperado ao criar solicitação.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };



  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 w-full bg-background flex flex-col ml-0 md:ml-64">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b">
          <Navbar />
        </div>
        <div className="flex-1 w-full px-6 py-8 pt-24">
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Ofertas Disponíveis
                </h1>
              </div>
              <p className="text-sm lg:text-base text-muted-foreground">
                Selecione a melhor oferta de crédito para seu paciente
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            {formData && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-900">
                    Resumo da Solicitação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-700">Valor do Tratamento</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={financialDetails.valorFinanciado}
                        onChange={(e) => handleInputChange('valorFinanciado', Number(e.target.value))}
                        className="text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-blue-700">Prazo (meses)</Label>
                      <Input
                        type="number"
                        value={financialDetails.parcelas}
                        onChange={(e) => handleInputChange('parcelas', Number(e.target.value))}
                        className="text-sm mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="space-y-6">
              {fidcOffers.map((offer) => (
                <Card key={offer.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{offer.name}</h3>
                      <p className="text-sm text-gray-600">{offer.subtitle}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${offer.color}`}>
                      {offer.rate}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <Label className="text-gray-600">Valor Financiado</Label>
                      <div className="mt-1">
                        <Input
                          type="number"
                          value={financialDetails.valorFinanciado}
                          onChange={(e) => handleInputChange('valorFinanciado', Number(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Parcela</Label>
                      <div className="mt-1 space-y-1">
                        <Input
                          type="number"
                          value={financialDetails.parcelas}
                          onChange={(e) => handleInputChange('parcelas', Number(e.target.value))}
                          className="text-sm"
                          placeholder="Qtd"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={financialDetails.valorParcela}
                          onChange={(e) => handleInputChange('valorParcela', Number(e.target.value))}
                          className="text-sm"
                          placeholder="Valor"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Total a Pagar</Label>
                      <div className="mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={financialDetails.totalPagar}
                          onChange={(e) => handleInputChange('totalPagar', Number(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">CET</Label>
                      <div className="mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={financialDetails.cet}
                          onChange={(e) => handleInputChange('cet', Number(e.target.value))}
                          className="text-sm"
                          placeholder="% a.a."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <Label className="text-gray-600">Taxa a.a.</Label>
                      <div className="mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={financialDetails.taxaAno}
                          onChange={(e) => handleInputChange('taxaAno', Number(e.target.value))}
                          className="text-sm"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">IOF</Label>
                      <div className="mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={financialDetails.iof}
                          onChange={(e) => handleInputChange('iof', Number(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Tarifas</Label>
                      <div className="mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={financialDetails.tarifas}
                          onChange={(e) => handleInputChange('tarifas', Number(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSelectOffer(offer.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Selecionar esta Oferta
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default OffersPage;
