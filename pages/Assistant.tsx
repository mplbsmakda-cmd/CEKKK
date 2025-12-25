
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, Send, User, Sparkles, Loader2, Globe, ExternalLink, RefreshCcw } from 'lucide-react';
import { useAuth } from '../authContext';
import { Card, Button, Badge } from '../components/ui/Shared';

const Assistant: React.FC = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string, links?: any[]}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Anda adalah AI Tutor ahli untuk SMK LPPMRI 2 Kedungreja. 
          Siswa: ${profile?.name}. Jurusan: ${profile?.class}.
          Berikan jawaban teknis yang mendalam, profesional, dan gunakan Search Grounding untuk data industri 2025.`,
          tools: [{ googleSearch: {} }]
        }
      });

      let fullResponse = "";
      let links: any[] = [];
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of responseStream) {
        const textChunk = chunk.text || "";
        fullResponse += textChunk;
        
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          links = chunk.candidates[0].groundingMetadata.groundingChunks;
        }

        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], text: fullResponse, links };
          return updated;
        });
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Koneksi AI terputus. Mohon periksa API Key atau koneksi internet Anda.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">AI Knowledge Hub</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-600" /> LPPMRI Advanced Intelligence (Pro)
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setMessages([])} className="rounded-2xl bg-white">
            <RefreshCcw size={14} className="mr-2" /> Reset
          </Button>
          <Badge variant="indigo" className="gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-indigo-50">
            <Globe size={14} className="animate-spin-slow" /> Search Grounding Active
          </Badge>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-3xl rounded-[3rem] bg-white">
        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-10">
              <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] flex items-center justify-center shadow-3xl rotate-6">
                <Brain size={64} className="text-white" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Halo, {profile?.name}</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed px-6">Tanyakan apapun tentang kurikulum SMK atau persiapan karir industri.</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
              <div className={`flex gap-5 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${msg.role === 'user' ? 'bg-slate-900' : 'bg-gradient-to-tr from-indigo-600 to-violet-700'}`}>
                  {msg.role === 'user' ? <User size={24} className="text-white" /> : <Sparkles size={24} className="text-white" />}
                </div>
                <div className="space-y-4">
                  <div className={`p-6 rounded-[2.5rem] shadow-xl text-md leading-relaxed whitespace-pre-wrap font-bold ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-indigo-50 text-slate-800 rounded-tl-none'}`}>
                    {msg.text || (loading && i === messages.length - 1 && <Loader2 className="animate-spin" />)}
                  </div>
                  {msg.links && msg.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.links.map((link: any, idx: number) => link.web && (
                        <a key={idx} href={link.web.uri} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-indigo-50 text-[9px] font-black text-indigo-700 px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-indigo-100 transition-all shadow-xl">
                          <ExternalLink size={12} /> {link.web.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleChat} className="p-8 bg-white border-t border-slate-50 flex gap-4">
          <input
            type="text"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-5 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner font-bold"
            placeholder="Tanyakan materi sulit kepada AI Tutor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-90 shadow-2xl shadow-indigo-100"
          >
            {loading ? <Loader2 size={28} className="animate-spin" /> : <Send size={28} />}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Assistant;
