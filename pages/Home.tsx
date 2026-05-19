
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

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-xl shadow-slate-100/50 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">The New Standard for Church CRM</span>
          </div>
          
          <h1 className="text-5xl lg:text-[110px] font-black text-slate-900 tracking-tighter leading-[0.95] lg:leading-[0.85] mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Ministry management <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600">without the chaos.</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-slate-500 text-base lg:text-2xl font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            Empower your leadership with a unified platform for visitor engagement, 
            financial transparency, and growth analytics. Built for the modern church.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 mb-20 lg:mb-24 w-full sm:w-auto px-4">
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

          {/* App Preview Mockup - Now visible on all devices */}
          <div className="relative w-full max-w-7xl mx-auto px-4 animate-in zoom-in-95 duration-1000 delay-300 flex justify-center group cursor-default">
             <div className="bg-slate-900 rounded-[2rem] lg:rounded-[3.5rem] p-1.5 lg:p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] lg:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border border-slate-800 w-full overflow-hidden transition-transform duration-700 group-hover:scale-[1.01]">
                <div className="bg-[#f8fafc] rounded-[1.8rem] lg:rounded-[3rem] overflow-hidden aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] relative text-[8px] lg:text-xs flex">
                   {/* Mock Sidebar */}
                   <div className="w-[22%] sm:w-[18%] bg-[#2d2a7c] h-full p-3 lg:p-6 flex flex-col gap-3 lg:gap-6 text-white/70">
                      <div className="flex items-center gap-1 lg:gap-2 mb-2 lg:mb-4">
                         <div className="w-5 h-5 lg:w-8 lg:h-8 bg-white rounded flex items-center justify-center text-[#2d2a7c] font-black text-[10px] lg:text-xs">E</div>
                         <span className="font-bold text-white text-[10px] lg:text-base hidden sm:inline">Ecclesia</span>
                      </div>
                      <div className="space-y-0.5 lg:space-y-1">
                         <div className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-3 bg-white/10 rounded-lg lg:rounded-xl text-white">
                            <span className="text-xs lg:text-base">🏠</span> 
                            <span className="font-bold hidden sm:inline">Dashboard</span>
                         </div>
                         <div className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-3 hover:bg-white/5 transition-colors rounded-lg lg:rounded-xl">
                            <span className="text-xs lg:text-base grayscale opacity-50">👋</span> 
                            <span className="font-bold hidden sm:inline">First Timers</span>
                         </div>
                         <div className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-3 hover:bg-white/5 transition-colors rounded-lg lg:rounded-xl">
                            <span className="text-xs lg:text-base grayscale opacity-50">📊</span> 
                            <span className="font-bold hidden sm:inline">Attendance</span>
                         </div>
                      </div>
                   </div>
                   {/* Mock Content */}
                   <div className="flex-1 p-3 lg:p-8 space-y-3 lg:space-y-8 bg-slate-50/30 overflow-hidden">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-6">
                         <div className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                            <div className="h-1 lg:h-2 w-8 lg:w-12 bg-slate-100 rounded mb-2 lg:mb-3"></div>
                            <p className="text-base lg:text-3xl font-black text-indigo-600">482</p>
                         </div>
                         <div className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                            <div className="h-1 lg:h-2 w-8 lg:w-12 bg-slate-100 rounded mb-2 lg:mb-3"></div>
                            <p className="text-base lg:text-3xl font-black text-emerald-500">24</p>
                         </div>
                         <div className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                            <div className="h-1 lg:h-2 w-8 lg:w-12 bg-slate-100 rounded mb-2 lg:mb-3"></div>
                            <p className="text-base lg:text-3xl font-black text-amber-500">12</p>
                         </div>
                         <div className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                            <div className="h-1 lg:h-2 w-8 lg:w-12 bg-slate-100 rounded mb-2 lg:mb-3"></div>
                            <p className="text-base lg:text-3xl font-black text-purple-500">5</p>
                         </div>
                      </div>
                      <div className="bg-white p-4 lg:p-8 rounded-[1.5rem] lg:rounded-[3rem] shadow-sm border border-slate-100 h-32 sm:h-48 lg:h-64 flex flex-col gap-4">
                         <div className="h-2 lg:h-4 w-1/3 bg-slate-50 rounded"></div>
                         <div className="flex-1 flex items-end gap-1 sm:gap-2">
                            {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                               <div key={i} className="flex-1 bg-indigo-50/50 rounded-t-sm lg:rounded-t-lg relative group/bar">
                                  <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm lg:rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-40 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-600 to-indigo-700"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8 lg:space-y-12 px-6">
           <h2 className="text-4xl lg:text-8xl font-black text-white tracking-tighter leading-none">Ready to scale your impact?</h2>
           <p className="text-lg lg:text-3xl text-indigo-100 font-medium leading-relaxed">No credit card required. Cancel anytime. <br className="hidden sm:block" />Your ministry's next chapter starts here.</p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-12 py-6 bg-white text-indigo-600 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95"
              >
                Get Started Now
              </button>
              
              <button 
                onClick={onViewPricing}
                className="text-white font-black text-xs uppercase tracking-[0.3em] border-b-2 border-white/20 hover:border-white hover:text-white hover:-translate-y-1 transition-all duration-300 pb-1 flex items-center gap-2 group/pricing"
              >
                View Pricing Plan
                <span className="group-hover/pricing:translate-x-1.5 transition-transform duration-300">→</span>
              </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-50 px-6 lg:px-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">© 2025 Ecclesia Systems. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
