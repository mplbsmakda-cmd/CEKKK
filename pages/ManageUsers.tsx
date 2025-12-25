
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Trash2, Edit, Search, UserPlus, ShieldCheck, UserX, CheckCircle2, Loader2, Filter, Mail, Fingerprint } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { Button, Card, CardContent, Input, Badge } from '../components/ui/Shared';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Real-time listener for users
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const deleteUser = async (uid: string) => {
    if (window.confirm('Hapus pengguna ini secara permanen? Sesi login mereka akan terputus.')) {
      setProcessingId(uid);
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.error(err);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const toggleVerify = async (uid: string, currentStatus: boolean) => {
    setProcessingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { verified: !currentStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Identity Management</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-3">
             <Fingerprint size={16} className="text-indigo-600" /> Pusat Kontrol Hak Akses Sivitas SMK LPPMRI 2
          </p>
        </div>
        <div className="flex gap-4">
           <Card className="bg-indigo-600 text-white p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl shadow-indigo-200 border-none">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-2xl">{users.length}</div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Total<br/>Registrations</p>
           </Card>
        </div>
      </div>

      <Card className="border-none shadow-3xl rounded-[3rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-6 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input 
                className="pl-12 py-7 bg-white border-slate-200 focus:bg-white rounded-2xl font-bold" 
                placeholder="Cari berdasarkan nama atau email..." 
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
              {(['ALL', 'SISWA', 'GURU', 'BENDAHARA', 'ADMIN'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 whitespace-nowrap ${
                    filterRole === r 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.4em]">
                  <th className="px-10 py-8">User Profile</th>
                  <th className="px-10 py-8">Authorization Status</th>
                  <th className="px-10 py-8">Academic Unit</th>
                  <th className="px-10 py-8 text-right">Security Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600 mb-6" size={48} /><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menghubungkan ke Database Identitas...</p></td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} className="p-32 text-center text-slate-400 italic text-lg font-bold opacity-30">Tidak ada data civitas ditemukan.</td></tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-50 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl transition-transform group-hover:rotate-6 ${
                          user.role === 'SISWA' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-900 text-white'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{user.name}</p>
                            {user.verified && <div className="p-1 bg-emerald-500 rounded-full text-white"><CheckCircle2 size={12} /></div>}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold text-xs uppercase tracking-tight">
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        <Badge variant={user.role === 'ADMIN' ? 'indigo' : user.role === 'GURU' ? 'warning' : 'default'} className="w-fit text-[9px] px-4 py-1.5 rounded-xl border-none font-black shadow-sm">
                          {user.role}
                        </Badge>
                        <Badge variant={user.verified ? 'success' : 'error'} className="w-fit text-[9px] px-4 py-1.5 rounded-xl border-none font-black shadow-sm">
                          {user.verified ? 'AUTHORIZED' : 'PENDING APPROVAL'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-sm font-black text-slate-800 tracking-tight">{user.class || 'N/A'}</p>
                       <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">SMK LPPMRI 2 KEDUNGREJA</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => toggleVerify(user.uid, user.verified || false)}
                          disabled={processingId === user.uid}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-2xl ${
                            user.verified ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                          }`}
                          title={user.verified ? "Cabut Hak Akses" : "Berikan Hak Akses"}
                        >
                          {processingId === user.uid ? <Loader2 size={20} className="animate-spin" /> : user.verified ? <UserX size={24} /> : <ShieldCheck size={24} />}
                        </button>
                        <button 
                          onClick={() => deleteUser(user.uid)}
                          disabled={processingId === user.uid}
                          className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-2xl"
                        >
                          {processingId === user.uid ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={24} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsers;
