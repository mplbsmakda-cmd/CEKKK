
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { GraduationCap, Mail, Lock, User, Briefcase, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('SISWA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  }, []);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Format email tidak valid.';
    if (password.length < 6) return 'Keamanan: Password minimal 6 karakter.';
    if (!isLogin && name.length < 3) return 'Validasi: Nama lengkap minimal 3 karakter.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Cepat & Aman: Login langsung
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        
        // Verifikasi apakah data profile ada (Sync check)
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!userDoc.exists()) {
          throw new Error('Data profil tidak ditemukan. Hubungi IT.');
        }
      } else {
        // Registrasi dengan Sanitasi
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const { user } = userCredential;
        
        const userData = {
          uid: user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          verified: role === 'ADMIN', // Admin auto-verified, others pending
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          class: role === 'SISWA' ? 'Menunggu Penempatan' : 'Staff Akademik'
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        if (navigator.onLine) sendEmailVerification(user).catch(() => {});
      }
    } catch (err: any) {
      console.error(err.code);
      let msg = 'Koneksi gagal atau kredensial salah.';
      if (err.code === 'auth/wrong-password') msg = 'Email atau kata sandi tidak cocok.';
      if (err.code === 'auth/user-not-found') msg = 'Akun belum terdaftar di database.';
      if (err.code === 'auth/email-already-in-use') msg = 'Email sudah digunakan oleh akun lain.';
      if (err.code === 'auth/network-request-failed') msg = 'Masalah jaringan. Periksa koneksi internet Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-white/20 animate-in fade-in zoom-in duration-500">
        <div className="bg-indigo-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-800 opacity-80"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl mb-6 shadow-2xl border border-white/20 flex items-center justify-center rotate-3 transition-transform hover:rotate-0 duration-500">
              <GraduationCap size={36} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight leading-none uppercase">SMK LPPMRI 2</h1>
            <p className="text-indigo-100 text-[10px] font-black mt-2 uppercase tracking-[0.3em] opacity-90">Secure Learning Gate</p>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[11px] font-black border border-rose-100 flex items-center gap-3 animate-in shake duration-300">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Sesuai Ijazah</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-bold"
                      placeholder="Nama Lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Akun</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none appearance-none transition-all text-sm font-black text-slate-700"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                    >
                      <option value="SISWA">Siswa / Peserta Didik</option>
                      <option value="GURU">Guru / Pengampu</option>
                      <option value="BENDAHARA">Bendahara Sekolah</option>
                      <option value="ADMIN">Administrator Sistem</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Email Resmi</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder="name@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder="Min. 6 Karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>{isLogin ? 'Masuk Portal' : 'Daftar Akun'} <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-slate-100">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:text-indigo-800 transition-colors"
            >
              {isLogin ? 'Belum punya akses? Buat Akun' : 'Sudah punya akun? Masuk Portal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
