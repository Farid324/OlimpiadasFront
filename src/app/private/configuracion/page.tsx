//src/app/private/configuracion/page.tsx
'use client';

import { useEffect } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import dynamic from 'next/dynamic';
import { Settings, Layers } from 'lucide-react';
// 1. Importamos los hooks de navegación
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

// Componentes Tabs
const MedalleroTab = dynamic(() => import('./tabs/MedalleroTab'), { ssr: false });
const AreasTab = dynamic(() => import('./tabs/AreasTab'), { ssr: false });

type TabKey = 'Configuracion' | 'Areas';

const TAB_CONTENT = {
  Configuracion: {
    title: 'Configuración de Medallero',
    subtitle: 'Parametrización de medallas y menciones por área de competencia.'
  },
  Areas: {
    title: 'Configuración de Áreas',
    subtitle: 'Gestión de materias, tipos y criterios de aprobación.'
  }
};

export default function ConfiguracionPage() {
  const { setTitle } = usePageHeader();
  
  // 2. Hooks para manipular la URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // 3. Leemos el tab desde la URL. Si no existe o es inválido, por defecto es 'Configuracion'
  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = (tabParam === 'Areas') ? 'Areas' : 'Configuracion';

  useEffect(() => {
    setTitle('Configuración del Sistema');
  }, [setTitle]);

  // 4. Función para cambiar de pestaña actualizando la URL
  const handleTabChange = (tab: TabKey) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    // replace: cambia la url sin añadir una entrada al historial (mejor para tabs)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-1 space-y-6 text-gray-900">
      
      <div className="bg-[var(--fondoAzulGris)] border-gray-100 min-h-[600px] p-4 flex flex-col gap-6">
        
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {TAB_CONTENT[activeTab].title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {TAB_CONTENT[activeTab].subtitle}
          </p>
        </div>

        <div className="flex justify-center md:justify-start">
           <div className="inline-flex items-center bg-gray-100 p-1 rounded-full shadow-inner">
             
             <button
               onClick={() => handleTabChange('Configuracion')} // Usamos la nueva función
               className={`
                 flex items-center gap-2 px-6 py-1.5 text-sm font-medium rounded-full transition-all duration-200
                 ${activeTab === 'Configuracion'
                   ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}
               `}
             >
               <Settings className="w-4 h-4" />
               <span>Configuración Medallero</span>
             </button>

             <button
               onClick={() => handleTabChange('Areas')} // Usamos la nueva función
               className={`
                 flex items-center gap-2 px-6 py-1.5 text-sm font-medium rounded-full transition-all duration-200
                 ${activeTab === 'Areas'
                   ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                   : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}
               `}
             >
               <Layers className="w-4 h-4" />
               <span>Gestión de Áreas</span>
             </button>
             
           </div>
        </div>

        <div className="flex-1 pt-2">
          {activeTab === 'Configuracion' && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <MedalleroTab />
             </div>
          )}

          {activeTab === 'Areas' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AreasTab />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
