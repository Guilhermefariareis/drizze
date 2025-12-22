import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'patient' | 'clinic';
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  clinicId?: string;
  patientName: string;
  clinicName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  payment: 'paid' | 'unpaid' | 'processing';
  price: number;
  phone?: string;
  address?: string;
}

export interface AppState {
  user: User | null;
  appointments: Appointment[];
  isLoading: boolean;
  notifications: Notification[];
  revenue: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Actions
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: { id: string; updates: Partial<Appointment> } }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_REVENUE'; payload: number };

// Initial state
const initialState: AppState = {
  user: null,
  appointments: [
    {
      id: '1',
      patientName: 'João Pedro Silva',
      clinicName: 'Clínica Sorrir Sempre',
      service: 'Limpeza Dental',
      date: '2024-01-20',
      time: '14:00',
      status: 'confirmed',
      payment: 'paid',
      price: 150,
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - São Paulo'
    },
    {
      id: '2',
      patientName: 'Maria Santos',
      clinicName: 'OdontoExcelência',
      service: 'Clareamento Dental',
      date: '2024-01-25',
      time: '10:30',
      status: 'pending',
      payment: 'unpaid',
      price: 350,
      phone: '(11) 88888-8888',
      address: 'Av. Paulista, 456 - São Paulo'
    },
    {
      id: '3',
      patientName: 'Carlos Oliveira',
      clinicName: 'DentalCare Pro',
      service: 'Consulta de Avaliação',
      date: '2024-01-18',
      time: '16:00',
      status: 'completed',
      payment: 'paid',
      price: 80,
      phone: '(11) 77777-7777',
      address: 'Rua Augusta, 789 - São Paulo'
    }
  ],
  isLoading: false,
  notifications: [],
  revenue: 0
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'ADD_APPOINTMENT':
      return { 
        ...state, 
        appointments: [...state.appointments, action.payload] 
      };
    
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id 
            ? { ...apt, ...action.payload.updates }
            : apt
        )
      };
    
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(apt => apt.id !== action.payload)
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload 
            ? { ...notif, read: true }
            : notif
        )
      };
    
    case 'UPDATE_REVENUE':
      return { ...state, revenue: action.payload };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Business Logic Hooks
export const useBusinessLogic = () => {
  const { state, dispatch } = useApp();

  const confirmAppointment = (appointmentId: string) => {
    dispatch({
      type: 'UPDATE_APPOINTMENT',
      payload: { 
        id: appointmentId, 
        updates: { status: 'confirmed' } 
      }
    });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Consulta Confirmada',
        message: 'Consulta confirmada com sucesso!',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      }
    });
  };

  const processPayment = (appointmentId: string) => {
    const appointment = state.appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      dispatch({
        type: 'UPDATE_APPOINTMENT',
        payload: { 
          id: appointmentId, 
          updates: { payment: 'paid' } 
        }
      });
      
      // Update revenue
      const newRevenue = state.revenue + appointment.price;
      dispatch({ type: 'UPDATE_REVENUE', payload: newRevenue });
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          title: 'Pagamento Processado',
          message: `Pagamento de R$ ${appointment.price} processado com sucesso!`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString()
        }
      });
    }
  };

  const calculateMetrics = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = state.appointments.filter(apt => apt.date === today).length;
    const completedAppointments = state.appointments.filter(apt => apt.status === 'completed').length;
    const totalRevenue = state.appointments
      .filter(apt => apt.payment === 'paid')
      .reduce((sum, apt) => sum + apt.price, 0);

    return {
      todayAppointments,
      completedAppointments,
      totalRevenue,
      pendingPayments: state.appointments.filter(apt => apt.payment === 'unpaid').length
    };
  };

  return {
    confirmAppointment,
    processPayment,
    calculateMetrics,
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          ...notification,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
      });
    }
  };
};