
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, getDocFromCache } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { useStore } from './store';

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
    // onAuthStateChanged is usually very fast
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        
        // 1. SAT SET: Try cache immediately to unblock UI
        try {
          const cacheSnap = await getDocFromCache(docRef);
          if (cacheSnap.exists()) {
            setProfile(cacheSnap.data() as UserProfile);
            setLoading(false); // Unblock immediately if cache exists
          }
        } catch (e) {
          // No cache, need to wait for server
        }

        // 2. Refresh from server in background
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
          console.warn("Background profile sync failed");
        } finally {
          setLoading(false); // Ensure loading is off
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
    } catch (error) {
      console.error("Logout failed:", error);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
