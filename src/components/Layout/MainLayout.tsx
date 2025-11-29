import React, { Suspense, memo } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const MainLayout: React.FC = memo(() => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
});

export default MainLayout;
