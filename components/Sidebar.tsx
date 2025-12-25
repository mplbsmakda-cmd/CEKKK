
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Wallet, 
  LogOut, 
  Bell, 
  Settings as SettingsIcon,
  GraduationCap,
  ShieldAlert,
  ClipboardList,
  UserCheck,
  Award,
  MessageSquare,
  Sparkles,
  Wand2,
  Mic2,
  MapPin,
  StickyNote,
  Film,
  Compass,
  Library,
  FileSpreadsheet,
  Brain,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../authContext';
import { UserRole } from '../types';
import { Badge } from './ui/Shared';

const Sidebar: React.FC = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();

  const commonItems = [
    { label: 'Creative Lab', icon: Wand2, path: '/creative-lab' },
    { label: 'AI Assistant', icon: Sparkles, path: '/assistant' },
    { label: 'Live AI Tutor', icon: Mic2, path: '/live-tutor' },
    { label: 'Pengaturan', icon: SettingsIcon, path: '/settings' },
  ];

  const roleItems: Record<UserRole, { label: string; icon: any; path: string }[]> = {
    ADMIN: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'AI Video Lab', icon: Film, path: '/video-lab' },
      { label: 'Kelola User', icon: Users, path: '/manage-users' },
      { label: 'Kurikulum', icon: GraduationCap, path: '/curriculum' },
      { label: 'Absensi Siswa', icon: UserCheck, path: '/attendance' },
      { label: 'Diskusi Global', icon: MessageSquare, path: '/discussion' },
      { label: 'Pengumuman', icon: Bell, path: '/announcements' },
    ],
    GURU: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'AI Video Lab', icon: Film, path: '/video-lab' },
      { label: 'Syllabus AI', icon: FileSpreadsheet, path: '/syllabus-ai' },
      { label: 'Materi Saya', icon: BookOpen, path: '/materials' },
      { label: 'Tugas & Grading', icon: FileText, path: '/assignments' },
      { label: 'Diskusi Mapel', icon: MessageSquare, path: '/discussion' },
      { label: 'Presensi Siswa', icon: UserCheck, path: '/attendance' },
      { label: 'Bank Ujian', icon: ShieldAlert, path: '/manage-exams' },
      { label: 'Nilai Siswa', icon: Award, path: '/grades' },
      { label: 'Pengumuman', icon: Bell, path: '/announcements' },
    ],
    SISWA: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Flashcards AI', icon: Brain, path: '/flashcards' },
      { label: 'Bursa Kerja', icon: Briefcase, path: '/job-board' },
      { label: 'CareerPath AI', icon: Compass, path: '/career-path' },
      { label: 'E-Library', icon: Library, path: '/e-library' },
      { label: 'Study Log', icon: StickyNote, path: '/study-notes' },
      { label: 'Discovery PKL', icon: MapPin, path: '/pkl-discovery' },
      { label: 'Materi Belajar', icon: BookOpen, path: '/student-materials' },
      { label: 'Tugas & Ujian', icon: FileText, path: '/student-assignments' },
      { label: 'Diskusi Mapel', icon: MessageSquare, path: '/student-discussion' },
      { label: 'Status SPP', icon: Wallet, path: '/student-payments' },
      { label: 'Nilai Saya', icon: Award, path: '/grades' },
      { label: 'Informasi', icon: Bell, path: '/announcements' },
    ],
    BENDAHARA: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Kelola SPP', icon: Wallet, path: '/manage-payments' },
      { label: 'Diskusi Staff', icon: MessageSquare, path: '/discussion' },
      { label: 'Pengumuman', icon: Bell, path: '/announcements' },
    ],
  };

  const currentRole = profile?.role || 'SISWA';
  const items = [...roleItems[currentRole], ...commonItems];

  return (
    <aside className="w-64 h-screen bg-indigo-950 text-white flex flex-col fixed left-0 top-0 overflow-y-auto shadow-2xl z-50 border-r border-white/5">
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">SMK LPPMRI</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter mt-1">Kedungreja Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 custom-scrollbar">
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                    : 'text-indigo-200/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-indigo-400 group-hover:text-white'} />
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/5 bg-white/5">
        <div className="mb-4 px-4 py-3 bg-indigo-900/40 rounded-xl border border-white/5">
          <p className="text-xs font-bold text-white truncate">{profile?.name}</p>
          <Badge variant="indigo" className="mt-1 opacity-80 text-[8px] px-1.5 font-bold uppercase tracking-widest">{profile?.role}</Badge>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-300 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold">Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
