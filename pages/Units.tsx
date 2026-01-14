
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole, Unit, User } from '../types';

const Units: React.FC = () => {
  const { units, currentUser, users, addUnit, updateUnit, deleteUnit } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const churchUnits = units.filter(u => u.churchId === currentUser?.churchId);
  const churchUsers = users.filter(u => u.churchId === currentUser?.churchId && u.status === 'APPROVED');
  
  const isManagement = currentUser?.role === UserRole.CHURCH_ADMIN;

  const handleCreateOrUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const selectedHeads = Array.from(formData.getAll('headIds') as string[]);

    if (editingUnit) {
      updateUnit(editingUnit.id, { name, headIds: selectedHeads });
    } else {
      addUnit({
        churchId: currentUser!.churchId,
        name,
        headIds: selectedHeads
      });
    }
    setShowAddModal(false);
    setEditingUnit(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Church Units</h3>
          <p className="text-slate-500">Organize your congregation departments and leadership</p>
        </div>
        {isManagement && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-semibold flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add New Unit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {churchUnits.map(unit => {
          const unitHeads = churchUsers.filter(u => unit.headIds.includes(u.id));
          
          return (
            <div key={unit.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                  <span className="text-2xl">🏛️</span>
                </div>
                {isManagement && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingUnit(unit);
                        setShowAddModal(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the ${unit.name} unit?`)) {
                          deleteUnit(unit.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              <h4 className="text-xl font-bold text-slate-800 mb-1">{unit.name}</h4>
              <p className="text-sm text-slate-500 mb-6">{unit.headIds.length} Assigned Leaders</p>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leadership Team</p>
                <div className="flex -space-x-2">
                  {unitHeads.length > 0 ? unitHeads.map(head => (
                    <div 
                      key={head.id} 
                      title={head.fullName}
                      className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm"
                    >
                      {head.fullName.charAt(0)}
                    </div>
                  )) : (
                    <span className="text-xs text-slate-400 italic">No heads assigned</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(showAddModal || editingUnit) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingUnit ? 'Edit Unit' : 'Create New Unit'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUnit(null);
                }} 
                className="text-slate-400 hover:text-slate-600 text-xl"
              >✕</button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unit Name</label>
                <input 
                  required 
                  name="name" 
                  defaultValue={editingUnit?.name}
                  placeholder="e.g., Audio Visual Department" 
                  className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border bg-slate-50" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Unit Heads</label>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-1">
                  {churchUsers.map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                      <input 
                        type="checkbox" 
                        name="headIds" 
                        value={user.id}
                        defaultChecked={editingUnit?.headIds.includes(user.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      <div className="text-sm font-medium text-slate-700">{user.fullName}</div>
                    </label>
                  ))}
                  {churchUsers.length === 0 && (
                    <p className="text-center py-4 text-xs text-slate-400">No approved workers available</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUnit(null);
                  }} 
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold"
                >Cancel</button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100"
                >
                  {editingUnit ? 'Save Changes' : 'Create Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
