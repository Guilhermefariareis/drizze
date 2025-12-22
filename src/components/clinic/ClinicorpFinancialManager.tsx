import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClinicorpFinancial, type CreateInvoiceData, type CreatePaymentData } from '@/hooks/useClinicorpFinancial';
import { useClinicorpApi } from '@/hooks/useClinicorpApi';
import { useClinicorpPatients } from '@/hooks/useClinicorpPatients';
import { DollarSign, Plus, FileText, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ClinicorpFinancialManagerProps {
  clinicId?: string;
}

export default function ClinicorpFinancialManager({ clinicId }: ClinicorpFinancialManagerProps) {
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  
  const [newInvoice, setNewInvoice] = useState<CreateInvoiceData>({
    patient_id: '',
    amount: 0,
    due_date: '',
    description: '',
    items: []
  });

  const [newPayment, setNewPayment] = useState<CreatePaymentData>({
    invoice_id: '',
    amount: 0,
    payment_method: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const {
    invoices,
    payments,
    loading,
    listInvoices,
    listPayments,
    createInvoice,
    createPayment,
    getFinancialSummary,
    getOverdueInvoices
  } = useClinicorpFinancial();

  const { patients, listPatients } = useClinicorpPatients();
  const { credentials, reloadCredentials } = useClinicorpApi();

  useEffect(() => {
    if (credentials) {
      loadFinancialData();
    } else {
      reloadCredentials();
    }
  }, [credentials, clinicId]);

  const loadFinancialData = async () => {
    await Promise.all([
      listInvoices(undefined, clinicId),
      listPayments(undefined, clinicId),
      listPatients(undefined, clinicId),
      loadSummary()
    ]);
  };

  const loadSummary = async () => {
    const summary = await getFinancialSummary(undefined, undefined, clinicId);
    setFinancialSummary(summary);
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.patient_id || !newInvoice.amount || !newInvoice.due_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const invoiceData = {
      ...newInvoice,
      items: newInvoice.items.length > 0 ? newInvoice.items : [{
        description: newInvoice.description,
        quantity: 1,
        unit_price: newInvoice.amount,
        total_price: newInvoice.amount
      }]
    };

    const result = await createInvoice(invoiceData, clinicId);
    if (result) {
      setIsInvoiceDialogOpen(false);
      setNewInvoice({
        patient_id: '',
        amount: 0,
        due_date: '',
        description: '',
        items: []
      });
      await loadFinancialData();
    }
  };

  const handleCreatePayment = async () => {
    if (!newPayment.invoice_id || !newPayment.amount || !newPayment.payment_method) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const result = await createPayment(newPayment, clinicId);
    if (result) {
      setIsPaymentDialogOpen(false);
      setNewPayment({
        invoice_id: '',
        amount: 0,
        payment_method: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
      await loadFinancialData();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getInvoiceStatus = (invoice: any) => {
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    
    if (invoice.status === 'paid') return { label: 'Pago', color: 'bg-green-100 text-green-800' };
    if (dueDate < today) return { label: 'Vencido', color: 'bg-red-100 text-red-800' };
    return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
  };

  const paymentMethods = [
    'Dinheiro',
    'Cartão de Crédito',
    'Cartão de Débito',
    'PIX',
    'Transferência Bancária',
    'Boleto'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Gestão Financeira</h3>
          <p className="text-muted-foreground">
            Controle de faturas, pagamentos e relatórios financeiros
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Nova Fatura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Fatura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient_id">Paciente *</Label>
                  <Select value={newInvoice.patient_id} onValueChange={(value) => 
                    setNewInvoice(prev => ({ ...prev, patient_id: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do serviço"
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="due_date">Data de Vencimento *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateInvoice} disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Fatura'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Pagamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invoice_id">Fatura *</Label>
                  <Select value={newPayment.invoice_id} onValueChange={(value) => 
                    setNewPayment(prev => ({ ...prev, invoice_id: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fatura" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.filter(inv => inv.status !== 'paid').map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {formatCurrency(invoice.amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="payment_amount">Valor *</Label>
                  <Input
                    id="payment_amount"
                    type="number"
                    step="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment_method">Método de Pagamento *</Label>
                  <Select value={newPayment.payment_method} onValueChange={(value) => 
                    setNewPayment(prev => ({ ...prev, payment_method: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="payment_date">Data do Pagamento</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={newPayment.payment_date}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, payment_date: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreatePayment} disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar Pagamento'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita do Mês</p>
                  <p className="text-xl font-bold">{formatCurrency(financialSummary.month_revenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                  <p className="text-xl font-bold">{formatCurrency(financialSummary.total_revenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <FileText className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendente</p>
                  <p className="text-xl font-bold">{formatCurrency(financialSummary.total_pending || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Em Atraso</p>
                  <p className="text-xl font-bold">{formatCurrency(financialSummary.total_overdue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Tables */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Faturas ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Faturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando faturas...</div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma fatura cadastrada
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => {
                        const status = getInvoiceStatus(invoice);
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoice_number}
                            </TableCell>
                            <TableCell>
                              Paciente #{invoice.patient_id.slice(0, 8)}
                            </TableCell>
                            <TableCell>{invoice.description}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell>
                              {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando pagamentos...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum pagamento registrado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Fatura</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Referência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            Fatura #{payment.invoice_id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              {payment.status === 'confirmed' ? 'Confirmado' : payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.reference || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}