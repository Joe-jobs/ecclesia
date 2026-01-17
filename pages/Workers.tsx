
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';

const Workers: React.FC = () => {
  const { currentUser, currentChurch, users, approveUser, deleteUser, units } = useApp();
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [search, setSearch] = useState('');

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
    if (!currentChurch) return;
    const link = `${window.location.origin}${window.location.pathname}#join-worker?churchId=${currentChurch.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently remove ${name}?`)) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">Staff Registry</h3>
          <p className="text-xs lg:text-base text-slate-500 font-medium">Monitoring worker participation and access permissions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button 
            onClick={handleCopyLink}
            className={`px-6 py-4 rounded-2xl transition shadow-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 ${copied ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-900 text-white shadow-slate-200'}`}
          >
            {copied ? '✓ Link Copied' : '📋 Invite Link'}
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">👥</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Staff</p>
            <h4 className="text-2xl font-black text-slate-900">{stats.total}</h4>
          </div>
        </div>
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</p>
            <h4 className="text-2xl font-black text-slate-900">{stats.active}</h4>
          </div>
        </div>
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
            <h4 className="text-2xl font-black text-slate-900">{stats.pending}</h4>
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
            {(['ALL', 'APPROVED', 'PENDING'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${filter === t ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
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

        {/* Worker Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
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
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 shrink-0">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900 truncate leading-tight">{user.fullName}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                        {user.role.replace('_', ' ')}
                      </p>
                      <p className="text-[9px] text-indigo-500 font-bold uppercase">
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
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      <p className="text-xs font-bold text-slate-500">{user.lastLogin || 'No activity recorded'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      {user.status === 'PENDING' && (
                        <button 
                          onClick={() => approveUser(user.id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(user.id, user.fullName)}
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWorkers.length === 0 && (
          <div className="py-24 text-center bg-slate-50/50 rounded-3xl">
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
