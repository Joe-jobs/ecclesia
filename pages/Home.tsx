
import React from 'react';

interface HomeProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onViewPricing: () => void;
}

const Home: React.FC<HomeProps> = ({ onGetStarted, onLogin, onViewPricing }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 lg:px-12 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">E</div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">Ecclesia</span>
        </div>
        <div className="flex items-center gap-4 lg:gap-10">
          <button 
            onClick={onLogin}
            className="hidden sm:block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 hover:shadow-slate-200 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-56 pb-20 px-6 lg:px-12 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-xl shadow-slate-100/50 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">The New Standard for Church CRM</span>
          </div>
          
          <h1 className="text-6xl lg:text-[110px] font-black text-slate-900 tracking-tighter leading-[0.85] text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Ministry management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600">without the chaos.</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-slate-500 text-lg lg:text-2xl font-medium leading-relaxed text-center mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            Empower your leadership with a unified platform for visitor engagement, 
            financial transparency, and growth analytics. Built for the modern church.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 mb-24">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95"
            >
              Start Free Trial
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-12 py-6 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-slate-200 transition-all"
            >
              Request Demo
            </button>
          </div>

          {/* High-Fidelity App Preview Mockup - Triple Responsive */}
          <div className="relative w-full max-w-7xl mx-auto px-4 animate-in zoom-in-95 duration-1000 delay-300 flex justify-center">
             
             {/* 1. Desktop View (Full Sidebar Layout - Based on Newest Image) */}
             <div className="hidden lg:block bg-slate-900 rounded-[3.5rem] p-3 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border border-slate-800 w-full overflow-hidden">
                <div className="bg-[#f8fafc] rounded-[3rem] overflow-hidden aspect-[16/9] relative text-xs flex">
                   {/* Full Dark Sidebar */}
                   <div className="w-[18%] bg-[#2d2a7c] h-full p-6 flex flex-col gap-6 text-white/70">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#2d2a7c] font-black text-xs">E</div>
                         <span className="font-bold text-white text-base">Ecclesia</span>
                         <span className="ml-auto text-white/50 text-[8px]">◀</span>
                      </div>
                      <div className="space-y-1 text-[10px]">
                         <div className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors rounded-xl"><span className="text-base grayscale opacity-50">👥</span> <span className="font-bold">Staff Registry</span></div>
                         <div className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors rounded-xl"><span className="text-base grayscale opacity-50">👋</span> <span className="font-bold">First Timers</span></div>
                         <div className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors rounded-xl"><span className="text-base grayscale opacity-50">📊</span> <span className="font-bold">Attendance</span></div>
                         <div className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors rounded-xl"><span className="text-base grayscale opacity-50">📋</span> <span className="font-bold">Action Plans</span></div>
                         <div className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors rounded-xl"><span className="text-base grayscale opacity-50">⛪</span> <span className="font-bold">Church Units</span></div>
                         <div className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors rounded-xl"><span className="text-base grayscale opacity-50">📦</span> <span className="font-bold">Properties</span></div>
                         <div className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors rounded-xl"><span className="text-base grayscale opacity-50">📢</span> <span className="font-bold">Announcements</span></div>
                         <div className="mt-8 flex items-center gap-3 p-3 hover:bg-white/5 transition-colors rounded-xl text-orange-200/50"><span className="text-base grayscale opacity-50">🚪</span> <span className="font-bold">Logout</span></div>
                      </div>
                   </div>

                   {/* Dashboard Body */}
                   <div className="flex-1 flex flex-col">
                      {/* Header */}
                      <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <span className="font-black text-slate-800 text-sm">Dashboard</span>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black text-[9px] uppercase tracking-tighter">@Grace Fellowship Center</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="font-black text-slate-800 text-[10px] leading-none">Admin John Doe</p>
                               <p className="text-[7px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">CHURCH ADMIN</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-sm">A</div>
                         </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 p-8 space-y-8 bg-slate-50/30 overflow-hidden">
                         {/* Stats */}
                         <div className="grid grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                               <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[7px] mb-2">Avg Attendance</p>
                               <p className="text-3xl font-black text-[#3b82f6]">482</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                               <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[7px] mb-2">Total First Timers</p>
                               <p className="text-3xl font-black text-[#10b981]">2</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                               <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[7px] mb-2">Active Tasks</p>
                               <p className="text-3xl font-black text-[#f59e0b]">0</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                               <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[7px] mb-2">Upcoming Events</p>
                               <p className="text-3xl font-black text-[#a855f7]">1</p>
                            </div>
                         </div>

                         {/* Trends & Updates */}
                         <div className="grid grid-cols-3 gap-8 h-full">
                            <div className="col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                               <h5 className="font-black text-slate-800 mb-6">Attendance Trends</h5>
                               <div className="h-48 relative">
                                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                     <path d="M0,80 Q50,70 100,75 T200,85 T300,70 T400,60" fill="none" stroke="#6366f1" strokeWidth="2.5" />
                                     <path d="M0,80 Q50,70 100,75 T200,85 T300,70 T400,60 L400,100 L0,100 Z" fill="url(#grad-desk-2)" opacity="0.1" />
                                     <defs>
                                        <linearGradient id="grad-desk-2" x1="0%" y1="0%" x2="0%" y2="100%">
                                           <stop offset="0%" style={{stopColor:'#6366f1', stopOpacity:1}} />
                                           <stop offset="100%" style={{stopColor:'#6366f1', stopOpacity:0}} />
                                        </linearGradient>
                                     </defs>
                                     <line x1="0" y1="95" x2="400" y2="95" stroke="#cbd5e1" strokeWidth="0.5" />
                                  </svg>
                                  <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                                     <span>2024-04-07</span>
                                     <span>2024-04-14</span>
                                     <span>2024-04-21</span>
                                     <span>2024-04-28</span>
                                     <span>2024-05-05</span>
                                  </div>
                               </div>
                            </div>
                            <div className="col-span-1 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                               <h5 className="font-black text-slate-800 mb-6">Latest Updates</h5>
                               <div className="space-y-6">
                                  <div className="border-l-4 border-[#6366f1] pl-4">
                                     <p className="font-black text-slate-900 leading-none">Workers Meeting</p>
                                     <p className="text-[7px] text-slate-500 mt-2">All workers must be present by 7:30 AM this Sunday.</p>
                                  </div>
                                  <div className="border-l-4 border-blue-500 pl-4">
                                     <p className="font-black text-slate-900 leading-none">New Camera Gear</p>
                                     <p className="text-[7px] text-slate-500 mt-2">We have received new 4K cameras. Training session on Saturday.</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* 2. Tablet View (No Sidebar, Wide Layout - Based on Previous Image 2) */}
             <div className="hidden sm:block lg:hidden bg-slate-900 rounded-[3rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-800 w-full">
                <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden aspect-[16/10] relative text-[10px]">
                   <div className="absolute inset-0 flex flex-col">
                      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-xl">☰</span>
                            <span className="font-bold text-slate-800 text-sm">Dashboard</span>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="font-black text-slate-800 leading-none">Admin John Doe</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">A</div>
                         </div>
                      </div>
                      <div className="flex-1 p-6 space-y-8 bg-[#f8fafc]">
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                               <p className="text-slate-400 font-black uppercase tracking-widest text-[8px] mb-2">Avg Attendance</p>
                               <p className="text-2xl font-black text-[#3b82f6]">482</p>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                               <p className="text-slate-400 font-black uppercase tracking-widest text-[8px] mb-2">Total First Timers</p>
                               <p className="text-2xl font-black text-[#10b981]">2</p>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                               <p className="text-slate-400 font-black uppercase tracking-widest text-[8px] mb-2">Active Tasks</p>
                               <p className="text-2xl font-black text-[#f59e0b]">0</p>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                               <p className="text-slate-400 font-black uppercase tracking-widest text-[8px] mb-2">Upcoming Events</p>
                               <p className="text-2xl font-black text-[#a855f7]">1</p>
                            </div>
                         </div>
                         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h5 className="font-black text-slate-800 text-base mb-6">Attendance Trends</h5>
                            <div className="h-48 w-full relative">
                               <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                  <path d="M0,80 Q50,70 100,75 T200,85 T300,70 T400,60" fill="none" stroke="#6366f1" strokeWidth="2.5" />
                                  <path d="M0,80 Q50,70 100,75 T200,85 T300,70 T400,60 L400,100 L0,100 Z" fill="url(#grad-desk-1)" opacity="0.1" />
                                  <defs>
                                     <linearGradient id="grad-desk-1" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{stopColor:'#6366f1', stopOpacity:1}} />
                                        <stop offset="100%" style={{stopColor:'#6366f1', stopOpacity:0}} />
                                     </linearGradient>
                                  </defs>
                               </svg>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* 3. Mobile View (Vertical Layout - Based on Image 1) */}
             <div className="sm:hidden w-full max-w-[320px] bg-slate-900 rounded-[3.5rem] p-3 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border border-slate-800">
                <div className="bg-[#f8fafc] rounded-[3rem] overflow-hidden aspect-[9/19] relative flex flex-col text-[10px]">
                   <div className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between">
                      <span className="text-xl">☰</span>
                      <span className="font-black text-slate-800 uppercase tracking-widest text-[9px]">Dashboard</span>
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">A</div>
                   </div>
                   <div className="flex-1 p-5 space-y-5 overflow-y-auto no-scrollbar">
                      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                         <p className="text-slate-400 font-black uppercase tracking-widest text-[7px] mb-2">Avg Attendance</p>
                         <p className="text-2xl font-black text-[#3b82f6]">482</p>
                      </div>
                      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                         <p className="text-slate-400 font-black uppercase tracking-widest text-[7px] mb-2">Total First Timers</p>
                         <p className="text-2xl font-black text-[#10b981]">2</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                         <h5 className="font-black text-slate-800 text-[10px]">Attendance Trends</h5>
                         <div className="h-40 w-full relative">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                               <path d="M0,80 Q25,70 50,75 T100,60" fill="none" stroke="#6366f1" strokeWidth="3" />
                               <path d="M0,80 Q25,70 50,75 T100,60 L100,100 L0,100 Z" fill="url(#grad-mob-1)" opacity="0.1" />
                               <defs>
                                  <linearGradient id="grad-mob-1" x1="0%" y1="0%" x2="0%" y2="100%">
                                     <stop offset="0%" style={{stopColor:'#6366f1', stopOpacity:1}} />
                                     <stop offset="100%" style={{stopColor:'#6366f1', stopOpacity:0}} />
                                  </linearGradient>
                               </defs>
                            </svg>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="w-1/3 h-1 bg-white/20 rounded-full mx-auto mt-4"></div>
             </div>

             {/* Decorative floating elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-[2.5rem] -z-10 rotate-12 opacity-20 blur-2xl"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600 rounded-[2.5rem] -z-10 -rotate-12 opacity-20 blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <div className="space-y-2">
            <h4 className="text-4xl lg:text-6xl font-black tracking-tighter">500+</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Global Churches</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-4xl lg:text-6xl font-black tracking-tighter">98%</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Visitor Retention</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-4xl lg:text-6xl font-black tracking-tighter">1M+</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Records Managed</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-4xl lg:text-6xl font-black tracking-tighter">24/7</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Platform Uptime</p>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-32 bg-slate-50 px-6 lg:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
             <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">The Ecosystem</h2>
             <h3 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter">Engineered for Excellence.</h3>
             <p className="text-slate-500 max-w-2xl mx-auto font-medium">Everything you need to manage a thriving community, from the local parish to global denominations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-5 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">👋</div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Visitor Engine</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Integrated follow-up AI strategies that ensure no guest is ever forgotten.</p>
            </div>
            
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-5 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💎</div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Fiscal Vault</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Multi-currency accounting with granular permission levels for maximum security.</p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-5 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Insight Center</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Beautifully visualised attendance data and growth trends for strategic planning.</p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-5 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🏛️</div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Unit Structure</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Organise departments, assign leaders, and manage worker permissions with ease.</p>
            </div>

            {/* Additional Features Row */}
            <div className="bg-indigo-900 p-10 rounded-[3rem] text-white space-y-5 hover:shadow-2xl hover:-translate-y-2 transition-all group lg:col-span-2">
              <div className="flex justify-between items-start">
                 <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📋</div>
                 <div className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">New Feature</div>
              </div>
              <h3 className="text-3xl font-black tracking-tight">Actionable Roadmaps</h3>
              <p className="text-indigo-200 font-medium leading-relaxed max-w-md">Design task-based workflows for your workers. From Sunday service setup to community outreach, keep everyone in sync.</p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-5 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📦</div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Asset Registry</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Full lifecycle management of church properties and technical equipment.</p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-5 hover:shadow-2xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🌐</div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Multi-Tenancy</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">One platform to rule multiple branches. The ultimate tool for denominations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-600 to-indigo-700"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-12 px-6">
           <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-none">Ready to scale your impact?</h2>
           <p className="text-xl lg:text-3xl text-indigo-100 font-medium leading-relaxed">No credit card required. Cancel anytime. <br />Your ministry's next chapter starts here.</p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-600 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95"
              >
                Get Started Now
              </button>
              <button 
                onClick={onViewPricing}
                className="text-white font-black text-xs uppercase tracking-[0.3em] border-b-2 border-white/20 hover:border-white transition-all pb-1"
              >
                View Pricing Plan
              </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-50 px-6 lg:px-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">E</div>
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">Ecclesia</span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Empowering the global church with cutting-edge technology to fulfill the great commission through administrative excellence.
            </p>
          </div>
          
          <div className="space-y-6">
             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Platform</h5>
             <ul className="space-y-4 text-xs font-bold text-slate-600">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Visitor Engine</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Financial Treasury</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Growth Analytics</li>
             </ul>
          </div>

          <div className="space-y-6">
             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Community</h5>
             <ul className="space-y-4 text-xs font-bold text-slate-600">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Case Studies</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Support</li>
             </ul>
          </div>

          <div className="space-y-6">
             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Legal</h5>
             <ul className="space-y-4 text-xs font-bold text-slate-600">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Data Processing</li>
             </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2025 Ecclesia Systems. All Rights Reserved.</p>
          <div className="flex gap-8">
             <span className="text-xl cursor-pointer hover:scale-110 transition-transform">🐦</span>
             <span className="text-xl cursor-pointer hover:scale-110 transition-transform">📸</span>
             <span className="text-xl cursor-pointer hover:scale-110 transition-transform">💼</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
