
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, FileText, Wallet, LogOut, 
  Bell, Settings as SettingsIcon, GraduationCap, ShieldAlert,
  UserCheck, Award, MessageSquare, Sparkles, Wand2, Mic2,
  Film, Compass, Library, FileSpreadsheet, Brain, Briefcase
} from 'lucide-react';
import { useAuth } from '../authContext';
import { UserRole } from '../types';
import { Badge } from './ui/Shared';

const Sidebar: React.FC = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();

  const roleItems: Record<UserRole, { label: string; icon: any; path: string }[]> = {
    ADMIN: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Kelola User', icon: Users, path: '/manage-users' },
      { label: 'Video Lab AI', icon: Film, path: '/video-lab' },
      { label: 'Pengumuman', icon: Bell, path: '/announcements' },
    ],
    GURU: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Materi Saya', icon: BookOpen, path: '/materials' },
      { label: 'Tugas Siswa', icon: FileText, path: '/assignments' },
      { label: 'Bank Ujian', icon: ShieldAlert, path: '/manage-exams' },
    ],
    SISWA: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Materi Belajar', icon: BookOpen, path: '/student-materials' },
      { label: 'Tugas & Ujian', icon: FileText, path: '/student-assignments' },
      { label: 'Nilai Saya', icon: Award, path: '/grades' },
      { label: 'Status SPP', icon: Wallet, path: '/student-payments' },
    ],
    BENDAHARA: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Kelola SPP', icon: Wallet, path: '/manage-payments' },
    ],
  };

  const commonItems = [
    { label: 'AI Assistant', icon: Sparkles, path: '/assistant' },
    { label: 'Live AI Tutor', icon: Mic2, path: '/live-tutor' },
    { label: 'Job Board', icon: Briefcase, path: '/job-board' },
    { label: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  const currentRole = profile?.role || 'SISWA';
  const items = [...roleItems[currentRole], ...commonItems];

  return (
    <aside className="w-72 h-screen bg-slate-950 text-slate-400 flex flex-col fixed left-0 top-0 overflow-hidden border-r border-slate-900 z-50 shadow-2xl">
      <div className="p-8 border-b border-slate-900">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/20 rotate-3">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none italic uppercase">LPPMRI<span className="text-indigo-500">2</span></h1>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Academic Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
        <ul className="space-y-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 font-black scale-105'
                      : 'hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-900 bg-slate-900/30">
        <div className="mb-6 flex items-center gap-4 px-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 font-black text-lg">
            {profile?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-[11px] font-black uppercase truncate">{profile?.name}</p>
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-3 py-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut size={16} /> Sign Out System
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
