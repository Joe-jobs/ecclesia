import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, Church, Unit, FirstTimer, AttendanceRecord, ActionPlan, 
  Announcement, Property, ChurchEvent, UserRole, Transaction, Budget, Currency 
} from './types.ts';
import * as Mocks from './mockData.ts';
import { db } from './firebase.ts';
import { collection, onSnapshot, setDoc, doc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

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
  login: (email: string, password?: string) => void;
  logout: () => void;
  registerUser: (user: Omit<User, 'id'>, customId?: string) => Promise<User>;
  addChurch: (church: Omit<Church, 'id' | 'createdAt' | 'location' | 'status'>) => Promise<Church>;
  deleteChurch: (churchId: string) => Promise<void>;
  deleteAllChurches: () => Promise<void>;
  setCurrentChurchId: (id: string) => void;
  updateUser: (user: Partial<User>) => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addFirstTimer: (ft: Omit<FirstTimer, 'id'>) => Promise<void>;
  updateFirstTimer: (id: string, updates: Partial<FirstTimer>) => Promise<void>;
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  addTask: (task: Omit<ActionPlan, 'id'>) => Promise<void>;
  updateTask: (id: string, status: any) => Promise<void>;
  addUnit: (unit: Omit<Unit, 'id'>) => Promise<void>;
  updateUnit: (id: string, updates: Partial<Unit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  addProperty: (prop: Omit<Property, 'id'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addEvent: (event: Omit<ChurchEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<ChurchEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  toggleAccountingAccess: (userId: string) => Promise<void>;
  setChurchCurrency: (churchId: string, currency: Currency) => Promise<void>;
  toggleChurchStatus: (churchId: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentChurch: null,
    churches: [],
    users: Mocks.MOCK_USERS as User[],
    units: Mocks.MOCK_UNITS as Unit[],
    firstTimers: Mocks.MOCK_FIRST_TIMERS as FirstTimer[],
    attendance: Mocks.MOCK_ATTENDANCE as AttendanceRecord[],
    tasks: Mocks.MOCK_TASKS as ActionPlan[],
    announcements: Mocks.MOCK_ANNOUNCEMENTS as Announcement[],
    properties: Mocks.MOCK_PROPERTIES as Property[],
    events: Mocks.MOCK_EVENTS as ChurchEvent[],
    transactions: [],
    budgets: [],
  });

  // Sync Churches and Users with Firestore
  useEffect(() => {
    let unsubscribeChurches: (() => void) | null = null;
    let unsubscribeUsers: (() => void) | null = null;

    try {
      const churchesCol = collection(db, 'churches');
      unsubscribeChurches = onSnapshot(churchesCol, (snapshot) => {
        const fsChurches: Church[] = snapshot.docs.map(doc => doc.data() as Church);
        setState(prev => ({ ...prev, churches: fsChurches }));
      }, (err) => console.warn('Firestore churches snapshot warning:', err));

      const usersCol = collection(db, 'users');
      unsubscribeUsers = onSnapshot(usersCol, (snapshot) => {
        if (!snapshot.empty) {
          const fsUsers: User[] = snapshot.docs.map(doc => doc.data() as User);
          setState(prev => {
            const existingIds = new Set(fsUsers.map(u => u.id));
            const merged = [...fsUsers, ...prev.users.filter(u => !existingIds.has(u.id))];
            return { ...prev, users: merged };
          });
        }
      }, (err) => console.warn('Firestore users snapshot warning:', err));

    } catch (err) {
      console.warn('Firestore sync failed, falling back to local state:', err);
    }

    return () => {
      if (unsubscribeChurches) unsubscribeChurches();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Load user on mount if they have an active session
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('demo_email');
    if (savedEmail && !state.currentUser) {
      try {
        login(savedEmail);
      } catch (e) {
        localStorage.removeItem('demo_email');
      }
    }
  }, [state.users]);

  const login = (email: string, password?: string) => {
    // Demo login: allow any email from the mock user list
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const church = state.churches.find(c => c.id === user.churchId) || null;
      const updatedUser = { ...user, lastLogin: new Date().toLocaleString() };
      
      localStorage.setItem('demo_email', email);
      
      setState(prev => ({ 
        ...prev, 
        currentUser: updatedUser, 
        currentChurch: church,
        users: prev.users.map(u => u.id === user.id ? updatedUser : u)
      }));
    } else {
      throw new Error("Demo Account Not Found");
    }
  };

  const logout = () => {
    localStorage.removeItem('demo_email');
    setState(prev => ({ ...prev, currentUser: null, currentChurch: null }));
  };

  const setCurrentUser = (user: User | null) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const addChurch = async (churchData: Omit<Church, 'id' | 'createdAt' | 'location' | 'status'>) => {
    const churchId = 'c-' + Math.random().toString(36).substring(2, 11);
    const newChurch: Church = {
      ...churchData,
      id: churchId,
      createdAt: new Date().toISOString().split('T')[0],
      location: `${churchData.city}, ${churchData.state}`,
      currency: Currency.USD,
      status: 'ACTIVE'
    };
    try {
      await setDoc(doc(db, 'churches', churchId), newChurch);
    } catch (err) {
      console.error('Error saving church to Firestore:', err);
    }
    setState(prev => ({ ...prev, churches: [...prev.churches, newChurch] }));
    return newChurch;
  };

  const deleteChurch = async (churchId: string) => {
    try {
      await deleteDoc(doc(db, 'churches', churchId));
    } catch (err) {
      console.error('Error deleting church from Firestore:', err);
    }
    setState(prev => ({
      ...prev,
      churches: prev.churches.filter(c => c.id !== churchId),
      currentChurch: prev.currentChurch?.id === churchId ? null : prev.currentChurch
    }));
  };

  const deleteAllChurches = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'churches'));
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (err) {
      console.error('Error deleting all churches from Firestore:', err);
    }
    setState(prev => ({ ...prev, churches: [], currentChurch: null }));
  };

  // Immediate execution of purge on load as explicitly requested by user
  useEffect(() => {
    deleteAllChurches();
  }, []);

  const toggleChurchStatus = async (churchId: string) => {
    const updatedStatus = state.churches.find(c => c.id === churchId)?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await setDoc(doc(db, 'churches', churchId), { status: updatedStatus }, { merge: true });
    } catch (err) {
      console.error('Error updating church status in Firestore:', err);
    }
    setState(prev => ({
      ...prev,
      churches: prev.churches.map(c => c.id === churchId ? { ...c, status: updatedStatus } : c)
    }));
  };

  const registerUser = async (userData: Omit<User, 'id'>, customId?: string) => {
    const id = customId || 'u-' + Math.random().toString(36).substring(2, 11);
    const newUser: User = { ...userData, id };
    try {
      await setDoc(doc(db, 'users', id), newUser);
    } catch (err) {
      console.error('Error saving user to Firestore:', err);
    }
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return newUser;
  };

  const setCurrentChurchId = (id: string) => {
     const church = state.churches.find(c => c.id === id) || null;
     setState(prev => ({ ...prev, currentChurch: church }));
  };

  const approveUser = async (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, status: 'APPROVED' as const } : u)
    }));
  };

  const deleteUser = async (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
  };

  const addFirstTimer = async (ft: Omit<FirstTimer, 'id'>) => {
    const id = 'ft-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ ...prev, firstTimers: [...prev.firstTimers, { ...ft, id }] }));
  };

  const updateFirstTimer = async (id: string, updates: Partial<FirstTimer>) => {
    setState(prev => ({
      ...prev,
      firstTimers: prev.firstTimers.map(ft => ft.id === id ? { ...ft, ...updates } : ft)
    }));
  };

  const addAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
    const id = 'att-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ ...prev, attendance: [...prev.attendance, { ...record, id }] }));
  };

  const addTask = async (task: Omit<ActionPlan, 'id'>) => {
    const id = 't-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ ...prev, tasks: [...prev.tasks, { ...task, id }] }));
  };

  const updateTask = async (id: string, status: any) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, status } : t)
    }));
  };

  const addUnit = async (unit: Omit<Unit, 'id'>) => {
    const id = 'un-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ ...prev, units: [...prev.units, { ...unit, id }] }));
  };

  const updateUnit = async (id: string, updates: Partial<Unit>) => {
    setState(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  };

  const deleteUnit = async (id: string) => {
    setState(prev => ({
      ...prev,
      units: prev.units.filter(u => u.id !== id)
    }));
  };

  const addProperty = async (prop: Omit<Property, 'id'>) => {
    const id = 'p-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ ...prev, properties: [...prev.properties, { ...prop, id }] }));
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    setState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProperty = async (id: string) => {
    setState(prev => ({
      ...prev,
      properties: prev.properties.filter(p => p.id !== id)
    }));
  };

  const addAnnouncement = async (ann: Omit<Announcement, 'id' | 'createdAt'>) => {
    const id = 'ann-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ 
      ...prev, 
      announcements: [...prev.announcements, { ...ann, id, createdAt: new Date().toISOString().split('T')[0] }] 
    }));
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    setState(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const deleteAnnouncement = async (id: string) => {
    setState(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id)
    }));
  };

  const addEvent = async (event: Omit<ChurchEvent, 'id'>) => {
    const id = 'e-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ ...prev, events: [...prev.events, { ...event, id }] }));
  };

  const updateEvent = async (id: string, updates: Partial<ChurchEvent>) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteEvent = async (id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const id = 'tx-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ ...prev, transactions: [...prev.transactions, { ...tx, id }] }));
  };

  const addBudget = async (b: Omit<Budget, 'id'>) => {
    const id = 'b-' + Math.random().toString(36).substring(2, 11);
    setState(prev => ({ ...prev, budgets: [...prev.budgets, { ...b, id }] }));
  };

  const toggleAccountingAccess = async (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, hasAccountingAccess: !u.hasAccountingAccess } : u)
    }));
  };

  const setChurchCurrency = async (churchId: string, currency: Currency) => {
    setState(prev => ({
      ...prev,
      churches: prev.churches.map(c => c.id === churchId ? { ...c, currency } : c),
      currentChurch: prev.currentChurch?.id === churchId ? { ...prev.currentChurch, currency } : prev.currentChurch
    }));
  };

  const updateUser = async (user: Partial<User>) => {
    if (state.currentUser) {
      const updatedUser = { ...state.currentUser, ...user };
      setState(prev => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map(u => u.id === state.currentUser?.id ? updatedUser : u)
      }));
    }
  };

  return (
    <AppContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      registerUser,
      addChurch,
      deleteChurch,
      deleteAllChurches,
      setCurrentChurchId, 
      updateUser, 
      approveUser, 
      deleteUser,
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
      setChurchCurrency,
      toggleChurchStatus,
      setCurrentUser
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