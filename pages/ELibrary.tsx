
import React, { useState } from 'react';
import { Book as BookIcon, Search, Download, Bookmark, Layers, Filter } from 'lucide-react';
import { Card, Button, Badge, Input } from '../components/ui/Shared';

const ELibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const books = [
    { id: '1', title: 'Manual Teknik Otomotif Dasar', author: 'Tim Kurikulum SMK', category: 'OTOMOTIF', cover: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400' },
    { id: '2', title: 'Pemrograman Web Modern with React', author: 'Andi Wijaya', category: 'RPL', cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400' },
    { id: '3', title: 'Akuntansi Perusahaan Manufaktur', author: 'Sri Wahyuni', category: 'AKUNTANSI', cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400' },
    { id: '4', title: 'Kreativitas Multimedia & Animasi', author: 'Budi Hartono', category: 'MULTIMEDIA', cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400' },
  ];

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Digital Repository</h1>
          <p className="text-slate-500">Akses ribuan buku digital dan modul praktik industri.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            placeholder="Cari buku atau modul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['SEMUA', 'RPL', 'OTOMOTIF', 'AKUNTANSI', 'MULTIMEDIA'].map(cat => (
          <button key={cat} className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="group cursor-pointer border-slate-100 hover:shadow-2xl transition-all duration-300">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
              <div className="absolute top-4 right-4">
                <Badge variant="indigo" className="shadow-lg backdrop-blur-md bg-white/20 text-white border-white/20">{book.category}</Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <Button className="w-full py-3 gap-2 bg-white text-slate-900 hover:bg-indigo-50 font-black">
                  <Download size={16} /> Unduh PDF
                </Button>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-bold text-slate-800 leading-tight line-clamp-2 min-h-[3rem]">{book.title}</h3>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>{book.author}</span>
                <Bookmark size={14} className="hover:text-indigo-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ELibrary;
