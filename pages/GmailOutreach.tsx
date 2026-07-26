import React, { useState, useEffect } from 'react';
import { useApp } from '../store.tsx';
import { googleSignIn, getAccessToken, sendGmailMessage, googleLogout, fetchRecentSentMessages } from '../gmailService.ts';
import { User as FirebaseUser } from 'firebase/auth';

export const GmailOutreach: React.FC = () => {
  const { currentUser, firstTimers, users } = useApp();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [recipientType, setRecipientType] = useState<'custom' | 'firstTimer' | 'worker'>('firstTimer');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [customTo, setCustomTo] = useState('');
  const [subject, setSubject] = useState('Welcome to Ecclesia Church!');
  const [body, setBody] = useState('Dear friend,\n\nThank you for visiting us! We would love to stay in touch and welcome you to our upcoming fellowship.\n\nWarm regards,\nEcclesia Ministry Team');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recentSentCount, setRecentSentCount] = useState<number | null>(null);

  const churchFTs = firstTimers.filter(ft => ft.churchId === currentUser?.churchId);
  const churchWorkers = users.filter(u => u.churchId === currentUser?.churchId && u.status === 'APPROVED');

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setAccessToken(token);
      loadRecentMessages(token);
    }
  }, []);

  const loadRecentMessages = async (token: string) => {
    const messages = await fetchRecentSentMessages(token);
    setRecentSentCount(messages.length);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      setAccessToken(result.accessToken);
      setGoogleUser(result.user);
      setStatusMessage({ type: 'success', text: `Successfully connected to Gmail as ${result.user.email}` });
      loadRecentMessages(result.accessToken);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sign in with Google' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleLogout();
    setAccessToken(null);
    setGoogleUser(null);
    setStatusMessage(null);
    setRecentSentCount(null);
  };

  const getRecipientEmail = () => {
    if (recipientType === 'custom') return customTo;
    if (recipientType === 'firstTimer') {
      const ft = churchFTs.find(f => f.id === selectedRecipientId);
      return ft?.email || '';
    }
    if (recipientType === 'worker') {
      const w = churchWorkers.find(u => u.id === selectedRecipientId);
      return w?.email || '';
    }
    return '';
  };

  const handleApplyTemplate = (templateName: string) => {
    if (templateName === 'welcome') {
      setSubject('Warm Welcome to Ecclesia Church!');
      setBody('Dear friend,\n\nThank you so much for joining us for our worship service. We pray you experienced the presence and warmth of God in our midst.\n\nWe would love to get to know you better and answer any questions you might have. Feel free to reply to this email or join us for our next service!\n\nWarm blessings,\nEcclesia Pastoral Team');
    } else if (templateName === 'event') {
      setSubject('Invitation: Upcoming Church Fellowship Event');
      setBody('Hello,\n\nWe are excited to invite you to our upcoming church event this weekend! It will be a powerful time of worship, teaching, and fellowship.\n\nDate: This Sunday @ 9:00 AM\nVenue: Main Sanctuary\n\nWe look forward to worshipping with you!\n\nIn Christ,\nEcclesia Church');
    } else if (templateName === 'worker') {
      setSubject('Unit Update & Prayer Session');
      setBody('Dear Leader/Worker,\n\nThank you for your dedicated service in the kingdom. Please be reminded of our upcoming unit briefing and prayer session.\n\nYour passion and effort make a profound difference in our church community.\n\nBlessings,\nEcclesia Administration');
    }
  };

  const handleOpenSendConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTo = getRecipientEmail();
    if (!finalTo) {
      setStatusMessage({ type: 'error', text: 'Please specify a valid recipient email address.' });
      return;
    }
    if (!subject || !body) {
      setStatusMessage({ type: 'error', text: 'Please fill in both subject and body fields.' });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first.' });
      setShowConfirmModal(false);
      return;
    }

    const finalTo = getRecipientEmail();
    setIsSending(true);
    setStatusMessage(null);

    try {
      await sendGmailMessage({ to: finalTo, subject, body }, accessToken);
      setStatusMessage({ type: 'success', text: `Email successfully sent to ${finalTo} via Gmail!` });
      setShowConfirmModal(false);
      setCustomTo('');
      setSelectedRecipientId('');
      loadRecentMessages(accessToken);
    } catch (err: any) {
      console.error('Error sending email:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send email via Gmail API' });
      setShowConfirmModal(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 rounded-3xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block backdrop-blur-md">
            Google Workspace Integration
          </span>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Gmail Outreach Hub</h1>
          <p className="text-red-100 text-sm leading-relaxed">
            Directly compose and send welcome messages, event invites, and follow-ups to First Timers and Workers using your connected Gmail account.
          </p>
        </div>
      </div>

      {/* Connection & Auth Card */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-bold text-2xl">
              ✉️
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Gmail Integration Status</h3>
              <p className="text-xs text-slate-500 font-medium">
                {accessToken 
                  ? `Connected as ${googleUser?.email || 'Google User'}` 
                  : 'Connect your Google account to send emails directly via Gmail'}
              </p>
            </div>
          </div>

          {!accessToken ? (
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn}
              className="inline-flex items-center gap-3 bg-white border border-slate-300 hover:border-slate-400 rounded-2xl px-6 py-3.5 text-slate-700 font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {recentSentCount !== null && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                  {recentSentCount} Sent Emails Found
                </span>
              )}
              <button 
                onClick={handleGoogleLogout}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition-colors uppercase tracking-wider"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {statusMessage && (
          <div className={`mt-6 p-4 rounded-2xl text-xs font-bold text-center ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* Main Outreach Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Templates & Recipient Type */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Quick Templates</h3>
            <p className="text-xs text-slate-500">Select a pre-configured template to populate subject and body.</p>
            <div className="space-y-2">
              <button 
                onClick={() => handleApplyTemplate('welcome')}
                className="w-full text-left p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-900 transition-colors"
              >
                <div className="text-xs font-bold">First Timer Welcome</div>
                <div className="text-[11px] text-indigo-600 truncate">Warm greeting & introduction to church</div>
              </button>
              <button 
                onClick={() => handleApplyTemplate('event')}
                className="w-full text-left p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-900 transition-colors"
              >
                <div className="text-xs font-bold">Service & Event Invitation</div>
                <div className="text-[11px] text-amber-600 truncate">Invite members/visitors to Sunday worship</div>
              </button>
              <button 
                onClick={() => handleApplyTemplate('worker')}
                className="w-full text-left p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-900 transition-colors"
              >
                <div className="text-xs font-bold">Staff / Worker Update</div>
                <div className="text-[11px] text-purple-600 truncate">Briefing & prayer session reminder</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Target Audience</h3>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button 
                onClick={() => setRecipientType('firstTimer')}
                className={`py-2 rounded-xl transition-all ${recipientType === 'firstTimer' ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}
              >
                Visitors
              </button>
              <button 
                onClick={() => setRecipientType('worker')}
                className={`py-2 rounded-xl transition-all ${recipientType === 'worker' ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}
              >
                Workers
              </button>
              <button 
                onClick={() => setRecipientType('custom')}
                className={`py-2 rounded-xl transition-all ${recipientType === 'custom' ? 'bg-white shadow text-indigo-600' : 'text-slate-600'}`}
              >
                Custom
              </button>
            </div>

            {recipientType === 'firstTimer' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select First Timer</label>
                <select 
                  value={selectedRecipientId}
                  onChange={e => setSelectedRecipientId(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="">-- Choose First Timer --</option>
                  {churchFTs.map(ft => (
                    <option key={ft.id} value={ft.id}>
                      {ft.fullName} {ft.email ? `(${ft.email})` : '(No Email)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientType === 'worker' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Worker</label>
                <select 
                  value={selectedRecipientId}
                  onChange={e => setSelectedRecipientId(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="">-- Choose Worker --</option>
                  {churchWorkers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientType === 'custom' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Custom Recipient Email</label>
                <input 
                  type="email"
                  placeholder="recipient@example.com"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Email Composition */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800">Compose Email Dispatch</h3>
            <span className="text-xs font-bold text-slate-400">Powered by Gmail API</span>
          </div>

          <form onSubmit={handleOpenSendConfirmation} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Recipient</label>
              <input 
                type="text"
                readOnly
                value={getRecipientEmail() || 'No recipient selected'}
                className="w-full p-3 text-sm bg-slate-50 font-bold border border-slate-200 rounded-xl text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Subject</label>
              <input 
                required
                type="text"
                placeholder="Enter email subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message Content</label>
              <textarea 
                required
                rows={8}
                placeholder="Write your email body here..."
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none leading-relaxed font-normal"
              />
            </div>

            {!accessToken ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center text-xs text-amber-800 font-bold">
                ⚠️ Please click "Sign in with Google" above to authorize sending emails via Gmail.
              </div>
            ) : (
              <button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-wider transition-colors shadow-lg shadow-red-100 flex items-center justify-center gap-2"
              >
                <span>Send Email via Gmail</span>
              </button>
            )}
          </form>
        </div>

      </div>

      {/* Explicit User Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[90] animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
              ✉️
            </div>
            <h3 className="text-xl font-black text-slate-800">Confirm Gmail Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to dispatch this email from your connected Gmail account?
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs space-y-2 border border-slate-100">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">To Recipient:</span>
                <span className="font-bold text-slate-800">{getRecipientEmail()}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Subject:</span>
                <span className="font-bold text-slate-800">{subject}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmSend}
                disabled={isSending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
