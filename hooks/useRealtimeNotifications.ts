
import { useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store';

export const useRealtimeNotifications = () => {
  const { profile, addNotification } = useStore();

  useEffect(() => {
    if (!profile) return;

    let unsubscribers: (() => void)[] = [];

    // Notifications for GURU (New Submissions)
    if (profile.role === 'GURU') {
      const q = query(
        collection(db, 'submissions'),
        where('status', '==', 'PENDING'),
        orderBy('submittedAt', 'desc'),
        limit(5)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            addNotification({
              title: 'Tugas Baru Masuk',
              message: `Seorang siswa baru saja mengumpulkan tugas.`,
              type: 'info'
            });
          }
        });
      });
      unsubscribers.push(unsub);
    }

    // Notifications for SISWA (Payment Verification / Grade Update)
    if (profile.role === 'SISWA') {
      const q = query(
        collection(db, 'payments'),
        where('studentId', '==', profile.uid),
        where('status', '==', 'VERIFIED'),
        limit(1)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            addNotification({
              title: 'Pembayaran Diverifikasi',
              message: 'Bukti pembayaran SPP Anda telah dikonfirmasi oleh Bendahara.',
              type: 'success'
            });
          }
        });
      });
      unsubscribers.push(unsub);
    }

    // Notifications for BENDAHARA (New Payments)
    if (profile.role === 'BENDAHARA') {
      const q = query(
        collection(db, 'payments'),
        where('status', '==', 'PENDING'),
        limit(5)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            addNotification({
              title: 'Tagihan Baru',
              message: 'Ada bukti transfer baru yang perlu diverifikasi.',
              type: 'warning'
            });
          }
        });
      });
      unsubscribers.push(unsub);
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, [profile]);
};
