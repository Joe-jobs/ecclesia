
import React from 'react';

interface PricingProps {
  onBack: () => void;
  onGetStarted: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onBack, onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 lg:px-12 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onBack}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">E</div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">Ecclesia</span>
        </div>
        <button 
          onClick={onBack}
          className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-600 transition-colors"
        >
          ← Back to Home
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-56 pb-20 px-6 lg:px-12 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-xl shadow-slate-100/50 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Transparent Pricing</span>
          </div>
          
          <h1 className="text-5xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Simple, impact-driven <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">stewardship plans.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-500 text-lg lg:text-xl font-medium leading-relaxed text-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            One flat fee for everything. No hidden tiers, no complicated feature gating. Just pure ministry empowerment.
          </p>

          {/* Pricing Card */}
          <div className="w-full max-w-xl animate-in zoom-in-95 duration-1000 delay-300">
            <div className="bg-slate-900 rounded-[3rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
              <div className="bg-white rounded-[2.8rem] p-10 lg:p-16 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mb-8">💎</div>
                
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-4">Unlimited Plan</h2>
                
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-6xl lg:text-8xl font-black tracking-tighter text-slate-900">$10</span>
                  <span className="text-xl font-black text-slate-400 uppercase">/month</span>
                </div>

                <div className="w-full space-y-5 mb-12 text-left">
                  {[
                    "Unlimited Visitors & Follow-up Logs",
                    "Advanced Attendance Growth Analytics",
                    "Full Financial Vault & Multi-currency Support",
                    "Unlimited Staff & Church Unit Registry",
                    "Action Plan Roadmaps & Task Tracking",
                    "Announcement Broadcasts & Event Calendar",
                    "Property & Asset Lifecycle Management",
                    "Premium Support & Data Security"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] shrink-0">✓</div>
                      <span className="text-slate-600 font-bold text-sm lg:text-base">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={onGetStarted}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95"
                >
                  Start Your 30-Day Free Trial
                </button>
                <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No credit card required upfront</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Mini Section */}
      <section className="py-32 bg-slate-50 px-6 lg:px-12 relative">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h3 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter">Common Questions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-lg">Are there any user limits?</h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">No. You can add as many staff members, units, and visitors as your ministry needs without any additional cost.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-lg">Can I cancel anytime?</h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">Absolutely. There are no long-term contracts. You can cancel your subscription at any time directly from the dashboard.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-lg">Do you offer discounts?</h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">We believe $10/mo is accessible for most congregations. For larger denominations with 50+ branches, contact our sales team for custom volume pricing.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-lg">How secure is my data?</h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">We use enterprise-grade encryption and daily backups. Your church data is private and never shared with third parties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white px-6 lg:px-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2025 Ecclesia Systems. Empowering Stewardship.</p>
          <div className="flex gap-8">
             <button onClick={onBack} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Platform Home</button>
             <button onClick={onGetStarted} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Create Account</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
