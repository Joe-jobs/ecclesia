
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const { login, registerUser, addChurch, churches, units, users } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [isWorkerJoin, setIsWorkerJoin] = useState(false);
  const [targetChurchId, setTargetChurchId] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [isChurchSuspended, setIsChurchSuspended] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Secret access state
  const [isSecretVisible, setIsSecretVisible] = useState(false);

  // Signup/Registration State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [churchCity, setChurchCity] = useState('');
  const [churchState, setChurchState] = useState('');
  const [churchCountry, setChurchCountry] = useState('');
  const [newChurchName, setNewChurchName] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Check for hash routes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#platform-vault') {
        setIsSecretVisible(true);
        setIsWorkerJoin(false);
      } else if (hash.startsWith('#join-worker')) {
        const params = new URLSearchParams(hash.split('?')[1]);
        const churchId = params.get('churchId');
        if (churchId) {
          setIsWorkerJoin(true);
          setTargetChurchId(churchId);
          setIsSignup(true);
        }
      } else {
        setIsSecretVisible(false);
        setIsWorkerJoin(false);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // Check for suspended church
      const church = churches.find(c => c.id === user.churchId);
      if (church && church.status === 'SUSPENDED' && user.role !== UserRole.PLATFORM_OWNER) {
        setIsChurchSuspended(true);
        return;
      }

      if (user.status === 'PENDING') {
        setIsPendingApproval(true);
        return;
      }
    }
    login(email, password);
  };

  const startVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setResendTimer(60);
  };

  const handleGoogleAuth = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      setIsSignup(true);
      setEmail('verified.google.user@gmail.com');
      setFullName('Google User');
      setIsVerifying(false); 
    }, 1500);
  };

  const handleCompleteSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== '123456' && !email.includes('google')) {
      alert("Invalid verification code. Please use 123456 for this demo.");
      return;
    }

    if (isWorkerJoin && targetChurchId) {
      registerUser({
        churchId: targetChurchId,
        fullName,
        email,
        password: signupPassword,
        role: UserRole.WORKER,
        unitId: selectedUnitId,
        status: 'PENDING'
      });
      setIsPendingApproval(true);
      setIsVerifying(false);
      return;
    }

    // New church creation with expanded fields
    const church = addChurch({
      name: newChurchName,
      city: churchCity,
      state: churchState,
      country: churchCountry,
      phone: phone,
      adminId: 'pending',
    });

    registerUser({
      churchId: church.id,
      fullName,
      email,
      password: signupPassword,
      role: UserRole.CHURCH_ADMIN,
      status: 'APPROVED'
    });

    login(email, signupPassword);
  };

  const targetChurch = targetChurchId ? churches.find(c => c.id === targetChurchId) : null;
  const targetUnits = targetChurchId ? units.filter(u => u.churchId === targetChurchId) : [];

  if (isChurchSuspended) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 lg:p-14 text-center animate-in zoom-in-95 duration-300">
           <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-600 border-4 border-rose-200">
             <span className="text-5xl">🔒</span>
           </div>
           <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight uppercase">Account Restricted</h2>
           <p className="text-slate-500 text-sm leading-relaxed mb-8">
             Access to this church portal has been <span className="font-bold text-rose-600">suspended</span> by the platform administration. Please contact support or your organization administrator for more details.
           </p>
           <button 
             onClick={() => setIsChurchSuspended(false)}
             className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all text-[10px] uppercase tracking-widest"
           >
             Return to Login
           </button>
        </div>
      </div>
    );
  }

  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 lg:p-14 text-center animate-in zoom-in-95 duration-300">
           <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
             <span className="text-5xl">⏳</span>
           </div>
           <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight uppercase">Approval Pending</h2>
           <p className="text-slate-500 text-sm leading-relaxed mb-8">
             Your account for <span className="font-bold text-indigo-600">{fullName || 'the church'}</span> has been created. 
             An Admin will review your registration and grant access shortly. You can login once approved using your password.
           </p>
           <button 
             onClick={() => setIsPendingApproval(false)}
             className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all text-[10px] uppercase tracking-widest"
           >
             Return to Login
           </button>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 lg:p-12 animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Verify your email</h2>
            <p className="text-sm text-slate-500">
              We've sent a code to <span className="font-bold text-indigo-600">{email}</span>. 
              Enter it below to continue.
            </p>
          </div>

          <form onSubmit={handleCompleteSignup} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest text-center">6-Digit Verification Code</label>
              <input 
                required
                type="text" 
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="0 0 0 0 0 0"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none transition-all text-3xl font-black text-center tracking-[0.5em]"
              />
              <p className="text-center text-[10px] text-slate-400 mt-2 italic">Tip: Use 123456 for the demo</p>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-sm uppercase tracking-widest"
            >
              Verify & Create Account
            </button>

            <div className="text-center">
              <button 
                type="button"
                disabled={resendTimer > 0}
                onClick={() => setResendTimer(60)}
                className={`text-xs font-black uppercase tracking-widest transition-colors ${resendTimer > 0 ? 'text-slate-300' : 'text-indigo-600 hover:text-indigo-800'}`}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
            
            <button 
              type="button"
              onClick={() => setIsVerifying(false)}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              ← Back to Details
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-8">
        <div className="bg-indigo-900 p-8 lg:p-12 text-center text-white relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full lg:hidden"></div>
          <h1 className="text-3xl lg:text-5xl font-black mb-2 tracking-tighter">Ecclesia</h1>
          <p className="text-indigo-200 text-sm lg:text-base opacity-80 uppercase tracking-widest font-bold">
            {isWorkerJoin ? `Join ${targetChurch?.name || 'Church'}` : isSignup ? 'Create Church Account' : 'Church Management System'}
          </p>
        </div>
        
        <div className="p-8 lg:p-12">
          {/* Third Party Auth */}
          {!isWorkerJoin && (
            <div className="mb-8">
              <button 
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all relative"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
              <div className="relative mt-8 mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-300">Or use email</span></div>
              </div>
            </div>
          )}

          {isSignup ? (
            <form onSubmit={startVerification} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all text-sm font-bold"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Create Password</label>
                <input 
                  required
                  type="password" 
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all text-sm font-bold"
                />
              </div>

              {isWorkerJoin ? (
                <div className="space-y-5 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 animate-in zoom-in-95 duration-300">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Worker Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">Target Unit</label>
                      <select 
                        required
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-bold"
                      >
                        <option value="">Select Unit</option>
                        {targetUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 animate-in zoom-in-95 duration-300">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Church Registry Details</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">Church Legal Name</label>
                      <input 
                        required
                        type="text" 
                        value={newChurchName}
                        onChange={(e) => setNewChurchName(e.target.value)}
                        placeholder="Grace Fellowship Center Int'l"
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">Official Phone</label>
                      <input 
                        required
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">Country</label>
                      <input 
                        required
                        type="text" 
                        value={churchCountry}
                        onChange={(e) => setChurchCountry(e.target.value)}
                        placeholder="e.g. Nigeria"
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">State / Province</label>
                      <input 
                        required
                        type="text" 
                        value={churchState}
                        onChange={(e) => setChurchState(e.target.value)}
                        placeholder="e.g. Lagos"
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">City</label>
                      <input 
                        required
                        type="text" 
                        value={churchCity}
                        onChange={(e) => setChurchCity(e.target.value)}
                        placeholder="e.g. Ikeja"
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all text-sm uppercase tracking-[0.2em]"
              >
                {isWorkerJoin ? 'Request to Join & Verify' : 'Register Church & Verify'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Username or Email</label>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grace.com"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 focus:outline-none transition-all text-lg font-bold"
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Password</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 focus:outline-none transition-all text-lg font-bold"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all text-sm uppercase tracking-[0.2em]"
              >
                Enter Portal
              </button>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Or click to simulate login</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { role: 'Admin', email: 'pastor@grace.com' },
                    { role: 'Unit Head', email: 'sarah@grace.com' },
                    { role: 'Worker', email: 'david@grace.com' },
                  ].map(opt => (
                    <button 
                      key={opt.email}
                      type="button"
                      onClick={() => {
                        setEmail(opt.email);
                        setPassword('password123');
                      }}
                      className="px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all text-center uppercase"
                    >
                      {opt.role}
                    </button>
                  ))}
                </div>
              </div>

              {isSecretVisible && (
                <div className="pt-6 mt-6 border-t-2 border-dashed border-indigo-100 animate-in slide-in-from-top-4 duration-500">
                  <button 
                    type="button"
                    onClick={() => {
                      setEmail('platform@ecclesia.com');
                      setPassword('superadmin-secret-2025');
                    }}
                    className="w-full py-4 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-900 hover:text-white transition-all shadow-2xl shadow-indigo-200/50"
                  >
                    ✨ Master Platform Access
                  </button>
                </div>
              )}
            </form>
          )}

          <div className="mt-8 text-center">
            {!isWorkerJoin && (
              <button 
                onClick={() => setIsSignup(!isSignup)}
                className="text-xs font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors"
              >
                {isSignup ? 'Already have an account? Login' : "New to Ecclesia? Join here"}
              </button>
            )}
            {isWorkerJoin && (
              <button 
                onClick={() => {
                  window.location.hash = '';
                  setIsWorkerJoin(false);
                  setIsSignup(false);
                }}
                className="text-xs font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors"
              >
                ← Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
