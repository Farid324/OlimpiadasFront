// src/components/Menu.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LuHouse,
  LuUsers,
  LuSettings,
  LuShield,
  LuFilePen,
  LuGitBranch,
  LuChartColumn,
  LuActivity,
} from "react-icons/lu";
// Agregamos FiX para el icono de cerrar (X)
import { FiUserCheck, FiSmartphone, FiUser, FiLogOut, FiSidebar } from "react-icons/fi";
import { MdOutlineManageAccounts } from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";

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
  MdOutlineManageAccounts,
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
    { icon: 'LuActivity', label: 'Registro de Actividades', href: '/private/registroActividades' },
    { icon: 'LuSettings', label: 'Configuración', href: '/private/configuracion' },
    { icon: 'MdOutlineManageAccounts', label: 'Gestión', href: '/private/gestion' },
  ],
  EVALUADOR: [
    { icon: 'LuHouse', label: 'Panel Principal', href: '/private/panelPrincipal' },
    { icon: 'LuFilePen', label: 'Evaluaciones', href: '/private/evaluaciones/evaluadores' },
    { icon: 'LuSettings', label: 'Configuración', href: '/private/configuracion' },
  ],
  RESPONSABLE_DE_AREA: [
    { icon: 'LuHouse', label: 'Panel Principal', href: '/private/panelPrincipal' },
    { icon: 'LuUsers', label: 'Olimpistas', href: '/private/olimpistas' },
    { icon: 'FiUserCheck', label: 'Evaluadores', href: '/private/evaluadores' },
    { icon: 'LuGitBranch', label: 'Control de Fases', href: '/private/controlFases/responsables' },
    { icon: 'LuChartColumn', label: 'Reportes', href: '/private/reportes/responsables' },
    { icon: 'LuSettings', label: 'Configuración', href: '/private/configuracion' },
  ],
};

const ROLE_LABEL: Record<RoleName, string> = {
  ADMINISTRADOR: 'Administrador',
  EVALUADOR: 'Evaluador',
  RESPONSABLE_DE_AREA: 'Responsable de Área',
};

export default function SideMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const userRole = user?.role as RoleName;
  const items = userRole ? MENU_BY_ROLE[userRole] : [];

  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  const displayName = user?.name || 'Usuario';
  const displayRole = ROLE_LABEL[userRole] || 'Rol';
  const displayEmail = user?.email || 'usuario@olimpiadas.edu';

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={[
        // === COMPORTAMIENTO BASE (MÓVIL) ===
        'fixed inset-0 z-50', // Ocupa toda la pantalla
        'w-full', // Ancho completo
        'transition-transform duration-300 ease-out',
        'bg-[var(--blanco)] border-r',
        'flex flex-col overflow-hidden', // contenedor columna sin scroll
        open ? 'translate-x-0' : '-translate-x-full',

        // === COMPORTAMIENTO ESCRITORIO (lg: reset) ===
        // Aquí volvemos a las medidas originales cuando la pantalla es grande
        'lg:left-0 lg:top-0 lg:h-screen lg:w-[var(--sidebar-w)] lg:inset-auto',
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* Header/logo */}
      {/* MÓVIL: justify-between (Logo izq, Boton der) */}
      {/* ESCRITORIO (lg): justify-center (Solo logo centrado) */}
      <div className="flex items-center justify-between lg:justify-center px-4 h-auto border-b py-4 lg:py-0">
        
        {/* Contenedor Imagen: en móvil limitamos el ancho para que se encoja */}
        <div className="w-32 lg:w-auto flex justify-center lg:block">
           <Image 
             src="/assets/logo1.png" 
             alt="Logo" 
             width={200} 
             height={200} 
             className="object-contain"
           />
        </div>

        {/* Botón Cerrar (X) - Solo visible en móvil, oculto en lg */}
        <button 
            onClick={onClose}
            className="lg:hidden p-2 text-[var(--negro)] hover:bg-gray-100 rounded-full transition-colors"
        >
            <FiSidebar className="h-5 w-5 text-[var(--negro)]" />
        </button>
      </div>

      {/* Menú: único scroller */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto flex flex-col">
        {items.map((it) => {
          const Icon = it.icon ? ICONS[it.icon] : null;
          const active = isActive(it.href);

          const linkClass = [
            'group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
            // MÓVIL: Centramos contenido (justify-center)
            'justify-center',
            // ESCRITORIO: Alineamos a la izquierda (lg:justify-start)
            'lg:justify-start', 
            
            active
              ? 'bg-[var(--azul)] text-[var(--blanco)] font-semibold ring-1 ring-blue-200 lg:pl-2'
              : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900', 
          ].join(' ');

          const iconClass = active
            ? 'shrink-0 text-[var(--blanco)]'
            : 'shrink-0 text-gray-700 group-hover:text-gray-900';

          return (
            <Link
              key={it.href}
              href={it.href}
              // En móvil queremos que al dar click se cierre el menú
              onClick={() => {
                if (window.innerWidth < 1024) onClose?.();
              }}
              aria-current={active ? 'page' : undefined}
              className={linkClass}
            >
              {Icon && <Icon size={18} className={iconClass} aria-hidden />}

              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer fijo abajo */}
      <div className="border-t px-3 py-3">
        {/* MÓVIL: Flex columna y centrado */}
        {/* ESCRITORIO: Flex fila y alineado al inicio */}
        <div className="flex flex-col lg:flex-row items-center gap-3 mb-3">
          
          <div className="h-10 w-10 rounded-full bg-[var(--azul)] flex items-center justify-center shrink-0">
            <FiUser className="text-[var(--blanco)]" />
          </div>
          
          {/* Textos: Centrados en móvil, izquierda en escritorio */}
          <div className="min-w-0 text-center lg:text-left">
            <p className="text-sm font-bold text-[var(--negro)] truncate">{displayName}</p>
            <p className="text-xs font-semibold text-[var(--azul)] truncate">{displayRole}</p>
            <p className="text-xs font-semibold text-gray-500 truncate">{displayEmail}</p>
          </div>
        </div>

        <button
          type="button"
          className={[
            "inline-flex items-center gap-6 font-bold text-xs text-gray-700 hover:bg-[var(--grisClaro)] h-8 rounded-2xl px-3 transition-colors",
            // MÓVIL: Botón centrado (margin auto) o full width si prefieres, 
            // aquí uso 'mx-auto' para centrarlo visualmente respecto al contenedor flex col
            "justify-center w-full sm:w-auto sm:ml-auto" 
          ].join(' ')}
          onClick={handleLogout}
        >
          <FiLogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}