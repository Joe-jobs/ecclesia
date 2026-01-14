
import React, { useState } from 'react';
import { useApp } from '../store';
import { TaskStatus, Priority, UserRole, ActionPlan } from '../types';

const ActionPlans: React.FC = () => {
  const { tasks, currentUser, users, units, addTask, updateTask } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const isManagement = currentUser?.role === UserRole.CHURCH_ADMIN || currentUser?.role === UserRole.UNIT_HEAD;

  const churchTasks = tasks.filter(t => t.churchId === currentUser?.churchId);
  const filteredTasks = churchTasks.filter(t => {
    const matchesFilter = 
      filter === 'ALL' || 
      (filter === 'PENDING' && t.status !== TaskStatus.DONE) || 
      (filter === 'DONE' && t.status === TaskStatus.DONE);
    
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isVisibleToUser = isManagement || t.assignedTo === currentUser?.id;

    return matchesFilter && matchesSearch && isVisibleToUser;
  });

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'bg-red-100 text-red-700 border-red-200';
      case Priority.MEDIUM: return 'bg-amber-100 text-amber-700 border-amber-200';
      case Priority.LOW: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (s: TaskStatus) => {
    switch (s) {
      case TaskStatus.DONE: return 'bg-emerald-100 text-emerald-700';
      case TaskStatus.SUSPENDED: return 'bg-slate-100 text-slate-600';
      case TaskStatus.IN_PROGRESS: return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Action Plans</h3>
          <p className="text-sm text-slate-500">Coordinate tasks and unit operations</p>
        </div>
        
        {isManagement && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-semibold flex items-center gap-2 w-fit"
          >
            <span className="text-lg">+</span> Create New Plan
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-fit">
          {(['ALL', 'PENDING', 'DONE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f === 'ALL' ? 'All Plans' : f === 'PENDING' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-400">
                Ends: {task.endDate}
              </div>
            </div>

            <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
            <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">{task.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                  {users.find(u => u.id === task.assignedTo)?.fullName.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned To</p>
                  <p className="text-xs font-bold text-slate-700">{users.find(u => u.id === task.assignedTo)?.fullName || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {task.status !== TaskStatus.DONE && (
                  <button 
                    onClick={() => updateTask(task.id, TaskStatus.DONE)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors title='Mark as Done'"
                  >
                    ✓
                  </button>
                )}
                {task.status !== TaskStatus.SUSPENDED && task.status !== TaskStatus.DONE && (
                  <button 
                    onClick={() => updateTask(task.id, TaskStatus.SUSPENDED)}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors title='Suspend'"
                  >
                    ⏸
                  </button>
                )}
                {task.status === TaskStatus.SUSPENDED && (
                  <button 
                    onClick={() => updateTask(task.id, TaskStatus.IN_PROGRESS)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors title='Resume'"
                  >
                    ▶
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="lg:col-span-2 py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-4xl mb-4 text-slate-300">📋</div>
            <p className="text-slate-500 font-medium">No action plans found matching your criteria.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">New Action Plan</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addTask({
                churchId: currentUser!.churchId,
                unitId: formData.get('unitId') as string,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                startDate: new Date().toISOString().split('T')[0],
                endDate: formData.get('endDate') as string,
                assignedTo: formData.get('assignedTo') as string,
                priority: formData.get('priority') as Priority,
                status: TaskStatus.IN_PROGRESS
              });
              setShowAddModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plan Title</label>
                <input required name="title" type="text" placeholder="e.g., Media Setup for Outreach" className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border bg-slate-50" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea required name="description" rows={3} placeholder="Provide details about the task..." className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border bg-slate-50"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Unit</label>
                  <select name="unitId" required className="w-full border-slate-200 rounded-xl p-3 border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {units.filter(u => u.churchId === currentUser?.churchId).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Deadline</label>
                  <input required name="endDate" type="date" className="w-full border-slate-200 rounded-xl p-3 border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned To</label>
                  <select name="assignedTo" required className="w-full border-slate-200 rounded-xl p-3 border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {users.filter(u => u.churchId === currentUser?.churchId && u.status === 'APPROVED').map(u => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select name="priority" required className="w-full border-slate-200 rounded-xl p-3 border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={Priority.LOW}>Low</option>
                    <option value={Priority.MEDIUM}>Medium</option>
                    <option value={Priority.HIGH}>High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 transition-all">Create Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlans;
