
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

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
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
