// PWA Status Component
// Setupati School Management System PWA

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from './ui/card';
import { Badge } from './ui/badge';
import { Download, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAStatusProps {
  className?: string;
}

export const PWAStatus: React.FC<PWAStatusProps> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      // Check for standalone mode (iOS)
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;
      // Check for PWA mode (Android)
      const isPWA = window.navigator.standalone === true;
      setIsInstalled(isStandalone || isPWA);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show anything if already installed and online
  if (isInstalled && isOnline) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Install prompt */}
      {showInstallPrompt && !isInstalled && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-sm text-blue-900">
                  Install App
                </CardTitle>
              </div>
              <button
                onClick={dismissInstallPrompt}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
            <CardDescription className="text-blue-700">
              Install Setupati School app for a better experience with offline
              access and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={dismissInstallPrompt}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PWA features info */}
      {isInstalled && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                App Installed
              </span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                PWA
              </Badge>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Enjoy offline access, push notifications, and native app
              experience!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Connection status */}
      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800 font-medium">
                Offline Mode
              </span>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800"
              >
                Cached Data Available
              </Badge>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              You can still view your data. Changes will sync when you're back
              online.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PWAStatus;
