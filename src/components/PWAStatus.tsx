import React, { useState, useEffect } from 'react';
import { installPWA, isPWAInstallable, isOnline } from '../lib/pwa';

interface PWAStatusProps {
  className?: string;
}

export const PWAStatus: React.FC<PWAStatusProps> = ({ className = '' }) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check initial installability
    setIsInstallable(isPWAInstallable());

    // Listen for PWA events
    const handleInstallable = (event: CustomEvent) => {
      setIsInstallable(event.detail.installable);
    };

    const handleNetworkStatus = (event: CustomEvent) => {
      setIsOffline(!event.detail.online);
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener(
      'pwa-installable',
      handleInstallable as EventListener
    );
    window.addEventListener(
      'network-status',
      handleNetworkStatus as EventListener
    );
    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener(
        'pwa-installable',
        handleInstallable as EventListener
      );
      window.removeEventListener(
        'network-status',
        handleNetworkStatus as EventListener
      );
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const success = await installPWA();
      if (success) {
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <div className={`pwa-status ${className}`}>
      {/* Install Button */}
      {isInstallable && (
        <button
          onClick={handleInstall}
          disabled={installing}
          className="pwa-install-button"
          aria-label="Install Setupati School App"
        >
          {installing ? 'Installing...' : 'Install App'}
        </button>
      )}

      {/* Update Notification */}
      {updateAvailable && (
        <div className="pwa-update-notification">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Update Available</h4>
              <p className="text-sm opacity-90">
                A new version is ready to install
              </p>
            </div>
            <button
              onClick={handleUpdate}
              className="ml-3 bg-white text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 text-sm font-medium z-50">
          You are currently offline. Some features may be limited.
        </div>
      )}
    </div>
  );
};

export default PWAStatus;
