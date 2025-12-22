import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';

interface CreditSimulatorProps {
  requestedAmount: string;
  onSimulationChange?: (simulation: SimulationResult | null) => void;
}

interface SimulationResult {
  requestedAmount: number;
  installments: number;
  monthlyPayment: number;
  totalAmount: number;
  interestRate: number;
}

export default function CreditSimulator({ requestedAmount, onSimulationChange }: CreditSimulatorProps) {
  const [installments, setInstallments] = useState('12');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  
  const interestRate = 2.5; // 2.5% ao mês
  const minInstallments = 3;
  const maxInstallments = 24;
  const minAmount = 300;
  const maxAmount = 50000;

  useEffect(() => {
    calculateSimulation();
  }, [requestedAmount, installments]);

  const calculateSimulation = () => {
    const amount = parseFloat(requestedAmount.replace(/[^\d,]/g, '').replace(',', '.'));
    const months = parseInt(installments);
    
    if (!amount || amount < minAmount || amount > maxAmount || months < minInstallments || months > maxInstallments) {
      setSimulation(null);
      onSimulationChange?.(null);
      return;
    }

    // Cálculo com juros compostos
    const monthlyRate = interestRate / 100;
    const totalAmount = amount * Math.pow(1 + monthlyRate, months);
    const monthlyPayment = totalAmount / months;

    const result: SimulationResult = {
      requestedAmount: amount,
      installments: months,
      monthlyPayment,
      totalAmount,
      interestRate
    };

    setSimulation(result);
    onSimulationChange?.(result);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const installmentOptions = [];
  for (let i = minInstallments; i <= maxInstallments; i++) {
    installmentOptions.push(i);
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Simulação de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="installments-select" className="text-sm font-medium">
            Número de Parcelas
          </Label>
          <Select value={installments} onValueChange={setInstallments}>
            <SelectTrigger id="installments-select">
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

        {simulation && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Valor da Parcela</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(simulation.monthlyPayment)}
                </p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Total a Pagar</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(simulation.totalAmount)}
                </p>
              </div>
            </div>
            
            <div className="text-center p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                Taxa de juros: {interestRate}% ao mês
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                * Simulação sujeita à análise de crédito
              </p>
            </div>
          </div>
        )}

        {!simulation && requestedAmount && (
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Informe um valor entre {formatCurrency(minAmount)} e {formatCurrency(maxAmount)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { SimulationResult };