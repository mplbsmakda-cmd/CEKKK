
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Briefcase, MapPin, Search, Loader2, ExternalLink, Filter, TrendingUp, Building2, Key } from 'lucide-react';
import { useAuth } from '../authContext';
import { Card, Button, Badge, Input } from '../components/ui/Shared';

const JobBoard: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [major, setMajor] = useState(profile?.class?.includes('RPL') ? 'Rekayasa Perangkat Lunak' : 'Teknik');

  const fetchJobs = async () => {
    // Check for API Key selection for Pro models as per guidelines
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Cari lowongan kerja terbaru (Februari-Maret 2025) di wilayah Cilacap, Kedungreja, Sidareja atau Jawa Tengah yang sangat spesifik untuk lulusan SMK jurusan ${major}. Berikan daftar yang menyertakan nama perusahaan dan posisi.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const formattedJobs = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title,
          uri: c.web.uri,
        }));

      // If no grounded links, fallback to text analysis
      if (formattedJobs.length === 0 && response.text) {
        setJobs([{ title: "Analisis AI: " + response.text.substring(0, 100) + "...", uri: "#", isText: true }]);
      } else {
        setJobs(formattedJobs);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bursa Kerja SMK</h1>
          <p className="text-slate-500">Link & Match Industri: Temukan peluang karir masa depanmu.</p>
        </div>
        <Badge variant="success" className="gap-2 px-4 py-2">
          <TrendingUp size={14} /> Live Search 2025
        </Badge>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <Filter className="text-slate-400 ml-2" size={20} />
        <select 
          className="bg-transparent text-sm font-bold outline-none flex-1 cursor-pointer"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
        >
          <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</option>
          <option value="Teknik Otomotif">Teknik Otomotif (TKR/TSM)</option>
          <option value="Akuntansi">Akuntansi & Keuangan</option>
          <option value="Multimedia">Multimedia / DKV</option>
          <option value="Teknik Jaringan Komputer">Teknik Jaringan Komputer (TKJ)</option>
        </select>
        <Button onClick={fetchJobs} disabled={loading} className="rounded-2xl gap-2 min-w-[140px]">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <><Search size={16} /> Cari Loker</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-3 bg-slate-50 rounded w-1/2"></div>
              </div>
            </Card>
          ))
        ) : jobs.length > 0 ? (
          jobs.map((job, i) => (
            <Card key={i} className="group hover:border-indigo-200 transition-all hover:shadow-xl">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Building2 size={24} />
                  </div>
                  <Badge variant="indigo">Verified Info</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">{job.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-medium">
                    <MapPin size={12} /> Jawa Tengah & Sekitarnya
                  </div>
                </div>
                {job.uri !== "#" ? (
                  <a href={job.uri} target="_blank" rel="noreferrer" className="block pt-2">
                    <Button variant="outline" className="w-full gap-2 text-xs border-slate-100 bg-slate-50 font-black uppercase tracking-widest">
                      Detail Lowongan <ExternalLink size={14} />
                    </Button>
                  </a>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Gunakan kata kunci pencarian yang lebih spesifik.</p>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-40">
            <Briefcase size={64} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-sm">Tidak ada lowongan ditemukan</p>
            <Button variant="ghost" onClick={fetchJobs} className="mt-4">Coba Lagi</Button>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><TrendingUp size={160} /></div>
        <div className="relative z-10">
          <h4 className="font-black text-xl tracking-tight">Butuh API Key untuk fitur Pro?</h4>
          <p className="text-slate-400 text-xs font-medium mt-1">Pilih kunci API Anda sendiri untuk akses pencarian industri 2025.</p>
        </div>
        <Button onClick={() => (window as any).aistudio.openSelectKey()} className="bg-white text-slate-900 hover:bg-indigo-50 font-black relative z-10">
          <Key size={18} className="mr-2" /> Ganti API Key
        </Button>
      </div>
    </div>
  );
};

export default JobBoard;
