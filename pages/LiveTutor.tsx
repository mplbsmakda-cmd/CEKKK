
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, PhoneOff, Loader2, Sparkles, ShieldCheck, Waves } from 'lucide-react';
import { useAuth } from '../authContext';
import { Button, Card, Badge } from '../components/ui/Shared';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveTutor: React.FC = () => {
  const { profile } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusText, setStatusText] = useState('Siap untuk memulai sesi suara...');
  
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    setStatusText('Membangun jalur transmisi suara...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputAudioContext;

      // Resume context because of browser auto-play policy
      if (outputAudioContext.state === 'suspended') {
        await outputAudioContext.resume();
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            setStatusText('Sesi Terhubung. Silakan bicara.');

            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1
              );

              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            setStatusText('Sesi terganggu. Harap muat ulang halaman.');
            endSession();
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: `Anda adalah AI Tutor interaktif LPPMRI 2. Siswa: ${profile?.name}. Jurusan: ${profile?.class}. Gunakan bahasa yang ramah dan mendidik.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Setup Error:", err);
      setIsConnecting(false);
      alert("Izin mikrofon diperlukan untuk fitur ini.");
    }
  };

  const endSession = () => {
    sessionRef.current?.close();
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    sourcesRef.current.clear();
    setIsActive(false);
    setStatusText('Sesi ditutup.');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full overflow-hidden border-none shadow-[0_32px_64px_-16px_rgba(79,70,229,0.3)] rounded-[3rem] bg-white">
        <div className="p-10 bg-indigo-600 text-white text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-800 opacity-80"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-28 h-28 rounded-[2.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/20 transition-all duration-700 ${isActive ? 'scale-110' : 'rotate-12'}`}>
              {isActive ? <Waves size={56} className="animate-pulse" /> : <Mic size={56} />}
            </div>
            <h2 className="text-3xl font-black mt-8 tracking-tighter uppercase">LPPMRI Voice Lab</h2>
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mt-2">Native Audio AI v2.5</p>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="text-center space-y-4">
             <div className="flex justify-center gap-3">
                <Badge variant={isActive ? 'success' : 'indigo'} className="px-6 py-2 rounded-xl font-black">
                  {isActive ? 'SESI AKTIF' : 'SIAP TERHUBUNG'}
                </Badge>
             </div>
             <p className="text-slate-500 text-sm font-bold leading-relaxed">{statusText}</p>
          </div>

          <div className="space-y-4">
            {!isActive ? (
              <Button 
                className="w-full py-6 rounded-2xl shadow-2xl shadow-indigo-100 font-black text-lg uppercase tracking-widest gap-3" 
                onClick={startSession}
                disabled={isConnecting}
              >
                {isConnecting ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={24} /> Aktifkan AI Voice</>}
              </Button>
            ) : (
              <Button variant="destructive" className="w-full py-6 rounded-2xl gap-3 font-black text-lg uppercase tracking-widest shadow-2xl shadow-rose-100" onClick={endSession}>
                <PhoneOff size={24} /> Putus Sambungan
              </Button>
            )}

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4 items-start">
              <ShieldCheck size={20} className="text-indigo-600 mt-1 shrink-0" />
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Koneksi suara menggunakan protokol aman Gemini Live. Tidak ada rekaman yang disimpan di server.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LiveTutor;
