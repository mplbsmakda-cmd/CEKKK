
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { 
  Users, BookOpen, FileCheck, Zap, Sparkles, Loader2,
  TrendingUp, Activity, ArrowUpRight, Calendar, Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { Card, Badge } from '../components/ui/Shared';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, materials: 0, submissions: 0 });
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    // Parallel Listeners - Non-blocking UI
    const unsubscribers = [
      onSnapshot(collection(db, 'users'), s => setStats(p => ({...p, users: s.size}))),
      onSnapshot(collection(db, 'materials'), s => setStats(p => ({...p, materials: s.size}))),
      onSnapshot(collection(db, 'submissions'), s => {
        setStats(p => ({...p, submissions: s.size}));
        setLoading(false); // Lepas loading state segera setelah data pertama masuk
      })
    ];

    if (profile) fetchAIInsight();

    return () => unsubscribers.forEach(unsub => unsub());
  }, [profile]);

  const fetchAIInsight = async () => {
    // Ambil dari localStorage untuk instan UI jika tersedia
    const cached = localStorage.getItem(`ai_insight_${profile?.uid}`);
    if (cached) setAiInsight(cached);

    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Berikan 1 motivasi industri profesional singkat (maks 15 kata) untuk jurusan ${profile?.class || 'SMK'}.`,
      });
      const text = response.text;
      setAiInsight(text);
      localStorage.setItem(`ai_insight_${profile?.uid}`, text);
    } catch (e) {
      if (!cached) setAiInsight("Tingkatkan kompetensi, kuasai masa depan industri.");
    } finally {
      setLoadingAI(false);
    }
  };

  const chartData = [
    { name: 'Sen', value: 30 }, { name: 'Sel', value: 45 }, { name: 'Rab', value: 40 },
    { name: 'Kam', value: 70 }, { name: 'Jum', value: 50 }, { name: 'Sab', value: 65 },
  ];

  if (loading && stats.users === 0) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 w-1/3 bg-slate-900 rounded-3xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-900 rounded-[2.5rem]"></div>)}
      </div>
      <div className="h-80 bg-slate-900 rounded-[3rem]"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            System <span className="text-indigo-500">Overview</span>
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <Badge variant="indigo" className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">
              {profile?.role || 'USER'} SESSION ACTIVE
            </Badge>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800">
              <Calendar size={14} /> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
        
        <div className="glass p-5 rounded-3xl flex items-center gap-5 min-w-[240px]">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center">
            <Activity size={24} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Speed</p>
            <p className="text-white font-black text-lg">Optimized <span className="text-emerald-500 ml-2">●</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem label="Total Siswa" value={stats.users} icon={Users} color="indigo" />
        <StatItem label="Modul Aktif" value={stats.materials} icon={BookOpen} color="violet" />
        <StatItem label="Tugas Masuk" value={stats.submissions} icon={FileCheck} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-700 to-indigo-950 p-12 min-h-[300px] flex flex-col justify-center shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
              <Sparkles size={250} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                  <Zap size={24} className="text-amber-400 fill-amber-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-white/60">AI Intelligence Core</span>
              </div>
              <div className="min-h-[64px]">
                {loadingAI && !aiInsight ? (
                   <div className="space-y-2">
                     <div className="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse"></div>
                     <div className="h-8 w-1/2 bg-white/10 rounded-lg animate-pulse"></div>
                   </div>
                ) : (
                  <h2 className="text-4xl font-black text-white leading-tight tracking-tighter max-w-xl animate-in fade-in duration-500">
                    "{aiInsight}"
                  </h2>
                )}
              </div>
              <button className="bg-white text-indigo-950 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-3 active:scale-95">
                Go to Classroom <ArrowUpRight size={18} />
              </button>
            </div>
          </div>

          <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-white font-black text-xl tracking-tight">Real-time Performance</h4>
              <Badge variant="indigo" className="bg-indigo-500/10 text-indigo-400 border-none">Live Analytics</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                    itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-slate-900 border-slate-800 p-8 rounded-[3rem] h-full shadow-3xl">
            <h3 className="text-white font-black text-xl mb-8 flex items-center gap-3">
              <Clock size={24} className="text-indigo-500" /> Notifications
            </h3>
            <div className="space-y-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 p-5 bg-slate-950/50 border border-slate-800 rounded-3xl hover:border-indigo-500/50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold leading-tight">Materi Baru Diupload</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase mt-1 tracking-widest">System • Just Now</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon: Icon, color }: any) => (
  <Card className="bg-slate-900 border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-500">
    <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 text-${color}-500`}>
      <Icon size={160} />
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-500/10 text-${color}-500 mb-6 ring-1 ring-${color}-500/20`}>
      <Icon size={28} />
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{label}</p>
    <h3 className="text-4xl font-black text-white mt-2 tracking-tighter">{value || '...'}</h3>
  </Card>
);

export default Dashboard;
