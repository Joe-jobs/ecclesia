
import React, { useState, useEffect } from 'react';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check for email verification
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth); // Ensure they stay in Login state
        setVerificationEmail(email);
        setLoading(false);
        return;
      }
    } catch (error: any) {
      console.error(error);
      setAuthError("password or email incorrect");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in local state
      const existingUser = users.find(u => u.email === user.email);
      
      if (!existingUser) {
        // If they are on a worker join page
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
        } 
        // If they are trying to sign up a new church
        else if (isSignup) {
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
      setAuthError(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email) {
      setAuthError("Please enter your email address first");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsResetSent(true);
    } catch (error: any) {
      console.error(error);
      setAuthError("Could not send reset link. Check if email is correct.");
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

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      await updateProfile(fbUser, { displayName: fullName });
      
      // Send Verification Email
      await sendEmailVerification(fbUser);

      // Handle custom local state logic based on worker join or church admin
      if (isWorkerJoin && targetChurchId) {
        registerUser({
          churchId: targetChurchId,
          fullName,
          email,
          role: UserRole.WORKER,
          unitId: selectedUnitId,
          status: 'PENDING'
        });
      } else {
        // New church creation
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

      // Important: Sign out to force "verify and login" flow
      await signOut(auth);
      setVerificationEmail(email);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError("user already exist. sign in");
      } else {
        setAuthError(error.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  const targetChurch = targetChurchId ? churches.find(c => c.id === targetChurchId) : null;
  const targetUnits = targetChurchId ? units.filter(u => u.churchId === targetChurchId) : [];

  // Reset Success Screen
  if (isResetSent) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 lg:p-14 text-center animate-in zoom-in-95 duration-300">
           <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 border-4 border-emerald-100">
             <span className="text-5xl">✅</span>
           </div>
           <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight uppercase">Link Sent</h2>
           <p className="text-slate-500 text-sm leading-relaxed mb-8">
             We sent you a password change link to <span className="font-bold text-indigo-600">{email}</span>. Check your inbox and follow the instructions.
           </p>
           <button 
             onClick={() => {
               setIsResetSent(false);
               setIsForgotPassword(false);
             }}
             className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-indigo-600 transition-all text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100"
           >
             Return to Sign In
           </button>
        </div>
      </div>
    );
  }

  // Verification Screen
  if (verificationEmail) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 lg:p-14 text-center animate-in zoom-in-95 duration-300">
           <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600 border-4 border-indigo-200">
             <span className="text-5xl">📩</span>
           </div>
           <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight uppercase">Check your mail</h2>
           <p className="text-slate-500 text-sm leading-relaxed mb-8">
             We have sent a verification mail to <span className="font-bold text-indigo-600">{verificationEmail}</span>. 
             Verify it and login to access your portal.
           </p>
           <button 
             onClick={() => setVerificationEmail(null)}
             className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-[10px] uppercase tracking-widest"
           >
             Return to Login
           </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-8">
        <div className="bg-indigo-900 p-8 lg:p-12 text-center text-white relative">
          <div className="absolute top-4 left-4">
            <button 
              onClick={onBackToHome}
              className="p-2 text-white/50 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
            >
              ← Home
            </button>
          </div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full lg:hidden"></div>
          <h1 className="text-3xl lg:text-5xl font-black mb-2 tracking-tighter">Ecclesia</h1>
          <p className="text-indigo-200 text-sm lg:text-base opacity-80 uppercase tracking-widest font-bold">
            {isWorkerJoin ? `Join ${targetChurch?.name || 'Church'}` : isSignup ? 'Create Church Account' : isForgotPassword ? 'Reset Security Credentials' : 'Church Management System'}
          </p>
        </div>
        
        <div className="p-8 lg:p-12">
          {authError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300">
              {authError}
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Enter Account Email</label>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grace.com"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 focus:outline-none transition-all text-lg font-bold"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {loading ? 'Requesting...' : 'Get Reset Link'}
              </button>
              <div className="text-center pt-4">
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-xs font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          ) : isSignup ? (
            <form onSubmit={handleSignup} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Create Password</label>
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Confirm Password</label>
                  <input 
                    required
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all text-sm font-bold"
                  />
                </div>
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
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isWorkerJoin ? 'Request to Join' : 'Register Church')}
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
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
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {loading ? 'Entering...' : 'Enter Portal'}
              </button>
            </form>
          )}

          {/* Social Auth Separator */}
          {!isForgotPassword && (
            <div className="mt-8 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400">Or continue with</span>
                </div>
              </div>

              <button 
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full bg-white border-2 border-slate-100 text-slate-700 font-black py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.21-3.21C17.53 1.63 14.99 1 12 1 7.37 1 3.4 3.66 1.45 7.54l3.78 2.94C6.12 7.15 8.84 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.68 2.85c2.15-1.98 3.39-4.89 3.39-8.5z" />
                  <path fill="#34A853" d="M5.23 14.98c-.23-.68-.36-1.41-.36-2.18s.13-1.5.36-2.18L1.45 7.68C.53 9.47 0 11.68 0 14s.53 4.53 1.45 6.32l3.78-2.94c-.23-.68-.36-1.41-.36-2.18z" />
                  <path fill="#FBBC05" d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.68-2.85c-1.11.75-2.52 1.19-4.27 1.19-3.16 0-5.88-2.11-6.84-5.01l-3.78 2.94C3.4 20.34 7.37 23 12 23z" />
                </svg>
                Google
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
            </div>
          )}

          <div className="mt-8 text-center">
            {!isWorkerJoin && (
              <button 
                onClick={() => {
                  setIsSignup(!isSignup);
                  setIsForgotPassword(false);
                  setAuthError(null);
                }}
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
                  setIsForgotPassword(false);
                  setAuthError(null);
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
