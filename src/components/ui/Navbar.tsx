// src/components/ui/Navbar.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

type NavLink = { label: string; href: string };
type UserData = { name: string; role?: string };

interface NavbarProps {
  title?: string;
  tittleButton?: string;
  links?: NavLink[];
  user?: UserData | null;
  onLogout?: () => void;
  className?: string;
  rightSlot?: React.ReactNode;
  loginHref?: string;
}

export default function Navbar({
  title = 'Oh! SanSi 2025',
  tittleButton = 'Iniciar Sesion',
  links,
  user,
  onLogout,
  className,
  rightSlot,
  loginHref = '/login',
}: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const hasLinks = Array.isArray(links) && links.length > 0;
  const hasRightContent = !!rightSlot || !!user || !user; // siempre habrá algo (login/logout)
  const shouldShowMobileToggle = hasLinks || hasRightContent;

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                className="rounded-full"
                src="/assets/logo2.png"
                alt="Logo principal del login"
                width={50}
                height={50}
              />
              <span className="text-sm font-semibold text-gray-900">{title}</span>
            </Link>
          </div>

          {/* Desktop nav */}
          {hasLinks && (
            <nav className="hidden md:flex md:items-center md:gap-1">
              {links!.map((l) => {
                const active = pathname === l.href || pathname?.startsWith(l.href + '/');
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors',
                      active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            {rightSlot}
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-md border px-2 py-1">
                  <UserCircle className="size-4 text-gray-500" />
                  <div className="leading-tight">
                    <div className="text-xs font-medium text-gray-900">{user.name}</div>
                    {user.role && (
                      <div className="text-[11px] text-gray-500">{user.role}</div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout} aria-label="Cerrar sesión">
                  <LogOut className="mr-2 size-4" />
                  Salir
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href={loginHref}>{tittleButton}</Link>
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          {shouldShowMobileToggle && (
            <button
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {/* Links (si existen) */}
            {hasLinks && (
              <div className="flex flex-col gap-1">
                {links!.map((l) => {
                  const active = pathname === l.href || pathname?.startsWith(l.href + '/');
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cn(
                        'rounded-md px-3 py-2 text-sm transition-colors',
                        active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Sección inferior SIEMPRE visible en móvil (login/logout) */}
            <div className={cn('mt-3 flex items-center justify-between', !hasLinks && 'mt-0')}>
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <UserCircle className="size-5 text-gray-500" />
                    <div className="leading-tight">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      {user.role && <div className="text-xs text-gray-500">{user.role}</div>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={onLogout} aria-label="Cerrar sesión">
                    <LogOut className="mr-1 size-4" />
                    Salir
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full">
                  <Link href={loginHref}>{tittleButton}</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
