
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, getDocFromCache } from 'firebase/firestore';
import { auth, db } from './firebase.ts';
import { UserProfile } from './types.ts';
import { useStore } from './store.ts';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isOffline: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { profile, setProfile } = useStore();

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        
        // PRIORITAS 1: Ambil dari Cache (Kecepatan < 100ms)
        try {
          const cacheSnap = await getDocFromCache(docRef);
          if (cacheSnap.exists()) {
            setProfile(cacheSnap.data() as UserProfile);
            setLoading(false); // Langsung tampilkan UI
          }
        } catch (e) {
          // Cache tidak ada, tetap loading
        }

        // PRIORITAS 2: Sync Server di latar belakang
        try {
          const serverSnap = await getDoc(docRef);
          if (serverSnap.exists()) {
            const data = serverSnap.data() as UserProfile;
            setProfile(data);
            if (navigator.onLine) {
              updateDoc(docRef, { lastLogin: serverTimestamp() }).catch(() => {});
            }
          }
        } catch (err) {
          console.warn("Auth Sync Warning:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setProfile]);

  const logout = async () => {
    try {
      await auth.signOut();
      setProfile(null);
      window.location.hash = '/login';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isOffline, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth error');
  return context;
};
