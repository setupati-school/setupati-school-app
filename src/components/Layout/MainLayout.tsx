import React, { Suspense, memo } from 'react';
import { AppShell, MinimalAppShell } from '@/components/AppShell';

export const MainLayout: React.FC = memo(() => {
  return (
    <Suspense fallback={<MinimalAppShell />}>
      <AppShell />
    </Suspense>
  );
});

export default MainLayout;
