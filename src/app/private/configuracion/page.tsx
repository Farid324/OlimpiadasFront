// src/app/private/configuracion/page.tsx
'use client';

import { useEffect, Suspense } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import dynamic from 'next/dynamic';
import { Settings, Layers, KeyRound } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { RoleName } from '@/types';

const MedalleroTab = dynamic(() => import('./tabs/MedalleroTab'), { ssr: false });
const AreasTab = dynamic(() => import('./tabs/AreasTab'), { ssr: false });
const PasswordTab = dynamic(() => import('./tabs/PasswordTab'), { ssr: false });

type TabKey = 'Configuracion' | 'Areas' | 'Password';

const TAB_CONTENT: Record<TabKey, { title: string; subtitle: string }> = {
  Configuracion: {
    title: 'Configuración de Medallero',
    subtitle: 'Parametrización de medallas y menciones por área de competencia.',
  },
  Areas: {
    title: 'Configuración de Áreas',
    subtitle: 'Gestión de materias, tipos y criterios de aprobación.',
  },
  Password: {
    title: 'Cambiar contraseña',
    subtitle: 'Actualiza tu contraseña de acceso al sistema.',
  },
};

function ConfiguracionContent() {
  const { setTitle } = usePageHeader();
  const { user } = useAuth();
  const userRole = user?.role as RoleName | undefined;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tabParam = searchParams.get('tab') as TabKey | null;

  const isAdmin = userRole === 'ADMINISTRADOR';

  // Tab activo según rol
  let activeTab: TabKey = 'Configuracion';
  if (isAdmin) {
    if (tabParam === 'Areas' || tabParam === 'Password') {
      activeTab = tabParam;
    }
  } else {
    // Responsables / Evaluadores → siempre Password
    activeTab = 'Password';
  }

  useEffect(() => {
    setTitle('Configuración del Sistema');
  }, [setTitle]);

  const handleTabChange = (tab: TabKey) => {
    if (!isAdmin) return; // otros roles no cambian de tab

    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const headerInfo = TAB_CONTENT[activeTab];

  return (
    <div className="p-2 space-y-6 text-gray-900">
      
      <div className="bg-[var(--fondoAzulGris)] border-gray-100 min-h-[600px] p-4 flex flex-col gap-6">
        {/* Título de la sección */}
        <div>
          <h2 className="text-2xl font-bold text-black">
            {headerInfo.title}
          </h2>
          <p className="text-gray-500 text-sm">
            {headerInfo.subtitle}
          </p>
        </div>

        {/* BOTONES DE TABS – solo para ADMINISTRADOR */}
        {isAdmin && (
          <div className="w-full overflow-x-auto">
            <div className="inline-flex items-center bg-gray-100 p-1 rounded-full shadow-inner min-w-max mx-auto md:mx-0">
              {/* Tab Configuración Medallero */}
              <button
                onClick={() => handleTabChange('Configuracion')}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-1.5 text-sm font-medium rounded-full 
                  transition-all duration-200 whitespace-nowrap
                  ${
                    activeTab === 'Configuracion'
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }
                `}
              >
                <Settings className="w-4 h-4" />
                <span>Configuración Medallero</span>
              </button>

              {/* Tab Gestión de Áreas */}
              <button
                onClick={() => handleTabChange('Areas')}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-1.5 text-sm font-medium rounded-full 
                  transition-all duration-200 whitespace-nowrap
                  ${
                    activeTab === 'Areas'
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }
                `}
              >
                <Layers className="w-4 h-4" />
                <span>Gestión de Áreas</span>
              </button>

              {/* Tab Cambiar contraseña */}
              <button
                onClick={() => handleTabChange('Password')}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-1.5 text-sm font-medium rounded-full 
                  transition-all duration-200 whitespace-nowrap
                  ${
                    activeTab === 'Password'
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }
                `}
              >
                <KeyRound className="w-4 h-4" />
                <span>Cambiar contraseña</span>
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO DE CADA TAB */}
        <div className="flex-1 pt-2">
          {isAdmin && activeTab === 'Configuracion' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MedalleroTab />
            </div>
          )}

          {isAdmin && activeTab === 'Areas' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AreasTab />
            </div>
          )}

          {/* Siempre permitimos Password, para todos los roles */}
          {activeTab === 'Password' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <PasswordTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function ConfiguracionPage() {
  return (
    <Suspense fallback={<div className="p-4">Cargando...</div>}>
      <ConfiguracionContent />
    </Suspense>
  );
}
