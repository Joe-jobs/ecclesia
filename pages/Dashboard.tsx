
import React, { useState } from 'react';
import { useApp } from '../store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TaskStatus, UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { currentUser, currentChurch, attendance, firstTimers, tasks, announcements, events, users, approveUser } = useApp();
  const [copied, setCopied] = useState(false);

  const churchAttendance = attendance.filter(a => a.churchId === currentUser?.churchId);
  const pendingTasks = tasks.filter(t => t.assignedTo === currentUser?.id && t.status !== TaskStatus.DONE);
  const churchAnnouncements = announcements.filter(a => a.churchId === currentUser?.churchId).slice(0, 3);
  const pendingApprovals = users.filter(u => u.churchId === currentUser?.churchId && u.status === 'PENDING');

  const stats = [
    { label: 'Avg Attendance', value: churchAttendance.length > 0 ? Math.round(churchAttendance.reduce((acc, curr) => acc + curr.total, 0) / churchAttendance.length) : 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total First Timers', value: firstTimers.filter(ft => ft.churchId === currentUser?.churchId).length, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Tasks', value: pendingTasks.length, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Upcoming Events', value: events.length, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleCopyLink = () => {
    if (!currentChurch) return;
    const link = `${window.location.origin}${window.location.pathname}#join-worker?churchId=${currentChurch.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] lg:text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-xl lg:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4">Attendance Trends</h3>
          <div className="h-48 lg:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={churchAttendance}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide={window.innerWidth < 640} tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Management (Admin Only) */}
        {currentUser?.role === UserRole.CHURCH_ADMIN && (
          <div className="space-y-6">
            {/* Invite Link Card */}
            <div className="bg-indigo-900 p-6 rounded-2xl shadow-xl text-white">
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">Worker Onboarding</h3>
              <p className="text-xs text-indigo-200 mb-4">Share this link with new workers to allow them to register for your church units.</p>
              <button 
                onClick={handleCopyLink}
                className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-900 hover:bg-indigo-50'}`}
              >
                {copied ? '✓ Link Copied' : '📋 Copy Invite Link'}
              </button>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4">Pending Approvals</h3>
              {pendingApprovals.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[300px]">
                  {pendingApprovals.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <button 
                        onClick={() => approveUser(user.id)}
                        className="shrink-0 text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors uppercase tracking-widest"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
                  <span className="text-3xl mb-2">✅</span>
                  <p className="text-xs font-medium uppercase tracking-widest">No pending workers.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements */}
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
           <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4">Latest Updates</h3>
           <div className="space-y-4">
             {churchAnnouncements.map(ann => (
               <div key={ann.id} className="border-l-4 border-indigo-500 pl-4 py-1">
                 <p className="text-sm font-bold text-slate-800 truncate">{ann.title}</p>
                 <p className="text-xs text-slate-600 line-clamp-2">{ann.body}</p>
               </div>
             ))}
             {churchAnnouncements.length === 0 && <p className="text-xs text-slate-400 italic">No recent announcements.</p>}
           </div>
        </div>

        {/* Quick Tasks */}
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4">My Tasks</h3>
           {pendingTasks.length > 0 ? (
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b">
                      <th className="pb-2">Task</th>
                      <th className="pb-2 hidden sm:table-cell">Priority</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingTasks.map(task => (
                      <tr key={task.id} className="text-xs hover:bg-slate-50">
                        <td className="py-3 pr-2">
                           <p className="font-bold text-slate-800 truncate max-w-[150px] sm:max-w-none">{task.title}</p>
                           <p className="sm:hidden text-[10px] text-slate-400">{task.priority} • {task.endDate}</p>
                        </td>
                        <td className="py-3 hidden sm:table-cell">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            task.priority === 'High' ? 'bg-red-50 text-red-600' : 
                            task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 font-black text-[10px] uppercase">Complete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           ) : (
             <p className="text-slate-400 text-xs py-4 italic">No pending tasks. Great job!</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
