
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole, ChurchEvent } from '../types';

const Events: React.FC = () => {
  const { events, currentUser, addEvent, updateEvent, deleteEvent } = useApp();
  const [view, setView] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);

  const isAdmin = currentUser?.role === UserRole.CHURCH_ADMIN;
  const isUnitHead = currentUser?.role === UserRole.UNIT_HEAD;
  const canManage = isAdmin || isUnitHead;

  const churchEvents = events.filter(e => e.churchId === currentUser?.churchId);
  const sortedEvents = [...churchEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calendar Logic
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleCreateOrUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;

    if (editingEvent) {
      updateEvent(editingEvent.id, { title, date, location, description });
    } else {
      addEvent({
        churchId: currentUser!.churchId,
        title,
        date,
        location,
        description
      });
    }
    setShowAddModal(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-800">Events & Calendar</h3>
          <p className="text-sm text-slate-500">Scheduled activities and special services</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm grow md:grow-0">
            <button 
              onClick={() => setView('LIST')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] lg:text-xs font-black transition-all ${view === 'LIST' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              List View
            </button>
            <button 
              onClick={() => setView('CALENDAR')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] lg:text-xs font-black transition-all ${view === 'CALENDAR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Calendar
            </button>
          </div>
          {canManage && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white p-2.5 lg:px-6 lg:py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-semibold flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> <span className="hidden lg:inline">Add Event</span>
            </button>
          )}
        </div>
      </div>

      {view === 'LIST' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {sortedEvents.map(event => (
            <div key={event.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 lg:p-6 group hover:border-indigo-300 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 text-indigo-600 p-2.5 lg:p-3 rounded-2xl">
                   <span className="text-lg lg:text-xl">📅</span>
                </div>
                {canManage && (
                  <div className="flex gap-1 lg:gap-2">
                    <button 
                      onClick={() => {
                        setEditingEvent(event);
                        setShowAddModal(true);
                      }}
                      className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Cancel this event?')) deleteEvent(event.id);
                      }}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              
              <h4 className="text-base lg:text-lg font-bold text-slate-800 mb-2 truncate">{event.title}</h4>
              <p className="text-xs lg:text-sm text-slate-500 mb-6 flex-1 line-clamp-3">{event.description}</p>
              
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-[10px] lg:text-xs text-slate-600">
                  <span className="opacity-60 shrink-0">🕒</span>
                  <span className="font-semibold truncate">{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] lg:text-xs text-slate-600">
                  <span className="opacity-60 shrink-0">📍</span>
                  <span className="font-semibold truncate">{event.location}</span>
                </div>
              </div>
            </div>
          ))}
          {sortedEvents.length === 0 && (
            <div className="col-span-full py-20 lg:py-24 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <span className="text-4xl lg:text-5xl mb-4 block">🏜️</span>
               <p className="text-slate-500 font-bold text-sm lg:text-base">No upcoming events found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h4 className="text-lg lg:text-xl font-black text-slate-800">{monthNames[currentMonth]} {currentYear}</h4>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handlePrevMonth} className="flex-1 sm:flex-none p-2 hover:bg-slate-100 rounded-lg border border-slate-100 sm:border-none">◀</button>
              <button onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }} className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-lg">Today</button>
              <button onClick={handleNextMonth} className="flex-1 sm:flex-none p-2 hover:bg-slate-100 rounded-lg border border-slate-100 sm:border-none">▶</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 lg:gap-4 overflow-x-auto min-w-[300px]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 pb-2 lg:pb-4 shrink-0">{day}</div>
            ))}
            
            {Array.from({ length: startDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square shrink-0"></div>
            ))}

            {Array.from({ length: daysInMonth(currentMonth, currentYear) }).map((_, i) => {
              const dayNum = i + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = churchEvents.filter(e => e.date.startsWith(dateString));
              const isToday = today.getDate() === dayNum && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

              return (
                <div key={dayNum} className={`aspect-square border border-slate-50 rounded-lg lg:rounded-2xl flex flex-col items-center justify-center relative transition-colors cursor-default shrink-0 ${isToday ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50/50'}`}>
                  <span className={`text-[10px] lg:text-sm font-bold ${isToday ? '' : 'text-slate-700'}`}>{dayNum}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 lg:mt-1">
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id} className={`w-0.5 h-0.5 lg:w-1 lg:h-1 rounded-full ${isToday ? 'bg-white' : 'bg-indigo-500'}`}></div>
                      ))}
                    </div>
                  )}
                  {dayEvents.length > 0 && (
                     <div className="absolute inset-0 opacity-0 lg:hover:opacity-100 bg-white/95 backdrop-blur-sm p-1 lg:p-2 rounded-lg lg:rounded-2xl flex flex-col justify-center items-center text-[8px] lg:text-[10px] text-slate-800 transition-opacity z-10 border border-indigo-100 pointer-events-none lg:pointer-events-auto">
                        {dayEvents.slice(0, 2).map(e => <p key={e.id} className="truncate w-full text-center font-bold">· {e.title}</p>)}
                        {dayEvents.length > 2 && <p className="font-black text-indigo-600 text-[6px] mt-0.5">+{dayEvents.length - 2} MORE</p>}
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {(showAddModal || editingEvent) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2rem] lg:rounded-[3rem] w-full max-w-xl p-6 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
                {editingEvent ? 'Edit Event' : 'Schedule Event'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEvent(null);
                }} 
                className="text-slate-400 hover:text-slate-600 text-xl p-2"
              >✕</button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-5 lg:space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Event Title</label>
                <input 
                  required 
                  name="title" 
                  defaultValue={editingEvent?.title}
                  placeholder="e.g., Annual Harvest Thanksgiving" 
                  className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    required 
                    name="date" 
                    type="date"
                    defaultValue={editingEvent?.date || new Date().toISOString().split('T')[0]}
                    className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Location</label>
                  <input 
                    required 
                    name="location" 
                    defaultValue={editingEvent?.location}
                    placeholder="Main Sanctuary..." 
                    className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-bold" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Event Description</label>
                <textarea 
                  required 
                  name="description" 
                  rows={4}
                  defaultValue={editingEvent?.description}
                  placeholder="Details about the service or activity..." 
                  className="w-full border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none border bg-slate-50 text-sm font-medium" 
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEvent(null);
                  }} 
                  className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all"
                >Cancel</button>
                <button 
                  type="submit" 
                  className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
