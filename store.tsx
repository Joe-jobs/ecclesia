
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, Church, Unit, FirstTimer, AttendanceRecord, ActionPlan, 
  Announcement, Property, ChurchEvent, UserRole, Transaction, Budget, Currency 
} from './types';
import * as Mocks from './mockData';

export const EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.USD]: 1,
  [Currency.NGN]: 1500,
  [Currency.GBP]: 0.78
};

interface AppState {
  currentUser: User | null;
  currentChurch: Church | null;
  churches: Church[];
  users: User[];
  units: Unit[];
  firstTimers: FirstTimer[];
  attendance: AttendanceRecord[];
  tasks: ActionPlan[];
  announcements: Announcement[];
  properties: Property[];
  events: ChurchEvent[];
  transactions: Transaction[];
  budgets: Budget[];
}

interface AppContextProps extends AppState {
  login: (email: string) => void;
  logout: () => void;
  registerUser: (user: Omit<User, 'id'>) => User;
  addChurch: (church: Omit<Church, 'id' | 'createdAt' | 'location'>) => Church;
  setCurrentChurchId: (id: string) => void;
  updateUser: (user: Partial<User>) => void;
  approveUser: (userId: string) => void;
  addFirstTimer: (ft: Omit<FirstTimer, 'id'>) => void;
  updateFirstTimer: (id: string, updates: Partial<FirstTimer>) => void;
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  addTask: (task: Omit<ActionPlan, 'id'>) => void;
  updateTask: (id: string, status: any) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (id: string, updates: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
  addProperty: (prop: Omit<Property, 'id'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  addEvent: (event: Omit<ChurchEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<ChurchEvent>) => void;
  deleteEvent: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  toggleAccountingAccess: (userId: string) => void;
  setChurchCurrency: (churchId: string, currency: Currency) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('ecclesia_state');
    if (saved) return JSON.parse(saved);
    return {
      currentUser: null,
      currentChurch: null,
      churches: Mocks.MOCK_CHURCHES.map(c => ({ 
        ...c, 
        currency: Currency.USD,
        city: c.location.split(', ')[0] || '',
        state: c.location.split(', ')[1] || '',
        country: 'Nigeria', // Mock default
        phone: '+234 000 000 0000' // Mock default
      })),
      users: Mocks.MOCK_USERS as any,
      units: Mocks.MOCK_UNITS,
      firstTimers: Mocks.MOCK_FIRST_TIMERS as any,
      attendance: Mocks.MOCK_ATTENDANCE,
      tasks: Mocks.MOCK_TASKS as any,
      announcements: Mocks.MOCK_ANNOUNCEMENTS as any,
      properties: Mocks.MOCK_PROPERTIES as any,
      events: Mocks.MOCK_EVENTS as any,
      transactions: [],
      budgets: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('ecclesia_state', JSON.stringify(state));
  }, [state]);

  const login = (email: string) => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const church = state.churches.find(c => c.id === user.churchId) || null;
      setState(prev => ({ ...prev, currentUser: user, currentChurch: church }));
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null, currentChurch: null }));
  };

  const addChurch = (churchData: Omit<Church, 'id' | 'createdAt' | 'location'>) => {
    const newChurch: Church = {
      ...churchData,
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
      location: `${churchData.city}, ${churchData.state}`,
      currency: Currency.USD
    };
    setState(prev => ({
      ...prev,
      churches: [...prev.churches, newChurch]
    }));
    return newChurch;
  };

  const registerUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'u-' + Math.random().toString(36).substr(2, 9),
    };
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    return newUser;
  };

  const setCurrentChurchId = (id: string) => {
     const church = state.churches.find(c => c.id === id) || null;
     setState(prev => ({ ...prev, currentChurch: church }));
  }

  const approveUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, status: 'APPROVED' } : u)
    }));
  };

  const addFirstTimer = (ft: Omit<FirstTimer, 'id'>) => {
    const newFT = { ...ft, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, firstTimers: [newFT as any, ...prev.firstTimers] }));
  };

  const updateFirstTimer = (id: string, updates: Partial<FirstTimer>) => {
    setState(prev => ({
      ...prev,
      firstTimers: prev.firstTimers.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const addAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, attendance: [newRecord as any, ...prev.attendance] }));
  };

  const addTask = (task: Omit<ActionPlan, 'id'>) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, tasks: [newTask as any, ...prev.tasks] }));
  };

  const updateTask = (id: string, status: any) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, status } : t)
    }));
  }

  const addUnit = (unit: Omit<Unit, 'id'>) => {
    const newUnit = { ...unit, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, units: [...prev.units, newUnit] }));
  };

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    setState(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  };

  const deleteUnit = (id: string) => {
    setState(prev => ({
      ...prev,
      units: prev.units.filter(u => u.id !== id)
    }));
  };

  const addProperty = (prop: Omit<Property, 'id'>) => {
    const newProp = { ...prop, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, properties: [...prev.properties, newProp as any] }));
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProperty = (id: string) => {
    setState(prev => ({
      ...prev,
      properties: prev.properties.filter(p => p.id !== id)
    }));
  };

  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn = { 
      ...ann, 
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setState(prev => ({ ...prev, announcements: [newAnn as any, ...prev.announcements] }));
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    setState(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const deleteAnnouncement = (id: string) => {
    setState(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id)
    }));
  };

  const addEvent = (event: Omit<ChurchEvent, 'id'>) => {
    const newEvent = { 
      ...event, 
      id: Math.random().toString(36).substr(2, 9) 
    };
    setState(prev => ({ ...prev, events: [newEvent as any, ...prev.events] }));
  };

  const updateEvent = (id: string, updates: Partial<ChurchEvent>) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteEvent = (id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ 
      ...prev, 
      transactions: [newTx as any, ...prev.transactions],
      budgets: tx.type === 'EXPENSE' 
        ? prev.budgets.map(b => b.category === tx.category ? { ...b, spentAmount: b.spentAmount + tx.amount } : b)
        : prev.budgets
    }));
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    const newB = { ...b, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, budgets: [...prev.budgets, newB as any] }));
  };

  const toggleAccountingAccess = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, hasAccountingAccess: !u.hasAccountingAccess } : u)
    }));
  };

  const setChurchCurrency = (churchId: string, targetCurrency: Currency) => {
    setState(prev => {
      const church = prev.churches.find(c => c.id === churchId);
      if (!church) return prev;
      
      const sourceCurrency = church.currency || Currency.USD;
      if (sourceCurrency === targetCurrency) return prev;

      const conversionFactor = EXCHANGE_RATES[targetCurrency] / EXCHANGE_RATES[sourceCurrency];

      const updatedChurches = prev.churches.map(c => c.id === churchId ? { ...c, currency: targetCurrency } : c);
      const updatedCurrentChurch = prev.currentChurch?.id === churchId ? { ...prev.currentChurch, currency: targetCurrency } : prev.currentChurch;
      
      const updatedTransactions = prev.transactions.map(tx => 
        tx.churchId === churchId ? { ...tx, amount: Number((tx.amount * conversionFactor).toFixed(2)) } : tx
      );
      
      const updatedBudgets = prev.budgets.map(b => 
        b.churchId === churchId ? { 
          ...b, 
          allocatedAmount: Number((b.allocatedAmount * conversionFactor).toFixed(2)),
          spentAmount: Number((b.spentAmount * conversionFactor).toFixed(2))
        } : b
      );

      return {
        ...prev,
        churches: updatedChurches,
        currentChurch: updatedCurrentChurch,
        transactions: updatedTransactions,
        budgets: updatedBudgets
      };
    });
  };

  const updateUser = (user: Partial<User>) => {};

  return (
    <AppContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      registerUser,
      addChurch,
      setCurrentChurchId, 
      updateUser, 
      approveUser, 
      addFirstTimer, 
      updateFirstTimer, 
      addAttendance,
      addTask,
      updateTask,
      addUnit,
      updateUnit,
      deleteUnit,
      addProperty,
      updateProperty,
      deleteProperty,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      addEvent,
      updateEvent,
      deleteEvent,
      addTransaction,
      addBudget,
      toggleAccountingAccess,
      setChurchCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
