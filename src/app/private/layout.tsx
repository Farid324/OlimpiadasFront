'use client';

import { useState } from 'react';
import SideMenu from '@/components/Menu';
import Header from '@/components/ui/Header';
import { PageHeaderProvider, usePageHeader } from '@/contexts/pageHeader';

function HeaderFromContext({ onToggle }: { onToggle: () => void }) {
  const { title, right } = usePageHeader();
  return (
    <Header
      title={title || 'Oh! SanSi'}
      right={right}
      onToggleMenu={onToggle}
      showMenu
    />
  );
}

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <PageHeaderProvider>
      <SideMenu open={open} />
      <div className={['min-h-screen flex flex-col transition-[padding] duration-300 ease-out', open ? 'pl-[var(--sidebar-w)]' : 'pl-0'].join(' ')}>
        <HeaderFromContext onToggle={() => setOpen(v => !v)} />
        <main className="flex-1 overflow-auto bg-[var(--fondoAzulGris)]">
          <div className="max-w-7xl mx-auto py-6 px-4">{children}</div>
        </main>
      </div>
    </PageHeaderProvider>
  );
}
