
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { Calendar, Check, X, UserCheck, History, Filter, Search, Download, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, Badge, Input } from '../components/ui/Shared';
import { AttendanceRecord, Subject } from '../types';
import { exportToCSV } from '../utils/export';

const Attendance: React.FC = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'INPUT' | 'HISTORY'>('INPUT');

  useEffect(() => {
    if (profile?.role === 'GURU') {
      fetchStudents();
      fetchSubjects();
      
      // Real-time history listener
      const q = query(collection(db, 'attendance'), orderBy('date', 'desc'), limit(100));
      const unsub = onSnapshot(q, (snap) => {
        setAttendanceHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AttendanceRecord[]);
      });
      return () => unsub();
    }
  }, [profile]);

  const fetchStudents = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'SISWA'));
    const snap = await getDocs(q);
    setStudents(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
  };

  const fetchSubjects = async () => {
    const q = query(collection(db, 'subjects'), where('teacherId', '==', profile?.uid));
    const snap = await getDocs(q);
    setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Subject[]);
  };

  const submitAttendance = async () => {
    if (!selectedSubject) return alert('Pilih mata pelajaran!');
    setLoading(true);
    try {
      const promises = students.map(s => 
        addDoc(collection(db, 'attendance'), {
          studentId: s.uid,
          studentName: s.name,
          subjectId: selectedSubject,
          status: attendance[s.uid] || 'HADIR',
          date: serverTimestamp(),
          teacherId: profile?.uid
        })
      );
      await Promise.all(promises);
      alert('Absensi berhasil disimpan!');
      setAttendance({});
      setActiveTab('HISTORY');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = attendanceHistory.map(h => ({
      Tanggal: h.date?.toDate ? h.date.toDate().toLocaleDateString('id-ID') : 'N/A',
      Nama: h.studentName,
      Status: h.status,
      Mata_Pelajaran: subjects.find(s => s.id === h.subjectId)?.name || 'N/A'
    }));
    exportToCSV(`Laporan_Absensi_${new Date().toLocaleDateString()}`, exportData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Presensi Kehadiran</h1>
          <p className="text-slate-500 font-medium">Monitoring kedisiplinan siswa SMK LPPMRI 2 secara real-time.</p>
        </div>
        <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('INPUT')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'INPUT' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Input Baru
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'HISTORY' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Riwayat Live
          </button>
        </div>
      </div>

      {activeTab === 'INPUT' ? (
        <Card className="border-indigo-100 shadow-2xl shadow-indigo-100/30 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex gap-4 flex-1">
              <select 
                className="flex-1 max-w-xs p-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Pilih Mata Pelajaran</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex items-center gap-3 bg-white px-6 border border-slate-200 rounded-2xl text-slate-500 text-xs font-black uppercase tracking-widest shadow-sm">
                <Calendar size={16} className="text-indigo-600" /> 
                {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            </div>
            <Button onClick={submitAttendance} disabled={loading || !selectedSubject} className="gap-2 shadow-2xl shadow-indigo-200 py-4 px-10 rounded-2xl">
              {loading ? <Loader2 className="animate-spin" /> : <><Check size={20} /> Submit Presensi</>}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                  <th className="px-10 py-5">Foto</th>
                  <th className="px-10 py-5">Identitas Siswa</th>
                  <th className="px-10 py-5">Jurusan</th>
                  <th className="px-10 py-5 text-center">Tandai Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => (
                  <tr key={s.uid} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-white flex items-center justify-center font-black text-sm shadow-xl group-hover:rotate-6 transition-transform">
                        {s.name.charAt(0)}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="font-black text-slate-900 text-lg tracking-tight leading-none">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">ID: {s.uid.substring(0,6)}</p>
                    </td>
                    <td className="px-10 py-6">
                      <Badge variant="indigo" className="px-4 py-1.5 rounded-xl border-none font-black text-[9px]">{s.class || 'LPPMRI ELITE'}</Badge>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex justify-center gap-3">
                        {[
                          { val: 'HADIR', color: 'bg-emerald-500', label: 'H' },
                          { val: 'IZIN', color: 'bg-amber-500', label: 'I' },
                          { val: 'ALFA', color: 'bg-rose-500', label: 'A' }
                        ].map(st => (
                          <button
                            key={st.val}
                            onClick={() => setAttendance({ ...attendance, [s.uid]: st.val })}
                            className={`w-12 h-12 rounded-2xl text-xs font-black transition-all border-2 ${
                              (attendance[s.uid] || 'HADIR') === st.val 
                                ? `${st.color} text-white border-transparent shadow-2xl scale-110` 
                                : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="p-8 bg-slate-900 flex justify-between items-center text-white">
            <h3 className="font-black text-xl tracking-tight flex items-center gap-3">
              <History size={24} className="text-indigo-400" /> Riwayat Presensi
            </h3>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-white/10 border-white/10 text-white hover:bg-white/20 px-6 py-2.5 rounded-xl">
              <Download size={16} /> Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-10 py-6">Tanggal</th>
                  <th className="px-10 py-6">Nama Siswa</th>
                  <th className="px-10 py-6">Mata Pelajaran</th>
                  <th className="px-10 py-6 text-right">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceHistory.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6 text-slate-500 font-bold">{h.date?.toDate ? h.date.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'N/A'}</td>
                    <td className="px-10 py-6 font-black text-slate-900">{h.studentName}</td>
                    <td className="px-10 py-6 text-slate-500 font-bold uppercase text-[11px] tracking-tight">{subjects.find(s => s.id === h.subjectId)?.name || 'Mapel'}</td>
                    <td className="px-10 py-6 text-right">
                      <Badge variant={h.status === 'HADIR' ? 'success' : h.status === 'IZIN' ? 'warning' : 'error'} className="px-6 py-2 rounded-xl border-none font-black shadow-lg">
                        {h.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {attendanceHistory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-32 text-center text-slate-400 italic font-bold opacity-30">Belum ada data terekam.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
