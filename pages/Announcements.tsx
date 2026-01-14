
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole, Announcement, Unit } from '../types';

const Announcements: React.FC = () => {
  const { announcements, units, currentUser, addAnnouncement, deleteAnnouncement } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'GLOBAL' | 'UNIT'>('ALL');

  const isAdmin = currentUser?.role === UserRole.CHURCH_ADMIN;
  const isUnitHead = currentUser?.role === UserRole.UNIT_HEAD;
  const canPost = isAdmin || isUnitHead;

  const churchAnns = announcements.filter(a => a.churchId === currentUser?.churchId);
  const filteredAnns = churchAnns.filter(a => {
    const isGlobal = !a.unitId;
    const isForMyUnit = a.unitId === currentUser?.unitId;
    
    // Visibility logic: Admins see everything, others see global + their unit
    const isVisible = isAdmin || isGlobal || isForMyUnit;
    if (!isVisible) return false;

    if (filter === 'GLOBAL') return isGlobal;
    if (filter === 'UNIT') return !isGlobal;
    return true;
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const body = formData.get('body') as string;
    const unitId = formData.get('unitId') as string;
    const expiryDate = formData.get('expiryDate') as string;

    addAnnouncement({
      churchId: currentUser!.churchId,
      title,
      body,
      unitId: unitId === 'GLOBAL' ? undefined : unitId,
      expiryDate: expiryDate || undefined
    });
    setShowAddModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Announcements</h3>
          <p className="text-slate-500">Stay informed about church updates and unit news</p>
        </div>
        {canPost && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-semibold flex items-center gap-2 w-fit"
          >
            <span className="text-xl">📢</span> Post Announcement
          </button>
        )}
      </div>

      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
        {(['ALL', 'GLOBAL', 'UNIT'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {f === 'ALL' ? 'All Updates' : f === 'GLOBAL' ? 'Global' : 'Unit News'}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredAnns.map((ann) => (
          <div key={ann.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative overflow-hidden group">
            {!ann.unitId ? (
              <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded-bl-xl">Global</div>
            ) : (
              <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-bl-xl">
                {units.find(u => u.id === ann.unitId)?.name || 'Unit'}
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-black text-slate-800 mb-1 leading-tight">{ann.title}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ann.createdAt}</p>
              </div>
              {isAdmin || (isUnitHead && ann.unitId === currentUser?.unitId) ? (
                <button 
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="text-slate-300 hover:text-rose-600 p-2 transition-colors opacity-0 group-hover:opacity-100"
                >
                  🗑️
                </button>
              ) : null}
            </div>

            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">
              {ann.body}
            </div>

            {ann.expiryDate && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic pt-4 border-t border-slate-50">
                <span>⏳ Valid until:</span>
                <span>{ann.expiryDate}</span>
              </div>
            )}
          </div>
        ))}

        {filteredAnns.length === 0 && (
          <div className="py-24 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-500 font-bold">No announcements to show.</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for updates!</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Broadcast Message</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Announcement Title</label>
                <input required name="title" type="text" placeholder="e.g., Upcoming Thanksgiving Service" className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border bg-slate-50" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Body</label>
                <textarea required name="body" rows={5} placeholder="Type your announcement here..." className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border bg-slate-50"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Audience</label>
                  <select name="unitId" required className="w-full border-slate-200 rounded-xl p-3 border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {isAdmin && <option value="GLOBAL">Entire Church</option>}
                    {isAdmin ? (
                      units.filter(u => u.churchId === currentUser?.churchId).map(u => (
                        <option key={u.id} value={u.id}>Unit: {u.name}</option>
                      ))
                    ) : (
                      <option value={currentUser?.unitId}>My Unit: {units.find(u => u.id === currentUser?.unitId)?.name}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                  <input name="expiryDate" type="date" className="w-full border-slate-200 rounded-xl p-3 border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">Post Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
