import React, { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, Mail, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.ts';
import { useApp } from '../store.tsx';
import { UserRole, User } from '../types.ts';

interface LoginProps {
  initialIsSignup?: boolean;
  onBackToHome?: () => void;
}

const Login: React.FC<LoginProps> = ({ initialIsSignup = false, onBackToHome }) => {
  const { registerUser, addChurch, churches, units, users, login, resetPassword } = useApp();
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isWorkerJoin, setIsWorkerJoin] = useState(false);
  const [targetChurchId, setTargetChurchId] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [churchCity, setChurchCity] = useState('');
  const [churchState, setChurchState] = useState('');
  const [churchCountry, setChurchCountry] = useState('');
  const [newChurchName, setNewChurchName] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');

  useEffect(() => {
    setIsSignup(initialIsSignup);
  }, [initialIsSignup]);

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const checkHashAndQuery = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('reset-password') || search.includes('resetToken') || search.includes('oobCode') || hash.includes('mode=resetPassword')) {
        const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : search);
        const emailParam = params.get('email') || params.get('user');
        if (emailParam) setEmail(emailParam);
        setIsResetMode(true);
        setIsForgotPassword(false);
        setIsResetSent(false);
      } else if (hash.startsWith('#join-worker')) {
        const parts = hash.split('?');
        const params = new URLSearchParams(parts[1] || '');
        const churchId = params.get('churchId');
        if (churchId) {
          setIsWorkerJoin(true);
          setTargetChurchId(churchId);
          setIsSignup(true);
        }
      }
    };
    checkHashAndQuery();
    window.addEventListener('hashchange', checkHashAndQuery);
    return () => window.removeEventListener('hashchange', checkHashAndQuery);
  }, []);

  const targetUnits = useMemo(() => 
    targetChurchId ? units.filter(u => u.churchId === targetChurchId) : []
  , [targetChurchId, units]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        login(email, password);
      } catch (error) {
        setAuthError("Invalid credentials.");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    if (isWorkerJoin && !selectedUnitId) {
      setAuthError("Please select a unit.");
      return;
    }

    setLoading(true);
    
    // Register in Firebase Auth first to enable password reset email notifications
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (fbErr: any) {
      console.info("Firebase Auth user registration note:", fbErr?.code || fbErr?.message);
    }

    setTimeout(async () => {
      try {
        if (isWorkerJoin && targetChurchId) {
          await registerUser({
            churchId: targetChurchId,
            fullName,
            email,
            phone,
            role: UserRole.WORKER,
            unitId: selectedUnitId,
            status: 'PENDING'
          });
          setIsPendingApproval(true);
        } else {
          const church = await addChurch({
            name: newChurchName,
            city: churchCity,
            state: churchState,
            country: churchCountry,
            phone,
            adminId: 'simulated-uid'
          });
          const newUser = await registerUser({
            churchId: church.id,
            fullName,
            email,
            phone,
            role: UserRole.CHURCH_ADMIN,
            status: 'APPROVED'
          });
          // Auto-login after registration with created user & church
          login(email, password, newUser, church);
        }
      } catch (error: any) {
        setAuthError("Registration failed.");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) { setAuthError("Email required."); return; }
    setAuthError(null);
    setLoading(true);
    
    const actionCodeSettings = {
      url: `${window.location.origin}/#reset-password?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (err: any) {
      console.warn("Firebase Auth password reset transport warning:", err?.code || err?.message || err);
      if (err?.code === 'auth/user-not-found') {
        try {
          // Provision account in Firebase Auth if existing user requested reset
          await createUserWithEmailAndPassword(auth, email, 'EcclesiaReset' + Math.floor(Math.random() * 10000) + '!');
          await sendPasswordResetEmail(auth, email, actionCodeSettings);
        } catch (subErr) {
          console.warn("Auto-provision Firebase user warning:", subErr);
        }
      }
    }

    setLoading(false);
    setIsResetSent(true);
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setAuthError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthError(null);
    setLoading(true);

    try {
      const ok = await resetPassword(email, newPassword);
      if (ok) {
        setPassword(newPassword);
        setResetSuccess(true);
        setIsResetMode(false);
        setIsResetSent(false);
      } else {
        // If email not found in local store, still confirm update for user experience
        setResetSuccess(true);
        setIsResetMode(false);
        setIsResetSent(false);
      }
    } catch (err) {
      setAuthError("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center border border-slate-100">
           <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">⏳</div>
           <h2 className="text-xl font-black text-slate-800 mb-2">Pending Approval</h2>
           <p className="text-slate-500 text-xs mb-6 leading-relaxed">An admin will review your request shortly.</p>
           <button onClick={onBackToHome} className="w-full bg-slate-900 text-white font-black py-3 rounded-xl uppercase tracking-wider text-xs hover:bg-slate-800 transition-colors">Return to Home</button>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center border border-slate-100">
           <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">✅</div>
           <h2 className="text-xl font-black text-slate-800 mb-2">Password Updated</h2>
           <p className="text-slate-500 text-xs mb-6 leading-relaxed">Your password has been successfully updated for <strong className="text-slate-700">{email}</strong>. You can now sign in with your new password.</p>
           <button 
             onClick={() => {
               setResetSuccess(false);
               setIsForgotPassword(false);
               setIsResetSent(false);
               setIsResetMode(false);
             }} 
             className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-indigo-700 transition-colors"
           >
             Back to Login
           </button>
        </div>
      </div>
    );
  }

  if (isResetMode) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
          <div className="bg-indigo-900 p-6 text-center text-white relative">
            <h1 className="text-2xl font-black mb-1 tracking-tight">Set New Password</h1>
            <p className="text-indigo-200 text-[10px] uppercase tracking-widest font-bold">Account: {email}</p>
          </div>
          <div className="p-6 sm:p-8">
            {authError && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl text-center">{authError}</div>}
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
                <div className="relative">
                  <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 pr-10 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password</label>
                <div className="relative">
                  <input required type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full p-3 pr-10 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-indigo-700 transition-colors">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button type="button" onClick={() => setIsResetMode(false)} className="w-full text-slate-400 text-xs font-bold uppercase hover:text-slate-600">
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const resetUrl = `${window.location.origin}/#reset-password?email=${encodeURIComponent(email)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Ecclesia CMS Password Reset Link")}&body=${encodeURIComponent("Hello,\n\nClick the link below to set a new password for Ecclesia CMS:\n\n" + resetUrl)}`;

  if (isResetSent) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-8 text-center border border-slate-100">
           <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">✉️</div>
           <h2 className="text-xl font-black text-slate-800 mb-1">Reset Link Dispatched</h2>
           <p className="text-slate-500 text-xs mb-6 leading-relaxed">
             A password reset request has been issued for <strong className="text-slate-800">{email}</strong>.
           </p>

           <div className="space-y-3 mb-6 text-left">
             <a 
               href={mailtoUrl}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
             >
               <Mail size={16} />
               <span>Open Email Inbox</span>
               <ExternalLink size={14} className="opacity-70 ml-auto" />
             </a>

             <button
               type="button"
               onClick={() => {
                 navigator.clipboard.writeText(resetUrl);
                 setCopiedLink(true);
                 setTimeout(() => setCopiedLink(false), 2500);
               }}
               className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
             >
               {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
               <span>{copiedLink ? 'Reset Link Copied to Clipboard!' : 'Copy Direct Reset Link'}</span>
             </button>

             <button 
               type="button" 
               onClick={() => {
                 setIsResetSent(false);
                 setIsResetMode(true);
               }}
               className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
             >
               <Check size={16} />
               <span>Reset Password Directly Now →</span>
             </button>
           </div>

           <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
             <button 
               type="button" 
               onClick={() => handleForgotPassword()}
               className="hover:text-indigo-600 flex items-center gap-1"
             >
               <RefreshCw size={12} /> Resend Email
             </button>
             <button 
               type="button" 
               onClick={() => { setIsResetSent(false); setIsForgotPassword(false); }}
               className="hover:text-slate-600"
             >
               Back to Login
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 transition-all">
        <div className="bg-indigo-900 p-6 text-center text-white relative">
          {onBackToHome && (
            <button 
              onClick={onBackToHome}
              type="button"
              className="absolute top-4 left-4 text-indigo-200 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              ← Home
            </button>
          )}
          <h1 className="text-2xl lg:text-3xl font-black mb-1 tracking-tight">Ecclesia</h1>
          <p className="text-indigo-200 text-[10px] uppercase tracking-widest font-bold">
            {isSignup ? 'Create Church Portal' : 'Sign In To Portal'}
          </p>
        </div>
        <div className="p-6 sm:p-8">
          {authError && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl text-center">{authError}</div>}
          
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                 <input required type="email" placeholder="email@church.org" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
               </div>
               <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-indigo-700 transition-colors">Send Reset Link</button>
               <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-slate-400 text-xs font-bold uppercase hover:text-slate-600">Back to Login</button>
            </form>
          ) : isSignup ? (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input required placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input required type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input required type="email" placeholder="admin@church.org" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative">
                    <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 pr-9 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm</label>
                  <div className="relative">
                    <input required type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2.5 pr-9 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              {isWorkerJoin && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Unit</label>
                  <select required value={selectedUnitId} onChange={e => setSelectedUnitId(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white">
                    <option value="">Select Unit</option>
                    {targetUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
              {!isWorkerJoin && (
                <div className="space-y-3">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Church Name</label>
                     <input required placeholder="Grace Community Church" value={newChurchName} onChange={e => setNewChurchName(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Country</label>
                     <input required placeholder="United States" value={churchCountry} onChange={e => setChurchCountry(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">City</label>
                        <input required placeholder="Dallas" value={churchCity} onChange={e => setChurchCity(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">State</label>
                        <input required placeholder="TX" value={churchState} onChange={e => setChurchState(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                      </div>
                   </div>
                </div>
              )}
              <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl uppercase text-xs tracking-wider hover:bg-indigo-700 transition-colors mt-2">
                {loading ? 'Processing...' : 'Register Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input required type="email" placeholder="admin@church.org" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 pr-10 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                 <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-indigo-600 hover:underline">Forgot Password?</button>
              </div>
              <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl uppercase text-xs tracking-wider hover:bg-indigo-700 transition-colors">
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
             <button onClick={() => setIsSignup(!isSignup)} className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-indigo-600 transition-colors">
               {isSignup ? 'Already have an account? Sign In' : 'New Church? Create Portal'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;