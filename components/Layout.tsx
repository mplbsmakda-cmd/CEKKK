
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../authContext';
import { useStore } from '../store';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { Bell, Search, X, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { Button } from './ui/Shared';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const { notifications, markAsRead, clearNotifications } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Initialize notifications listener
  useRealtimeNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full w-96 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <Search size={16} className="text-slate-400 group-focus-within:text-indigo-500" />
            <input 
              type="text" 
              placeholder="Cari materi, tugas, atau nilai..." 
              className="bg-transparent border-none outline-none ml-2 w-full text-sm"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-800">Notifikasi</h4>
                    <button onClick={clearNotifications} className="text-[10px] font-bold text-indigo-600 hover:underline">Hapus Semua</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs">Tidak ada notifikasi baru</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              {n.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                              {n.type === 'info' && <Info size={16} className="text-indigo-500" />}
                              {n.type === 'warning' && <AlertCircle size={16} className="text-amber-500" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{n.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{profile?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile?.role}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center font-bold shadow-md shadow-indigo-200">
                {profile?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
