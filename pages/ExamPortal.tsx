
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { preventCheating, enterFullscreen, exitFullscreen, startProctoringCamera } from '../utils/security';
import { AlertTriangle, Clock, ShieldCheck, Lock, Camera, Loader2, AlertCircle, MonitorOff, UserCheck, Zap } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/ui/Shared';

const ExamPortal: React.FC = () => {
  const { examId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [violationLog, setViolationLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      try {
        const docRef = doc(db, 'exams', examId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setExam(data);
          const shuffled = [...(data.questions || [])].sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
          setTimeLeft(data.duration * 60);
        }
      } catch (e) {
        console.error("Critical: Failed to load exam protocol", e);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // Real-time Integrity Logic
  useEffect(() => {
    if (!isStarted || isLocked || isSubmitting) return;

    const cleanup = preventCheating((msg) => {
      setViolations(prev => {
        const next = prev + 1;
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `${timestamp}: ${msg}`;
        setViolationLog(log => [...log, logEntry]);
        
        // INSTANT ALERT SYNC TO FIRESTORE
        if (profile) {
          const alertId = `${examId}_${profile.uid}`;
          setDoc(doc(db, 'exam_alerts', alertId), {
            studentId: profile.uid,
            studentName: profile.name,
            examTitle: exam?.title,
            violationCount: next,
            lastViolation: logEntry,
            violationLog: [...violationLog, logEntry],
            timestamp: serverTimestamp(),
            isCritical: next >= 3
          }, { merge: true }).catch(err => console.error("Integrity Sync Failed:", err));
        }

        if (next >= 3) {
          setIsLocked(true);
          handleFinalSubmit(next, true, [...violationLog, logEntry]);
        } else {
          // Re-force focus if user tab-switched
          enterFullscreen();
        }
        return next;
      });
    });

    return () => cleanup();
  }, [isStarted, isLocked, isSubmitting, exam, violationLog, profile, examId]);

  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isLocked || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinalSubmit(violations);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => timer && clearInterval(timer);
  }, [isStarted, timeLeft, isLocked, isSubmitting, violations]);

  const startExam = async () => {
    const stream = await startProctoringCamera(videoRef);
    if (!stream) {
      alert("Protokol Keamanan: Akses kamera wajib aktif untuk verifikasi proctoring AI.");
      return;
    }
    streamRef.current = stream;
    enterFullscreen();
    setIsStarted(true);
  };

  const handleFinalSubmit = async (vCount: number, forced = false, finalLog?: string[]) => {
    if (!examId || !profile || isSubmitting) return;
    setIsSubmitting(true);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOption) correctCount++;
    });
    const score = Math.round((correctCount / questions.length) * 100);

    try {
      await addDoc(collection(db, 'exam_attempts'), {
        examId,
        examTitle: exam.title,
        studentId: profile.uid,
        studentName: profile.name,
        score,
        violations: vCount,
        violationLog: finalLog || violationLog,
        isForced: forced,
        submittedAt: serverTimestamp(),
        studentClass: profile.class || 'Regular Class'
      });
      exitFullscreen();
      navigate('/grades');
    } catch (err) {
      console.error("Submission Crash:", err);
      alert("Kesalahan Jaringan. Sistem akan mencoba sinkronisasi otomatis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-12 text-center text-white animate-in zoom-in duration-700">
        <div className="w-32 h-32 bg-rose-600 rounded-[3rem] flex items-center justify-center shadow-[0_0_80px_rgba(225,29,72,0.5)] mb-12 animate-pulse">
          <MonitorOff size={64} />
        </div>
        <h1 className="text-6xl font-black text-rose-500 uppercase tracking-tighter">Session Terminated</h1>
        <p className="text-slate-400 mt-8 max-w-xl mx-auto font-bold text-xl leading-relaxed">
          Sesi ujian dihentikan secara otomatis karena pelanggaran protokol keamanan berulang. Guru pengampu telah menerima notifikasi insiden ini.
        </p>
        <Button onClick={() => navigate('/')} className="mt-12 bg-white text-slate-950 px-16 py-6 font-black text-lg rounded-2xl hover:bg-slate-100 transition-all shadow-2xl">
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  if (loading && !isStarted) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-10">
      <Loader2 className="text-indigo-500 animate-spin" size={64} />
      <p className="text-sm font-black uppercase tracking-[0.4em]">Mempersiapkan Lingkungan Aman...</p>
    </div>
  );

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <Card className="max-w-2xl w-full rounded-[4rem] border-none shadow-3xl overflow-hidden bg-white relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="p-12 md:p-16 text-center space-y-12">
            <ShieldCheck size={72} className="mx-auto text-indigo-600" />
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{exam?.title || 'Gateway Ujian'}</h1>
              <Badge variant="indigo" className="px-6 py-2.5 rounded-xl uppercase font-black tracking-widest text-[10px] shadow-xl shadow-indigo-100 border-none">AI PROCTORING ACTIVE</Badge>
            </div>
            
            <div className="aspect-video bg-black rounded-[3.5rem] overflow-hidden border-[10px] border-slate-100 shadow-3xl relative">
               <video ref={videoRef} autoPlay muted className="w-full h-full object-cover grayscale" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-6">
                  <span className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2 animate-pulse"><Camera size={16} /> Kalibrasi Kamera...</span>
               </div>
            </div>

            <Button onClick={startExam} className="w-full py-7 text-2xl font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-200 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-700 transition-all">
              Mulai Sesi Aman
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 select-none pb-48">
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-3xl border-b border-slate-100 p-8 px-16 flex justify-between items-center z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-rose-600 text-white px-8 py-3.5 rounded-2xl font-black text-[12px] tracking-[0.3em] shadow-2xl shadow-rose-200">
            <Zap size={20} className="fill-white" /> LIVE MONITORING
          </div>
          <div>
            <span className="font-black text-slate-900 tracking-tight text-2xl">{exam?.title}</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID Siswa: {profile?.uid.substring(0,8)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className={`flex items-center gap-4 px-12 py-4 rounded-3xl font-black transition-all shadow-3xl ${
            timeLeft < 300 ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-slate-900 text-white shadow-slate-200'
          }`}>
            <Clock size={28} />
            <span className="text-3xl tabular-nums tracking-tighter">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <Button variant="destructive" onClick={() => handleFinalSubmit(violations)} className="rounded-[1.8rem] px-14 py-5 font-black text-sm uppercase tracking-widest">
            Kumpulkan Ujian
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-56 px-6 space-y-20">
        {questions.map((q: any, idx: number) => (
          <Card key={idx} className={`rounded-[4rem] border-none shadow-3xl overflow-hidden bg-white transition-all ${
            answers[idx] !== undefined ? 'ring-8 ring-indigo-500/10' : ''
          }`}>
            <CardContent className="p-16 space-y-16">
              <p className="text-3xl font-black text-slate-800 leading-tight tracking-tight">
                <span className="text-indigo-600 mr-4">#{idx+1}</span> {q.text}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {q.options.map((opt: string, optIdx: number) => (
                  <button
                    key={optIdx}
                    onClick={() => setAnswers({ ...answers, [idx]: optIdx })}
                    className={`p-10 rounded-[3rem] border-4 text-left transition-all font-black flex items-center group ${
                      answers[idx] === optIdx 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xl' 
                        : 'border-slate-50 hover:border-indigo-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-8 font-black ${
                        answers[idx] === optIdx ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-2xl">{opt}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      {violations > 0 && (
        <div className="fixed bottom-16 left-16 bg-rose-600 text-white px-12 py-6 rounded-[3rem] shadow-2xl flex items-center gap-6 animate-in slide-in-from-left-12">
          <AlertTriangle size={32} />
          <div>
             <p className="font-black text-[10px] uppercase tracking-widest opacity-80">Pelanggaran Integritas</p>
             <p className="text-2xl font-black">{violations} / 3 Percobaan</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPortal;
