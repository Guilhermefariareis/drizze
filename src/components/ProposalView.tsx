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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0A0514] border border-white/5 rounded-[3.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>

        {/* Header Section */}
        <div className="p-10 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-glow shadow-primary/20">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">Proposta de Crédito</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-3 py-1 bg-warning/10 text-warning text-[10px] font-black uppercase tracking-widest rounded-full">Mesa de Crédito</span>
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Até {formatDate(request.updated_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={exportToPDF}
              className="h-14 px-6 border border-white/5 rounded-2xl text-white font-bold hover:bg-white/5 transition-all text-xs flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              PDF
            </Button>
            <Button
              variant="ghost"
              onClick={generateContract}
              className="h-14 px-6 border border-white/5 rounded-2xl text-white font-bold hover:bg-white/5 transition-all text-xs flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              CONTRATO
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-14 w-14 border border-white/5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-10 border-b border-white/5 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-8">
            {[
              { id: 'resumo', label: 'Resumo da Offerta' },
              { id: 'cliente', label: 'Dados do Paciente' },
              { id: 'financeiro', label: 'Planilha Financeira' },
              { id: 'historico', label: 'Histórico' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-6 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-white'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-glow shadow-primary/50"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-10 overflow-y-auto max-h-[calc(90vh-320px)] custom-scrollbar">
          {activeTab === 'resumo' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Financial Highlight Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-effect p-8 rounded-[2.5rem] border-none bg-primary/5">
                  <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-3">Valor Solicitado</p>
                  <p className="text-3xl font-black text-white font-outfit">{formatCurrency(valorSolicitado)}</p>
                </div>
                <div className="glass-effect p-8 rounded-[2.5rem] border-none bg-success/10 shadow-glow shadow-success/10">
                  <p className="text-success text-[10px] font-black uppercase tracking-widest mb-3">Valor Liberado</p>
                  <p className="text-3xl font-black text-white font-outfit">{formatCurrency(valorFinanciado)}</p>
                </div>
                <div className="glass-effect p-8 rounded-[2.5rem] border-none bg-white/5">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-3">Plano de Pagas</p>
                  <p className="text-3xl font-black text-white font-outfit">{parcelas}x</p>
                </div>
              </div>

              {/* Installment Detail */}
              <div className="glass-effect p-10 rounded-[3rem] border border-white/5 bg-white/2 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[80px] -z-10 rounded-full"></div>

                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow shadow-primary"></div>
                  Detalhamento das Parcelas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Valor por Parcela</span>
                      <span className="text-4xl font-black text-primary font-outfit leading-none">{formatCurrency(valorParcela)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Custo Total (Final)</span>
                      <span className="text-white font-bold">{formatCurrency(totalAPagar)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 items-start">
                    <div>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Taxa Mensal</p>
                      <p className="text-xl font-black text-white font-outfit">{taxaJurosMensal.toFixed(2)}% <span className="text-[10px] text-muted-foreground ml-1">a.m.</span></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">CET Anual</p>
                      <p className="text-xl font-black text-white font-outfit">{cet.toFixed(2)}% <span className="text-[10px] text-muted-foreground ml-1">a.a.</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Institution and Clinic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-3">Agente Financeiro</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-white font-outfit">{instituicaoFinanceira}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Doutorizze Partners</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-3">Unidade de Atendimento</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                      <User className="w-5 h-5 text-white/50" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-white font-outfit truncate max-w-[200px]">{clinicName || 'Clínica Parceira'}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{clinicCnpj ? formatCNPJ(clinicCnpj) : '--.---.---/----.--'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cliente' && (
            <div className="animate-in slide-in-from-bottom-5 duration-500">
              <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8">Informações de Cadastro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <DataField label="Nome Completo" value={request.patient_name} premium />
                  <DataField label="CPF / Documento" value={formatCPF(request.patient_cpf)} />
                  <DataField label="E-mail de Contato" value={request.patient_email} />
                  <DataField label="WhatsApp" value={formatPhone(request.patient_phone || '')} />
                  <DataField label="Data de Nascimento" value="15/03/1985" />
                  <DataField label="Início do Processo" value={formatDate(request.created_at)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="animate-in slide-in-from-bottom-5 duration-500 space-y-6">
              <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8">Composição do CET</h3>
                <div className="space-y-6">
                  <FinancialRow label="Valor Bruto do Crédito" value={formatCurrency(valorFinanciado)} bold />
                  <FinancialRow label="IOF (Imposto s/ Operação Fin.)" value={formatCurrency(iof)} />
                  <FinancialRow label="Tarifas Administrativas" value={formatCurrency(tarifas)} />
                  <div className="pt-6 border-t border-white/10 mt-6">
                    <FinancialRow label="Valor Total Pago ao Final" value={formatCurrency(totalAPagar)} primary bold large />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="animate-in zoom-in duration-500">
              <div className="bg-white/5 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
                <div className="absolute left-[54px] top-[120px] bottom-[120px] w-[1px] bg-white/10"></div>

                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-12">Traceabilidade da Operação</h3>

                <div className="space-y-12">
                  <HistoryItem
                    title="Solicitação Submetida"
                    date={formatDate(request.created_at)}
                    desc="A clínica iniciou o processo de simulação de crédito."
                    active
                  />
                  <HistoryItem
                    title="Em Análise Bancária"
                    date={formatDate(request.updated_at)}
                    desc="A proposta está sendo avaliada pelas mesas de crédito parceiras."
                    active
                  />
                  <HistoryItem
                    title="Aguardando Confirmação"
                    date="Pendente"
                    desc="Liberação aguardando aceite formal do contratante."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components for better organization
const DataField = ({ label, value, premium }: { label: string; value: string; premium?: boolean }) => (
  <div className="space-y-1">
    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{label}</p>
    <p className={`text-sm ${premium ? 'text-primary font-black' : 'text-white font-medium'}`}>{value}</p>
  </div>
);

const FinancialRow = ({ label, value, bold, primary, large }: { label: string; value: string; bold?: boolean; primary?: boolean; large?: boolean }) => (
  <div className="flex justify-between items-center">
    <span className={`text-xs uppercase tracking-widest ${bold ? 'font-black text-white' : 'font-medium text-muted-foreground'}`}>{label}</span>
    <span className={`font-outfit ${large ? 'text-2xl' : 'text-lg'} ${primary ? 'text-primary font-black' : 'text-white font-bold'}`}>{value}</span>
  </div>
);

const HistoryItem = ({ title, date, desc, active }: { title: string; date: string; desc: string; active?: boolean }) => (
  <div className="flex items-start gap-6 relative z-10">
    <div className={`w-8 h-8 rounded-full border-4 ${active ? 'bg-primary border-[#0A0514] shadow-glow shadow-primary/50' : 'bg-white/5 border-white/10'} flex-shrink-0 mt-1`}></div>
    <div>
      <h4 className={`text-xs font-black uppercase tracking-widest ${active ? 'text-white' : 'text-muted-foreground'}`}>{title}</h4>
      <p className="text-[10px] font-bold text-muted-foreground mt-1">{date}</p>
      <p className="text-xs text-white/40 mt-2 max-w-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);
