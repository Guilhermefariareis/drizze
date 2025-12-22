import React, { useState } from 'react';
import { X, Clock, User, Building2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

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

interface ProposalViewProps {
  request: CreditRequest;
  offers?: CreditOffer[];
  clinicName?: string;
  clinicCnpj?: string;
  onClose: () => void;
}

export const ProposalView: React.FC<ProposalViewProps> = ({
  request,
  offers = [],
  clinicName = '',
  clinicCnpj = '',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('resumo');

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
    doc.text(`Nome: ${request.patient_name}`, margin, yPosition);
    yPosition += 10;
    doc.text(`CPF: ${formatCPF(request.patient_cpf)}`, margin, yPosition);
    yPosition += 10;
    doc.text(`E-mail: ${request.patient_email}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Telefone: ${formatPhone(request.patient_phone || '')}`, margin, yPosition);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">Status da Proposta</div>
              <div className="text-sm font-semibold text-orange-600">Mesa de Crédito</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Última atualização</div>
            <div className="text-xs font-medium">{formatDate(request.updated_at)}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateContract}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar Contrato
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 px-3">
            {[
              { id: 'resumo', label: 'Resumo' },
              { id: 'cliente', label: 'Cliente' },
              { id: 'financeiro', label: 'Financeiro' },
              { id: 'historico', label: 'Histórico' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-xs ${
                  activeTab === tab.id
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
        <div className="p-3 overflow-y-auto max-h-[calc(80vh-140px)]">
          {activeTab === 'resumo' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {/* Valores do Financiamento */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                    Valores do Financiamento
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Valor Solicitado</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(valorSolicitado)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Valor Financiado</div>
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(valorFinanciado)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Parcelas</div>
                      <div className="text-base font-bold text-gray-900">{parcelas}x</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Valor Parcela</div>
                      <div className="text-base font-bold text-blue-600">{formatCurrency(valorParcela)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Total a Pagar</div>
                      <div className="text-base font-bold text-gray-900">{formatCurrency(totalAPagar)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500 mb-1">Taxa de Juros Mensal</div>
                      <div className="font-medium">{taxaJurosMensal.toFixed(2)}% a.m.</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Taxa de Juros Anual</div>
                      <div className="font-medium">{taxaJurosAnual.toFixed(2)}% a.a.</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">CET (Custo Efetivo Total)</div>
                      <div className="font-medium">{cet.toFixed(2)}% a.a.</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Prazo</div>
                      <div className="font-medium">{prazoMeses} meses</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Encargos e Tarifas */}
              <div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Encargos e Tarifas</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">IOF</span>
                      <span className="font-medium">{formatCurrency(iof)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarifas</span>
                      <span className="font-medium">{formatCurrency(tarifas)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-600">Total Encargos</span>
                        <span className="font-bold text-blue-600">{formatCurrency(totalEncargos)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instituição Financeira */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Instituição Financeira</h3>
                  <div className="text-blue-600 font-semibold text-sm">{instituicaoFinanceira}</div>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-3 h-3 mr-2" />
                    Informações do Cliente
                  </h3>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-gray-500 mb-1">Nome Completo</div>
                      <div className="font-medium text-gray-900">{request.patient_name}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">CPF</div>
                      <div className="font-medium">{formatCPF(request.patient_cpf)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Data Nascimento</div>
                      <div className="font-medium">15/03/1985</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">E-mail</div>
                      <div className="font-medium">{request.patient_email}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Telefone</div>
                      <div className="font-medium">{formatPhone(request.patient_phone || '')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações da Clínica */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Building2 className="w-3 h-3 mr-2" />
                    Informações da Clínica
                  </h3>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-gray-500 mb-1">Razão Social</div>
                      <div className="font-medium text-gray-900">{clinicName || 'Não informado'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">CNPJ</div>
                      <div className="font-medium">{clinicCnpj ? formatCNPJ(clinicCnpj) : 'Não informado'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cliente' && (
            <div className="max-w-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Informações Detalhadas do Cliente</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500 mb-1">Nome Completo</div>
                    <div className="font-medium text-gray-900">{request.patient_name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">CPF</div>
                    <div className="font-medium">{formatCPF(request.patient_cpf)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">E-mail</div>
                    <div className="font-medium">{request.patient_email}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Telefone</div>
                    <div className="font-medium">{formatPhone(request.patient_phone || '')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Data de Nascimento</div>
                    <div className="font-medium">15/03/1985</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Data da Solicitação</div>
                    <div className="font-medium">{formatDate(request.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="max-w-2xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalhes Financeiros</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-base font-medium text-gray-900 mb-3">Valores do Financiamento</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Solicitado:</span>
                      <span className="font-medium">{formatCurrency(valorSolicitado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Financiado:</span>
                      <span className="font-medium">{formatCurrency(valorFinanciado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número de Parcelas:</span>
                      <span className="font-medium">{parcelas}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor da Parcela:</span>
                      <span className="font-medium">{formatCurrency(valorParcela)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total a Pagar:</span>
                      <span className="font-bold">{formatCurrency(totalAPagar)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Taxas e Encargos</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa Mensal:</span>
                      <span className="font-medium">{taxaJurosMensal.toFixed(2)}% a.m.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa Anual:</span>
                      <span className="font-medium">{taxaJurosAnual.toFixed(2)}% a.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CET:</span>
                      <span className="font-medium">{cet.toFixed(2)}% a.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IOF:</span>
                      <span className="font-medium">{formatCurrency(iof)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarifas:</span>
                      <span className="font-medium">{formatCurrency(tarifas)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Encargos:</span>
                      <span className="font-bold">{formatCurrency(totalEncargos)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="max-w-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Histórico da Solicitação</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <div>
                      <div className="font-medium">Solicitação Criada</div>
                      <div className="text-sm text-gray-500">{formatDate(request.created_at)}</div>
                      <div className="text-sm text-gray-600">Solicitação de crédito criada pela clínica</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                    <div>
                      <div className="font-medium">Em Análise</div>
                      <div className="text-sm text-gray-500">{formatDate(request.updated_at)}</div>
                      <div className="text-sm text-gray-600">Proposta em análise pela mesa de crédito</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};