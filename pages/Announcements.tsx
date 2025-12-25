
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';
// Added X to the imports from lucide-react
import { Bell, Plus, Megaphone, Trash2, Clock, X } from 'lucide-react';
import { Button, Card, CardContent, Input, Badge } from '../components/ui/Shared';

const Announcements: React.FC = () => {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title,
        content,
        author: profile?.name,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Pengumuman Sekolah</h1>
          <p className="text-slate-500">Informasi terbaru seputar kegiatan SMK LPPMRI 2.</p>
        </div>
        {(profile?.role === 'ADMIN' || profile?.role === 'GURU') && (
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus size={18} /> Buat Pengumuman
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map(a => (
          <Card key={a.id} className="hover:border-indigo-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl h-fit">
                  <Megaphone size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-800">{a.title}</h3>
                    <Badge variant="indigo">{a.author}</Badge>
                  </div>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed">{a.content}</p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {a.createdAt?.toDate().toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-xl">
              <h2 className="text-xl font-bold">Tulis Pengumuman</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handlePost} className="p-6 space-y-4">
              <Input placeholder="Subjek Pengumuman" required value={title} onChange={(e: any) => setTitle(e.target.value)} />
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-40 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Isi pesan..."
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button className="w-full py-3" type="submit" disabled={loading}>Siarkan Sekarang</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Announcements;
