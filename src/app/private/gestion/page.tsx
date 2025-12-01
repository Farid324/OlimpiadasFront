// src/app/private/gestion/page.tsx
'use client';

import { useEffect, Suspense } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import dynamic from 'next/dynamic';
// Iconos sugeridos para cada sección
import { Users, GraduationCap, Layers } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

// --- Importación Dinámica de Tabs (Lazy Loading) ---
const OlimpistasTab = dynamic(() => import('@/app/private/gestion/tabs/OlimpistasTab'), { 
  ssr: false,
  loading: () => <div className="p-8 text-center text-gray-400">Cargando módulo de Olimpistas...</div>
});
const EquipoTab = dynamic(() => import('@/app/private/gestion/tabs/EquipoTab'), { 
  ssr: false,
  loading: () => <div className="p-8 text-center text-gray-400">Cargando módulo de Equipo...</div>
});
const AreasGestionTab = dynamic(() => import('@/app/private/gestion/tabs/AreasGestionTab'), { 
  ssr: false,
  loading: () => <div className="p-8 text-center text-gray-400">Cargando módulo de Áreas...</div>
});

// Definimos las llaves posibles para los Tabs
type TabKey = 'Olimpistas' | 'Equipo' | 'Areas';

// --- Configuración de Textos y Títulos ---
const TAB_CONTENT = {
  Olimpistas: {
    title: 'Directorio de Olimpistas',
    subtitle: 'Gestión, inscripción y seguimiento de estudiantes participantes.'
  },
  Equipo: {
    title: 'Equipo Académico',
    subtitle: 'Administración de Evaluadores y Responsables de Área.'
  },
  Areas: {
    title: 'Gestión Operativa de Áreas',
    subtitle: 'Supervisión y control de las áreas activas en la competencia.'
  }
};

function GestionContent() {
  const { setTitle } = usePageHeader();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Leer tab de la URL, por defecto 'Olimpistas'
  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = (tabParam === 'Equipo' || tabParam === 'Areas') ? (tabParam as TabKey) : 'Olimpistas';

  useEffect(() => {
    setTitle('Gestión Integral');
  }, [setTitle]);

  const handleTabChange = (tab: TabKey) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-1 space-y-6 text-gray-900">
      
      {/* Tarjeta contenedora principal bg-[var(--fondoAzulGris)] */}
      <div className="bg-white   min-h-[600px] p-6 flex flex-col gap-6">
        
        {/* 1. Encabezado Dinámico */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {TAB_CONTENT[activeTab].title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {TAB_CONTENT[activeTab].subtitle}
          </p>
        </div>

        {/* 2. Navegación de Tabs (Píldora) */}
        <div className="flex justify-center md:justify-start overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
           <div className="inline-flex items-center bg-gray-100 p-1 rounded-full shadow-inner whitespace-nowrap">
             
             {/* Tab 1: Olimpistas */}
             <button
               onClick={() => handleTabChange('Olimpistas')}
               className={`
                 flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200
                 ${activeTab === 'Olimpistas'
                   ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}
               `}
             >
               <Users className="w-4 h-4" />
               <span>Olimpistas</span>
             </button>

             {/* Tab 2: Equipo (Evaluadores y Responsables) */}
             <button
               onClick={() => handleTabChange('Equipo')}
               className={`
                 flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200
                 ${activeTab === 'Equipo'
                   ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}
               `}
             >
               <GraduationCap className="w-4 h-4" />
               <span>Equipo Académico</span>
             </button>
             
             {/* Tab 3: Áreas */}
             <button
               onClick={() => handleTabChange('Areas')}
               className={`
                 flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200
                 ${activeTab === 'Areas'
                   ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}
               `}
             >
               <Layers className="w-4 h-4" />
               <span>Áreas</span>
             </button>

           </div>
        </div>

        {/* 3. Contenido del Tab */}
        <div className="flex-1 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'Olimpistas' && <OlimpistasTab />}
          {activeTab === 'Equipo' && <EquipoTab />}
          {activeTab === 'Areas' && <AreasGestionTab />}
        </div>

      </div>

    </div>
  );
}

// Export Default con Suspense (Obligatorio para useSearchParams)
export default function GestionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[600px] text-gray-500">Cargando panel de gestión...</div>}>
      <GestionContent />
    </Suspense>
  );
}