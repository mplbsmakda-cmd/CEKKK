
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { GraduationCap, Award, TrendingUp, Download, Search } from 'lucide-react';
import { Button, Card, CardContent, Badge, Input } from '../components/ui/Shared';
import { exportToCSV } from '../utils/export';

const Grades: React.FC = () => {
  const { profile } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGrades();
  }, [profile]);

  const fetchGrades = async () => {
    if (!profile) return;
    try {
      // Fetch results from both assignments (submissions) and exams (exam_attempts)
      const subQ = profile.role === 'SISWA' 
        ? query(collection(db, 'submissions'), where('studentId', '==', profile.uid))
        : query(collection(db, 'submissions'));
        
      const examQ = profile.role === 'SISWA'
        ? query(collection(db, 'exam_attempts'), where('studentId', '==', profile.uid))
        : query(collection(db, 'exam_attempts'));

      const [subSnap, examSnap] = await Promise.all([getDocs(subQ), getDocs(examQ)]);
      
      const subData = subSnap.docs.map(d => ({ ...d.data(), type: 'TUGAS' }));
      const examData = examSnap.docs.map(d => ({ ...d.data(), type: 'UJIAN' }));
      
      setGrades([...subData, ...examData]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(`Nilai_${profile?.name}`, grades);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Rekapitulasi Nilai</h1>
          <p className="text-slate-500">Pantau perkembangan akademik secara transparan.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white">
          <CardContent className="p-6">
            <Award className="mb-2 opacity-50" size={32} />
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Rata-rata Nilai</p>
            <h2 className="text-4xl font-black mt-1">
              {grades.length > 0 ? (grades.reduce((a, b) => a + (b.score || 0), 0) / grades.length).toFixed(1) : 0}
            </h2>
          </CardContent>
        </Card>
        {/* Placeholder for other stats */}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                className="pl-10" 
                placeholder="Cari aktivitas atau nama siswa..." 
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <th className="px-6 py-4">Aktivitas</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4 text-center">Nilai</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((g, i) => (
                  <tr key={i} className="hover:bg-slate-50 text-sm">
                    <td className="px-6 py-4 font-bold text-slate-800">{g.assignmentId || g.examId || 'Ujian/Tugas'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={g.type === 'UJIAN' ? 'error' : 'indigo'}>{g.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{g.studentName || 'Siswa'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xl font-black ${g.score >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {g.score || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {g.submittedAt?.toDate().toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Grades;
