
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole, Property, Unit } from '../types';

const Properties: React.FC = () => {
  const { properties, units, currentUser, addProperty, updateProperty, deleteProperty } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('ALL');

  const isAdmin = currentUser?.role === UserRole.CHURCH_ADMIN;
  const isUnitHead = currentUser?.role === UserRole.UNIT_HEAD;

  const churchProps = properties.filter(p => p.churchId === currentUser?.churchId);
  const filteredProps = churchProps.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'ALL' || p.unitId === unitFilter;
    
    // Logic for visibility
    if (isAdmin) return matchesSearch && matchesUnit;
    if (isUnitHead) return p.unitId === currentUser?.unitId && matchesSearch;
    return false;
  });

  const stats = {
    totalQuantity: filteredProps.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
    totalFunctional: filteredProps.reduce((acc, curr) => acc + (curr.functionalQty || 0), 0),
    totalMaintenance: filteredProps.reduce((acc, curr) => acc + (curr.maintenanceQty || 0), 0),
    totalDamaged: filteredProps.reduce((acc, curr) => acc + (curr.damagedQty || 0), 0)
  };

  const handleCreateOrUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const func = parseInt(formData.get('functionalQty') as string) || 0;
    const maint = parseInt(formData.get('maintenanceQty') as string) || 0;
    const dmg = parseInt(formData.get('damagedQty') as string) || 0;
    const unitId = formData.get('unitId') as string;

    const payload = {
      churchId: currentUser!.churchId,
      name,
      functionalQty: func,
      maintenanceQty: maint,
      damagedQty: dmg,
      quantity: func + maint + dmg,
      unitId,
    };

    if (editingProp) {
      updateProperty(editingProp.id, payload);
    } else {
      addProperty(payload);
    }
    setShowAddModal(false);
    setEditingProp(null);
  };

  return (
    <div className="space-y-6 lg:space-y-10 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl lg:text-3xl font-black text-slate-800 tracking-tight">Church Inventory</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Managing physical assets and departmental equipment</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Add New Asset
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-slate-900 p-5 lg:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
          <p className="text-[9px] lg:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Total Inventory</p>
          <p className="text-2xl lg:text-4xl font-black tracking-tighter">{stats.totalQuantity}</p>
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl group-hover:scale-110 transition-transform">📦</div>
        </div>
        <div className="bg-white p-5 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Functional</p>
          <p className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tighter">{stats.totalFunctional}</p>
        </div>
        <div className="bg-white p-5 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[9px] lg:text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Maintenance</p>
          <p className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tighter">{stats.totalMaintenance}</p>
        </div>
        <div className="bg-white p-5 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[9px] lg:text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">Damaged</p>
          <p className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tighter">{stats.totalDamaged}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search equipment..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none text-sm font-bold tracking-tight transition-all"
            />
          </div>
          {isAdmin && (
            <select 
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full sm:w-56 p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:outline-none text-xs font-black uppercase tracking-widest cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {units.filter(u => u.churchId === currentUser?.churchId).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <th className="px-8 py-5">Asset Description</th>
                <th className="px-8 py-5 text-center">Department</th>
                <th className="px-8 py-5 text-center">Status Breakdown</th>
                <th className="px-8 py-5 text-center">Total</th>
                <th className="px-8 py-5 text-right">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProps.map(prop => (
                <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 text-sm lg:text-base tracking-tight">{prop.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UID: {prop.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                      {units.find(u => u.id === prop.unitId)?.name || 'Central Registry'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center" title="Functional">
                        <p className="text-[10px] font-black text-emerald-500 leading-none">{prop.functionalQty || 0}</p>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Func</p>
                      </div>
                      <div className="text-center" title="Maintenance">
                        <p className="text-[10px] font-black text-amber-500 leading-none">{prop.maintenanceQty || 0}</p>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Maint</p>
                      </div>
                      <div className="text-center" title="Damaged">
                        <p className="text-[10px] font-black text-rose-500 leading-none">{prop.damagedQty || 0}</p>
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Dmg</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-base font-black text-slate-600">{prop.quantity}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => {
                          setEditingProp(prop);
                          setShowAddModal(true);
                        }}
                        className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
                      >✏️</button>
                      <button 
                        onClick={() => {
                          if (confirm('Permanently remove this asset from registry?')) {
                            deleteProperty(prop.id);
                          }
                        }}
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredProps.map(prop => (
            <div key={prop.id} className="p-6 space-y-5 group animate-in fade-in duration-300">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-slate-800 text-lg tracking-tight truncate">{prop.name}</h4>
                  <p className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg inline-block mt-1">
                    {units.find(u => u.id === prop.unitId)?.name || 'Central Registry'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingProp(prop); setShowAddModal(true); }}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 shadow-sm"
                  >✏️</button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Total</p>
                  <p className="text-sm font-black text-slate-800">{prop.quantity}</p>
                </div>
                <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 text-center">
                  <p className="text-[7px] font-black text-emerald-500 uppercase mb-1">Func</p>
                  <p className="text-sm font-black text-emerald-600">{prop.functionalQty || 0}</p>
                </div>
                <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50 text-center">
                  <p className="text-[7px] font-black text-amber-500 uppercase mb-1">Maint</p>
                  <p className="text-sm font-black text-amber-600">{prop.maintenanceQty || 0}</p>
                </div>
                <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/50 text-center">
                  <p className="text-[7px] font-black text-rose-500 uppercase mb-1">Dmg</p>
                  <p className="text-sm font-black text-rose-600">{prop.damagedQty || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProps.length === 0 && (
          <div className="py-24 text-center bg-slate-50/50">
            <div className="flex flex-col items-center">
               <span className="text-6xl mb-6 grayscale opacity-20">📦</span>
               <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Registry Empty</p>
               <p className="text-sm text-slate-400 mt-2 font-medium">No assets matching your search found.</p>
            </div>
          </div>
        )}
      </div>

      {(showAddModal || editingProp) && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 lg:p-12 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                {editingProp ? 'Modify Registry' : 'Asset Acquisition'}
              </h2>
              <button 
                onClick={() => { setShowAddModal(false); setEditingProp(null); }} 
                className="text-slate-400 hover:text-slate-600 text-xl p-2"
              >✕</button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Asset Designation</label>
                <input 
                  required 
                  name="name" 
                  defaultValue={editingProp?.name}
                  placeholder="e.g., Mackie Thump Go 8-inch Speaker" 
                  className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold shadow-inner" 
                />
              </div>

              <div>
                <p className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inventory Breakdown</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-emerald-600 uppercase text-center">Functional</label>
                    <input 
                      required 
                      type="number"
                      name="functionalQty" 
                      min="0"
                      defaultValue={editingProp?.functionalQty || 0}
                      className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none border bg-slate-50 text-sm font-black text-center shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-amber-600 uppercase text-center">Maintenance</label>
                    <input 
                      required 
                      type="number"
                      name="maintenanceQty" 
                      min="0"
                      defaultValue={editingProp?.maintenanceQty || 0}
                      className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:outline-none border bg-slate-50 text-sm font-black text-center shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-rose-600 uppercase text-center">Damaged</label>
                    <input 
                      required 
                      type="number"
                      name="damagedQty" 
                      min="0"
                      defaultValue={editingProp?.damagedQty || 0}
                      className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 focus:outline-none border bg-slate-50 text-sm font-black text-center shadow-inner" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Custodial Department</label>
                <select 
                  name="unitId" 
                  disabled={isUnitHead}
                  defaultValue={editingProp?.unitId || (isUnitHead ? currentUser?.unitId : '')}
                  required
                  className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-xs font-black uppercase tracking-widest shadow-inner cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>Select Responsible Unit</option>
                  {units.filter(u => u.churchId === currentUser?.churchId).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingProp(null); }} className="flex-1 px-8 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all order-2 sm:order-1">Discard</button>
                <button type="submit" className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all order-1 sm:order-2">
                  {editingProp ? 'Confirm Changes' : 'Record Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
