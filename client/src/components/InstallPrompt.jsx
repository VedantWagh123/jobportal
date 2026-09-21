import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Show the UI popup after 2 seconds to ensure user sees it
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      setDeferredPrompt(null);
      setIsVisible(false);
    } else {
      // Fallback for iOS or devices where event didn't fire
      alert("To install: Tap the Share button in your browser and select 'Add to Home Screen'");
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center pb-6 px-4 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-3 pr-3 w-full max-w-[340px] flex items-center gap-3 pointer-events-auto animate-fade-in-up">
        
        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
          <Download size={20} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-[14px] leading-tight">Job Portal App</h3>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">Install for a better experience</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3.5 rounded-lg text-[12px] transition-colors shadow-sm"
          >
            Install
          </button>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
