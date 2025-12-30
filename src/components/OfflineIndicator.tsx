// Offline Indicator Component
// Setupati School Management System PWA

import React from 'react';
import { useOffline } from '../hooks/useOffline';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { WifiOff, Wifi, RefreshCw, Database, Clock } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({
  className = '',
  showDetails = false
}: OfflineIndicatorProps) {
  const {
    isOnline,
    isOffline,
    hasOfflineData,
    syncInProgress,
    lastSyncTime,
    pendingSyncItems,
    forceSync
  } = useOffline();

  const handleForceSync = async () => {
    try {
      const result = await forceSync();
      console.log('Sync completed:', result);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const formatLastSyncTime = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Don't show anything if online and no pending items
  if (isOnline && !showDetails && pendingSyncItems === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main status indicator */}
      {isOffline && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <span>
                You're currently offline. Some features may be limited.
              </span>
              {hasOfflineData && (
                <Badge variant="secondary" className="ml-2">
                  <Database className="h-3 w-3 mr-1" />
                  Offline data available
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sync status */}
      {(syncInProgress || pendingSyncItems > 0) && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw
            className={`h-4 w-4 text-blue-600 ${syncInProgress ? 'animate-spin' : ''}`}
          />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {syncInProgress ? (
                  <span>Syncing data...</span>
                ) : (
                  <span>
                    {pendingSyncItems} item{pendingSyncItems !== 1 ? 's' : ''}{' '}
                    pending sync
                  </span>
                )}
                {isOnline && !syncInProgress && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleForceSync}
                    className="h-6 px-2 text-xs"
                  >
                    Sync now
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed status (when showDetails is true) */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Connection Status</h3>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Online
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-600" />
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    Offline
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                Offline data: {hasOfflineData ? 'Available' : 'None'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <RefreshCw
                className={`h-4 w-4 text-gray-500 ${syncInProgress ? 'animate-spin' : ''}`}
              />
              <span className="text-gray-600">
                Sync: {syncInProgress ? 'In progress' : 'Idle'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                Last sync: {formatLastSyncTime(lastSyncTime)}
              </span>
            </div>
          </div>

          {pendingSyncItems > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                {pendingSyncItems} item{pendingSyncItems !== 1 ? 's' : ''}{' '}
                waiting to sync
              </span>
              {isOnline && !syncInProgress && (
                <Button size="sm" onClick={handleForceSync} className="h-8">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync Now
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for header/navbar
export function OfflineStatusBadge({ className = '' }: { className?: string }) {
  const { isOnline, pendingSyncItems, syncInProgress } = useOffline();

  if (isOnline && pendingSyncItems === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {!isOnline && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}

      {pendingSyncItems > 0 && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <RefreshCw
            className={`h-3 w-3 mr-1 ${syncInProgress ? 'animate-spin' : ''}`}
          />
          {pendingSyncItems}
        </Badge>
      )}
    </div>
  );
}

export default OfflineIndicator;
