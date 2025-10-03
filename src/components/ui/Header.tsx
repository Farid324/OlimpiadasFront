// src/components/ui/Header.tsx
'use client';

import * as React from 'react';
import { FiSidebar } from 'react-icons/fi';

type Props = {
  title: string;
  right?: React.ReactNode;     // slot opcional
  showMenu?: boolean;          // ocultar/mostrar botón
  onToggleMenu?: () => void;   // abre/cierra sidebar
  className?: string;
};

export function Header({
  title,
  right,
  showMenu = true,
  onToggleMenu,
  className = '',
}: Props) {
  return (
    <header
      className={[
        'sticky top-0 z-40',
        'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--blanco)]',
        'border-b border-gray-200',
        'px-3 sm:px-4 lg:px-6',
        'pt-6 pb-4',
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {showMenu ? (
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label="Abrir menú"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-[var(--grisClaro)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <FiSidebar className="h-5 w-5 text-[var(--negro)]" />
          </button>
        ) : (
          <div className="h-9 w-9" aria-hidden />
        )}

        <div className="flex-1 text-start">
          <h1 className="text-base font-semibold leading-5 text-[var(--negro)]">{title}</h1>
        </div>

        {right ? (
          <div className="min-h-9 min-w-9 flex items-center justify-center">{right}</div>
        ) : (
          <div className="h-9 w-9" aria-hidden />
        )}
      </div>
    </header>
  );
}

export default Header;
