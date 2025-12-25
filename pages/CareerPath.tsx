
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Compass, Briefcase, Sparkles, Loader2, ExternalLink, 
  TrendingUp, Target, FileText, Download, CheckCircle2,
  ShieldCheck, Layout, Award, Key
} from 'lucide-react';
import { useAuth } from '../authContext';
import { Card, Button, Badge, Input } from '../components/ui/Shared';

const CareerPath: React.FC = () => {
  const { profile } = useAuth();
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [resumeContent, setResumeContent] = useState<string | null>(null);

  const checkApiKey = async () => {
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
      return true;
    }
    return true;
  };

  const analyzeCareer = async () => {
    if (!interest.trim()) return;
    await checkApiKey();
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Analisis jalur karir masa depan untuk siswa SMK jurusan ${profile?.class || 'Multimedia'} yang tertarik pada: ${interest}. Berikan rekomendasi pekerjaan, tren pasar kerja di Indonesia tahun 2025, dan skill spesifik yang harus dipelajari.`,
        config: { tools: [{ googleSearch: {} }] }
      });

      setAnalysis({
        text: response.text,
        links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      });
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
      alert("Gagal memproses analisis karir.");
    } finally {
      setLoading(false);
    }
  };

  const generateSmartResume = async () => {
    await checkApiKey();
    setIsGeneratingResume(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Buatkan draft CV/Resume profesional ATS-FRIENDLY untuk siswa SMK bernama ${profile?.name}, jurusan ${profile?.class}. Gunakan bahasa Indonesia formal. Sertakan bagian: Profil Profesional, Kompetensi Keahlian (Hard Skills), Soft Skills, Riwayat Pendidikan, dan Proyek/Praktik Kerja Industri. Sesuaikan dengan minat: ${interest}.`,
      });
      setResumeContent(response.text);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setIsGeneratingResume(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">CareerPath AI</h1>
          <p className="text-slate-500 font-medium">Navigasi masa depan Anda setelah lulus dari SMK LPPMRI 2.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => (window as any).aistudio.openSelectKey()} className="rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest gap-2">
            <Key size={14} /> Ganti API Key
          </Button>
          <Badge variant="indigo" className="gap-2 px-6 py-3 rounded-2xl uppercase font-black text-xs tracking-widest shadow-lg shadow-indigo-100">
            <Target size={14} /> Link and Match Industri
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-fit border-none shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] bg-white overflow-hidden">
            <div className="p-10 space-y-8">
              <div className="bg-indigo-600 w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                <Compass size={40} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Apa Impianmu?</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Beritahu AI cita-citamu untuk mendapatkan peta jalan sukses.</p>
              </div>
              <textarea
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-48 font-medium leading-relaxed resize-none"
                placeholder="Contoh: Saya ingin menjadi Game Developer atau Teknisi Jaringan di Telkom..."
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
              <Button className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200" onClick={analyzeCareer} disabled={loading || !interest.trim()}>
                {loading ? <Loader2 className="animate-spin" /> : 'Analisis Masa Depan'}
              </Button>
            </div>
          </Card>

          {analysis && (
            <Card className="bg-slate-900 text-white rounded-[2.5rem] p-10 space-y-6 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10"><FileText size={100} /></div>
              <h4 className="font-black text-xs uppercase tracking-widest text-indigo-400 flex items-center gap-2"><Award size={16}/> Career Booster</h4>
              <p className="text-sm font-medium text-slate-300">Siapkan berkas lamaran kerjamu dengan asisten resume cerdas yang dioptimasi untuk industri.</p>
              <Button 
                onClick={generateSmartResume} 
                disabled={isGeneratingResume}
                className="w-full bg-white text-slate-900 hover:bg-indigo-50 py-4 rounded-2xl font-black gap-2"
              >
                {isGeneratingResume ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Bangun CV ATS-Friendly</>}
              </Button>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          {analysis ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
               <Card className="p-10 space-y-8 rounded-[2.5rem] border-none shadow-2xl bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><Sparkles size={200} /></div>
                <div className="flex items-center gap-3 text-indigo-600">
                  <Sparkles size={24} />
                  <h3 className="font-black uppercase tracking-[0.2em] text-xs">Peta Jalan Karir Anda</h3>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed font-bold">
                  {analysis.text}
                </div>
                {analysis.links.length > 0 && (
                  <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-2">
                    {analysis.links.map((link: any, i: number) => link.web && (
                      <a key={i} href={link.web.uri} target="_blank" className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-100 px-4 py-2.5 rounded-2xl text-[10px] font-black text-indigo-600 transition-all shadow-sm">
                        <ExternalLink size={12} /> {link.web.title}
                      </a>
                    ))}
                  </div>
                )}
              </Card>

              {resumeContent && (
                <Card className="p-10 bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] space-y-6 animate-in zoom-in duration-500">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-indigo-900 flex items-center gap-3 text-xl tracking-tight"><FileText size={28} /> Draft Resume Profesional</h3>
                    <Badge variant="indigo" className="bg-indigo-600 text-white flex gap-1.5"><ShieldCheck size={12}/> ATS Optimized</Badge>
                  </div>
                  <div className="bg-white p-10 rounded-3xl shadow-xl prose prose-indigo max-w-none text-sm font-bold whitespace-pre-wrap border border-indigo-100">
                    {resumeContent}
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1 py-4 gap-2 rounded-2xl font-black shadow-lg shadow-indigo-200">
                        <Download size={18} /> Unduh E-Resume (Draft)
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-16 opacity-30">
              <TrendingUp size={80} className="text-slate-300 mb-6" />
              <h4 className="font-black text-slate-400 uppercase tracking-[0.3em] text-lg">Peluang Sukses Menanti</h4>
              <p className="max-w-sm mt-4 font-bold text-slate-400">Gunakan AI untuk menganalisis jalur karir terbaik sesuai jurusan SMK Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerPath;
