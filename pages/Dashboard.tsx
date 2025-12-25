
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { 
  Users, BookOpen, FileCheck, Clock, Wallet, Trophy, 
  Medal, ChevronRight, Sparkles, BrainCircuit, Loader2,
  TrendingUp, WifiOff, Target, Zap, Activity, Info, ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Button, Card, Badge } from '../components/ui/Shared';

const Dashboard: React.FC = () => {
  const { profile, isOffline } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    materials: 0,
    tasks: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    // Real-time aggregate statistics from Firestore
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => setStats(prev => ({...prev, users: s.size})));
    const unsubMats = onSnapshot(collection(db, 'materials'), (s) => setStats(prev => ({...prev, materials: s.size})));
    const unsubTasks = onSnapshot(collection(db, 'submissions'), (s) => setStats(prev => ({...prev, tasks: s.size})));
    const unsubPay = onSnapshot(collection(db, 'payments'), (s) => {
      let total = 0;
      s.docs.forEach(d => { 
        const data = d.data();
        if(data.status === 'VERIFIED') total += Number(data.amount); 
      });
      setStats(prev => ({...prev, revenue: total}));
      setLoading(false);
    });

    const qLeaderboard = query(collection(db, 'exam_attempts'), orderBy('score', 'desc'), limit(5));
    const unsubLeader = onSnapshot(qLeaderboard, (snap) => {
      setLeaderboard(snap.docs.map(d => d.data()));
    });

    return () => { 
      unsubUsers(); unsubMats(); unsubTasks(); unsubPay(); unsubLeader();
    };
  }, []);

  useEffect(() => {
    if (profile) generateAIInsights();
  }, [profile]);

  const generateAIInsights = async () => {
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Berikan 1 tips belajar teknis spesifik untuk siswa SMK jurusan ${profile?.class || 'Teknik'} bernama ${profile?.name}. Hubungkan dengan tren industri 2025. Maksimal 25 kata.`,
      });
      setAiInsight(response.text);
    } catch (e) {
      console.error("AI Insight Error:", e);
    } finally {
      setLoadingAI(false);
    }
  };

  const activityData = [
    { name: 'Sen', value: 400 },
    { name: 'Sel', value: 300 },
    { name: 'Rab', value: 600 },
    { name: 'Kam', value: 800 },
    { name: 'Jum', value: 500 },
    { name: 'Sab', value: 900 },
    { name: 'Min', value: 1000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
            {profile?.role === 'GURU' ? 'Control Center' : 'Learning Hub'}
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <Badge variant="indigo" className="py-1.5 px-5 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200">
              {profile?.role} Verified
            </Badge>
            {isOffline && <Badge variant="error" className="gap-2 animate-pulse"><WifiOff size={14} /> Offline Access</Badge>}
            <p className="text-slate-400 font-bold text-xs">LPPMRI-ID: {profile?.uid.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Card className="bg-slate-900 p-5 rounded-[2rem] shadow-2xl flex items-center gap-5 text-white border-none min-w-[200px]">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Zap size={24} className="fill-white"/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
              <p className="font-black text-2xl leading-none mt-1">Live</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Siswa" value={stats.users} icon={Users} color="bg-indigo-600" />
        <StatCard label="Materi Aktif" value={stats.materials} icon={BookOpen} color="bg-violet-600" />
        <StatCard label="Tugas Masuk" value={stats.tasks} icon={FileCheck} color="bg-emerald-600" />
        <StatCard label="Verified SPP" value={`Rp ${(stats.revenue / 1000000).toFixed(1)}M`} icon={Wallet} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-black border-none relative overflow-hidden group rounded-[3rem] shadow-3xl min-h-[320px] flex items-center">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
              <BrainCircuit size={280} className="text-white" />
            </div>
            <div className="p-12 relative z-10 space-y-8 w-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-2xl">
                  <Sparkles size={28} className="text-amber-400" />
                </div>
                <div>
                   <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] opacity-60">AI Smart Insight</h3>
                   <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Gemini Neural Network</p>
                </div>
              </div>
              
              <div className="max-w-xl">
                {loadingAI ? (
                  <div className="flex items-center gap-4 text-white/50 italic text-2xl font-black">
                    <Loader2 size={32} className="animate-spin" /> Menganalisis kurikulum...
                  </div>
                ) : (
                  <p className="text-white text-3xl font-black leading-[1.2] tracking-tight">
                    "{aiInsight || 'Eksplorasi modul teknik hari ini untuk membangun portofolio industri kelas dunia.'}"
                  </p>
                )}
              </div>
              <Button className="bg-white text-indigo-950 hover:bg-slate-100 font-black px-12 py-6 rounded-2xl shadow-2xl border-none active:scale-95 transition-all text-sm uppercase tracking-widest">
                Mulai Belajar <ArrowUpRight size={20} className="ml-2" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-10 border-none shadow-2xl rounded-[3rem] bg-white group overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Aktivitas Mingguan</h4>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Activity size={20}/></div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-10 border-none shadow-2xl rounded-[3rem] bg-slate-900 group">
               <div className="flex justify-between items-center mb-10">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Skill Competency</h4>
                  <Target size={20} className="text-indigo-400" />
               </div>
               <div className="space-y-6">
                  {['Technical Accuracy', 'Project Management', 'Logical Thinking'].map((skill, i) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-white/50 tracking-widest">
                        <span>{skill}</span>
                        <span>{85 + (i*3)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${85 + (i*3)}%` }}></div>
                      </div>
                    </div>
                  ))}
               </div>
               <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                  <Info size={16} className="text-indigo-400" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">Nilai ini adalah agregat real-time dari seluruh asesmen semester ini.</p>
               </div>
            </Card>
          </div>
        </div>

        <Card className="bg-white p-10 rounded-[3rem] text-slate-800 shadow-3xl relative overflow-hidden flex flex-col h-full border-none">
          <h3 className="font-black mb-10 flex items-center gap-4 text-indigo-600 text-2xl tracking-tighter">
            <Trophy size={32} className="text-amber-500" /> Leaderboard
          </h3>
          <div className="space-y-8 flex-1">
            {leaderboard.length > 0 ? leaderboard.map((item, i) => (
              <div key={i} className="flex items-center gap-6 group hover:translate-x-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl ${
                  i === 0 ? 'bg-amber-400 text-amber-950 scale-110 ring-4 ring-amber-400/20' : 
                  i === 1 ? 'bg-slate-200 text-slate-600' : 
                  i === 2 ? 'bg-orange-300 text-orange-950' : 'bg-slate-50 text-slate-400'
                }`}>
                  {i === 0 ? <Medal size={28} /> : i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-md font-black truncate text-slate-900 tracking-tight">{item.studentName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.studentClass || 'LPPMRI Class'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600 tracking-tighter">{item.score}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Score</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Activity size={64} />
                <p className="text-xs font-black uppercase mt-6 tracking-widest">Data Kosong</p>
              </div>
            )}
          </div>
          <Button variant="outline" className="mt-10 w-full py-5 rounded-2xl border-slate-100 font-black uppercase text-[10px] tracking-widest">
            Full Ranking <ChevronRight size={16} className="ml-2" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
    <div className={`absolute -right-6 -bottom-6 opacity-5 group-hover:scale-125 transition-transform duration-700 ${color.replace('bg-', 'text-')}`}>
      <Icon size={160} />
    </div>
    <div className={`p-4 rounded-3xl ${color} text-white shadow-2xl shadow-indigo-100 w-fit mb-6`}>
      <Icon size={28} />
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{label}</p>
    <h3 className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
  </div>
);

export default Dashboard;
