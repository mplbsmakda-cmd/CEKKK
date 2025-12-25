
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { Plus, Book, Clock, Settings, ShieldCheck, Trash2, LayoutList, Wand2, Loader2, X, Sparkles } from 'lucide-react';
import { Button, Card, CardContent, Input, Badge } from '../components/ui/Shared';

const ManageExams: React.FC = () => {
  const { profile } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<any[]>([{ text: '', options: ['', '', '', ''], correctOption: 0 }]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const q = query(collection(db, 'exams'));
    const snap = await getDocs(q);
    setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const generateAIQuestions = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Buatkan 5 soal pilihan ganda (4 opsi A,B,C,D) dalam format JSON berdasarkan teks berikut: ${aiInput}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOption: { type: Type.INTEGER, description: "Index 0-3 dari opsi yang benar" }
              },
              required: ["text", "options", "correctOption"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setQuestions(data);
      setShowAIModal(false);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses AI. Pastikan input teks cukup jelas.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOption: 0 }]);
  };

  const saveExam = async () => {
    try {
      await addDoc(collection(db, 'exams'), {
        title,
        duration,
        questions,
        teacherId: profile?.uid,
        createdAt: serverTimestamp(),
        status: 'ACTIVE'
      });
      setShowModal(false);
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manajemen Ujian</h1>
          <p className="text-slate-500">Buat dan pantau ujian online terproteksi.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowAIModal(true)} className="gap-2 border-indigo-200 text-indigo-600 bg-indigo-50">
            <Wand2 size={18} /> AI Generator
          </Button>
          <Button onClick={() => {
            setQuestions([{ text: '', options: ['', '', '', ''], correctOption: 0 }]);
            setShowModal(true);
          }} className="gap-2 shadow-lg shadow-indigo-100">
            <Plus size={18} /> Buat Paket Manual
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(e => (
          <Card key={e.id}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><LayoutList size={20} /></div>
                <Badge variant="indigo">{e.duration}m</Badge>
              </div>
              <h3 className="font-bold text-slate-800">{e.title}</h3>
              <p className="text-xs text-slate-400 font-medium">Total {e.questions?.length} Soal Terdaftar</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full">Edit</Button>
                <Button variant="ghost" size="sm" className="text-rose-500"><Trash2 size={16} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <Card className="w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles size={20} /> Magic AI Quiz Generator</h2>
              <button onClick={() => setShowAIModal(false)}><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tempel Materi Teks</label>
                <textarea
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-64 leading-relaxed"
                  placeholder="Tempel ringkasan materi atau artikel di sini, AI akan otomatis membuatkan soal pilihan ganda..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
              </div>
              <Button onClick={generateAIQuestions} disabled={isAiLoading || !aiInput.trim()} className="w-full py-4 gap-2">
                {isAiLoading ? <Loader2 className="animate-spin" /> : <><Wand2 size={18} /> Hasilkan Soal Otomatis</>}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur z-50 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-xl">
                <h2 className="text-xl font-bold">Pembuat Paket Ujian Baru</h2>
                <Button variant="ghost" className="text-white" onClick={() => setShowModal(false)}>Batal</Button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Judul Ujian</label>
                    <Input placeholder="Nama Ujian" value={title} onChange={(e: any) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Durasi (Menit)</label>
                    <Input type="number" value={duration} onChange={(e: any) => setDuration(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-bold text-slate-800 border-b pb-2">Daftar Pertanyaan ({questions.length})</h4>
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="font-bold text-indigo-600">Soal #{qIdx + 1}</span>
                      </div>
                      <Input 
                        placeholder="Pertanyaan..." 
                        value={q.text} 
                        onChange={(e: any) => {
                          const newQ = [...questions];
                          newQ[qIdx].text = e.target.value;
                          setQuestions(newQ);
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        {q.options.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className="flex gap-2 items-center">
                            <input 
                              type="radio" 
                              name={`correct-${qIdx}`} 
                              checked={q.correctOption === oIdx}
                              onChange={() => {
                                const newQ = [...questions];
                                newQ[qIdx].correctOption = oIdx;
                                setQuestions(newQ);
                              }}
                            />
                            <Input 
                              placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`} 
                              value={opt}
                              onChange={(e: any) => {
                                const newQ = [...questions];
                                newQ[qIdx].options[oIdx] = e.target.value;
                                setQuestions(newQ);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2 border-dashed" onClick={addQuestion}>
                    <Plus size={16} /> Tambah Soal Lagi
                  </Button>
                </div>

                <Button className="w-full py-4 text-lg" onClick={saveExam}>Publikasikan Ujian</Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExams;
