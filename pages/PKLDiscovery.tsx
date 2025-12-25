
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MapPin, Briefcase, Search, Loader2, Navigation, ExternalLink, Info, Star } from 'lucide-react';
import { useAuth } from '../authContext';
import { Card, Button, Badge, Input } from '../components/ui/Shared';

const PKLDiscovery: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation denied", err)
      );
    }
  }, []);

  const searchPKL = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Cari tempat PKL (Praktek Kerja Lapangan) untuk siswa SMK jurusan ${query} di sekitar Kedungreja atau Cilacap. Berikan daftar perusahaan yang relevan.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: location ? { latitude: location.lat, longitude: location.lng } : undefined
            }
          }
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const formattedResults = chunks.filter((c: any) => c.maps).map((c: any) => ({
        title: c.maps.title,
        uri: c.maps.uri,
      }));

      setResults(formattedResults);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data PKL. Pastikan izin lokasi aktif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">PKL Discovery</h1>
          <p className="text-slate-500">Cari mitra industri untuk Praktek Kerja Lapangan.</p>
        </div>
        <Badge variant="indigo" className="gap-2 px-4 py-2">
          <Navigation size={14} /> Maps Grounding
        </Badge>
      </div>

      <Card className="p-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl overflow-hidden">
        <div className="bg-white p-8 rounded-[1.4rem] space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-center font-bold text-slate-800 text-lg">Apa Jurusan Anda?</h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="Contoh: Multimedia, Teknik Otomotif, Akuntansi..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button onClick={searchPKL} disabled={loading} className="px-8 rounded-2xl">
                {loading ? <Loader2 className="animate-spin" /> : 'Cari Mitra'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.length > 0 ? (
          results.map((item, i) => (
            <Card key={i} className="hover:border-indigo-200 transition-all hover:shadow-xl group overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <Badge variant="indigo">Verified Place</Badge>
                </div>
                <h4 className="font-bold text-slate-800 text-lg line-clamp-2 min-h-[3.5rem]">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" /> Direkomendasikan oleh AI SMK LPPMRI 2
                </p>
                <div className="mt-6">
                  <a href={item.uri} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full gap-2 border-slate-100 bg-slate-50 text-xs">
                      Buka di Google Maps <ExternalLink size={14} />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))
        ) : !loading && (
          <div className="col-span-full py-20 text-center opacity-40">
            <Search size={64} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-sm">Cari jurusan untuk melihat hasil</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
          <Info size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-blue-900">Tips Mencari PKL</h4>
          <p className="text-sm text-blue-700/80 leading-relaxed">
            Siswa disarankan untuk mendiskusikan daftar industri ini dengan Koordinator Hubin (Hubungan Industri) sekolah sebelum mengajukan surat permohonan PKL resmi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PKLDiscovery;
