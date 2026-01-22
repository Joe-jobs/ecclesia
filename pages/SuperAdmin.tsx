
import React from 'react';
import { useApp } from '../store';

const SuperAdmin: React.FC = () => {
  const { churches, users, attendance, firstTimers } = useApp();

  const totalUsers = users.length;
  const totalEntries = attendance.length;
  const totalFirstTimers = firstTimers.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-8xl opacity-10 group-hover:scale-110 transition-transform">⛪</div>
          <p className="text-indigo-100 font-black text-[10px] uppercase tracking-widest mb-2">Total Churches</p>
          <h2 className="text-4xl font-black tracking-tighter">{churches.length}</h2>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-8xl opacity-5 group-hover:scale-110 transition-transform">👥</div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Active Users</p>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{totalUsers}</h2>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-8xl opacity-5 group-hover:scale-110 transition-transform">📂</div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Global Data</p>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
            {totalFirstTimers + totalEntries} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">Records</span>
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Church Registration Registry</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Tenant List</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">System Online</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <th className="px-8 py-5">Church Entity</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Contact Phone</th>
                <th className="px-8 py-5">Admin Email</th>
                <th className="px-8 py-5">Onboarding</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {churches.map(church => {
                const admin = users.find(u => u.id === church.adminId);
                return (
                  <tr key={church.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-indigo-900 text-sm tracking-tight">{church.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ID: {church.id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-600 tracking-tight">{church.location}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-600 tracking-tight">{church.phone || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-indigo-600 tracking-tight lowercase">{admin?.email || 'No Admin Linked'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-500">{church.createdAt}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">Verified</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {churches.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No churches registered in the platform vault.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
