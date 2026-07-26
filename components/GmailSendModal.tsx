import React, { useState, useEffect } from 'react';
import { googleSignIn, getAccessToken, sendGmailMessage, googleLogout } from '../gmailService.ts';
import { User } from 'firebase/auth';

interface GmailSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
}

export const GmailSendModal: React.FC<GmailSendModalProps> = ({
  isOpen,
  onClose,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
}) => {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTo(initialTo);
      setSubject(initialSubject);
      setBody(initialBody);
      setShowConfirm(false);
      setStatusMessage(null);
      
      const token = getAccessToken();
      if (token) {
        setAccessToken(token);
      }
    }
  }, [isOpen, initialTo, initialSubject, initialBody]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      setAccessToken(result.accessToken);
      setGoogleUser(result.user);
      setStatusMessage({ type: 'success', text: `Signed in as ${result.user.email}` });
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sign in with Google' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setAccessToken(null);
    setGoogleUser(null);
    setStatusMessage(null);
  };

  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !body) {
      setStatusMessage({ type: 'error', text: 'Please fill in recipient, subject, and message body.' });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'Google authentication required.' });
      setShowConfirm(false);
      return;
    }

    setIsSending(true);
    setStatusMessage(null);
    try {
      await sendGmailMessage({ to, subject, body }, accessToken);
      setStatusMessage({ type: 'success', text: `Email successfully sent to ${to} via Gmail!` });
      setShowConfirm(false);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Error sending email via Gmail:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send email via Gmail API' });
      setShowConfirm(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg">
              ✉️
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Gmail Outreach</h3>
              <p className="text-xs text-slate-500 font-medium">Send email directly via Google Workspace API</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-bold text-center ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Google Authentication Box */}
        {!accessToken ? (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center mb-6">
            <p className="text-xs font-bold text-slate-600 mb-4">
              Sign in with your Google account to authorize sending emails via Gmail.
            </p>
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-xl px-5 py-3 text-slate-700 font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isLoggingIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex justify-between items-center mb-5 text-xs text-emerald-800">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gmail Connected {googleUser?.email ? `(${googleUser.email})` : ''}
            </span>
            <button 
              type="button" 
              onClick={handleSignOut} 
              className="text-[10px] uppercase font-bold text-emerald-700 hover:underline"
            >
              Switch Account
            </button>
          </div>
        )}

        {/* Send Email Form */}
        <form onSubmit={handleInitiateSend} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Recipient Email</label>
            <input 
              required
              type="email"
              placeholder="visitor@example.com"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject Line</label>
            <input 
              required
              type="text"
              placeholder="Welcome to Ecclesia Church!"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message Body</label>
            <textarea 
              required
              rows={4}
              placeholder="Write your email message here..."
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none leading-relaxed"
            />
          </div>

          {!accessToken ? (
            <p className="text-[11px] text-amber-600 font-bold text-center">
              Please sign in with Google above to send this message.
            </p>
          ) : (
            <button 
              type="submit" 
              disabled={isSending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl uppercase text-xs tracking-wider transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              <span>Send Email via Gmail</span>
            </button>
          )}
        </form>

        {/* Explicit Confirmation Overlay Modal */}
        {showConfirm && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 z-10 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center space-y-4 max-w-sm w-full">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                ✉️
              </div>
              <h4 className="text-lg font-black text-slate-800">Confirm Email Dispatch</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to dispatch this email via your connected Gmail account?
              </p>
              <div className="bg-slate-50 p-3 rounded-xl text-left text-xs font-mono text-slate-700 space-y-1">
                <div><span className="font-bold text-slate-400">To:</span> {to}</div>
                <div className="truncate"><span className="font-bold text-slate-400">Subject:</span> {subject}</div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmSend}
                  disabled={isSending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Confirm & Send'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
