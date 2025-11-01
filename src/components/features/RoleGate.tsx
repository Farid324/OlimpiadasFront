//src/components/features/RoleGate.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type RoleName = 'ADMINISTRADOR' | 'EVALUADOR' | 'RESPONSABLE_DE_AREA';

export default function RoleGate({
  allow,
  children,
  redirect = '/private/panelPrincipal',
}: {
  allow: RoleName[];
  children: React.ReactNode;
  redirect?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !allow.includes(user.role as RoleName)) {
      router.replace(redirect);
    }
  }, [loading, user, allow, router, redirect]);

  if (loading || !user) {
    // Skeleton mínimo para evitar "flicker"
    return <div className="min-h-[200px] bg-gray-50" />;
  }

  if (!allow.includes(user.role as RoleName)) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
        No tienes permisos para ver esta sección.
      </div>
    );
  }

  return <>{children}</>;
}
