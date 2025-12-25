
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  orderBy, 
  where, 
  limit,
  getDocs // Added getDocs to imports
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';
import { MessageSquare, Send, User, Hash } from 'lucide-react';
import { Button, Card, CardContent, Badge, Input } from '../components/ui/Shared';
import { ChatMessage, Subject } from '../types';

const Discussion: React.FC = () => {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      const q = query(
        collection(db, 'discussions', selectedSubject.id, 'messages'),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[]);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
      return () => unsub();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    const q = query(collection(db, 'subjects'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[];
    setSubjects(data);
    if (data.length > 0) setSelectedSubject(data[0]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedSubject || !profile) return;

    try {
      await addDoc(collection(db, 'discussions', selectedSubject.id, 'messages'), {
        text: inputText,
        userId: profile.uid,
        userName: profile.name,
        role: profile.role,
        createdAt: serverTimestamp()
      });
      setInputText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Sidebar: Subjects List */}
      <Card className="w-64 h-full flex flex-col shrink-0">
        <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
          <Hash size={18} className="text-indigo-600" />
          <h2 className="font-bold text-slate-800">Ruang Diskusi</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSubject?.id === sub.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 h-full flex flex-col overflow-hidden border-indigo-100">
        {selectedSubject ? (
          <>
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900">{selectedSubject.name}</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Forum Mata Pelajaran</p>
              </div>
              <Badge variant="indigo">Online</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg) => {
                const isOwn = msg.userId === profile?.uid;
                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isOwn && <span className="text-[10px] font-bold text-slate-500">{msg.userName}</span>}
                      <Badge variant={msg.role === 'GURU' ? 'warning' : 'default'} className="text-[8px] py-0 px-1">
                        {msg.role}
                      </Badge>
                    </div>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      isOwn ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                    </span>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-2">
              <input
                type="text"
                placeholder="Tulis pesan diskusi..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="submit"
                className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-transform active:scale-95 shadow-md shadow-indigo-100"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <MessageSquare size={48} className="opacity-10" />
            <p className="text-sm font-medium">Pilih mata pelajaran untuk mulai berdiskusi</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Discussion;
