// src/components/Menu.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LuHouse, LuUsers, LuSettings, LuShield,
  LuFilePen, LuGitBranch, LuChartColumn, LuActivity
} from 'react-icons/lu';
import { FiUserCheck, FiSmartphone, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

export type RoleName = 'ADMINISTRADOR' | 'EVALUADOR' | 'RESPONSABLE_DE_AREA';

const ICONS = {
  LuHouse,
  LuUsers,
  LuSettings,
  LuShield,
  LuFilePen,
  LuGitBranch,
  LuChartColumn,
  LuActivity,
  FiUserCheck,
  FiSmartphone,
} as const;

type IconKey = keyof typeof ICONS;

export type MenuItem = {
  icon?: IconKey;
  label: string;
  href: string;
};

export const MENU_BY_ROLE: Record<RoleName, MenuItem[]> = {
  ADMINISTRADOR: [
    { icon: 'LuHouse', label: 'Panel Principal', href: '/private/panelPrincipal' },
    { icon: 'LuUsers', label: 'Olimpistas', href: '/private/olimpistas' },
    { icon: 'FiUserCheck', label: 'Evaluadores', href: '/private/evaluadores' },
    { icon: 'LuShield', label: 'Responsables', href: '/private/responsables' },
    { icon: 'LuFilePen', label: 'Evaluaciones', href: '/private/evaluaciones' },
    { icon: 'LuGitBranch', label: 'Control de Fases', href: '/private/controlFases' },
    { icon: 'LuChartColumn', label: 'Reportes', href: '/private/reportes' },
    { icon: 'FiSmartphone', label: 'Evaluación Móvil', href: '/private/evaluacionMovil' },
    { icon: 'LuActivity', label: 'Registro de Actividades', href: '/private/registroActividades' },
    { icon: 'LuSettings', label: 'Configuración', href: '/private/configuracion' },
  ],
  EVALUADOR: [
    { icon: 'LuHouse', label: 'Panel Principal', href: '/private/panelPrincipal' },
    { icon: 'LuFilePen', label: 'Evaluaciones', href: '/private/evaluaciones' },
    { icon: 'FiSmartphone', label: 'Evaluación Móvil', href: '/private/evaluacionMovil' },
  ],
  RESPONSABLE_DE_AREA: [
    { icon: 'LuHouse', label: 'Panel Principal', href: '/private/panelPrincipal' },
    { icon: 'LuGitBranch', label: 'Control de Fases', href: '/private/controlFases' },
    { icon: 'LuChartColumn', label: 'Reportes', href: '/private/reportes' },
  ],
};

const ROLE_LABEL: Record<RoleName, string> = {
  ADMINISTRADOR: 'Administrador',
  EVALUADOR: 'Evaluador',
  RESPONSABLE_DE_AREA: 'Responsable de Área',
};

export default function SideMenu({
  open,
  role,
  onClose,
}: {
  open: boolean;
  role: RoleName;
  onClose?: () => void; 
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const items = MENU_BY_ROLE[role] ?? [];

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  const displayName = user?.name || 'Usuario';
  const displayRole = ROLE_LABEL[(user?.role as RoleName) || role] || 'Rol';
  const displayEmail = user?.email || 'usuario@olimpiadas.edu';

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={[
        'fixed left-0 top-0 h-screen w-[var(--sidebar-w)]',
        'transition-transform duration-300 ease-out',
        'bg-[var(--blanco)] border-r z-40',
        'flex flex-col overflow-hidden', // contenedor columna sin scroll
        open ? 'translate-x-0' : '-translate-x-full',
        // 'md:translate-x-0', // opcional: siempre visible en desktop
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* Header/logo */}
      <div className="flex items-center justify-center px-4 h-auto border-b">
        <Image src="/assets/logo1.png" alt="Logo" width={200} height={200} />
      </div>

      {/* Menú: único scroller */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const Icon = it.icon ? ICONS[it.icon] : null;
          const active = isActive(it.href);

          const linkClass = [
            'group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
            active
              ? 'bg-[var(--azul)] text-[var(--blanco)] font-semibold ring-1 ring-blue-200 pl-2'
              : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900', // 👈 hover SOLO si NO está activo
          ].join(' ');

          const iconClass = active
            ? 'shrink-0 text-[var(--blanco)]'
            : 'shrink-0 text-gray-700 group-hover:text-gray-900';

          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => onClose?.()}
              aria-current={active ? 'page' : undefined}
              className={linkClass}
            >
              {Icon && <Icon size={18} className={iconClass} aria-hidden />}

              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer fijo abajo (no scrollea) */}
      <div className="border-t px-3 py-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-[var(--azul)] flex items-center justify-center">
            <FiUser className="text-[var(--blanco)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--negro)] truncate">{displayName}</p>
            <p className="text-xs font-semibold text-[var(--azul)] truncate">{displayRole}</p>
            <p className="text-xs font-semibold text-gray-500 truncate">{displayEmail}</p>
          </div>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-6 font-bold text-xs text-gray-700 hover:bg-[var(--grisClaro)] h-8 w-full rounded-2xl px-3"
          onClick={handleLogout}
        >
          <FiLogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
