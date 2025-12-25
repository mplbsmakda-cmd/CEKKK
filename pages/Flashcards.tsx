
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Brain, Sparkles, RefreshCcw, ArrowRight, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/Shared';
import { Flashcard } from '../types';

const Flashcards: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateCards = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Buatkan 5 flashcards (pertanyaan & jawaban singkat) untuk membantu hafalan berdasarkan materi berikut: ${inputText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          }
        }
      });
      setCards(JSON.parse(response.text));
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
      alert("Gagal membuat kartu hafalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Smart Flashcards</h1>
          <p className="text-slate-500">Ubah materi sulit menjadi kartu hafalan interaktif.</p>
        </div>
        <Badge variant="indigo" className="gap-2 px-4 py-2">
          <Brain size={14} /> AI Study Aid
        </Badge>
      </div>

      {cards.length === 0 ? (
        <Card className="p-8 border-dashed border-2 border-indigo-100 bg-white">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <Sparkles size={24} />
              <h3 className="font-bold text-lg">Input Materi Pembelajaran</h3>
            </div>
            <textarea
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl h-48 outline-none focus:ring-2 focus:ring-indigo-500 font-medium leading-relaxed"
              placeholder="Tempelkan ringkasan materi atau poin-poin penting di sini..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button onClick={generateCards} disabled={loading || !inputText} className="w-full py-4 gap-2 text-lg font-black shadow-lg shadow-indigo-100">
              {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Buat Kartu Hafalan</>}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8 animate-in zoom-in duration-300">
          <div 
            className="relative perspective-1000 w-full max-w-xl mx-auto cursor-pointer h-80"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 bg-white border-2 border-indigo-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-xl">
                <Badge variant="indigo" className="absolute top-6">PERTANYAAN</Badge>
                <p className="text-xl font-bold text-slate-800 leading-relaxed">
                  {cards[currentIndex].question}
                </p>
                <p className="absolute bottom-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik untuk lihat jawaban</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-indigo-600 text-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl">
                <Badge variant="default" className="absolute top-6 bg-white/20 text-white border-none">JAWABAN</Badge>
                <p className="text-xl font-bold leading-relaxed">
                  {cards[currentIndex].answer}
                </p>
                <p className="absolute bottom-6 text-[10px] font-black text-indigo-200 uppercase tracking-widest">Klik untuk kembali ke soal</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-6">
            <button 
              onClick={() => { setCurrentIndex(prev => Math.max(0, prev - 1)); setIsFlipped(false); }}
              disabled={currentIndex === 0}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="text-center">
              <p className="text-lg font-black text-slate-800">{currentIndex + 1} <span className="text-slate-300">/</span> {cards.length}</p>
            </div>
            <button 
              onClick={() => { setCurrentIndex(prev => Math.min(cards.length - 1, prev + 1)); setIsFlipped(false); }}
              disabled={currentIndex === cards.length - 1}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ArrowRight size={24} />
            </button>
          </div>

          <div className="flex justify-center">
            <button onClick={() => setCards([])} className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">
              <RefreshCcw size={14} /> Ganti Materi Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
