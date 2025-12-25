
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Book, Plus, Trash2, GraduationCap } from 'lucide-react';
import { Subject, UserProfile } from '../types';
import { Button, Card, CardContent, Input, Badge } from '../components/ui/Shared';

const Curriculum: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const sq = query(collection(db, 'subjects'));
    const tq = query(collection(db, 'users'));
    
    const [sSnap, tSnap] = await Promise.all([getDocs(sq), getDocs(tq)]);
    
    setSubjects(sSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Subject[]);
    setTeachers(tSnap.docs.map(d => d.data() as UserProfile).filter(u => u.role === 'GURU'));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'subjects'), { name, teacherId });
      setName('');
      setTeacherId('');
      fetchData();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus mapel ini?')) {
      await deleteDoc(doc(db, 'subjects', id));
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Kurikulum & Mapel</h1>
          <p className="text-slate-500">Atur mata pelajaran dan pengampu untuk tiap kelas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-bold text-slate-800">Tambah Mata Pelajaran</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder="Nama Mata Pelajaran" required value={name} onChange={(e: any) => setName(e.target.value)} />
              <select 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                required
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              >
                <option value="">Pilih Guru Pengampu</option>
                {teachers.map(t => <option key={t.uid} value={t.uid}>{t.name}</option>)}
              </select>
              <Button className="w-full gap-2" type="submit" disabled={loading}>
                <Plus size={18} /> Tambahkan Mapel
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(s => (
              <Card key={s.id} className="hover:border-indigo-200 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Book size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{s.name}</h4>
                      <p className="text-xs text-slate-400">Guru: {teachers.find(t => t.uid === s.teacherId)?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => handleDelete(s.id)}>
                    <Trash2 size={16} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Curriculum;
