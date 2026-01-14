
import React from 'react';
import { useApp } from '../store';

const SuperAdmin: React.FC = () => {
  const { churches, users, attendance, firstTimers } = useApp();

  const totalUsers = users.length;
  const totalEntries = attendance.length;
  const totalFirstTimers = firstTimers.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-2xl text-white">
          <p className="text-indigo-100 font-medium mb-1">Total Churches</p>
          <h2 className="text-4xl font-bold">{churches.length}</h2>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-1">Active Users</p>
          <h2 className="text-4xl font-bold text-slate-800">{totalUsers}</h2>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-1">Global Database Size</p>
          <h2 className="text-4xl font-bold text-slate-800">{totalFirstTimers + totalEntries} <span className="text-sm text-slate-400 font-normal">Records</span></h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b">
          <h3 className="text-lg font-bold text-slate-800">Church Registration Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-8 py-4">Church Name</th>
                <th className="px-8 py-4">Location</th>
                <th className="px-8 py-4">Created At</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {churches.map(church => (
                <tr key={church.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-indigo-900">{church.name}</td>
                  <td className="px-8 py-4 text-slate-600">{church.location}</td>
                  <td className="px-8 py-4 text-slate-500">{church.createdAt}</td>
                  <td className="px-8 py-4 text-right">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
