
import React, { useState } from 'react';
import { useApp } from '../store';
import { User, UserRole } from '../types';

const Workers: React.FC = () => {
  const { currentUser, currentChurch, users, approveUser, deleteUser, units } = useApp();
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [search, setSearch] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  
  // Custom Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Get all users for this church except the current user (admin cannot delete themselves)
  const churchUsers = users.filter(u => u.churchId === currentUser?.churchId && u.id !== currentUser?.id);
  
  const filteredWorkers = churchUsers.filter(u => {
    const matchesFilter = filter === 'ALL' || u.status === filter;
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: churchUsers.length,
    active: churchUsers.filter(u => u.status === 'APPROVED').length,
    pending: churchUsers.filter(u => u.status === 'PENDING').length,
  };

  const handleCopyLink = () => {
    const churchId = currentChurch?.id || currentUser?.churchId;
    if (!churchId) return;

    // Construct link robustly by cleaning current URL of hashes and params
    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    const link = `${baseUrl}#join-worker?churchId=${churchId}`;
    
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      // Fallback: simple alert if clipboard API fails
      alert("Please copy this link manually: " + link);
    });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      const name = userToDelete.fullName;
      deleteUser(userToDelete.id);
      setUserToDelete(null);
      setDeleteSuccess(`${name} removed from registry.`);
      setTimeout(() => setDeleteSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 pb-20 animate-in fade-in duration-500">
      {/* Success Toast */}
      {deleteSuccess && (
        <div className="fixed top-20 right-4 lg:right-8 z-[100] bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-right-8 duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          {deleteSuccess}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setUserToDelete(null)}></div>
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 lg:p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">⚠️</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Permanent Removal</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Are you absolutely sure you want to remove <span className="font-bold text-slate-900">"{userToDelete.fullName}"</span> from the staff registry? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-100 transition-all active:scale-95"
              >
                Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">Staff Registry</h3>
          <p className="text-xs lg:text-base text-slate-500 font-medium">Monitoring worker participation and access permissions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button 
            type="button"
            onClick={handleCopyLink}
            className={`px-6 py-4 rounded-2xl transition shadow-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 ${copied ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-900 text-white shadow-slate-200'}`}
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            )}
            {copied ? 'Link Copied' : 'Invite Link'}
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-indigo-200 transition-colors">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">👥</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Staff</p>
            <h4 className="text-2xl font-black text-slate-900">{stats.total}</h4>
          </div>
        </div>
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-colors">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">⚡</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</p>
            <h4 className="text-2xl font-black text-slate-900">{stats.active}</h4>
          </div>
        </div>
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-amber-200 transition-colors">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">⏳</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
            <h4 className="text-2xl font-black text-slate-900">{stats.pending}</h4>
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white p-4 lg:p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full lg:w-fit overflow-x-auto no-scrollbar">
            {(['ALL', 'APPROVED', 'PENDING'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${filter === t ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
          
          <div className="relative w-full lg:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Filter by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none text-sm font-bold tracking-tight transition-all"
            />
          </div>
        </div>

        {/* Desktop Worker Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Staff Identity</th>
                <th className="px-6 py-5">Unit/Role</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Last Activity</th>
                <th className="px-6 py-5 text-right">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">{user.fullName}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                        {user.role.replace('_', ' ')}
                      </p>
                      <p className="text-[9px] text-indigo-50 font-bold uppercase">
                        {units.find(u => u.id === user.unitId)?.name || 'General Registry'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${user.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.lastLogin ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                      <p className="text-xs font-bold text-slate-500">{user.lastLogin || 'No activity recorded'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-3">
                      {user.status === 'PENDING' && (
                        <button 
                          type="button"
                          onClick={() => approveUser(user.id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          Approve
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => setUserToDelete(user)}
                        title="Delete User from Registry"
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 active:scale-90"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Worker Cards */}
        <div className="md:hidden space-y-4">
          {filteredWorkers.map(user => (
            <div key={user.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-black text-slate-900 truncate leading-tight">{user.fullName}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${user.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {user.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-200/50">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit/Role</p>
                  <p className="text-[10px] font-black text-slate-800 uppercase truncate">
                    {user.role.replace('_', ' ')}
                  </p>
                  <p className="text-[8px] text-indigo-500 font-bold uppercase">
                    {units.find(u => u.id === user.unitId)?.name || 'General Registry'}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Activity</p>
                  <p className="text-[10px] font-bold text-slate-600">
                    {user.lastLogin || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {user.status === 'PENDING' && (
                  <button 
                    type="button"
                    onClick={() => approveUser(user.id)}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-50 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    Approve
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setUserToDelete(user)}
                  className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Remove Staff
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredWorkers.length === 0 && (
          <div className="py-24 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <div className="flex flex-col items-center">
               <span className="text-6xl mb-6 grayscale opacity-20">👥</span>
               <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">No Registry Entries</p>
               <p className="text-sm text-slate-400 mt-2 font-medium">Clear search filters to see all staff.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workers;
