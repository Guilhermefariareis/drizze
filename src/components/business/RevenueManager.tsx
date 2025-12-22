import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp, useBusinessLogic } from '@/contexts/AppContext';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calculator,
  PiggyBank,
  Target,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const RevenueManager: React.FC = () => {
  const { state } = useApp();
  const { processPayment, calculateMetrics, addNotification } = useBusinessLogic();
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentGoal, setPaymentGoal] = useState('');

  const metrics = calculateMetrics();
  const pendingRevenue = state.appointments
    .filter(apt => apt.payment === 'unpaid')
    .reduce((sum, apt) => sum + apt.price, 0);

  const handleProcessAllPayments = () => {
    const unpaidAppointments = state.appointments.filter(apt => apt.payment === 'unpaid');
    
    unpaidAppointments.forEach(apt => {
      processPayment(apt.id);
    });

    toast({
      title: "Pagamentos Processados",
      description: `${unpaidAppointments.length} pagamentos processados com sucesso!`,
    });
  };

  const handleSetCreditLimit = () => {
    if (creditLimit) {
      addNotification({
        title: 'Limite de Crédito Definido',
        message: `Limite de R$ ${creditLimit} definido para novos clientes`,
        type: 'success',
        read: false
      });
      
      toast({
        title: "Limite Definido",
        description: `Limite de crédito de R$ ${creditLimit} ativado`,
      });
      
      setCreditLimit('');
    }
  };

  const handleSetPaymentGoal = () => {
    if (paymentGoal) {
      addNotification({
        title: 'Meta de Faturamento',
        message: `Meta de R$ ${paymentGoal} definida para este mês`,
        type: 'info',
        read: false
      });
      
      toast({
        title: "Meta Definida",
        description: `Meta de faturamento de R$ ${paymentGoal} estabelecida`,
      });
      
      setPaymentGoal('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão Financeira</h2>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          <DollarSign className="h-4 w-4 mr-1" />
          R$ {metrics.totalRevenue.toLocaleString()}
        </Badge>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(metrics.totalRevenue)}</p>
                <p className="text-sm text-green-600">Faturamento Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-700">{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(pendingRevenue)}</p>
                <p className="text-sm text-orange-600">Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{metrics.completedAppointments}</p>
                <p className="text-sm text-blue-600">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-700">{metrics.pendingPayments}</p>
                <p className="text-sm text-purple-600">Pag. Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Ações Rápidas</span>
            </CardTitle>
            <CardDescription>
              Processe pagamentos e otimize seu fluxo de caixa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleProcessAllPayments}
              className="w-full"
              variant="gradient"
              disabled={pendingRevenue === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Processar Todos os Pagamentos ({new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(pendingRevenue)})
            </Button>
            
            <div className="grid gap-2">
              <Label>Limite de Crédito para Novos Clientes</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Ex: 5000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                />
                <Button onClick={handleSetCreditLimit} variant="outline">
                  <PiggyBank className="h-4 w-4 mr-1" />
                  Definir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              <span>Metas e Objetivos</span>
            </CardTitle>
            <CardDescription>
              Defina metas de faturamento e acompanhe o progresso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Meta de Faturamento Mensal</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Ex: 50000"
                  value={paymentGoal}
                  onChange={(e) => setPaymentGoal(e.target.value)}
                />
                <Button onClick={handleSetPaymentGoal} variant="outline">
                  <Target className="h-4 w-4 mr-1" />
                  Definir
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Projeção do Mês</span>
              </div>
              <p className="text-xs text-blue-600">
                Com base no ritmo atual, você pode faturar {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(metrics.totalRevenue * 1.5)} este mês
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos Pendentes */}
      {pendingRevenue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Pagamentos Pendentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.appointments
                .filter(apt => apt.payment === 'unpaid')
                .map(apt => (
                  <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">{apt.service}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600">{new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(apt.price)}</span>
                      <Button 
                        size="sm" 
                        onClick={() => processPayment(apt.id)}
                        variant="outline"
                      >
                        Processar
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};