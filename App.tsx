import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import FirstTimers from './pages/FirstTimers.tsx';
import Attendance from './pages/Attendance.tsx';
import SuperAdmin from './pages/SuperAdmin.tsx';
import ActionPlans from './pages/ActionPlans.tsx';
import Units from './pages/Units.tsx';
import Properties from './pages/Properties.tsx';
import Announcements from './pages/Announcements.tsx';
import Events from './pages/Events.tsx';
import Accounting from './pages/Accounting.tsx';
import Workers from './pages/Workers.tsx';
import { GmailOutreach } from './pages/GmailOutreach.tsx';
import Login from './pages/Login.tsx';
import Home from './pages/Home.tsx';
import Pricing from './pages/Pricing.tsx';
import { UserRole } from './types.ts';

const PendingApprovalScreen: React.FC = () => {
  const { logout, currentUser } = useApp();
  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-16 text-center animate-in zoom-in-95">
        <h2 className="text-3xl font-black mb-4">Awaiting Approval</h2>
        <p className="text-slate-500 mb-8">Hello {currentUser?.fullName}, an admin must approve your account.</p>
        <button onClick={logout} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em]">Logout</button>
      </div>
    </div>
  );
};

const SuspendedScreen: React.FC = () => {
  const { logout, currentChurch } = useApp();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-16 text-center">
        <h2 className="text-3xl font-black mb-4">Portal Restricted</h2>
        <p className="text-slate-500 mb-8">{currentChurch?.name} is currently suspended.</p>
        <button onClick={logout} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em]">Return to Login</button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, currentChurch } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewState, setViewState] = useState<'LANDING' | 'AUTH' | 'PRICING'>('LANDING');
  const [initialSignupMode, setInitialSignupMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("Ecclesia AppContent: Mounting component tree...");
    if (window.location.hash.startsWith('#join-worker')) {
      setViewState('AUTH');
    }
    setIsInitialized(true);
    console.log("Ecclesia AppContent: Initialized successfully.");
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    if (viewState === 'LANDING') {
      return (
        <Home 
          onGetStarted={() => { setInitialSignupMode(true); setViewState('AUTH'); }} 
          onLogin={() => { setInitialSignupMode(false); setViewState('AUTH'); }} 
          onViewPricing={() => setViewState('PRICING')} 
        />
      );
    }
    if (viewState === 'PRICING') {
      return (
        <Pricing 
          onBack={() => setViewState('LANDING')} 
          onGetStarted={() => { setInitialSignupMode(true); setViewState('AUTH'); }} 
        />
      );
    }
    return (
      <Login 
        initialIsSignup={initialSignupMode} 
        onBackToHome={() => setViewState('LANDING')} 
      />
    );
  }

  if (currentUser.status === 'PENDING') return <PendingApprovalScreen />;
  if (currentChurch?.status === 'SUSPENDED' && currentUser.role !== UserRole.PLATFORM_OWNER) return <SuspendedScreen />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'first-timers': return <FirstTimers />;
      case 'attendance': return <Attendance />;
      case 'superadmin': return <SuperAdmin />;
      case 'tasks': return <ActionPlans />;
      case 'units': return <Units />;
      case 'inventory': return <Properties />;
      case 'announcements': return <Announcements />;
      case 'events': return <Events />;
      case 'gmail': return <GmailOutreach />;
      case 'accounting': return <Accounting />;
      case 'workers': return <Workers />;
      default: return <Dashboard />;
    }
  };

  return <Layout activeTab={activeTab} setActiveTab={setActiveTab}>{renderContent()}</Layout>;
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;