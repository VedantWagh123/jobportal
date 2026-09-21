import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for the 'beforeinstallprompt' event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Check if it's a mobile device using userAgent
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Stash the event so it can be triggered later.
        setDeferredPrompt(e);
        // Update UI notify the user they can install the PWA
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-50 animate-fade-in-up">
      <div className="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-5 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 relative z-10">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-[14px] flex items-center justify-center text-blue-600">
            <Download size={24} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-[16px] leading-tight">Install Job Portal App</h3>
            <p className="text-[13px] text-gray-500 mt-1 leading-snug">
              Get the full experience on your home screen. Fast, easy, and always accessible!
            </p>
            
            <div className="mt-4 flex gap-3">
              <button 
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-[12px] text-[14px] transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]"
              >
                Install Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
