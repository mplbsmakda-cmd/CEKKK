
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { db, storage } from '../firebase';
import { useAuth } from '../authContext';
import { 
  Plus, FileText, Upload, X, BookOpen, ChevronRight, 
  Volume2, Loader2, PlayCircle, Users as UsersIcon,
  BrainCircuit, Sparkles, CheckCircle2, ListFilter
} from 'lucide-react';
import { Material, Subject } from '../types';
import { Button, Card, CardContent, Input, Badge } from '../components/ui/Shared';

const Materials: React.FC = () => {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [summaryLoading, setSummaryLoading] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState<'PDF' | 'VIDEO' | 'TEXT'>('PDF');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMaterials();
    fetchSubjects();
  }, [profile]);

  const fetchMaterials = async () => {
    if (!profile) return;
    const q = query(collection(db, 'materials'));
    const snapshot = await getDocs(q);
    setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Material[]);
  };

  const fetchSubjects = async () => {
    const q = query(collection(db, 'subjects'));
    const snapshot = await getDocs(q);
    setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[]);
  };

  const handleAiSummarize = async (mat: Material) => {
    setSummaryLoading(mat.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rangkum materi pembelajaran ini dengan poin-poin singkat yang mudah dipahami siswa SMK. Judul: ${mat.title}. Konten akan dianalisis berdasarkan deskripsi atau URL lampiran yang diberikan.`,
      });
      setActiveSummary(response.text);
    } catch (err) {
      console.error(err);
      alert("Gagal merangkum materi.");
    } finally {
      setSummaryLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Pustaka Materi</h1>
          <p className="text-slate-500 font-medium font-inter">Bank data pembelajaran digital SMK LPPMRI 2.</p>
        </div>
        {profile?.role === 'GURU' && (
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-indigo-600 shadow-xl shadow-indigo-200">
            <Plus size={18} /> Publish Materi
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {materials.map((mat) => (
          <Card key={mat.id} className="group hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] overflow-hidden bg-white">
            <div className="p-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-3xl shadow-lg transition-transform group-hover:scale-110 duration-500 ${mat.type === 'PDF' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {mat.type === 'PDF' ? <FileText size={32} /> : <BookOpen size={32} />}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAiSummarize(mat)} className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                    {summaryLoading === mat.id ? <Loader2 size={16} className="animate-spin" /> : <ListFilter size={16} />}
                  </button>
                  <Badge variant={mat.type === 'PDF' ? 'error' : 'indigo'}>{mat.type}</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors duration-300">{mat.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{subjects.find(s => s.id === mat.subjectId)?.name || 'Materi Umum'}</p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex gap-2">
                <a href={mat.fileUrl} target="_blank" className="flex-1">
                  <Button variant="outline" className="w-full gap-2 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-100 bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all duration-300">
                    Buka Berkas <ChevronRight size={16} />
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {activeSummary && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl rounded-[3rem] border-none overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 bg-amber-500 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <Sparkles size={28} />
                 <h2 className="text-2xl font-black tracking-tight">AI Smart Summary</h2>
               </div>
               <button onClick={() => setActiveSummary(null)}><X size={32} /></button>
            </div>
            <div className="p-10 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="prose prose-slate max-w-none prose-sm leading-relaxed font-medium text-slate-700 whitespace-pre-wrap">
                {activeSummary}
              </div>
              <Button className="w-full mt-10 py-5 bg-slate-900 font-black rounded-2xl" onClick={() => setActiveSummary(null)}>Paham, Terima Kasih AI</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Materials;
