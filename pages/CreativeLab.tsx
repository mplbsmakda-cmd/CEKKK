
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Image as ImageIcon, Sparkles, Download, Loader2, Wand2, Info } from 'lucide-react';
import { Card, Button, Badge, Input } from '../components/ui/Shared';

const CreativeLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `High quality educational illustration of: ${prompt}. Professional, clear, and detailed.` }],
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghasilkan gambar. Coba ganti prompt Anda.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Creative Lab</h1>
          <p className="text-slate-500">Hasilkan aset visual pembelajaran berbasis AI.</p>
        </div>
        <Badge variant="indigo" className="gap-2 px-4 py-2">
          <Sparkles size={14} /> Gemini 2.5 Image
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <div className="p-6 bg-indigo-600 text-white rounded-t-xl">
            <h3 className="font-bold flex items-center gap-2"><Wand2 size={18} /> Studio Prompt</h3>
            <p className="text-[10px] text-indigo-100 uppercase mt-1 tracking-widest">Gunakan Bahasa Inggris untuk hasil maksimal</p>
          </div>
          <div className="p-6 space-y-4">
            <textarea
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32"
              placeholder="Contoh: Digital circuit schematic for computer architecture lesson..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              className="w-full py-4 shadow-lg shadow-indigo-100" 
              onClick={generateImage}
              disabled={isGenerating || !prompt}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : 'Generate Visual'}
            </Button>
            <div className="bg-amber-50 p-4 rounded-xl flex gap-2">
              <Info size={16} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-700 font-medium italic">Gambar yang dihasilkan dapat digunakan sebagai aset presentasi atau materi belajar mandiri.</p>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card className="min-h-[500px] flex items-center justify-center bg-slate-50 border-dashed border-2">
            {generatedImage ? (
              <div className="p-4 w-full space-y-4 animate-in zoom-in duration-300">
                <img src={generatedImage} alt="Generated" className="w-full rounded-2xl shadow-2xl" />
                <a href={generatedImage} download="lppmri-ai-asset.png" className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <Download size={16} /> Unduh Hasil (PNG)
                  </Button>
                </a>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <ImageIcon size={64} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold text-sm">Visual Anda akan muncul di sini</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreativeLab;
