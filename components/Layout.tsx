
import React from 'react';
import Sidebar from './Sidebar.tsx';
import { useAuth } from '../authContext.tsx';
import { Bell, Search, Settings } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
        <header className="h-24 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-900 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="relative w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search databases, tasks, files..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-3 bg-slate-900 text-slate-500 hover:text-white rounded-2xl border border-slate-800 transition-all">
              <Bell size={20} />
            </button>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-[11px] font-black uppercase leading-none">{profile?.name}</p>
                <p className="text-indigo-500 text-[9px] font-black uppercase tracking-widest mt-1">Verified User</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/20 flex items-center justify-center font-black text-white text-xl">
                {profile?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
