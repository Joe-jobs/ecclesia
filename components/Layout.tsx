
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, currentChurch } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-close sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentUser) return <>{children}</>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', roles: [UserRole.CHURCH_ADMIN, UserRole.UNIT_HEAD, UserRole.WORKER] },
    { id: 'superadmin', label: 'Platform Mgmt', icon: '🌐', roles: [UserRole.PLATFORM_OWNER] },
    { id: 'workers', label: 'Staff Registry', icon: '👥', roles: [UserRole.CHURCH_ADMIN] },
    { id: 'first-timers', label: 'First Timers', icon: '👋', roles: [UserRole.CHURCH_ADMIN, UserRole.UNIT_HEAD, UserRole.WORKER] },
    { id: 'attendance', label: 'Attendance', icon: '📊', roles: [UserRole.CHURCH_ADMIN] },
    { id: 'tasks', label: 'Action Plans', icon: '📋', roles: [UserRole.CHURCH_ADMIN, UserRole.UNIT_HEAD, UserRole.WORKER] },
    { id: 'units', label: 'Church Units', icon: '⛪', roles: [UserRole.CHURCH_ADMIN] },
    { id: 'inventory', label: 'Properties', icon: '📦', roles: [UserRole.CHURCH_ADMIN, UserRole.UNIT_HEAD] },
    { id: 'announcements', label: 'Announcements', icon: '📢', roles: [UserRole.CHURCH_ADMIN, UserRole.UNIT_HEAD, UserRole.WORKER] },
    { id: 'events', label: 'Events & Calendar', icon: '📅', roles: [UserRole.CHURCH_ADMIN, UserRole.UNIT_HEAD, UserRole.WORKER] },
    { 
      id: 'accounting', 
      label: 'Financials', 
      icon: '💰', 
      roles: [UserRole.CHURCH_ADMIN], 
      customCheck: () => currentUser.hasAccountingAccess === true 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    const hasRole = item.roles.includes(currentUser.role);
    const hasCustomAccess = item.customCheck ? item.customCheck() : false;
    return hasRole || hasCustomAccess;
  });

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed h-full z-50 bg-indigo-900 text-white transition-all duration-300 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
      `}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-800">
          <span className={`font-bold text-xl ${(isSidebarOpen || isMobileMenuOpen) ? 'block' : 'hidden'}`}>Ecclesia</span>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-1 hover:bg-indigo-800 rounded hidden lg:block"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="p-1 hover:bg-indigo-800 rounded lg:hidden text-2xl"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 mt-4 overflow-y-auto custom-scrollbar no-scrollbar">
          {filteredMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center p-4 transition-colors ${activeTab === item.id ? 'bg-indigo-700 border-r-4 border-white' : 'hover:bg-indigo-800'}`}
            >
              <span className="text-xl mr-3 shrink-0">{item.icon}</span>
              {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <button onClick={logout} className="w-full flex items-center p-2 text-indigo-300 hover:text-white transition-colors">
            <span className="text-xl mr-3 shrink-0">🚪</span>
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-2xl"
            >
              ☰
            </button>
             <h2 className="text-lg lg:text-xl font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-none">
              {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
             </h2>
             {currentChurch && (
               <span className="hidden sm:inline-block text-[10px] lg:text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                 @{currentChurch.name}
               </span>
             )}
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{currentUser.fullName}</p>
              <p className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
