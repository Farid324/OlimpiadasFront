// src/app/private/layout.tsx
'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const role = sp.get('role');

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
  }, [loading, user, router]);

  if (!user) return null;

  // (Opcional) si quieres validar query ?role= con el real:
  if (role && role !== user.role) {
    router.replace(`/private?role=${user.role}`);
    return null;
  }

  return <div className="min-h-screen">{children}</div>;
}
