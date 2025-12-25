
import React from 'react';

export const preventCheating = (onViolation: (msg: string) => void) => {
  // Disable Right Click
  const handleContextMenu = (e: MouseEvent) => e.preventDefault();
  document.addEventListener('contextmenu', handleContextMenu);

  // Advanced DevTools Detection via Resize
  const detectDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if (widthThreshold || heightThreshold) {
      onViolation("Percobaan inspeksi elemen terdeteksi! (DevTools)");
    }
  };

  // Disable Common Shortcuts & Developer Tools
  const handleKeyDown = (e: KeyboardEvent) => {
    const forbiddenKeys = ['F12', 'u', 'i', 'j', 'c', 'v', 's', 'p', 'r'];
    const isForbidden = forbiddenKeys.includes(e.key.toLowerCase());
    
    if (
      e.key === 'F12' ||
      ((e.ctrlKey || e.metaKey) && isForbidden)
    ) {
      e.preventDefault();
      onViolation(`Penggunaan pintasan keyboard terlarang (${e.key}) terdeteksi!`);
      return false;
    }
  };

  // Visibility Change Detection (Tab Switching)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onViolation("Anda meninggalkan halaman ujian (Tab Switching terdeteksi).");
    }
  };

  // Focus Loss Detection
  const handleBlur = () => {
    // Memberikan waktu sedikit untuk menghindari trigger palsu saat sistem memproses popup internal
    setTimeout(() => {
        if (!document.hasFocus()) {
            onViolation("Fokus jendela hilang! Jangan berinteraksi dengan aplikasi lain.");
        }
    }, 100);
  };

  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleBlur);
  window.addEventListener('resize', detectDevTools);
  const devToolsInterval = setInterval(detectDevTools, 3000);

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleBlur);
    window.removeEventListener('resize', detectDevTools);
    clearInterval(devToolsInterval);
  };
};

export const enterFullscreen = () => {
  const elem = document.documentElement as any;
  try {
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  } catch (e) {
    console.warn("Fullscreen request failed", e);
  }
};

export const exitFullscreen = () => {
  try {
    if (document.exitFullscreen) document.exitFullscreen();
    else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
  } catch (e) {
    console.warn("Fullscreen exit failed", e);
  }
};

export const startProctoringCamera = async (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            facingMode: 'user' 
        } 
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return stream;
  } catch (err) {
    console.error("Camera access denied", err);
    return null;
  }
};
