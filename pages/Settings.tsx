
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { User, Shield, Key, Bell, Save, Trash2, Mail, Camera, CreditCard, QrCode } from 'lucide-react';
import { Button, Card, CardContent, Input, Badge } from '../components/ui/Shared';

const Settings: React.FC = () => {
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        name,
        bio
      });
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pengaturan Akun</h1>
          <p className="text-slate-500">Kelola identitas dan keamanan portal E-Learning Anda.</p>
        </div>
        <Badge variant="indigo" className="px-4 py-2 gap-2 uppercase font-black tracking-widest text-[10px]">
           Account ID: {profile?.uid.substring(0,8)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 text-sm font-bold">
            <User size={18} /> Profil Publik
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-2xl text-sm font-bold transition-colors">
            <CreditCard size={18} /> E-Card Siswa
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-2xl text-sm font-bold transition-colors">
            <Shield size={18} /> Keamanan
          </button>
        </aside>

        <main className="md:col-span-3 space-y-10">
          {/* E-CARD SISWA VISUAL */}
          {profile?.role === 'SISWA' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Digital Student ID</h3>
              <div className="relative w-full max-w-md aspect-[1.6/1] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900"></div>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                
                <div className="relative h-full p-8 flex flex-col justify-between text-white z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <User size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm tracking-tighter uppercase leading-none">SMK LPPMRI 2</h4>
                        <p className="text-[8px] font-bold text-indigo-300 tracking-[0.2em] uppercase">E-Portal Student</p>
                      </div>
                    </div>
                    <QrCode size={40} className="text-white/30" />
                  </div>

                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center text-3xl font-black">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{profile.name}</h2>
                      <p className="text-indigo-300 font-bold text-xs uppercase tracking-widest">{profile.class || 'XII RPL 1'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] text-white/50 uppercase font-bold tracking-widest">Valid Since</p>
                      <p className="text-[10px] font-black">{profile.createdAt?.toDate().getFullYear() || '2024'}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[8px] text-white/50 uppercase font-bold tracking-widest">Status</p>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] px-2">AKTIF</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Card className="border-slate-100">
            <CardContent className="p-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Identity Details</h3>
              <div className="flex flex-col items-center sm:flex-row gap-8 mb-10">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2rem] bg-indigo-100 text-indigo-600 flex items-center justify-center text-4xl font-black rotate-6 group-hover:rotate-0 transition-transform">
                    {profile?.name.charAt(0)}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm hover:text-indigo-600 transition-colors">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-800">{profile?.name}</h3>
                  <p className="text-sm text-slate-400">{profile?.email}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="indigo">{profile?.role}</Badge>
                    <Badge variant="default">{profile?.class || 'Siswa LPPMRI'}</Badge>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                    <Input 
                      value={name}
                      onChange={(e: any) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bio / Slogan</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                      placeholder="Ceritakan sedikit tentang Anda..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" disabled={loading} className="gap-2 px-8">
                    <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-rose-100 bg-rose-50/20">
            <CardContent className="p-8">
              <h3 className="text-rose-600 font-bold mb-2">Zona Berbahaya</h3>
              <p className="text-sm text-slate-500 mb-6">Jika Anda menghapus akun, semua data Anda akan hilang selamanya. Harap berhati-hati.</p>
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-2">
                <Trash2 size={18} /> Nonaktifkan Akun
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Settings;
