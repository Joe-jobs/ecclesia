
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { UserRole, User } from '../types';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface LoginProps {
  initialIsSignup?: boolean;
  onBackToHome?: () => void;
}

const Login: React.FC<LoginProps> = ({ initialIsSignup = false, onBackToHome }) => {
  const { registerUser, addChurch, churches, units, users, setCurrentUser } = useApp();
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [isWorkerJoin, setIsWorkerJoin] = useState(false);
  const [targetChurchId, setTargetChurchId] = useState<string | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [isChurchSuspended, setIsChurchSuspended] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Sync isSignup with initialIsSignup prop only on mount
  useEffect(() => {
    setIsSignup(initialIsSignup);
  }, [initialIsSignup]);

  // Check for hash routes and invite links
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#platform-vault') {
        setIsSecretVisible(true);
        setIsWorkerJoin(false);
      } else if (hash.startsWith('#join-worker')) {
        // Robust parsing for churchId parameter
        const parts = hash.split('?');
        const queryString = parts.length > 1 ? parts[1] : '';
        const params = new URLSearchParams(queryString);
        const churchId = params.get('churchId');
        
        if (churchId) {
          setIsWorkerJoin(true);
          setTargetChurchId(churchId);
          setIsSignup(true);
        }
      } else {
        setIsSecretVisible(false);
        setIsWorkerJoin(false);
        setTargetChurchId(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Compute available units based on target church ID from the invite link
  const targetChurch = useMemo(() => 
    targetChurchId ? churches.find(c => c.id === targetChurchId) : null
  , [targetChurchId, churches]);

  const targetUnits = useMemo(() => 
    targetChurchId ? units.filter(u => u.churchId === targetChurchId) : []
  , [targetChurchId, units]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check for email verification
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setVerificationEmail(email);
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error(error);
      setAuthError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      if (isWorkerJoin && !selectedUnitId) {
        setAuthError("Please select a unit/department before joining.");
        setLoading(false);
        return;
      }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const existingUser = users.find(u => u.email === user.email);
      
      if (!existingUser) {
        if (isWorkerJoin && targetChurchId) {
          registerUser({
            churchId: targetChurchId,
            fullName: user.displayName || 'Worker',
            email: user.email || '',
            role: UserRole.WORKER,
            unitId: selectedUnitId,
            status: 'PENDING'
          });
          setIsPendingApproval(true);
          await signOut(auth);
        } else if (isSignup) {
          const church = addChurch({
            name: newChurchName || `${user.displayName}'s Church`,
            city: churchCity || 'Unknown',
            state: churchState || 'Unknown',
            country: churchCountry || 'Unknown',
            phone: phone || 'N/A',
            adminId: user.uid,
          });

          const newUser = registerUser({
            churchId: church.id,
            fullName: user.displayName || 'Admin',
            email: user.email || '',
            role: UserRole.CHURCH_ADMIN,
            status: 'APPROVED'
          });
          setCurrentUser(newUser);
        }
      }
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message || "Social sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    if (isWorkerJoin && !selectedUnitId) {
      setAuthError("Selecting a unit/department is mandatory.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      await updateProfile(fbUser, { displayName: fullName });
      await sendEmailVerification(fbUser);

      if (isWorkerJoin && targetChurchId) {
        registerUser({
          churchId: targetChurchId,
          fullName,
          email,
          role: UserRole.WORKER,
          unitId: selectedUnitId,
          status: 'PENDING'
        });
        setIsPendingApproval(true);
      } else {
        const church = addChurch({
          name: newChurchName,
          city: churchCity,
          state: churchState,
          country: churchCountry,
          phone: phone,
          adminId: fbUser.uid,
        });

        registerUser({
          churchId: church.id,
          fullName,
          email,
          role: UserRole.CHURCH_ADMIN,
          status: 'APPROVED'
        });
      }

      await signOut(auth);
      if (!isWorkerJoin) {
        setVerificationEmail(email);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError("An account with this email already exists.");
      } else {
        setAuthError(error.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Added missing handleForgotPassword handler to fix the reference error.
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError("Please enter your email address first.");
      return;
    }
    setAuthError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsResetSent(true);
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (isResetSent) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 lg:p-14 text-center">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">✓</div>
           <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Email Sent</h2>
           <p className="text-slate-500 text-sm mb-8">We've sent a password reset link to <span className="font-bold text-indigo-600">{email}</span>.</p>
           <button onClick={() => { setIsResetSent(false); setIsForgotPassword(false); }} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Return to Login</button>
        </div>
      </div>
    );
  }

  if (verificationEmail) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 lg:p-14 text-center">
           <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">✉️</div>
           <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Verify Email</h2>
           <p className="text-slate-500 text-sm mb-8">Check <span className="font-bold text-indigo-600">{verificationEmail}</span> to verify your account.</p>
           <button onClick={() => setVerificationEmail(null)} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Back to Login</button>
        </div>
      </div>
    );
  }

  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 lg:p-14 text-center">
           <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">⏳</div>
           <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Request Pending</h2>
           <p className="text-slate-500 text-sm mb-8">
             Your application for <span className="font-bold text-indigo-600">{targetChurch?.name || 'the church'}</span> has been submitted. 
             An admin must approve you before you can sign in.
           </p>
           <button onClick={() => { setIsPendingApproval(false); onBackToHome?.(); }} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-8">
        <div className="bg-indigo-900 p-8 lg:p-12 text-center text-white relative">
          <div className="absolute top-4 left-4">
            <button onClick={onBackToHome} className="text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest">← Home</button>
          </div>
          <h1 className="text-3xl lg:text-5xl font-black mb-2 tracking-tighter">Ecclesia</h1>
          <p className="text-indigo-200 text-[10px] uppercase tracking-[0.3em] font-black">
            {isWorkerJoin ? `JOIN ${targetChurch?.name || 'CHURCH'}` : isSignup ? 'CREATE ACCOUNT' : isForgotPassword ? 'SECURITY RESET' : 'CHURCH MANAGEMENT'}
          </p>
        </div>
        
        <div className="p-8 lg:p-12">
          {authError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black text-center uppercase tracking-widest animate-in fade-in duration-300">
              {authError}
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold transition-all" />
              </div>
              <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 disabled:opacity-50">Send Reset Link</button>
              <div className="text-center pt-4">
                <button type="button" onClick={() => setIsForgotPassword(false)} className="text-[10px] font-black text-slate-500 hover:text-indigo-600 uppercase">Back to Login</button>
              </div>
            </form>
          ) : isSignup ? (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Full Name</label>
                  <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. David King" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Email</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Password</label>
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Confirm Password</label>
                  <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-sm font-bold" />
                </div>
              </div>

              {isWorkerJoin ? (
                <div className="space-y-4 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Staff Registration Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">Phone Number</label>
                      <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">Target Unit/Department</label>
                      <select required value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold cursor-pointer hover:border-indigo-400 transition-colors">
                        <option value="">-- Choose Unit --</option>
                        {targetUnits.length > 0 ? (
                          targetUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)
                        ) : (
                          <option value="GENERAL">General Registry</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Church Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input required type="text" value={newChurchName} onChange={(e) => setNewChurchName(e.target.value)} placeholder="Church Name" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold" />
                    </div>
                    <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Official Phone" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold" />
                    <input required type="text" value={churchCountry} onChange={(e) => setChurchCountry(e.target.value)} placeholder="Country" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold" />
                  </div>
                </div>
              )}

              <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all">
                {loading ? 'Processing...' : (isWorkerJoin ? 'Join as Worker' : 'Register Church')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pastor@grace.com" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-lg font-bold" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Password</label>
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-lg font-bold" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? "👁️" : "👁️‍🗨️"}</button>
                </div>
              </div>
              <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                {loading ? 'Authenticating...' : 'Enter Portal'}
              </button>
            </form>
          )}

          {!isForgotPassword && (
            <div className="mt-8 space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-100 absolute"></div>
                <span className="relative bg-white px-4 text-[10px] font-black text-slate-400 uppercase">Or continue with</span>
              </div>
              <button onClick={handleGoogleSignIn} disabled={loading} className="w-full bg-white border-2 border-slate-100 text-slate-700 font-black py-4 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-95 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.21-3.21C17.53 1.63 14.99 1 12 1 7.37 1 3.4 3.66 1.45 7.54l3.78 2.94C6.12 7.15 8.84 5.04 12 5.04z" /><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.68 2.85c2.15-1.98 3.39-4.89 3.39-8.5z" /><path fill="#34A853" d="M5.23 14.98c-.23-.68-.36-1.41-.36-2.18s.13-1.5.36-2.18L1.45 7.68C.53 9.47 0 11.68 0 14s.53 4.53 1.45 6.32l3.78-2.94c-.23-.68-.36-1.41-.36-2.18z" /><path fill="#FBBC05" d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.68-2.85c-1.11.75-2.52 1.19-4.27 1.19-3.16 0-5.88-2.11-6.84-5.01l-3.78 2.94C3.4 20.34 7.37 23 12 23z" /></svg>
                Google
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            {!isWorkerJoin ? (
              <button onClick={() => { setIsSignup(!isSignup); setAuthError(null); }} className="text-[10px] font-black text-slate-500 hover:text-indigo-600 uppercase">
                {isSignup ? 'Already have an account? Login' : "New Church? Register Here"}
              </button>
            ) : (
              <button onClick={() => { window.location.hash = ''; setIsWorkerJoin(false); setIsSignup(false); }} className="text-[10px] font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest">
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
