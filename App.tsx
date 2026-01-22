
import React, { useState } from 'react';
import { AppProvider, useApp } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FirstTimers from './pages/FirstTimers';
import Attendance from './pages/Attendance';
import SuperAdmin from './pages/SuperAdmin';
import ActionPlans from './pages/ActionPlans';
import Units from './pages/Units';
import Properties from './pages/Properties';
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import Accounting from './pages/Accounting';
import Workers from './pages/Workers';
import Login from './pages/Login';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import { UserRole } from './types';

/**
 * Screen displayed when a worker is logged in but awaiting admin approval.
 * Prevents access to any dashboard features.
 */
const PendingApprovalScreen: React.FC = () => {
  const { logout, currentUser, currentChurch } = useApp();
  
  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 lg:p-16 text-center animate-in zoom-in-95 duration-500 border border-slate-100">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-amber-100 shadow-inner text-4xl">
          ⏳
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-none">
          Approval Required
        </h2>
        
        <div className="space-y-4 mb-10">
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            Hello, <span className="font-bold text-slate-900">{currentUser?.fullName}</span>. Your registration for <span className="font-bold text-indigo-600">{currentChurch?.name || 'the organization'}</span> is currently being reviewed.
          </p>
          <div className="p-5 bg-slate-50 rounded-2xl text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            An administrator must approve your access before you can view the dashboard and assigned units.
          </div>
          <p className="text-slate-400 text-[10px] font-medium italic">
            Check back later or contact your department head.
          </p>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-95"
        >
          Return to Sign In
        </button>
      </div>
    </div>
  );
};

const SuspendedScreen: React.FC = () => {
  const { logout, currentChurch } = useApp();
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 lg:p-16 text-center animate-in zoom-in-95 duration-500 border border-slate-100">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-rose-100 shadow-inner text-4xl">
          🔒
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-none">
          Portal Restricted
        </h2>
        
        <div className="space-y-4 mb-10">
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            The portal for <span className="font-bold text-slate-900">{currentChurch?.name || 'your organization'}</span> has been suspended.
          </p>
          <div className="p-5 bg-slate-50 rounded-2xl text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            Administrative intervention is required to restore dashboard functionality.
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-95"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, currentChurch } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewState, setViewState] = useState<'LANDING' | 'AUTH' | 'PRICING'>('LANDING');
  const [initialSignupMode, setInitialSignupMode] = useState(false);

  // If we are on the worker join link, we bypass landing and go straight to AUTH
  React.useEffect(() => {
    if (window.location.hash.startsWith('#join-worker') || window.location.hash === '#platform-vault') {
      setViewState('AUTH');
    }
  }, []);

  if (!currentUser) {
    if (viewState === 'LANDING') {
      return (
        <Home 
          onGetStarted={() => {
            setInitialSignupMode(true);
            setViewState('AUTH');
          }}
          onLogin={() => {
            setInitialSignupMode(false);
            setViewState('AUTH');
          }}
          onViewPricing={() => {
            setViewState('PRICING');
          }}
        />
      );
    }
    if (viewState === 'PRICING') {
      return (
        <Pricing 
          onBack={() => setViewState('LANDING')} 
          onGetStarted={() => {
            setInitialSignupMode(true);
            setViewState('AUTH');
          }}
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

  // Permission and Status Checks
  // A user with 'PENDING' status (like a new worker) is blocked from the dashboard.
  const isPending = currentUser.status === 'PENDING';
  const isSuspended = currentChurch?.status === 'SUSPENDED' && currentUser.role !== UserRole.PLATFORM_OWNER;

  if (isPending) {
    return <PendingApprovalScreen />;
  }

  if (isSuspended) {
    return <SuspendedScreen />;
  }

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
      case 'accounting': return <Accounting />;
      case 'workers': return <Workers />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
