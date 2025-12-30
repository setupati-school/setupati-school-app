import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/skeleton-loader';

/**
 * App Shell component that provides the basic application structure
 * This loads immediately and provides the navigation and header while content loads
 */
export const AppShell: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={cn('app-shell', 'flex min-h-screen bg-background')}>
      {/* Sidebar - part of the app shell, loads immediately */}
      <Sidebar />

      <div
        className={cn(
          'app-shell-main',
          'flex-1 flex flex-col overflow-hidden',
          isMobile && 'ml-0'
        )}
      >
        {/* Header - part of the app shell, loads immediately */}
        <Header />

        {/* Main content area with loading fallback */}
        <main
          className={cn(
            'app-shell-content',
            'flex-1 overflow-auto transition-all duration-300',
            'p-3 sm:p-4 md:p-6',
            'space-y-4 sm:space-y-6',
            isMobile && 'mobile-content-offset pt-16'
          )}
        >
          <Suspense
            fallback={
              <div className="w-full h-full">
                <DashboardSkeleton />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

/**
 * Minimal App Shell for initial load
 * This provides the absolute minimum structure while the full app loads
 */
export const MinimalAppShell: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={cn('app-shell', 'flex min-h-screen bg-background')}>
      {/* Minimal sidebar placeholder */}
      <div
        className={cn(
          'app-shell-sidebar',
          'bg-card border-r border-border transition-all duration-300',
          isMobile ? 'w-0' : 'w-16'
        )}
      >
        <div className="p-4 border-b border-border">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="app-shell-main flex-1 flex flex-col">
        {/* Minimal header placeholder */}
        <header className="app-shell-header bg-card border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 skeleton animate-pulse" />
              <div className="h-4 w-64 skeleton animate-pulse" />
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-10 skeleton rounded-full animate-pulse touch-target" />
              <div className="h-10 w-10 skeleton rounded-full animate-pulse touch-target" />
            </div>
          </div>
        </header>

        {/* Minimal content placeholder */}
        <main
          className={cn(
            'app-shell-content flex-1 p-3 sm:p-4 md:p-6',
            isMobile && 'mobile-content-offset pt-16'
          )}
        >
          <div className="space-y-6">
            <div className="h-8 w-1/3 skeleton animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 skeleton rounded-lg animate-pulse"
                />
              ))}
            </div>
            <div className="h-64 skeleton rounded-lg animate-pulse" />
          </div>
        </main>
      </div>
    </div>
  );
};
