
import React, { useState } from 'react';
import { useApp } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Attendance: React.FC = () => {
  const { attendance, currentUser, addAttendance } = useApp();
  const [showLogModal, setShowLogModal] = useState(false);

  const churchAttendance = attendance
    .filter(a => a.churchId === currentUser?.churchId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl lg:text-3xl font-black text-slate-800 tracking-tight">Attendance Analytics</h3>
          <p className="text-sm text-slate-500 font-medium">Monitoring growth trends and service demographics</p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Log New Sunday
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative group">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h4 className="text-xs lg:text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Growth Breakdown</h4>
          <div className="flex gap-2 text-[10px] font-bold">
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Men</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Women</span>
            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Children</span>
          </div>
        </div>
        <div className="h-64 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={churchAttendance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}} 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              <Bar dataKey="male" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="female" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="children" stackId="a" fill="#10b981" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Section - Desktop View */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Service History</h4>
          <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">Verified Data</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Men</th>
                <th className="px-8 py-5">Women</th>
                <th className="px-8 py-5">Children</th>
                <th className="px-8 py-5">Total Count</th>
                <th className="px-8 py-5 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...churchAttendance].reverse().map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800 text-sm">{record.date}</td>
                  <td className="px-8 py-5 text-slate-600 font-bold">{record.male}</td>
                  <td className="px-8 py-5 text-slate-600 font-bold">{record.female}</td>
                  <td className="px-8 py-5 text-slate-600 font-bold">{record.children}</td>
                  <td className="px-8 py-5 font-black text-indigo-700 text-base">{record.total}</td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-emerald-500 bg-emerald-50 w-8 h-8 rounded-full inline-flex items-center justify-center font-bold">↑</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Section - Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        <div className="px-2">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Past 5 Services</h4>
        </div>
        {[...churchAttendance].reverse().slice(0, 5).map(record => (
          <div key={record.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center">
              <div className="font-black text-slate-800 text-lg tracking-tight">{record.date}</div>
              <div className="text-emerald-500 font-black flex items-center gap-1 text-sm bg-emerald-50 px-3 py-1 rounded-full">
                <span>↑</span> 12%
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 text-center">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-tighter mb-1">Men</p>
                <p className="text-xs font-black text-blue-700">{record.male}</p>
              </div>
              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/50 text-center">
                <p className="text-[8px] font-black text-rose-400 uppercase tracking-tighter mb-1">Women</p>
                <p className="text-xs font-black text-rose-700">{record.female}</p>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 text-center">
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter mb-1">Children</p>
                <p className="text-xs font-black text-emerald-700">{record.children}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Attendance</span>
              <span className="text-xl font-black text-indigo-700 tracking-tighter">{record.total}</span>
            </div>
          </div>
        ))}
      </div>

      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Log Sunday Service</h2>
              <button 
                onClick={() => setShowLogModal(false)} 
                className="text-slate-400 hover:text-slate-600 text-xl p-2"
              >✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const m = parseInt(formData.get('male') as string);
              const f = parseInt(formData.get('female') as string);
              const c = parseInt(formData.get('children') as string);
              addAttendance({
                churchId: currentUser!.churchId,
                date: formData.get('date') as string,
                male: m,
                female: f,
                children: c,
                total: m + f + c
              });
              setShowLogModal(false);
            }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Service Date</label>
                <input 
                  required 
                  name="date" 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full border-slate-200 rounded-2xl p-4 bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all font-black text-sm" 
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-tight mb-2 text-center">Men</label>
                  <input 
                    required 
                    name="male" 
                    type="number" 
                    placeholder="0"
                    className="w-full border-slate-200 rounded-2xl p-4 bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all font-black text-center" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-tight mb-2 text-center">Women</label>
                  <input 
                    required 
                    name="female" 
                    type="number" 
                    placeholder="0"
                    className="w-full border-slate-200 rounded-2xl p-4 bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all font-black text-center" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-tight mb-2 text-center">Children</label>
                  <input 
                    required 
                    name="children" 
                    type="number" 
                    placeholder="0"
                    className="w-full border-slate-200 rounded-2xl p-4 bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all font-black text-center" 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 px-8 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all order-2 sm:order-1">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all order-1 sm:order-2">Record Count</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
