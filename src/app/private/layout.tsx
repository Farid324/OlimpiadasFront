'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SideMenu, { MENU_BY_ROLE, RoleName, MenuItem } from '@/components/Menu';
import Header from '@/components/ui/Header';
// src/app/private/layout.tsx
import { Suspense } from 'react';
import PrivateLayoutContent from './PrivateLayoutContent';

function findTitleByPath(pathname: string, items: MenuItem[]): string {
  // Ordena por href más largo primero para matchear rutas específicas antes que /private
  const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
  const match = sorted.find(it =>
    pathname === it.href || pathname.startsWith(it.href + '/')
  );
  return match?.label ?? 'Panel Principal';
}


export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </Suspense>
  );
}