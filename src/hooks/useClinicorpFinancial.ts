import { useState, useCallback } from 'react';
import { useClinicorpApi } from './useClinicorpApi';
import { useToast } from './use-toast';

export interface ClinicorpInvoice {
  id: string;
  patient_id: string;
  appointment_id?: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: string;
  description: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateInvoiceData {
  patient_id: string;
  appointment_id?: string;
  amount: number;
  due_date: string;
  description: string;
  items: Omit<InvoiceItem, 'id'>[];
}

export interface ClinicorpPayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  reference?: string;
  created_at: string;
}

export interface CreatePaymentData {
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date?: string;
  reference?: string;
}

export interface FinancialSummary {
  total_revenue: number;
  total_pending: number;
  total_overdue: number;
  today_revenue: number;
  month_revenue: number;
  year_revenue: number;
}

export interface AccountsReceivable {
  patient_name: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  days_overdue: number;
  status: string;
}

export interface CashFlow {
  date: string;
  revenue: number;
  expenses: number;
  net_flow: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  active: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  payment_method: string;
  created_at: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  payment_method: string;
}

export function useClinicorpFinancial() {
  const { request, loading } = useClinicorpApi();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<ClinicorpInvoice[]>([]);
  const [payments, setPayments] = useState<ClinicorpPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Invoice operations
  const listInvoices = useCallback(async (query?: Record<string, any>, clinic_id?: string) => {
    try {
      const data = await request('/financial/list_invoices', 'GET', { query, clinic_id });
      if (Array.isArray(data)) {
        setInvoices(data);
      }
      return data;
    } catch (error) {
      console.error('Error listing invoices:', error);
      return [];
    }
  }, [request]);

  const getInvoice = useCallback(async (invoiceId: string, clinic_id?: string) => {
    try {
      return await request(`/financial/invoices/${invoiceId}`, 'GET', { clinic_id });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }, [request]);

  const createInvoice = useCallback(async (invoiceData: CreateInvoiceData, clinic_id?: string) => {
    try {
      const data = await request('/financial/create_invoice', 'POST', { 
        body: invoiceData, 
        clinic_id 
      });
      
      if (data) {
        toast({
          title: 'Sucesso',
          description: 'Fatura criada com sucesso',
        });
        await listInvoices(undefined, clinic_id);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      // toast({
      //   title: 'Erro',
      //   description: 'Falha ao criar fatura',
      //   variant: 'destructive'
      // });
      return null;
    }
  }, [request, toast, listInvoices]);

  // Payment operations
  const listPayments = useCallback(async (query?: Record<string, any>, clinic_id?: string) => {
    try {
      const data = await request('/financial/list_payments', 'GET', { query, clinic_id });
      if (Array.isArray(data)) {
        setPayments(data);
      }
      return data;
    } catch (error) {
      console.error('Error listing payments:', error);
      return [];
    }
  }, [request]);

  const createPayment = useCallback(async (paymentData: CreatePaymentData, clinic_id?: string) => {
    try {
      const data = await request('/financial/create_payment', 'POST', { 
        body: paymentData, 
        clinic_id 
      });
      
      if (data) {
        toast({
          title: 'Sucesso',
          description: 'Pagamento registrado com sucesso',
        });
        await listPayments(undefined, clinic_id);
        await listInvoices(undefined, clinic_id); // Refresh invoices as status might change
      }
      
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      // toast({
      //   title: 'Erro',
      //   description: 'Falha ao registrar pagamento',
      //   variant: 'destructive'
      // });
      return null;
    }
  }, [request, toast, listPayments, listInvoices]);

  // Financial summary (use available Clinicorp endpoints)
  const getFinancialSummary = useCallback(async (
    startDate?: string,
    endDate?: string,
    clinic_id?: string,
    suppressToast = true
  ) => {
    try {
      console.log('[useClinicorpFinancial] Getting financial summary...');
      const query: Record<string, any> = {};
      if (startDate) query.start_date = startDate;
      if (endDate) query.end_date = endDate;
      
      // Try different financial endpoints that might exist
      try {
        // Try appointment info which might contain financial data
        const appointmentInfo = await request('/appointment/list_info', 'GET', { 
          query, 
          clinic_id, 
          suppressToast 
        });
        console.log('[useClinicorpFinancial] Appointment info result:', appointmentInfo);
        return appointmentInfo;
      } catch (error) {
        console.log('[useClinicorpFinancial] No financial endpoints available, returning null');
        return null;
      }
    } catch (error) {
      console.error('[useClinicorpFinancial] Error fetching financial summary:', error);
      return null;
    }
  }, [request]);

  // Accounts receivable
  const getAccountsReceivable = useCallback(async (clinic_id?: string) => {
    try {
      return await request('/financial/accounts-receivable', 'GET', { clinic_id });
    } catch (error) {
      console.error('Error fetching accounts receivable:', error);
      return [];
    }
  }, [request]);

  // Cash flow
  const getCashFlow = useCallback(async (
    startDate: string,
    endDate: string,
    clinic_id?: string
  ) => {
    try {
      return await request('/financial/cash-flow', 'GET', { 
        query: { start_date: startDate, end_date: endDate }, 
        clinic_id 
      });
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      return [];
    }
  }, [request]);

  // Payment methods
  const getPaymentMethods = useCallback(async (clinic_id?: string) => {
    try {
      return await request('/financial/payment-methods', 'GET', { clinic_id });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }, [request]);

  // Daily closing
  const getDailyClosing = useCallback(async (date: string, clinic_id?: string) => {
    try {
      return await request('/financial/daily-closing', 'GET', { 
        query: { date }, 
        clinic_id 
      });
    } catch (error) {
      console.error('Error fetching daily closing:', error);
      return null;
    }
  }, [request]);

  // Expense operations
  const listExpenses = useCallback(async (query?: Record<string, any>, clinic_id?: string) => {
    try {
      const data = await request('/financial/expenses', 'GET', { query, clinic_id });
      if (Array.isArray(data)) {
        setExpenses(data);
      }
      return data;
    } catch (error) {
      console.error('Error listing expenses:', error);
      return [];
    }
  }, [request]);

  const createExpense = useCallback(async (expenseData: CreateExpenseData, clinic_id?: string) => {
    try {
      const data = await request('/financial/expenses', 'POST', { 
        body: expenseData, 
        clinic_id 
      });
      
      if (data) {
        toast({
          title: 'Sucesso',
          description: 'Despesa registrada com sucesso',
        });
        await listExpenses(undefined, clinic_id);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating expense:', error);
      // toast({
      //   title: 'Erro',
      //   description: 'Falha ao registrar despesa',
      //   variant: 'destructive'
      // });
      return null;
    }
  }, [request, toast, listExpenses]);

  // Monthly revenue report
  const getMonthlyRevenue = useCallback(async (year: number, clinic_id?: string) => {
    try {
      return await request('/financial/monthly-revenue', 'GET', { 
        query: { year }, 
        clinic_id 
      });
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      return [];
    }
  }, [request]);

  // Overdue invoices (simplified since financial endpoints may not exist)
  const getOverdueInvoices = useCallback(async (clinic_id?: string, suppressToast = true) => {
    try {
      console.log('[useClinicorpFinancial] Getting overdue invoices...');
      // Since financial endpoints may not exist in Clinicorp API, return empty array
      console.log('[useClinicorpFinancial] Financial endpoints not available, returning empty array');
      return [];
    } catch (error) {
      console.error('[useClinicorpFinancial] Error fetching overdue invoices:', error);
      return [];
    }
  }, [request]);

  return {
    invoices,
    payments,
    expenses,
    loading,
    // Invoice operations
    listInvoices,
    getInvoice,
    createInvoice,
    // Payment operations
    listPayments,
    createPayment,
    // Expense operations
    listExpenses,
    createExpense,
    // Reports and analytics
    getFinancialSummary,
    getAccountsReceivable,
    getCashFlow,
    getPaymentMethods,
    getDailyClosing,
    getMonthlyRevenue,
    getOverdueInvoices,
  };
}