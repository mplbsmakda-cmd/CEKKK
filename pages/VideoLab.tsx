
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Video, Sparkles, Download, Loader2, Film, ShieldAlert } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/Shared';

const VideoLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('Menginisialisasi server Veo 3.1...');

  const messages = [
    "Menganalisis deskripsi materi...",
    "Merancang model animasi 3D...",
    "Me-render frame pendidikan...",
    "Finishing transisi sinematik...",
    "Video hampir siap..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      let i = 0;
      interval = setInterval(() => {
        setLoadingMsg(messages[i % messages.length]);
        i++;
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateVideo = async () => {
    if (!prompt.trim()) return;

    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsGenerating(true);
    setVideoUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Animasi edukasi berkualitas tinggi: ${prompt}. Cinematic, detailed, 3D style.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Polling for video completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        // Correct fetch pattern with API Key
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error("Veo Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        alert("API Key tidak valid atau memerlukan billing aktif.");
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("Terjadi kesalahan pada generator video AI.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Video Simulation</h1>
          <p className="text-slate-500">Transformasi teks materi menjadi video animasi 3D edukatif.</p>
        </div>
        <Badge variant="indigo" className="gap-2 px-4 py-2"><Film size={14} /> Veo 3.1 Engine</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit border-indigo-100 shadow-xl">
          <div className="p-6 bg-slate-900 text-white rounded-t-xl">
            <h3 className="font-bold flex items-center gap-2"><Sparkles size={18} className="text-indigo-400" /> Scenario Prompt</h3>
          </div>
          <div className="p-6 space-y-4">
            <textarea
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-40 font-medium"
              placeholder="Contoh: Proses pembakaran pada mesin motor 4 tak dengan visual bagian dalam piston..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="bg-amber-50 p-4 rounded-xl flex gap-2 border border-amber-100">
              <ShieldAlert size={16} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-700 font-bold leading-tight">Video Lab menggunakan model komputasi tinggi Veo 3.1.</p>
            </div>
            <Button className="w-full py-4 font-black" onClick={generateVideo} disabled={isGenerating || !prompt}>
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : 'Buat Video Animasi'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card className="min-h-[500px] flex flex-col items-center justify-center bg-slate-50 border-dashed border-2 relative">
            {isGenerating ? (
              <div className="text-center space-y-4 p-8 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl relative">
                    <div className="absolute inset-0 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                    <Film size={32} className="text-white" />
                </div>
                <p className="text-sm font-bold text-indigo-600 animate-pulse">{loadingMsg}</p>
                <p className="text-[10px] text-slate-400">Proses ini memakan waktu sekitar 1-2 menit.</p>
              </div>
            ) : videoUrl ? (
              <div className="p-4 w-full space-y-4 animate-in zoom-in duration-300">
                <video src={videoUrl} controls className="w-full aspect-video bg-black rounded-3xl shadow-2xl" autoPlay />
                <div className="flex gap-3">
                    <a href={videoUrl} download="materi-visual-lppmri.mp4" className="flex-1">
                        <Button variant="outline" className="w-full gap-2 py-4 border-slate-200">
                            <Download size={18} /> Simpan Video
                        </Button>
                    </a>
                    <Button onClick={() => setVideoUrl(null)} className="px-8">Reset</Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 p-12">
                <Video size={64} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold text-slate-600">Simulasi Visual Anda Akan Muncul Di Sini</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoLab;
