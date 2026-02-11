import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Building2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import Navbar from '@/components/Navbar';
import { AppSidebar } from '@/components/AppSidebar';

interface CreditRequest {
  id: string;
  patient_id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  patient_name: string;
  patient_cpf: string;
  patient_email: string;
  patient_phone: string;
  patient_birth_date?: string;
  patient_address_cep?: string;
  patient_address_state?: string;
  patient_address_city?: string;
  patient_address_neighborhood?: string;
  patient_address_street?: string;
  patient_address_number?: string;
  treatment_type?: string;
  urgency_level?: string;
  requested_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_amount?: number;
  interest_rate?: number;
  monthly_payment?: number;
  total_amount?: number;
  fidc_name?: string;
  payment_conditions?: any;
}

interface CreditOffer {
  id: string;
  credit_request_id: string;
  bank_name: string;
  approved_amount: number;
  interest_rate: number;
  installments: number;
  conditions: string;
  monthly_payment: number | null;
  total_amount: number | null;
  created_at: string;
}

export const ProposalDetailsPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumo');
  const [request, setRequest] = useState<CreditRequest | null>(null);
  const [offers, setOffers] = useState<CreditOffer[]>([]);
  const [clinicName, setClinicName] = useState('');
  const [clinicCnpj, setClinicCnpj] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 [ProposalDetailsPage] useEffect executado com requestId:', requestId);
    if (requestId) {
      fetchProposalData(requestId);
    } else {
      console.error('❌ [ProposalDetailsPage] requestId não encontrado na URL');
      setError('ID da proposta não encontrado na URL');
      setLoading(false);
    }
  }, [requestId]);

  const fetchProposalData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [ProposalDetailsPage] Buscando proposta com ID:', id);

      // Buscar todos os dados diretamente da tabela credit_requests
      const { data: requestData, error: requestError } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('id', id)
        .single();

      console.log('📊 [ProposalDetailsPage] Resultado da query credit_requests:', { requestData, requestError });

      if (requestError) {
        console.error('❌ [ProposalDetailsPage] Erro na query credit_requests:', requestError);
        throw new Error(`Proposta não encontrada: ${requestError.message}`);
      }

      if (!requestData) {
        console.error('❌ [ProposalDetailsPage] Nenhum dado retornado para ID:', id);
        throw new Error('Proposta não encontrada - dados vazios');
      }

      console.log('✅ [ProposalDetailsPage] Dados da proposta carregados:', requestData);

      // Fallback: completar endereço do paciente com dados do perfil/patient quando não informado na proposta
      let mergedRequest: any = { ...requestData };
      const needsCep = !requestData.patient_address_cep;
      const needsCity = !requestData.patient_address_city;
      const needsState = !requestData.patient_address_state;
      const needsBirth = !requestData.patient_birth_date;

      if ((needsCep || needsCity || needsState || needsBirth) && requestData.patient_id) {
        try {
          const [{ data: profileData }, { data: patientData }] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', requestData.patient_id).maybeSingle(),
            supabase.from('patients').select('*').eq('id', requestData.patient_id).maybeSingle()
          ]);

          const fallbackCity = (profileData as any)?.city ?? (patientData as any)?.city ?? null;
          const fallbackState = (profileData as any)?.state ?? (patientData as any)?.state ?? null;
          const fallbackZip = ((profileData as any)?.zip_code ?? (patientData as any)?.zip_code ?? '')
            ?.toString()
            .replace(/\D/g, '') || null;
          const fallbackBirth = (profileData as any)?.birth_date ?? (patientData as any)?.birth_date ?? null;

          mergedRequest = {
            ...mergedRequest,
            patient_address_cep: mergedRequest.patient_address_cep ?? fallbackZip,
            patient_address_city: mergedRequest.patient_address_city ?? fallbackCity,
            patient_address_state: mergedRequest.patient_address_state ?? fallbackState,
            patient_birth_date: mergedRequest.patient_birth_date ?? fallbackBirth,
          };

          console.log('🔄 [ProposalDetailsPage] Endereço após fallback:', {
            cep: mergedRequest.patient_address_cep,
            city: mergedRequest.patient_address_city,
            state: mergedRequest.patient_address_state,
          });
        } catch (fallbackErr) {
          console.warn('⚠️ [ProposalDetailsPage] Falha ao aplicar fallback de endereço:', fallbackErr);
        }
      }

      setRequest(mergedRequest);

      // Buscar ofertas relacionadas
      const { data: offersData } = await supabase
        .from('credit_offers')
        .select('*')
        .eq('credit_request_id', id);

      if (offersData) {
        setOffers(offersData);
      }

      // Buscar dados da clínica
      if (requestData.clinic_id) {
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('name, cnpj')
          .eq('id', requestData.clinic_id)
          .single();

        if (clinicData) {
          setClinicName(clinicData.name || '');
          setClinicCnpj(clinicData.cnpj || '');
        }
      }
    } catch (err) {
      console.error('💥 [ProposalDetailsPage] Erro capturado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados da proposta';
      console.error('💥 [ProposalDetailsPage] Mensagem de erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 ml-0 md:ml-64 pt-16 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados da proposta...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 ml-0 md:ml-64 pt-16 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposta não encontrada</h1>
              <p className="text-gray-600 mb-6">{error || 'A proposta solicitada não foi encontrada.'}</p>
              <Button onClick={() => navigate('/clinic-dashboard')} className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Pegar a melhor oferta (maior valor aprovado)
  const bestOffer = offers && offers.length > 0
    ? offers.reduce((best, current) =>
      (current.approved_amount || 0) > (best.approved_amount || 0) ? current : best
    )
    : null;

  // Calcular valores baseados na melhor oferta ou dados da solicitação
  const valorSolicitado = request.requested_amount || 0;
  const valorFinanciado = bestOffer?.approved_amount || request.approved_amount || valorSolicitado;
  const parcelas = bestOffer?.installments || request.installments || 24;
  const valorParcela = bestOffer?.monthly_payment || request.monthly_payment || (valorFinanciado / parcelas);
  const totalAPagar = bestOffer?.total_amount || request.total_amount || (valorParcela * parcelas);
  const taxaJurosMensal = bestOffer?.interest_rate || request.interest_rate || 2.99;
  const taxaJurosAnual = taxaJurosMensal * 12;
  const cet = taxaJurosAnual + 3; // Estimativa do CET
  const prazoMeses = parcelas;

  // Calcular encargos
  const iof = valorFinanciado * 0.038; // 3.8% estimado
  const tarifas = 350.00; // Valor fixo estimado
  const totalEncargos = iof + tarifas;

  const instituicaoFinanceira = bestOffer?.bank_name || request.fidc_name || 'FIDC Santander';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Configurações
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSTA DE CRÉDITO', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // Status
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: Mesa de Crédito`, margin, yPosition);
    doc.text(`Data: ${formatDate(request.updated_at)}`, pageWidth - margin - 60, yPosition);

    yPosition += 20;

    // Valores do Financiamento
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VALORES DO FINANCIAMENTO', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Valor Solicitado: ${formatCurrency(valorSolicitado)}`, margin, yPosition);
    doc.text(`Valor Financiado: ${formatCurrency(valorFinanciado)}`, margin + 100, yPosition);
    yPosition += 10;

    doc.text(`Parcelas: ${parcelas}x`, margin, yPosition);
    doc.text(`Valor da Parcela: ${formatCurrency(valorParcela)}`, margin + 100, yPosition);
    yPosition += 10;

    doc.text(`Total a Pagar: ${formatCurrency(totalAPagar)}`, margin, yPosition);
    doc.text(`Taxa Juros Mensal: ${taxaJurosMensal.toFixed(2)}%`, margin + 100, yPosition);
    yPosition += 10;

    doc.text(`Taxa Juros Anual: ${taxaJurosAnual.toFixed(2)}%`, margin, yPosition);
    doc.text(`CET: ${cet.toFixed(2)}%`, margin + 100, yPosition);
    yPosition += 20;

    // Encargos e Tarifas
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ENCARGOS E TARIFAS', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`IOF: ${formatCurrency(iof)}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Tarifas: ${formatCurrency(tarifas)}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Total Encargos: ${formatCurrency(totalEncargos)}`, margin, yPosition);
    yPosition += 20;

    // Instituição Financeira
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTITUIÇÃO FINANCEIRA', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(instituicaoFinanceira, margin, yPosition);
    yPosition += 20;

    // Informações do Cliente
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DO CLIENTE', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${request.patient_name || 'Não informado'}`, margin, yPosition);
    yPosition += 10;
    doc.text(`CPF: ${request.patient_cpf ? formatCPF(request.patient_cpf) : 'Não informado'}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Data de Nascimento: ${request.patient_birth_date ? formatDate(request.patient_birth_date) : 'Não informado'}`, margin, yPosition);
    yPosition += 10;
    doc.text(`E-mail: ${request.patient_email || 'Não informado'}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Telefone: ${request.patient_phone ? formatPhone(request.patient_phone) : 'Não informado'}`, margin, yPosition);
    yPosition += 15;

    // Endereço do Cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ENDEREÇO:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const endereco = [
      request.patient_address_city,
      request.patient_address_state,
      request.patient_address_cep
    ].filter(Boolean).join(', ') || 'Endereço não informado';

    doc.text(`${endereco}`, margin, yPosition);
    yPosition += 20;

    // Informações da Clínica
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DA CLÍNICA', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Razão Social: ${clinicName || 'Não informado'}`, margin, yPosition);
    yPosition += 10;
    doc.text(`CNPJ: ${formatCNPJ(clinicCnpj || '')}`, margin, yPosition);

    // Salvar o PDF
    doc.save(`proposta-credito-${request.id}.pdf`);
  };

  const generateContract = () => {
    const doc = new jsPDF();

    // Configurações
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRATO DE FINANCIAMENTO', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // Número do contrato
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Contrato Nº: ${request.id.toUpperCase()}`, margin, yPosition);
    doc.text(`Data: ${formatDate(new Date().toISOString())}`, pageWidth - margin - 60, yPosition);

    yPosition += 20;

    // Partes do contrato
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTES CONTRATANTES', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CONTRATANTE:', margin, yPosition);
    yPosition += 8;
    doc.text(`Nome: ${request.patient_name}`, margin + 10, yPosition);
    yPosition += 8;
    doc.text(`CPF: ${formatCPF(request.patient_cpf)}`, margin + 10, yPosition);
    yPosition += 8;
    doc.text(`E-mail: ${request.patient_email}`, margin + 10, yPosition);
    yPosition += 15;

    doc.text('CONTRATADA:', margin, yPosition);
    yPosition += 8;
    doc.text(`Instituição: ${instituicaoFinanceira}`, margin + 10, yPosition);
    yPosition += 20;

    // Objeto do contrato
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OBJETO DO CONTRATO', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const objetoText = `Financiamento para tratamento odontológico no valor de ${formatCurrency(valorFinanciado)}, `;
    const objetoText2 = `a ser pago em ${parcelas} parcelas mensais de ${formatCurrency(valorParcela)}.`;
    doc.text(objetoText, margin, yPosition);
    yPosition += 8;
    doc.text(objetoText2, margin, yPosition);
    yPosition += 20;

    // Condições financeiras
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDIÇÕES FINANCEIRAS', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Valor do Financiamento: ${formatCurrency(valorFinanciado)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`• Número de Parcelas: ${parcelas}`, margin, yPosition);
    yPosition += 8;
    doc.text(`• Valor da Parcela: ${formatCurrency(valorParcela)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`• Taxa de Juros Mensal: ${taxaJurosMensal.toFixed(2)}%`, margin, yPosition);
    yPosition += 8;
    doc.text(`• Taxa de Juros Anual: ${taxaJurosAnual.toFixed(2)}%`, margin, yPosition);
    yPosition += 8;
    doc.text(`• CET (Custo Efetivo Total): ${cet.toFixed(2)}%`, margin, yPosition);
    yPosition += 8;
    doc.text(`• Total a Pagar: ${formatCurrency(totalAPagar)}`, margin, yPosition);
    yPosition += 20;

    // Encargos
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ENCARGOS E TARIFAS', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• IOF: ${formatCurrency(iof)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`• Tarifas Administrativas: ${formatCurrency(tarifas)}`, margin, yPosition);
    yPosition += 20;

    // Assinaturas
    yPosition = doc.internal.pageSize.height - 60;
    doc.setFontSize(10);
    doc.text('_________________________________', margin, yPosition);
    doc.text('_________________________________', pageWidth - margin - 80, yPosition);
    yPosition += 8;
    doc.text('Assinatura do Contratante', margin, yPosition);
    doc.text('Assinatura da Contratada', pageWidth - margin - 80, yPosition);

    // Salvar o PDF
    doc.save(`contrato-financiamento-${request.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 ml-0 md:ml-64 pt-16">
          {/* Header com navegação */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-auto sm:h-16 py-3 sm:py-0">
                <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/clinic-dashboard')}
                    className="text-gray-600 hover:text-gray-900 p-1 sm:p-2"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline ml-2">Voltar ao Dashboard</span>
                  </Button>
                  <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Detalhes da Proposta</h1>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPDF}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Exportar PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateContract}
                    className="text-green-600 border-green-600 hover:bg-green-50 text-xs sm:text-sm"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Gerar Contrato</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Status da proposta */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <div>
                    <div className="text-xs sm:text-sm text-gray-500">Status da Proposta</div>
                    <div className="text-base sm:text-lg font-semibold text-orange-600">Mesa de Crédito</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs sm:text-sm text-gray-500">Última atualização</div>
                  <div className="text-xs sm:text-sm font-medium">{formatDate(request.updated_at)}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex flex-wrap gap-1 px-4 sm:px-6">
                  {[
                    { id: 'resumo', label: 'Resumo' },
                    { id: 'cliente', label: 'Cliente' },
                    { id: 'financeiro', label: 'Financeiro' },
                    { id: 'historico', label: 'Histórico' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'resumo' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Valores do Financiamento */}
                    <div className="lg:col-span-2">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 sm:mr-3"></span>
                          Valores do Financiamento
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Valor Solicitado</div>
                            <div className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(valorSolicitado)}</div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Valor Financiado</div>
                            <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(valorFinanciado)}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="text-center">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Parcelas</div>
                            <div className="text-base sm:text-xl font-bold text-gray-900">{parcelas}x</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Valor Parcela</div>
                            <div className="text-base sm:text-xl font-bold text-blue-600">{formatCurrency(valorParcela)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Total a Pagar</div>
                            <div className="text-base sm:text-xl font-bold text-gray-900">{formatCurrency(totalAPagar)}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">Taxa de Juros Mensal</div>
                            <div className="font-medium text-sm sm:text-base">{taxaJurosMensal.toFixed(2)}% a.m.</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">Taxa de Juros Anual</div>
                            <div className="font-medium text-sm sm:text-base">{taxaJurosAnual.toFixed(2)}% a.a.</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">CET (Custo Efetivo Total)</div>
                            <div className="font-medium text-sm sm:text-base">{cet.toFixed(2)}% a.a.</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">Prazo</div>
                            <div className="font-medium text-sm sm:text-base">{prazoMeses} meses</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Encargos e Tarifas */}
                    <div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Encargos e Tarifas</h3>

                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-xs sm:text-sm">IOF</span>
                            <span className="font-medium text-sm sm:text-base">{formatCurrency(iof)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-xs sm:text-sm">Tarifas</span>
                            <span className="font-medium text-sm sm:text-base">{formatCurrency(tarifas)}</span>
                          </div>
                          <div className="border-t pt-3 sm:pt-4">
                            <div className="flex justify-between">
                              <span className="font-medium text-blue-600 text-sm sm:text-base">Total Encargos</span>
                              <span className="font-bold text-blue-600 text-sm sm:text-base">{formatCurrency(totalEncargos)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Instituição Financeira */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Instituição Financeira</h3>
                        <div className="text-blue-600 font-semibold text-base sm:text-lg">{instituicaoFinanceira}</div>
                      </div>
                    </div>

                    {/* Informações do Cliente */}
                    <div className="lg:col-span-1">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Informações do Cliente
                        </h3>

                        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">Nome Completo</div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">{request.patient_name}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">CPF</div>
                            <div className="font-medium text-sm sm:text-base">{formatCPF(request.patient_cpf)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">E-mail</div>
                            <div className="font-medium text-sm sm:text-base">{request.patient_email}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">Telefone</div>
                            <div className="font-medium text-sm sm:text-base">{request.patient_phone ? formatPhone(request.patient_phone) : 'Não informado'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1 text-xs sm:text-sm">Data de Nascimento</div>
                            <div className="font-medium text-sm sm:text-base">{request.patient_birth_date ? formatDate(request.patient_birth_date) : 'Não informado'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'cliente' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Dados Pessoais */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Dados Pessoais
                      </h3>

                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">Nome Completo</div>
                          <div className="font-medium text-sm sm:text-base">{request.patient_name}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">CPF</div>
                          <div className="font-medium text-sm sm:text-base">{request.patient_cpf ? formatCPF(request.patient_cpf) : 'Não informado'}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">Data de Nascimento</div>
                          <div className="font-medium text-sm sm:text-base">{request.patient_birth_date ? formatDate(request.patient_birth_date) : 'Não informado'}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">E-mail</div>
                          <div className="font-medium text-sm sm:text-base">{request.patient_email}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">Telefone</div>
                          <div className="font-medium text-sm sm:text-base">{request.patient_phone ? formatPhone(request.patient_phone) : 'Não informado'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Endereço
                      </h3>

                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">CEP</div>
                          <div className="font-medium text-sm sm:text-base">{request.patient_address_cep || 'Não informado'}</div>
                        </div>

                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">Cidade</div>
                          <div className="font-medium text-sm sm:text-base">{request.patient_address_city || 'Não informado'}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-1">Estado</div>
                          <div className="font-medium text-sm sm:text-base">{request.patient_address_state || 'Não informado'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'financeiro' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Resumo Financeiro */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Resumo Financeiro</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="text-center">
                          <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{formatCurrency(valorFinanciado)}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Valor Financiado</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{parcelas}x</div>
                          <div className="text-xs sm:text-sm text-gray-500">Parcelas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">{formatCurrency(valorParcela)}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Valor da Parcela</div>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes das Taxas */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Detalhes das Taxas</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Taxa de Juros Mensal</div>
                          <div className="text-xl font-bold text-gray-900">{taxaJurosMensal.toFixed(2)}% a.m.</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Taxa de Juros Anual</div>
                          <div className="text-xl font-bold text-gray-900">{taxaJurosAnual.toFixed(2)}% a.a.</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">CET (Custo Efetivo Total)</div>
                          <div className="text-xl font-bold text-red-600">{cet.toFixed(2)}% a.a.</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Total a Pagar</div>
                          <div className="text-xl font-bold text-gray-900">{formatCurrency(totalAPagar)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Encargos Detalhados */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Encargos Detalhados</h3>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">IOF (Imposto sobre Operações Financeiras)</span>
                          <span className="font-medium">{formatCurrency(iof)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Tarifas Administrativas</span>
                          <span className="font-medium">{formatCurrency(tarifas)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t-2 border-gray-200 pt-4">
                          <span className="font-semibold text-blue-600">Total de Encargos</span>
                          <span className="font-bold text-blue-600 text-lg">{formatCurrency(totalEncargos)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'historico' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico da Proposta</h3>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-gray-900">Proposta Criada</div>
                          <div className="text-sm text-gray-500">{formatDate(request.created_at)}</div>
                          <div className="text-sm text-gray-600 mt-1">Solicitação de crédito enviada para análise</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-gray-900">Em Análise - Mesa de Crédito</div>
                          <div className="text-sm text-gray-500">{formatDate(request.updated_at)}</div>
                          <div className="text-sm text-gray-600 mt-1">Proposta sendo analisada pela equipe de crédito</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
