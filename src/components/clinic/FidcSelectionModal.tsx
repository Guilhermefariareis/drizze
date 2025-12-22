import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

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

interface FidcSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFidc: (fidcId: string, details: FinancialDetails) => void;
  formData: any;
}

const FidcSelectionModal: React.FC<FidcSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectFidc,
  formData
}) => {
  const [financialDetails, setFinancialDetails] = useState<FinancialDetails>(() => {
    const valorFinanciado = formData?.requested_amount || 90.00;
    const parcelas = formData?.installments || 24;
    
    // Função para calcular valores iniciais
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

  // Função para calcular automaticamente todos os valores financeiros
  const calculateFinancialValues = (valorFinanciado: number, parcelas: number) => {
    // Taxas base realistas
    const taxaAnualBase = 35.8; // 35.8% a.a.
    const taxaMensal = taxaAnualBase / 12 / 100; // Taxa mensal decimal
    const iofPercentual = 0.38; // 0.38% do valor financiado
    const tarifasFixas = 50.00; // R$ 50,00 de tarifas
    
    // Cálculo da parcela usando fórmula de financiamento (Price)
    const valorParcela = (valorFinanciado * Math.pow(1 + taxaMensal, parcelas) * taxaMensal) / 
                        (Math.pow(1 + taxaMensal, parcelas) - 1);
    
    // Cálculo do total a pagar
    const totalPagar = valorParcela * parcelas;
    
    // Cálculo do IOF
    const iof = (valorFinanciado * iofPercentual) / 100;
    
    // Cálculo do CET (Custo Efetivo Total)
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

  // Atualiza os valores financeiros quando formData mudar
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
      
      // Se alterou valor financiado ou parcelas, recalcula todos os outros valores
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

  const handleSelectOffer = (fidcId: string) => {
    onSelectFidc(fidcId, financialDetails);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Ofertas Disponíveis
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção de Resumo da Solicitação - agora editável */}
          {formData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Resumo da Solicitação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Valor do Tratamento editável */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-blue-700">Valor do Tratamento</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={financialDetails.valorFinanciado}
                      onChange={(e) => handleInputChange('valorFinanciado', Number(e.target.value))}
                      className="w-40 text-sm"
                    />
                    <span className="text-sm font-semibold text-blue-900">
                      {formatCurrency(financialDetails.valorFinanciado)}
                    </span>
                  </div>
                </div>

                {/* Prazo editável */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-blue-700">Prazo</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={financialDetails.parcelas}
                      onChange={(e) => handleInputChange('parcelas', Number(e.target.value))}
                      className="w-24 text-sm"
                    />
                    <span className="text-sm font-semibold text-blue-900">meses</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 mb-4">
            — Voltar
          </div>

          {fidcOffers.map((offer) => (
            <div key={offer.id} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{offer.name}</h3>
                  <p className="text-sm text-gray-600">{offer.subtitle}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${offer.color}`}>
                  {offer.rate}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

              <div className="grid grid-cols-3 gap-4 text-sm">
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
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FidcSelectionModal;