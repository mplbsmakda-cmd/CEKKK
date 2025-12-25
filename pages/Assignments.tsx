
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp, where, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI, Type } from "@google/genai";
import { db, storage } from '../firebase';
import { useAuth } from '../authContext';
import { 
  FileText, Plus, Clock, Upload, CheckCircle2, 
  AlertCircle, ChevronRight, User, X, Users,
  Award, BrainCircuit, Loader2, Sparkles, Bot, Camera
} from 'lucide-react';
import { Assignment, Submission, Subject } from '../types';
import { Button, Card, CardContent, Input, Badge } from '../components/ui/Shared';

const Assignments: React.FC = () => {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isAiGrading, setIsAiGrading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    // REAL-TIME Assignments Listener
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Assignment[]);
    });

    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[]);
    });

    const unsubSubmissions = onSnapshot(
      profile?.role === 'SISWA' 
        ? query(collection(db, 'submissions'), where('studentId', '==', profile.uid))
        : collection(db, 'submissions'),
      (snapshot) => {
        setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Submission[]);
      }
    );

    return () => {
      unsubAssignments();
      unsubSubjects();
      unsubSubmissions();
    };
  }, [profile]);

  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAIScan = async () => {
    if (!selectedFile) return;
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64 = await fileToBase64(selectedFile);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: selectedFile.type } },
            { text: "Lakukan koreksi pada tugas tulisan tangan ini. Identifikasi jawaban yang benar, poin yang salah, dan berikan penjelasan edukatif yang mendalam dalam Bahasa Indonesia." }
          ]
        }
      });
      setAiFeedback(response.text || 'Gagal mengekstrak feedback.');
    } catch (error: any) {
      console.error(error);
      setAiFeedback('Koneksi Vision AI terputus. Pastikan foto cukup terang dan jelas.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiReview = async () => {
    if (!selectedSubmission) return;
    setIsAiGrading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentTask = assignments.find(a => a.id === selectedSubmission.assignmentId);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [{ text: `Review tugas ini secara profesional. 
          Judul: ${currentTask?.title}. 
          Panduan: ${currentTask?.description}. 
          Link File: ${selectedSubmission.fileUrl}. 
          Output harus berupa JSON dengan skor (0-100) dan feedback konstruktif.` }]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ["score", "feedback"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setScoreInput(result.score.toString());
      setFeedbackInput(result.feedback);
    } catch (err) {
      console.error(err);
      alert("AI Scoring gagal. Silakan lakukan penilaian manual.");
    } finally {
      setIsAiGrading(false);
    }
  };

  const handleSubmitTask = async (assignmentId: string) => {
    if (!selectedFile || !profile) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `submissions/${assignmentId}_${profile.uid}_${Date.now()}`);
      await uploadBytes(storageRef, selectedFile);
      const fileUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'submissions'), {
        assignmentId,
        studentId: profile.uid,
        studentName: profile.name,
        fileUrl,
        status: 'PENDING',
        score: null,
        submittedAt: serverTimestamp()
      });
      setSelectedFile(null);
      setActiveAssignmentId(null);
      alert('Tugas terkirim! Guru akan meninjau segera.');
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'assignments'), {
        title,
        description,
        subjectId,
        deadline: new Date(deadline),
        createdAt: serverTimestamp(),
        teacherId: profile?.uid
      });
      setShowModal(false);
      setTitle(''); setDescription(''); setSubjectId(''); setDeadline('');
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'submissions', selectedSubmission.id), {
        score: Number(scoreInput),
        feedback: feedbackInput,
        status: 'GRADED'
      });
      setShowGradingModal(false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Assessment Hub</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-3">
             <Bot size={16} className="text-indigo-600" /> Automated Grading System v3.0
          </p>
        </div>
        {profile?.role === 'GURU' && (
          <Button onClick={() => setShowModal(true)} className="py-5 px-10 rounded-2xl shadow-2xl shadow-indigo-100 font-black gap-2">
            <Plus size={20} /> Tambah Evaluasi Baru
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {assignments.map((task) => {
          const studentSub = profile?.role === 'SISWA' ? submissions.find(s => s.assignmentId === task.id) : null;
          const teacherSubs = submissions.filter(s => s.assignmentId === task.id);
          const isExpired = task.deadline?.toDate ? task.deadline.toDate() < new Date() : false;

          return (
            <Card key={task.id} className="relative group hover:border-indigo-500 transition-all duration-500 shadow-2xl rounded-[3rem] overflow-hidden bg-white border-none">
              <CardContent className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <FileText size={32} />
                  </div>
                  <Badge variant={studentSub ? 'success' : isExpired ? 'error' : 'indigo'} className="px-6 py-2 rounded-xl font-black">
                    {profile?.role === 'SISWA' ? (studentSub ? 'SUBMITTED' : isExpired ? 'OVERDUE' : 'ACTIVE') : `${teacherSubs.length} ENTRIES`}
                  </Badge>
                </div>

                <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                <p className="text-sm text-slate-400 mt-3 font-medium line-clamp-2 leading-relaxed">{task.description}</p>
                
                <div className="mt-8 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-indigo-500" />
                    Due: {task.deadline?.toDate ? task.deadline.toDate().toLocaleDateString('id-ID') : 'No Date'}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-indigo-500" />
                    {subjects.find(s => s.id === task.subjectId)?.name || 'General'}
                  </div>
                </div>

                {profile?.role === 'SISWA' && !studentSub && !isExpired && (
                  <div className="mt-10 pt-10 border-t border-slate-50 space-y-6">
                    {activeAssignmentId === task.id ? (
                      <div className="space-y-6 animate-in slide-in-from-top-4">
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border-4 border-dashed border-slate-200 relative group/drop overflow-hidden">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e: any) => setSelectedFile(e.target.files?.[0] || null)} />
                            <div className="text-center space-y-4">
                                <Upload size={32} className="mx-auto text-slate-300 group-hover/drop:text-indigo-600 transition-all" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{selectedFile ? selectedFile.name : 'Drop file atau ambil foto tugas'}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                          <Button className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl" onClick={() => handleSubmitTask(task.id)} disabled={loading || !selectedFile}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Kirim Sekarang'}
                          </Button>
                          {selectedFile && (
                            <button 
                              onClick={() => { setShowAIModal(true); handleAIScan(); }}
                              className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-xl border border-amber-100"
                              title="Smart AI Scan"
                            >
                                <BrainCircuit size={28} />
                            </button>
                          )}
                          <Button variant="ghost" onClick={() => setActiveAssignmentId(null)}>Batal</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full py-5 rounded-2xl border-slate-100 bg-slate-50 font-black uppercase tracking-widest" onClick={() => setActiveAssignmentId(task.id)}>
                        <Camera size={20} className="mr-2" /> Mulai Pengumpulan
                      </Button>
                    )}
                  </div>
                )}

                {profile?.role === 'GURU' && (
                  <div className="mt-10 pt-10 border-t border-slate-50 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Users size={16} /> Data Pengumpulan Siswa</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {teacherSubs.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white hover:shadow-xl transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl">{s.studentName?.charAt(0)}</div>
                            <div>
                                <p className="font-black text-slate-900 leading-none">{s.studentName}</p>
                                <Badge variant={s.status === 'GRADED' ? 'success' : 'indigo'} className="mt-2 text-[8px] px-2 py-0.5">{s.status}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={s.fileUrl} target="_blank" className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm"><ChevronRight size={20} /></a>
                            <button onClick={() => { setSelectedSubmission(s); setScoreInput(s.score?.toString() || ''); setFeedbackInput(s.feedback || ''); setShowGradingModal(true); }} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-amber-500 hover:text-amber-600 shadow-sm"><Award size={20}/></button>
                          </div>
                        </div>
                      ))}
                      {teacherSubs.length === 0 && <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Belum ada pengumpulan</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showAIModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
            <Card className="w-full max-w-xl shadow-3xl rounded-[3.5rem] border-none overflow-hidden animate-in zoom-in duration-500 bg-white">
                <div className="p-10 bg-amber-600 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-800 opacity-60"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <Sparkles size={32} />
                        <h2 className="text-2xl font-black uppercase tracking-tighter">AI Visual Insight</h2>
                    </div>
                    <button onClick={() => setShowAIModal(false)} className="relative z-10"><X size={32} /></button>
                </div>
                <div className="p-10 space-y-8">
                    {aiLoading ? (
                        <div className="text-center py-12 space-y-6">
                            <Loader2 className="animate-spin text-amber-600 mx-auto" size={56} />
                            <p className="text-sm font-black text-slate-600 uppercase tracking-[0.3em] animate-pulse">Membaca Tulisan Tangan Siswa...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-amber-50 p-8 rounded-[2.5rem] border-2 border-amber-100 relative">
                                <h4 className="font-black text-amber-800 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2"><Bot size={14}/> Hasil Analisis Kurikulum:</h4>
                                <div className="text-sm text-amber-900 leading-relaxed font-bold whitespace-pre-wrap">
                                    {aiFeedback}
                                </div>
                            </div>
                            <Button onClick={() => setShowAIModal(false)} className="w-full py-5 bg-slate-900 hover:bg-black font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-100">Paham, Simpan Hasil</Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
      )}

      {showGradingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-3xl rounded-[3rem] border-none animate-in zoom-in duration-300 bg-white">
            <div className="p-8 border-b bg-indigo-600 text-white flex justify-between items-center rounded-t-[3rem]">
              <h2 className="text-xl font-black uppercase tracking-tight">Evaluasi Akademik</h2>
              <button onClick={() => setShowGradingModal(false)}><X size={28} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">{selectedSubmission?.studentName?.charAt(0)}</div>
                  <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa Dinilai</p>
                      <p className="font-black text-slate-800 text-lg">{selectedSubmission?.studentName}</p>
                  </div>
                </div>
                <button onClick={handleAiReview} disabled={isAiGrading} className="bg-indigo-950 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-2">
                  {isAiGrading ? <Loader2 size={16} className="animate-spin" /> : <><Bot size={16} /> AI Score</>}
                </button>
              </div>
              <form onSubmit={handleGradeSubmission} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nilai (0-100)</label>
                  <Input type="number" min="0" max="100" required value={scoreInput} onChange={(e: any) => setScoreInput(e.target.value)} className="bg-white border-slate-200 py-8 text-3xl font-black text-center rounded-[1.5rem]" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Umpan Balik Guru</label>
                  <textarea className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32 leading-relaxed font-bold" placeholder="Catatan untuk siswa..." value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} />
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1 py-5 rounded-2xl font-black uppercase shadow-2xl" type="submit" disabled={loading}>Verifikasi Nilai</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Assignments;
