
import React, { useState, useEffect } from 'react';
import { collection, query, addDoc, serverTimestamp, where, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../authContext';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Wallet, Upload, CheckCircle, XCircle, Search, 
  ImageIcon, AlertCircle, Loader2, ChevronRight, ShieldCheck, Sparkles, FileSearch, History, DollarSign
} from 'lucide-react';
import { Payment } from '../types';
import { Button, Card, CardContent, Input, Badge } from '../components/ui/Shared';

const Payments: React.FC = () => {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, {match: boolean, info: string, confidence: number, detectedAmount: number}>>({});

  useEffect(() => {
    if (!profile) return;
    
    // Real-time listener for payments
    const baseQuery = collection(db, 'payments');
    const q = profile.role === 'SISWA' 
      ? query(baseQuery, where('studentId', '==', profile.uid))
      : (filterStatus === 'ALL' ? baseQuery : query(baseQuery, where('status', '==', filterStatus)));
    
    const unsub = onSnapshot(q, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[]);
    });

    return () => unsub();
  }, [profile, filterStatus]);

  const fileToGenerativePart = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          inlineData: {
            data: (reader.result as string).split(',')[1],
            mimeType: 'image/jpeg',
          },
        });
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleAiAudit = async (payment: Payment) => {
    setProcessingId(payment.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imagePart: any = await fileToGenerativePart(payment.proofUrl);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            imagePart,
            { text: `Lakukan audit finansial pada struk ini. Klaim nominal: Rp ${payment.amount.toLocaleString()}. Deteksi nominal asli, cek manipulasi pixel, dan verifikasi tanggal. Output JSON.` }
          ]
        },
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              match: { type: Type.BOOLEAN },
              info: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              detectedAmount: { type: Type.NUMBER }
            },
            required: ["match", "info", "confidence", "detectedAmount"]
          }
        }
      });
      
      const result = JSON.parse(response.text);
      setAiAnalysis(prev => ({ ...prev, [payment.id]: result }));
    } catch (err: any) {
      console.error("AI Audit Error:", err);
      alert("Layanan AI Audit sedang sibuk. Silakan lakukan verifikasi manual atau coba lagi nanti.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `payments/${profile.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const proofUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'payments'), {
        studentId: profile.uid, 
        amount: Number(amount), 
        status: 'PENDING', 
        proofUrl, 
        date: serverTimestamp(),
        studentName: profile.name
      });
      setAmount(''); setFile(null);
      alert('Bukti pembayaran terkirim! Admin akan memvalidasi segera.');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    setProcessingId(paymentId);
    try {
      await updateDoc(doc(db, 'payments', paymentId), { status });
    } catch (err) { console.error(err); }
    finally { setProcessingId(null); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Finance Center</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-3">
            <ShieldCheck size={16} className="text-indigo-600" /> Secure Payment Protocol SMK LPPMRI 2
          </p>
        </div>
        <Button variant="outline" className="rounded-2xl px-8 py-4 bg-white shadow-xl">
          <History size={18} className="mr-2" /> History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {profile?.role === 'SISWA' && (
          <Card className="lg:col-span-4 border-none shadow-3xl rounded-[3.5rem] bg-white overflow-hidden h-fit">
            <div className="p-12 bg-indigo-600 text-white relative">
              <h2 className="font-black text-2xl tracking-tight flex items-center gap-4"><DollarSign size={32} /> Setor SPP</h2>
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-80">Upload Bukti Transfer</p>
            </div>
            <form onSubmit={handleUploadProof} className="p-12 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nominal (IDR)</label>
                <Input type="number" placeholder="250000" required value={amount} onChange={(e: any) => setAmount(e.target.value)} className="text-2xl font-black py-8 bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lampiran Struk</label>
                <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:bg-indigo-50 transition-all relative group cursor-pointer bg-slate-50">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                  <ImageIcon size={40} className="mx-auto text-slate-300 group-hover:text-indigo-600 mb-4" />
                  <p className="text-xs font-black text-slate-500 uppercase">{file ? file.name : 'Pilih Gambar'}</p>
                </div>
              </div>
              <Button className="w-full py-6 rounded-[1.8rem] font-black shadow-3xl" type="submit" disabled={loading}>
                {loading ? <Loader2 size={24} className="animate-spin" /> : 'Kirim Bukti'}
              </Button>
            </form>
          </Card>
        )}

        <Card className={`${profile?.role === 'SISWA' ? 'lg:col-span-8' : 'lg:col-span-12'} border-none shadow-3xl rounded-[3.5rem] bg-white overflow-hidden`}>
          <div className="p-8 bg-slate-50 flex gap-4 border-b border-slate-100 overflow-x-auto">
            {['PENDING', 'VERIFIED', 'REJECTED', 'ALL'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s as any)} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all ${filterStatus === s ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'bg-white text-slate-500 border border-slate-200'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  <th className="px-10 py-8">Nama Siswa</th>
                  <th className="px-10 py-8">Nominal</th>
                  <th className="px-10 py-8 text-center">AI Audit</th>
                  <th className="px-10 py-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-950 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                          {p.studentName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 leading-none">{p.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-black mt-2">{p.date?.toDate().toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 font-black text-2xl text-slate-800">Rp {p.amount.toLocaleString()}</td>
                    <td className="px-10 py-8">
                      <div className="flex justify-center">
                        {aiAnalysis[p.id] ? (
                          <div className={`p-6 rounded-[2rem] text-[10px] font-bold border-2 shadow-xl ${aiAnalysis[p.id].match ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                             <p className="uppercase tracking-widest flex gap-2"><Sparkles size={14}/> Trust: {aiAnalysis[p.id].confidence}%</p>
                             <p className="mt-2 leading-relaxed">{aiAnalysis[p.id].info}</p>
                          </div>
                        ) : profile?.role === 'BENDAHARA' && p.status === 'PENDING' ? (
                          <button onClick={() => handleAiAudit(p)} disabled={processingId === p.id} className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase shadow-xl">
                            {processingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={18} className="mr-2" /> AI Audit</>}
                          </button>
                        ) : <span className="text-[11px] text-slate-300 font-black italic">Audit Antri</span>}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {profile?.role === 'BENDAHARA' && p.status === 'PENDING' ? (
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => updateStatus(p.id, 'VERIFIED')} className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><CheckCircle size={24} /></button>
                          <button onClick={() => updateStatus(p.id, 'REJECTED')} className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><XCircle size={24} /></button>
                          <a href={p.proofUrl} target="_blank" className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><FileSearch size={24}/></a>
                        </div>
                      ) : (
                        <Badge variant={p.status === 'VERIFIED' ? 'success' : p.status === 'REJECTED' ? 'error' : 'indigo'} className="px-10 py-3 rounded-2xl font-black">
                           {p.status}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
