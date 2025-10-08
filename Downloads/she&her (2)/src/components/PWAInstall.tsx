import React, { useState, useEffect } from 'react';

interface PWAInstallProps {
  onClose?: () => void;
}

const PWAInstall: React.FC<PWAInstallProps> = ({ onClose }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if install button should be shown after delay
    const timer = setTimeout(() => {
      if (!isStandalone && !deferredPrompt) {
        setShowInstallButton(true);
      }
    }, 10000); // Show after 10 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setDeferredPrompt(null);
        setShowInstallButton(false);
      }
    }
  };

  const handleClose = () => {
    setShowInstallButton(false);
    if (onClose) onClose();
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // Don't show install button if not needed
  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-w-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              📱
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Install She&Her</h3>
              <p className="text-sm text-gray-600">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              ✅
            </div>
            <span>Works offline</span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              ✅
            </div>
            <span>Fast loading</span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              ✅
            </div>
            <span>Push notifications</span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              ✅
            </div>
            <span>No app store needed</span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {isAndroid && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-1">Android Users:</h4>
              <p className="text-sm text-blue-800">
                Tap the menu button (⋮) in your browser and select "Install app" or "Add to Home screen"
              </p>
            </div>
          )}

          {isIOS && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-1">iPhone/iPad Users:</h4>
              <p className="text-sm text-blue-800">
                Tap the share button (⬆️) and select "Add to Home Screen"
              </p>
            </div>
          )}

          <button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            📱 Install She&Her App
          </button>

          <button
            onClick={handleClose}
            className="w-full text-gray-500 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall;
