
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { Plus, Search, Trash2, Edit3, Save, X, BookText, FileText, Loader2, Calendar } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui/Shared';
import { StudyNote } from '../types';

const StudyNotes: React.FC = () => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Partial<StudyNote> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [profile]);

  const fetchNotes = async () => {
    if (!profile) return;
    try {
      const q = query(
        collection(db, 'study_notes'),
        where('userId', '==', profile.uid),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setNotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as StudyNote[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !profile) return;
    setLoading(true);
    try {
      if (editingNote.id) {
        await updateDoc(doc(db, 'study_notes', editingNote.id), {
          ...editingNote,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'study_notes'), {
          ...editingNote,
          userId: profile.uid,
          updatedAt: serverTimestamp(),
          tags: editingNote.tags || []
        });
      }
      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus catatan ini?')) {
      await deleteDoc(doc(db, 'study_notes', id));
      fetchNotes();
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Study Log</h1>
          <p className="text-slate-500">Simpan catatan belajar mandiri Anda secara aman.</p>
        </div>
        <Button onClick={() => setEditingNote({ title: '', content: '', tags: [] })} className="gap-2">
          <Plus size={18} /> Catatan Baru
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          placeholder="Cari materi yang Anda catat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <Card key={note.id} className="group hover:border-indigo-200 transition-all hover:shadow-lg flex flex-col h-full">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingNote(note)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(note.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{note.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-4 leading-relaxed">{note.content}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Calendar size={12} /> {note.updatedAt?.toDate().toLocaleDateString('id-ID')}
              </div>
              <Badge variant="indigo" className="text-[9px]">Private</Badge>
            </div>
          </Card>
        ))}
      </div>

      {editingNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">{editingNote.id ? 'Edit Catatan' : 'Buat Catatan Baru'}</h2>
              <button onClick={() => setEditingNote(null)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Catatan</label>
                <Input
                  required
                  placeholder="Masukkan judul..."
                  value={editingNote.title}
                  onChange={(e: any) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="bg-slate-50 border-slate-200 py-6 text-lg font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Isi Catatan</label>
                <textarea
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-64 leading-relaxed"
                  placeholder="Tuliskan insight atau ringkasan materi Anda di sini..."
                  required
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 py-4 rounded-2xl" type="button" onClick={() => setEditingNote(null)}>Batal</Button>
                <Button className="flex-1 py-4 rounded-2xl shadow-lg shadow-indigo-100" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Simpan Catatan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudyNotes;
