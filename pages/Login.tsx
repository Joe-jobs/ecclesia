import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store.tsx';
import { UserRole, User } from '../types.ts';

interface LoginProps {
  initialIsSignup?: boolean;
  onBackToHome?: () => void;
}

const Login: React.FC<LoginProps> = ({ initialIsSignup = false, onBackToHome }) => {
  const { registerUser, addChurch, churches, units, users, login } = useApp();
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [isWorkerJoin, setIsWorkerJoin] = useState(false);
  const [targetChurchId, setTargetChurchId] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#join-worker')) {
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
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
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
    
    // Simulate registration
    setTimeout(async () => {
      try {
        if (isWorkerJoin && targetChurchId) {
          await registerUser({
            churchId: targetChurchId,
            fullName,
            email,
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
          await registerUser({
            churchId: church.id,
            fullName,
            email,
            role: UserRole.CHURCH_ADMIN,
            status: 'APPROVED'
          });
          // Auto-login after registration
          login(email, password);
        }
      } catch (error: any) {
        setAuthError("Registration failed.");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setAuthError("Email required."); return; }
    setLoading(true);
    setTimeout(() => {
      setIsResetSent(true);
      setLoading(false);
    }, 500);
  };

  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 text-center">
           <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">⏳</div>
           <h2 className="text-2xl font-black text-slate-800 mb-4">Pending Approval</h2>
           <p className="text-slate-500 text-sm mb-8">An admin will review your request shortly.</p>
           <button onClick={onBackToHome} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Return to Home</button>
        </div>
      </div>
    );
  }

  if (isResetSent) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 text-center">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">✉️</div>
           <h2 className="text-2xl font-black text-slate-800 mb-4">Reset Sent</h2>
           <p className="text-slate-500 text-sm mb-8">Instructions have been sent to your email.</p>
           <button onClick={() => setIsResetSent(false)} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-indigo-900 p-8 text-center text-white relative">
          <h1 className="text-3xl lg:text-5xl font-black mb-2 tracking-tighter">Ecclesia</h1>
          <p className="text-indigo-200 text-[10px] uppercase tracking-widest font-bold">Simulated Local Environment</p>
        </div>
        <div className="p-8 lg:p-12">
          {authError && <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl text-center">{authError}</div>}
          
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
               <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 border rounded-xl" />
               <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl uppercase">Send Reset Link</button>
               <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full text-slate-400 text-xs font-bold uppercase">Back to Login</button>
            </form>
          ) : isSignup ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <input required placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-4 border rounded-xl" />
              <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 border rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 border rounded-xl" />
                <input required type="password" placeholder="Confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-4 border rounded-xl" />
              </div>
              {isWorkerJoin && (
                <select required value={selectedUnitId} onChange={e => setSelectedUnitId(e.target.value)} className="w-full p-4 border rounded-xl">
                  <option value="">Select Unit</option>
                  {targetUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              )}
              {!isWorkerJoin && (
                <div className="space-y-4">
                   <input required placeholder="Church Name" value={newChurchName} onChange={e => setNewChurchName(e.target.value)} className="w-full p-4 border rounded-xl" />
                   <div className="grid grid-cols-2 gap-4">
                      <input required placeholder="City" value={churchCity} onChange={e => setChurchCity(e.target.value)} className="w-full p-4 border rounded-xl" />
                      <input required placeholder="State" value={churchState} onChange={e => setChurchState(e.target.value)} className="w-full p-4 border rounded-xl" />
                   </div>
                </div>
              )}
              <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl uppercase">{loading ? 'Processing...' : 'Register'}</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 border rounded-xl" />
              <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 border rounded-xl" />
              <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl uppercase">{loading ? 'Authenticating...' : 'Login'}</button>
              <div className="text-right">
                 <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-indigo-600 hover:underline">Forgot Password?</button>
              </div>
            </form>
          )}
          
          <div className="mt-8 text-center border-t pt-8">
             <button onClick={() => setIsSignup(!isSignup)} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-600">
               {isSignup ? 'Already have an account? Login' : 'New Church? Create Portal'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;