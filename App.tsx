
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './authContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import ManageUsers from './pages/ManageUsers';
import Assignments from './pages/Assignments';
import Payments from './pages/Payments';
import Curriculum from './pages/Curriculum';
import ManageExams from './pages/ManageExams';
import ExamPortal from './pages/ExamPortal';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Announcements from './pages/Announcements';
import Discussion from './pages/Discussion';
import Assistant from './pages/Assistant';
import CreativeLab from './pages/CreativeLab';
import LiveTutor from './pages/LiveTutor';
import PKLDiscovery from './pages/PKLDiscovery';
import StudyNotes from './pages/StudyNotes';
import VideoLab from './pages/VideoLab';
import CareerPath from './pages/CareerPath';
import ELibrary from './pages/ELibrary';
import SyllabusGenerator from './pages/SyllabusGenerator';
import Flashcards from './pages/Flashcards';
import JobBoard from './pages/JobBoard';
import Settings from './pages/Settings';
import { ShieldCheck, Clock, LogOut, Loader2 } from 'lucide-react';
import { Button } from './components/ui/Shared';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading, logout } = useAuth();
  
  if (loading && !user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="text-indigo-500 animate-spin" size={40} />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Otorisasi Keamanan...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (!profile && loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
       <Loader2 className="text-indigo-600 animate-spin" size={32} />
    </div>
  );

  if (profile && profile.verified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 max-w-lg w-full text-center space-y-8 border border-slate-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner rotate-3">
            <Clock size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-slate-900 uppercase">Verifikasi Tertunda</h1>
            <p className="text-slate-500 text-sm leading-relaxed px-4">
              Halo <b>{profile.name}</b>, akun Anda sedang menunggu persetujuan Admin Sekolah. Silakan hubungi bagian IT atau Kesiswaan.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <Button onClick={() => window.location.reload()} className="w-full py-4 shadow-lg shadow-indigo-100">Cek Status</Button>
            <button onClick={() => logout()} className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-2">
              <LogOut size={14} /> Ganti Akun
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
