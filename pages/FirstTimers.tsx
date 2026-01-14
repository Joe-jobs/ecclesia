
import React, { useState } from 'react';
import { useApp } from '../store';
import { FollowUpStatus, FirstTimer, UserRole } from '../types';
import { getFollowUpStrategy } from '../geminiService';

const FirstTimers: React.FC = () => {
  const { firstTimers, currentUser, addFirstTimer, updateFirstTimer } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFT, setEditingFT] = useState<FirstTimer | null>(null);
  const [strategyLoading, setStrategyLoading] = useState<string | null>(null);
  const [strategyContent, setStrategyContent] = useState<string | null>(null);

  const churchFTs = firstTimers.filter(ft => ft.churchId === currentUser?.churchId);
  
  // Permission check: Only Pastor (CHURCH_ADMIN) and Unit Head (UNIT_HEAD) can add visitors
  const canAddVisitor = currentUser?.role === UserRole.CHURCH_ADMIN || currentUser?.role === UserRole.UNIT_HEAD;

  const handleAISuggestion = async (ft: FirstTimer) => {
    setStrategyLoading(ft.id);
    setStrategyContent(null);
    const strategy = await getFollowUpStrategy(ft.notes, ft.fullName);
    setStrategyContent(strategy);
    setStrategyLoading(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleStatusUpdate = (ft: FirstTimer, newStatus: FollowUpStatus) => {
    updateFirstTimer(ft.id, { status: newStatus });
  };

  const handleFollowUpSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingFT) return;
    
    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get('status') as FollowUpStatus;
    const newNote = formData.get('notes') as string;
    
    updateFirstTimer(editingFT.id, { 
      status: newStatus,
      notes: newNote
    });
    
    setEditingFT(null);
  };

  const getStatusColorClass = (status: FollowUpStatus) => {
    switch (status) {
      case FollowUpStatus.CONVERTED: return 'bg-emerald-100 text-emerald-700';
      case FollowUpStatus.NEEDS_FOLLOW_UP: return 'bg-rose-100 text-rose-700';
      case FollowUpStatus.CONTACTED: return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl lg:text-3xl font-black text-slate-800 tracking-tight">Visitor Tracking</h3>
          <p className="text-sm text-slate-500">Manage first-time guests and engagement</p>
        </div>
        {canAddVisitor && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Add Visitor
          </button>
        )}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <th className="px-8 py-5">Visitor Details</th>
                <th className="px-8 py-5">Visit Date</th>
                <th className="px-8 py-5">Assignment</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {churchFTs.map(ft => (
                <tr key={ft.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-800 text-sm lg:text-base">{ft.fullName}</div>
                    <div className="text-[10px] lg:text-xs text-slate-500 font-medium tracking-tight">{ft.phone}</div>
                  </td>
                  <td className="px-8 py-5 text-xs lg:text-sm text-slate-600 font-medium whitespace-nowrap">
                    {ft.dateVisited}
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl inline-flex items-center gap-2">
                      <span className="text-xs">👤</span> {ft.assignedTo ? 'Assigned' : 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={ft.status}
                      onChange={(e) => handleStatusUpdate(ft, e.target.value as FollowUpStatus)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight outline-none border-none cursor-pointer appearance-none text-center transition-colors shadow-sm ${getStatusColorClass(ft.status)}`}
                    >
                      {Object.values(FollowUpStatus).map(status => (
                        <option key={status} value={status} className="bg-white text-slate-800 normal-case font-medium">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button 
                        onClick={() => handleAISuggestion(ft)}
                        disabled={strategyLoading === ft.id}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                          strategyLoading === ft.id 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
                        }`}
                      >
                        {strategyLoading === ft.id ? 'Analyzing...' : '✨ Strategy'}
                      </button>
                      <button 
                        onClick={() => setEditingFT(ft)}
                        className="text-slate-400 hover:text-indigo-600 p-2.5 rounded-xl hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {churchFTs.map(ft => (
          <div key={ft.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h4 className="font-black text-slate-800 text-lg truncate tracking-tight">{ft.fullName}</h4>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">{ft.phone}</p>
              </div>
              <button 
                onClick={() => setEditingFT(ft)}
                className="p-3 text-slate-400 bg-slate-50 rounded-2xl hover:text-indigo-600"
              >
                ✏️
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Visited</p>
                <p className="text-xs font-bold text-slate-700">{ft.dateVisited}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Assignment</p>
                <p className="text-xs font-bold text-indigo-600">{ft.assignedTo ? 'Assigned' : 'Pending'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Update Progress</label>
              <select 
                value={ft.status}
                onChange={(e) => handleStatusUpdate(ft, e.target.value as FollowUpStatus)}
                className={`w-full p-4 rounded-2xl text-xs font-black uppercase tracking-widest outline-none border-none cursor-pointer appearance-none text-center transition-colors shadow-sm ${getStatusColorClass(ft.status)}`}
              >
                {Object.values(FollowUpStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => handleAISuggestion(ft)}
              disabled={strategyLoading === ft.id}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {strategyLoading === ft.id ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : '✨ Generate AI Strategy'}
            </button>
          </div>
        ))}
      </div>

      {churchFTs.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="flex flex-col items-center">
             <span className="text-6xl mb-6 grayscale opacity-20">🕊️</span>
             <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Harvest is Plenteous</p>
             <p className="text-sm text-slate-400 mt-2 font-medium">No visitors recorded yet.</p>
          </div>
        </div>
      )}

      {/* AI Advisory Result */}
      {strategyContent && (
        <div id="ai-advice" className="bg-slate-900 text-white p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-10 text-7xl lg:text-9xl group-hover:scale-110 transition-transform duration-1000">✨</div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8 lg:mb-10">
              <div>
                <h4 className="text-2xl lg:text-3xl font-black mb-2 tracking-tight">Ecclesia AI Advisor</h4>
                <p className="text-[10px] lg:text-xs text-indigo-400 font-black uppercase tracking-[0.2em]">Personalized Engagement Roadmap</p>
              </div>
              <button 
                onClick={() => setStrategyContent(null)} 
                className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all"
              >
                ✕
              </button>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 lg:p-8 rounded-3xl text-sm lg:text-lg leading-relaxed text-slate-100 font-medium">
              {strategyContent.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Follow-up Modal */}
      {editingFT && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 lg:p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Follow-up Log</h2>
              <button 
                onClick={() => setEditingFT(null)} 
                className="text-slate-400 hover:text-slate-600 text-xl p-2"
              >✕</button>
            </div>
            
            <form onSubmit={handleFollowUpSave} className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visitor</p>
                <p className="text-lg font-black text-slate-800">{editingFT.fullName}</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Engagement Status</label>
                <select 
                  name="status" 
                  defaultValue={editingFT.status}
                  className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold shadow-inner"
                >
                  {Object.values(FollowUpStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Interaction Notes</label>
                <textarea 
                  name="notes" 
                  defaultValue={editingFT.notes}
                  rows={4} 
                  className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-medium shadow-inner" 
                  placeholder="Record call summary or visitation notes..."
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="button" onClick={() => setEditingFT(null)} className="flex-1 px-8 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all">Update History</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Registration Modal */}
      {showAddModal && canAddVisitor && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] w-full max-w-xl p-8 lg:p-12 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Visitor Registration</h2>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-600 text-xl p-2"
              >✕</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addFirstTimer({
                churchId: currentUser!.churchId,
                fullName: formData.get('fullName') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                dateVisited: formData.get('dateVisited') as string,
                notes: formData.get('notes') as string,
                status: FollowUpStatus.NEEDS_FOLLOW_UP,
                history: []
              });
              setShowAddModal(false);
            }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Full Legal Name</label>
                <input required name="fullName" type="text" placeholder="e.g. Michael Angelo" className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold shadow-inner" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Phone Number</label>
                  <input required name="phone" type="tel" placeholder="+1..." className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Visit Date</label>
                  <input required name="dateVisited" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold shadow-inner" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Email Address (Optional)</label>
                <input name="email" type="email" placeholder="contact@example.com" className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold shadow-inner" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Observation / Prayer Points</label>
                <textarea name="notes" rows={3} className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-medium shadow-inner" placeholder="E.g. Seeking spiritual growth, interested in unit membership..."></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-8 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all order-2 sm:order-1">Discard</button>
                <button type="submit" className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all order-1 sm:order-2">Add to Flock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstTimers;
