
import React, { useState } from 'react';
import { useApp, EXCHANGE_RATES } from '../store';
import { UserRole, Transaction, Budget, Currency } from '../types';

const Accounting: React.FC = () => {
  const { 
    transactions, budgets, currentUser, users, currentChurch,
    addTransaction, addBudget, toggleAccountingAccess, setChurchCurrency 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'BUDGETS' | 'PERMISSIONS'>('OVERVIEW');
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [converting, setConverting] = useState(false);

  const isAdmin = currentUser?.role === UserRole.CHURCH_ADMIN;
  const currencySymbol = currentChurch?.currency || Currency.USD;
  
  const churchTx = transactions.filter(t => t.churchId === currentUser?.churchId);
  const churchBudgets = budgets.filter(b => b.churchId === currentUser?.churchId);
  const churchWorkers = users.filter(u => u.churchId === currentUser?.churchId && u.role === UserRole.WORKER && u.status === 'APPROVED');

  const totalIncome = churchTx.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = churchTx.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddTx = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addTransaction({
      churchId: currentUser!.churchId,
      type: formData.get('type') as 'INCOME' | 'EXPENSE',
      category: formData.get('category') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      recordedBy: currentUser!.id
    });
    setShowTxModal(false);
  };

  const handleAddBudget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addBudget({
      churchId: currentUser!.churchId,
      category: formData.get('category') as string,
      allocatedAmount: parseFloat(formData.get('amount') as string),
      spentAmount: 0,
      period: formData.get('period') as string
    });
    setShowBudgetModal(false);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    if (currentChurch && currentChurch.currency !== newCurrency) {
      setConverting(true);
      setTimeout(() => {
        setChurchCurrency(currentChurch.id, newCurrency);
        setConverting(false);
      }, 600);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 pb-20 relative px-1 sm:px-0">
      {converting && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
           <p className="text-indigo-950 font-black text-sm uppercase tracking-[0.3em] px-8 text-center leading-relaxed">Syncing Financial Vault...</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">Financial Treasury</h3>
          <p className="text-xs lg:text-base text-slate-500 font-medium max-w-md">Overseeing the stewardship of church assets.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center">
            {[Currency.USD, Currency.NGN, Currency.GBP].map(curr => (
              <button
                key={curr}
                onClick={() => handleCurrencyChange(curr)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black transition-all ${currencySymbol === curr ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {curr}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowTxModal(true)}
            className="bg-indigo-600 text-white px-6 py-4 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="text-lg">💰</span> Add Entry
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-max min-w-full sm:min-w-0">
          {(['OVERVIEW', 'TRANSACTIONS', 'BUDGETS', 'PERMISSIONS'] as const).map((t) => (
            (t === 'PERMISSIONS' && !isAdmin) ? null : (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 lg:px-8 py-3 rounded-xl text-[9px] lg:text-xs font-black transition-all whitespace-nowrap tracking-widest uppercase ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t}
              </button>
            )
          ))}
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-slate-900 p-6 lg:p-12 rounded-[2rem] lg:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-8 opacity-10 text-8xl italic font-black group-hover:scale-110 transition-transform duration-1000 select-none">
                {currencySymbol}
              </div>
              <p className="text-indigo-400 font-black uppercase tracking-widest text-[9px] mb-4">Net Balance</p>
              <h2 className="text-3xl lg:text-5xl font-black tracking-tighter truncate leading-tight">
                {currencySymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-white p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-emerald-500 font-black uppercase tracking-widest text-[9px] mb-2">Total Inflow</p>
              <h2 className="text-2xl lg:text-3xl font-black text-emerald-600 tracking-tighter truncate">
                +{currencySymbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-white p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-rose-500 font-black uppercase tracking-widest text-[9px] mb-2">Total Outflow</p>
              <h2 className="text-2xl lg:text-3xl font-black text-rose-600 tracking-tighter truncate">
                -{currencySymbol}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Budgets Panel */}
            <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budgets</h4>
                </div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">📊</div>
              </div>
              <div className="space-y-8">
                {churchBudgets.map(b => {
                  const percent = b.allocatedAmount > 0 ? Math.min((b.spentAmount / b.allocatedAmount) * 100, 100) : 0;
                  const isOver = b.spentAmount > b.allocatedAmount;
                  return (
                    <div key={b.id} className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                        <span className="text-slate-800">{b.category}</span>
                        <span className={isOver ? 'text-rose-600' : 'text-slate-500'}>
                          {Math.round(percent)}% Used
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-700 rounded-full ${isOver ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {churchBudgets.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs italic">No active budgets.</div>
                )}
              </div>
            </div>

            {/* Recent History Panel */}
            <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h4>
                <button onClick={() => setActiveTab('TRANSACTIONS')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {churchTx.slice(0, 4).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-sm ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {tx.type === 'INCOME' ? '↓' : '↑'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1">{tx.description}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 font-black text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {churchTx.length === 0 && (
                   <div className="text-center py-10 text-slate-400 text-xs italic">No transactions found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Narration</th>
                    <th className="px-8 py-5">Classification</th>
                    <th className="px-8 py-5 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {churchTx.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-xs font-bold text-slate-500">{tx.date}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900 truncate max-w-[300px]">{tx.description}</td>
                      <td className="px-8 py-4">
                         <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-tight border ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className={`px-8 py-4 text-right font-black text-base ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {churchTx.map(tx => (
              <div key={tx.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-base truncate leading-tight mb-1">{tx.description}</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</p>
                  </div>
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.type === 'INCOME' ? '↓' : '↑'}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                   <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {tx.category}
                  </span>
                  <span className={`font-black text-lg tracking-tight ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'BUDGETS' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Caps</h4>
            <button 
              onClick={() => setShowBudgetModal(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md active:scale-95"
            >
              Set Budget
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {churchBudgets.map(b => (
              <div key={b.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 p-8 opacity-5 text-6xl group-hover:scale-125 transition-transform duration-1000">🏦</div>
                <h5 className="font-black text-slate-900 text-xl tracking-tight uppercase mb-1">{b.category}</h5>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-6">{b.period}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-black text-slate-950">{currencySymbol}{Math.round(b.spentAmount).toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">of {currencySymbol}{Math.round(b.allocatedAmount).toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                   <div 
                    className={`h-full transition-all duration-700 rounded-full ${b.spentAmount > b.allocatedAmount ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                    style={{ width: `${Math.min((b.spentAmount / b.allocatedAmount) * 100, 100)}%` }}
                   ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'PERMISSIONS' && isAdmin && (
        <div className="bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
           <div className="p-8 lg:p-12 border-b border-slate-100 bg-slate-50/30">
             <h4 className="text-2xl font-black text-slate-900 tracking-tight">Access Control</h4>
             <p className="text-xs lg:text-sm text-slate-500 font-medium mt-2">Grant verified workers visibility into church financials.</p>
           </div>
           <div className="divide-y divide-slate-100">
             {churchWorkers.map(user => (
               <div key={user.id} className="flex flex-col sm:flex-row items-center justify-between p-6 lg:p-10 gap-6">
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 shrink-0">
                     {user.fullName.charAt(0)}
                   </div>
                   <div className="min-w-0">
                     <p className="text-base font-black text-slate-900 truncate leading-tight">{user.fullName}</p>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.email}</p>
                   </div>
                 </div>
                 <button 
                  onClick={() => toggleAccountingAccess(user.id)}
                  className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md ${user.hasAccountingAccess ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}
                 >
                   {user.hasAccountingAccess ? 'REVOKE ACCESS' : 'GRANT ACCESS'}
                 </button>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Entry Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[95vh] no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">New Registry</h2>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400 p-2">✕</button>
            </div>
            
            <form onSubmit={handleAddTx} className="space-y-6">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl shadow-inner">
                 <label className="cursor-pointer">
                   <input type="radio" name="type" value="INCOME" defaultChecked className="hidden peer" />
                   <div className="py-3 text-center rounded-xl text-[10px] font-black tracking-widest transition-all peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-md text-slate-400 uppercase">INCOME</div>
                 </label>
                 <label className="cursor-pointer">
                   <input type="radio" name="type" value="EXPENSE" className="hidden peer" />
                   <div className="py-3 text-center rounded-xl text-[10px] font-black tracking-widest transition-all peer-checked:bg-white peer-checked:text-rose-600 peer-checked:shadow-md text-slate-400 uppercase">EXPENSE</div>
                 </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Category</label>
                  <select name="category" required className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 text-xs font-black appearance-none focus:outline-none focus:border-indigo-500">
                    <option value="Tithes">Tithes</option>
                    <option value="Offering">Offering</option>
                    <option value="Donation">Donation</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Amount</label>
                  <input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 text-sm font-black focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Date</label>
                <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 text-xs font-black focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Narration</label>
                <textarea required name="description" rows={3} placeholder="Memo for audit..." className="w-full border-2 border-slate-100 rounded-xl p-4 bg-slate-50 text-xs font-medium focus:outline-none focus:border-indigo-500"></textarea>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowTxModal(false)} className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 font-black text-[9px] uppercase tracking-widest transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-[9px] uppercase tracking-widest shadow-xl transition-all">Submit Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-6 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Fiscal Objective</h2>
              <button onClick={() => setShowBudgetModal(false)} className="text-slate-400 p-2">✕</button>
            </div>
            
            <form onSubmit={handleAddBudget} className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">Cost Center</label>
                <select name="category" required className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 text-xs font-black appearance-none focus:outline-none focus:border-indigo-500">
                  <option value="Maintenance">Maintenance</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Admin">Admin</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Hospitality">Hospitality</option>
                </select>
              </div>

              <div className="space-y-4">
                <input required name="amount" type="number" placeholder="Allocation Ceiling" className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 text-sm font-black focus:outline-none focus:border-indigo-500" />
                <input required name="period" type="text" placeholder="Cycle (e.g., Monthly - Jun 24)" className="w-full border-2 border-slate-100 rounded-xl p-3.5 bg-slate-50 text-xs font-black focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 px-4 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[9px] uppercase transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[9px] uppercase shadow-lg transition-all">Deploy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
