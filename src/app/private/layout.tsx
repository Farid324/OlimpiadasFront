
'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SideMenu, { MENU_BY_ROLE, RoleName, MenuItem } from '@/components/Menu';
import Header from '@/components/ui/Header';

function findTitleByPath(pathname: string, items: MenuItem[]): string {
  // Ordena por href más largo primero para matchear rutas específicas antes que /private
  const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
  const match = sorted.find(it =>
    pathname === it.href || pathname.startsWith(it.href + '/')
  );
  return match?.label ?? 'Panel Principal';
}

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname() || '/private';

  const [open, setOpen] = useState(false);

  const role = useMemo(
    () => ((user?.role ?? 'ADMINISTRADOR') as RoleName),
    [user?.role]
  );

  const menuItems = useMemo(() => MENU_BY_ROLE[role] ?? [], [role]);
  const headerTitle = useMemo(() => findTitleByPath(pathname, menuItems), [pathname, menuItems]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const roleParam = sp.get('role');
    if (user && roleParam && roleParam !== user.role) {
      router.replace(`/private?role=${user.role}`);
    }
  }, [user, sp, router]);

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideMenu open={open} role={role} onClose={() => setOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title={headerTitle}
          onToggleMenu={() => setOpen(v => !v)}
          right={
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Cerrar sesión
            </button>
          }
        />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
//v1