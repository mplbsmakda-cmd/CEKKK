
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './authContext.tsx';
import Layout from './components/Layout.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Materials from './pages/Materials.tsx';
import ManageUsers from './pages/ManageUsers.tsx';
import Assignments from './pages/Assignments.tsx';
import Payments from './pages/Payments.tsx';
import Curriculum from './pages/Curriculum.tsx';
import ManageExams from './pages/ManageExams.tsx';
import ExamPortal from './pages/ExamPortal.tsx';
import Attendance from './pages/Attendance.tsx';
import Grades from './pages/Grades.tsx';
import Announcements from './pages/Announcements.tsx';
import Discussion from './pages/Discussion.tsx';
import Assistant from './pages/Assistant.tsx';
import CreativeLab from './pages/CreativeLab.tsx';
import LiveTutor from './pages/LiveTutor.tsx';
import PKLDiscovery from './pages/PKLDiscovery.tsx';
import StudyNotes from './pages/StudyNotes.tsx';
import VideoLab from './pages/VideoLab.tsx';
import CareerPath from './pages/CareerPath.tsx';
import ELibrary from './pages/ELibrary.tsx';
import SyllabusGenerator from './pages/SyllabusGenerator.tsx';
import Flashcards from './pages/Flashcards.tsx';
import JobBoard from './pages/JobBoard.tsx';
import Settings from './pages/Settings.tsx';
import { ShieldCheck, Clock, LogOut, Loader2 } from 'lucide-react';
import { Button } from './components/ui/Shared.tsx';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, logout } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
        <div className="relative w-16 h-16">
          <Loader2 className="text-indigo-500 animate-spin absolute inset-0" size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck size={24} className="text-indigo-400 opacity-50" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.5em] mb-2">LPPMRI SECURITY</p>
          <p className="text-slate-500 text-xs font-bold">Sinkronisasi Sesi Akademik...</p>
        </div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (profile && profile.verified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-lg w-full text-center space-y-8 border border-white/10 animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner rotate-6">
            <Clock size={48} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none uppercase">Akses Tertunda</h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
              Halo <b>{profile.name}</b>, akun Anda terdaftar namun memerlukan verifikasi manual dari <b>Admin Sekolah</b> sebelum dapat mengakses portal.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-4">
            <Button onClick={() => window.location.reload()} className="w-full py-5 rounded-2xl shadow-xl shadow-indigo-100 font-black uppercase tracking-widest text-xs">Cek Ulang Status</Button>
            <button onClick={() => logout()} className="text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest">
              <LogOut size={14} /> Gunakan Akun Lain
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
          <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
          <Route path="/curriculum" element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/discussion" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
          <Route path="/creative-lab" element={<ProtectedRoute><CreativeLab /></ProtectedRoute>} />
          <Route path="/live-tutor" element={<ProtectedRoute><LiveTutor /></ProtectedRoute>} />
          <Route path="/pkl-discovery" element={<ProtectedRoute><PKLDiscovery /></ProtectedRoute>} />
          <Route path="/study-notes" element={<ProtectedRoute><StudyNotes /></ProtectedRoute>} />
          <Route path="/video-lab" element={<ProtectedRoute><VideoLab /></ProtectedRoute>} />
          <Route path="/career-path" element={<ProtectedRoute><CareerPath /></ProtectedRoute>} />
          <Route path="/e-library" element={<ProtectedRoute><ELibrary /></ProtectedRoute>} />
          <Route path="/syllabus-ai" element={<ProtectedRoute><SyllabusGenerator /></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
          <Route path="/job-board" element={<ProtectedRoute><JobBoard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/manage-exams" element={<ProtectedRoute><ManageExams /></ProtectedRoute>} />
          <Route path="/exam/:examId" element={<ExamPortal />} />
          <Route path="/student-materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
          <Route path="/student-assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/student-payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/student-discussion" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
          <Route path="/manage-payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
