
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { GraduationCap, Wand2, Loader2, Download, CheckCircle2, Layout, BookOpen } from 'lucide-react';
import { Card, Button, Badge, Input } from '../components/ui/Shared';

const SyllabusGenerator: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [syllabus, setSyllabus] = useState<any[] | null>(null);

  const generateSyllabus = async () => {
    if (!subject || !grade) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Buatkan rencana silabus pembelajaran SMK LPPMRI 2 Kedungreja untuk mata pelajaran ${subject} kelas ${grade} selama 4 minggu pertama.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.NUMBER },
                topic: { type: Type.STRING },
                objective: { type: Type.STRING },
                activities: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["week", "topic", "objective", "activities"]
            }
          }
        }
      });

      setSyllabus(JSON.parse(response.text));
    } catch (err) {
      console.error(err);
      alert("Gagal membuat silabus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Smart Syllabus Generator</h1>
          <p className="text-slate-500">Rancang RPP dan Silabus semesteran dalam hitungan detik.</p>
        </div>
        <Badge variant="indigo" className="gap-2 px-4 py-2">
          <Layout size={14} /> Teacher Tools
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800">Konfigurasi Modul</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mata Pelajaran</label>
                <Input value={subject} onChange={(e:any) => setSubject(e.target.value)} placeholder="Contoh: Pemrograman Dasar" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tingkat Kelas</label>
                <Input value={grade} onChange={(e:any) => setGrade(e.target.value)} placeholder="Contoh: X RPL 1" />
              </div>
              <Button className="w-full py-4 gap-2" onClick={generateSyllabus} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <><Wand2 size={18} /> Generate Silabus</>}
              </Button>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {syllabus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in duration-300">
              {syllabus.map((item, i) => (
                <Card key={i} className="border-indigo-100 hover:shadow-lg transition-all">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="indigo">Minggu Ke-{item.week}</Badge>
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{item.topic}</h3>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tujuan Belajar:</p>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.objective}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rencana Aktivitas:</p>
                      <ul className="space-y-1.5">
                        {item.activities.map((act: string, j: number) => (
                          <li key={j} className="flex gap-2 text-xs text-slate-500">
                            <span className="text-indigo-600 font-bold">•</span> {act}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 opacity-50">
              <BookOpen size={64} className="text-slate-200 mb-4" />
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Gunakan AI untuk Merancang Kurikulum</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusGenerator;
