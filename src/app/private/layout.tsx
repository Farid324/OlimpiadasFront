// src/app/private/layout.tsx
'use client';

import { useState, useEffect } from 'react';
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
  // Iniciamos en false para que en Móvil no aparezca tapando la pantalla al cargar.
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Solo después de montar, leer localStorage o detectar escritorio
  useEffect(() => {
    const saved = localStorage.getItem('menuOpen');
    if (saved !== null) {
      setOpen(saved === 'true');
    } else {
      // Por defecto: abierto en escritorio
      setOpen(window.innerWidth >= 1024);
    }
    setMounted(true);
  }, []);

  // Guardar estado cuando cambie (solo si ya montó)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('menuOpen', String(open));
    }
  }, [open, mounted]);

  return (
    <PageHeaderProvider>
      {/* Pasamos onClose para que funcione la X y los links en móvil */}
      <SideMenu open={open} onClose={() => setOpen(false)} />

      <div
        className={[
          'min-h-screen flex flex-col transition-[padding] duration-300 ease-out',
          // MÓVIL: El padding es siempre 0 (el menú es overlay/encima).
          // ESCRITORIO (lg): Si está abierto, aplicamos el padding de la variable sidebar-w.
          open ? 'lg:pl-[var(--sidebar-w)]' : 'lg:pl-0'
        ].join(' ')}
      >
        <HeaderFromContext onToggle={() => setOpen(v => !v)} />
        
        <main className="flex-1 overflow-auto bg-[var(--fondoAzulGris)]">
          <div className="max-w-7xl mx-auto py-6 px-4">{children}</div>
        </main>
      </div>
    </PageHeaderProvider>
  );
}