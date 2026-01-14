
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
    <div className="space-y-6 lg:space-y-10 pb-20 relative">
      {converting && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
           <p className="text-indigo-950 font-black text-sm uppercase tracking-[0.3em] px-8 text-center leading-relaxed">Syncing Financial Vault...</p>
        </div>
      )}

      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-2">
          <h3 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">Financial Treasury</h3>
          <p className="text-sm lg:text-base text-slate-500 font-medium max-w-md">Overseeing the stewardship of church assets and budgets.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/60 flex items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 hidden lg:block">Base</span>
            {[Currency.USD, Currency.NGN, Currency.GBP].map(curr => (
              <button
                key={curr}
                onClick={() => handleCurrencyChange(curr)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black transition-all ${currencySymbol === curr ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {curr}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowTxModal(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] hover:bg-indigo-700 transition shadow-2xl shadow-indigo-200 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
          >
            <span className="text-xl">💰</span> Add Entry
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar">
        <div className="flex bg-white p-1.5 rounded-[2rem] border border-slate-200 shadow-sm w-max min-w-full lg:min-w-0">
          {(['OVERVIEW', 'TRANSACTIONS', 'BUDGETS', 'PERMISSIONS'] as const).map((t) => (
            (t === 'PERMISSIONS' && !isAdmin) ? null : (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-8 py-3.5 rounded-2xl text-[10px] lg:text-xs font-black transition-all whitespace-nowrap tracking-[0.2em] uppercase ${activeTab === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t}
              </button>
            )
          ))}
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Dashboard Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-10 lg:p-14 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-200/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl italic font-black group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none">{currencySymbol}</div>
              <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6">Net Treasury Balance</p>
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter truncate leading-tight">
                {currencySymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[180px]">
              <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Cumulative Inflow</p>
              <h2 className="text-3xl lg:text-4xl font-black text-emerald-600 tracking-tighter truncate leading-none">+{currencySymbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              <div className="absolute -bottom-6 -right-6 opacity-5 text-9xl grayscale select-none">📈</div>
            </div>
            <div className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[180px]">
              <p className="text-rose-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Cumulative Outflow</p>
              <h2 className="text-3xl lg:text-4xl font-black text-rose-600 tracking-tighter truncate leading-none">-{currencySymbol}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              <div className="absolute -bottom-6 -right-6 opacity-5 text-9xl grayscale select-none">📉</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Budgets Utilization Panel */}
            <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Budget Monitoring</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Tracking departmental spending caps</p>
                </div>
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center font-bold text-2xl shadow-inner">📊</div>
              </div>
              <div className="space-y-12 flex-1">
                {churchBudgets.map(b => {
                  const percent = b.allocatedAmount > 0 ? Math.min((b.spentAmount / b.allocatedAmount) * 100, 100) : 0;
                  const isOver = b.spentAmount > b.allocatedAmount;
                  return (
                    <div key={b.id} className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">{b.category}</span>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-black ${isOver ? 'text-rose-600 bg-rose-50 px-3 py-1 rounded-xl' : 'text-slate-500 bg-slate-50 px-3 py-1 rounded-xl'}`}>
                            {currencySymbol}{Math.round(b.spentAmount).toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">/ {currencySymbol}{Math.round(b.allocatedAmount).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner p-1">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out rounded-full shadow-sm ${isOver ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {churchBudgets.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                    <span className="text-8xl mb-8 opacity-10">🏛️</span>
                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">No active budget allocations found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Registry History Panel */}
            <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Audit Trail</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Latest 5 registry entries</p>
                </div>
                <button onClick={() => setActiveTab('TRANSACTIONS')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 hover:bg-indigo-100 px-6 py-3 rounded-2xl transition-all">Audit Ledger →</button>
              </div>
              <div className="space-y-6 flex-1">
                {churchTx.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:border-indigo-100 hover:bg-white transition-all hover:shadow-2xl hover:shadow-slate-100">
                    <div className="flex items-center gap-6 min-w-0">
                      <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl shrink-0 flex items-center justify-center font-black text-xl shadow-inner ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {tx.type === 'INCOME' ? '↓' : '↑'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900 truncate tracking-tight leading-tight mb-2">{tx.description}</p>
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${tx.type === 'INCOME' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                            {tx.category}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{tx.date}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`shrink-0 font-black text-base lg:text-xl tracking-tighter pl-4 ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                {churchTx.length === 0 && (
                  <div className="text-center py-24 text-slate-300 italic flex flex-col items-center justify-center">
                     <span className="text-8xl block mb-8 opacity-10">📜</span>
                     <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Financial registry is current empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-500">
          {/* Desktop Tabular View */}
          <div className="hidden md:block bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <th className="px-12 py-10">Posting Date</th>
                    <th className="px-12 py-10">Registry Narration</th>
                    <th className="px-12 py-10">Classification</th>
                    <th className="px-12 py-10 text-right">Value ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {churchTx.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-12 py-8 text-xs font-black text-slate-500">{tx.date}</td>
                      <td className="px-12 py-8 text-sm font-black text-slate-900 tracking-tight">{tx.description}</td>
                      <td className="px-12 py-8">
                         <span className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] shadow-sm border ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className={`px-12 py-8 text-right font-black text-xl tracking-tighter ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Optimized Card Layout */}
          <div className="md:hidden space-y-6">
            {churchTx.map(tx => (
              <div key={tx.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-900 text-xl tracking-tight leading-tight mb-2 break-words">{tx.description}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{tx.date}</p>
                  </div>
                  <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.type === 'INCOME' ? '↓' : '↑'}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
                  <span className={`px-5 py-2 rounded-[1rem] text-[9px] font-black uppercase tracking-widest border ${tx.type === 'INCOME' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    {tx.category}
                  </span>
                  <span className={`text-2xl font-black tracking-tighter ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
            {churchTx.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
                <span className="text-9xl mb-10 block grayscale opacity-10">💸</span>
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Vault records not found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'BUDGETS' && (
        <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="flex justify-between items-center px-4">
            <div className="space-y-1">
              <h4 className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Spending Boundaries</h4>
              <p className="text-[10px] text-slate-400 font-medium">Define fiscal caps for departments</p>
            </div>
            <button 
              onClick={() => setShowBudgetModal(true)}
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition shadow-2xl shadow-indigo-200 active:scale-95"
            >
              Set Budget
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 px-1">
            {churchBudgets.map(b => (
              <div key={b.id} className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 text-8xl select-none group-hover:scale-125 transition-transform duration-1000">🏦</div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="min-w-0">
                    <h5 className="font-black text-slate-900 text-3xl tracking-tighter uppercase mb-1 truncate leading-none">{b.category}</h5>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{b.period}</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-10 flex-1 relative z-10">
                  <span className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter leading-none">{currencySymbol}{b.spentAmount.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-slate-400 pb-2.5 uppercase tracking-widest">of {currencySymbol}{b.allocatedAmount.toLocaleString()}</span>
                </div>
                <div className="h-7 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner p-1 relative z-10">
                   <div 
                    className={`h-full transition-all duration-1000 rounded-full shadow-lg ${b.spentAmount > b.allocatedAmount ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                    style={{ width: `${Math.min((b.spentAmount / b.allocatedAmount) * 100, 100)}%` }}
                   ></div>
                </div>
                <div className="mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 relative z-10">
                   <span>Resource Utilization</span>
                   <span className={b.spentAmount > b.allocatedAmount ? 'text-rose-600 px-3 py-1 bg-rose-50 rounded-xl shadow-sm' : 'text-indigo-600 px-3 py-1 bg-indigo-50 rounded-xl shadow-sm'}>
                    {Math.round((b.spentAmount / b.allocatedAmount) * 100)}%
                   </span>
                </div>
              </div>
            ))}
            {churchBudgets.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                <span className="text-9xl mb-10 block grayscale opacity-10">📉</span>
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.4em]">Zero active fiscal caps</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'PERMISSIONS' && isAdmin && (
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500 mx-1">
           <div className="p-10 lg:p-20 border-b border-slate-100 bg-slate-50/50">
             <h4 className="text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter leading-none">Authorization Portal</h4>
             <p className="text-sm lg:text-lg text-slate-500 font-medium mt-6 max-w-xl leading-relaxed">Designate verified personnel with accounting visibility or registry management rights for the church treasury.</p>
           </div>
           <div className="divide-y divide-slate-100">
             {churchWorkers.map(user => (
               <div key={user.id} className="flex flex-col sm:flex-row items-center justify-between p-10 lg:p-16 gap-10 hover:bg-slate-50/50 transition-colors group">
                 <div className="flex items-center gap-8 w-full sm:w-auto min-w-0">
                   <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-3xl text-indigo-600 shrink-0 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 ease-in-out">
                     {user.fullName.charAt(0)}
                   </div>
                   <div className="min-w-0">
                     <p className="text-2xl font-black text-slate-900 truncate tracking-tight mb-2 leading-none">{user.fullName}</p>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">{user.email}</p>
                   </div>
                 </div>
                 <button 
                  onClick={() => toggleAccountingAccess(user.id)}
                  className={`w-full sm:w-auto px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl ${user.hasAccountingAccess ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-slate-900 text-white shadow-slate-200'}`}
                 >
                   {user.hasAccountingAccess ? 'REVOKE ACCESS' : 'GRANT ACCESS'}
                 </button>
               </div>
             ))}
             {churchWorkers.length === 0 && (
               <div className="py-40 text-center">
                  <span className="text-8xl mb-10 block grayscale opacity-10">👥</span>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No approved personnel found for authorization</p>
               </div>
             )}
           </div>
        </div>
      )}

      {/* REFINED MODAL SYSTEM */}
      {showTxModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[200] p-4 lg:p-10">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-8 lg:p-16 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto no-scrollbar border border-white/20">
            <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter uppercase leading-none">Vault Registry</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">COMMIT NEW LEDGER ENTRY</p>
              </div>
              <button onClick={() => setShowTxModal(false)} className="bg-slate-100 text-slate-400 hover:text-slate-950 p-5 rounded-[1.5rem] transition-all active:scale-90">✕</button>
            </div>
            
            <form onSubmit={handleAddTx} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Ledger Type</label>
                <div className="grid grid-cols-2 gap-4 p-2 bg-slate-100 rounded-[2.5rem] shadow-inner border border-slate-200/50">
                   <label className="cursor-pointer">
                     <input type="radio" name="type" value="INCOME" defaultChecked className="hidden peer" />
                     <div className="py-5 text-center rounded-[2.2rem] text-[11px] font-black tracking-[0.25em] transition-all peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-2xl text-slate-400 uppercase">INCOME</div>
                   </label>
                   <label className="cursor-pointer">
                     <input type="radio" name="type" value="EXPENSE" className="hidden peer" />
                     <div className="py-5 text-center rounded-[2.2rem] text-[11px] font-black tracking-[0.25em] transition-all peer-checked:bg-white peer-checked:text-rose-600 peer-checked:shadow-2xl text-slate-400 uppercase">EXPENSE</div>
                   </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Classification</label>
                  <select name="category" required className="w-full border-2 border-slate-100 rounded-[1.5rem] p-5 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none bg-slate-50 text-sm font-black tracking-tight cursor-pointer appearance-none shadow-sm transition-all hover:bg-white">
                    <option value="Tithes">Tithes</option>
                    <option value="Offering">Offering</option>
                    <option value="Donation">Donation</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Amount ({currencySymbol})</label>
                  <input required name="amount" type="number" step="0.01" placeholder="0.00" className="w-full border-2 border-slate-100 rounded-[1.5rem] p-5 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none bg-slate-50 text-2xl font-black tracking-tighter shadow-sm transition-all hover:bg-white" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Posting Date</label>
                <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border-2 border-slate-100 rounded-[1.5rem] p-5 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none bg-slate-50 text-sm font-black shadow-sm transition-all hover:bg-white" />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Audit Narration</label>
                <textarea required name="description" rows={3} placeholder="Detailed registry memo for audit trails..." className="w-full border-2 border-slate-100 rounded-[1.5rem] p-6 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none bg-slate-50 text-sm font-medium shadow-sm leading-relaxed transition-all hover:bg-white"></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <button type="button" onClick={() => setShowTxModal(false)} className="flex-1 px-8 py-6 border-2 border-slate-100 text-slate-500 rounded-[2rem] hover:bg-slate-50 font-black text-[10px] uppercase tracking-[0.3em] transition-all order-2 sm:order-1 active:scale-95">Discard Entry</button>
                <button type="submit" className="flex-1 px-8 py-6 bg-indigo-600 text-white rounded-[2rem] hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 transition-all order-1 sm:order-2 active:scale-95">POST REGISTRY</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center z-[200] p-4 lg:p-10">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-8 lg:p-16 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter uppercase leading-none">Fiscal Objective</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DEPLOY NEW EXPENDITURE CAP</p>
              </div>
              <button onClick={() => setShowBudgetModal(false)} className="bg-slate-100 text-slate-400 hover:text-slate-950 p-5 rounded-[1.5rem] transition-all active:scale-90">✕</button>
            </div>
            
            <form onSubmit={handleAddBudget} className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Target Cost Center</label>
                <select name="category" required className="w-full border-2 border-slate-100 rounded-[1.5rem] p-5 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none bg-slate-50 text-sm font-black tracking-tight cursor-pointer appearance-none shadow-sm transition-all hover:bg-white">
                  <option value="Maintenance">Maintenance</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Admin">Admin</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Hospitality">Hospitality</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">Allocation Ceiling</label>
                  <input required name="amount" type="number" placeholder="5000" className="w-full border-2 border-slate-100 rounded-[1.5rem] p-5 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none bg-slate-50 text-2xl font-black tracking-tighter shadow-sm transition-all hover:bg-white" />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Fiscal Cycle</label>
                  <input required name="period" type="text" placeholder="Monthly - Jun 24" className="w-full border-2 border-slate-100 rounded-[1.5rem] p-5 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 focus:outline-none bg-slate-50 text-sm font-black tracking-tight shadow-sm transition-all hover:bg-white" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 px-8 py-6 border-2 border-slate-100 text-slate-500 rounded-[2rem] hover:bg-slate-50 font-black text-[10px] uppercase tracking-[0.3em] transition-all order-2 sm:order-1 active:scale-95">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-6 bg-indigo-600 text-white rounded-[2rem] hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 transition-all order-1 sm:order-2 active:scale-95">DEPLOY BUDGET</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
