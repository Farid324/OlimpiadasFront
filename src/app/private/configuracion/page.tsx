'use client';

import { useEffect, useState } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';
import dynamic from 'next/dynamic';
import { Settings, Layers } from 'lucide-react';

// Componentes Tabs
const MedalleroTab = dynamic(() => import('./tabs/MedalleroTab'), { ssr: false });
const AreasTab = dynamic(() => import('./tabs/AreasTab'), { ssr: false });

type TabKey = 'Configuracion' | 'Areas';

// Configuración de textos para cada Tab
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
  
  useEffect(() => {
    setTitle('Configuración del Sistema');
  }, [setTitle]);

  const [activeTab, setActiveTab] = useState<TabKey>('Configuracion');

  return (
    <div className="p-6 space-y-6 text-gray-900">
      
      {/* Contenedor Principal (Tarjeta Blanca) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] p-6 flex flex-col gap-6">
        
        {/* 1. Título y Subtítulo Dinámicos */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {TAB_CONTENT[activeTab].title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {TAB_CONTENT[activeTab].subtitle}
          </p>
        </div>

        {/* 2. Navegación de Tabs (Estilo Segmentado / Píldora) */}
        <div className="flex justify-center md:justify-start">
           <div className="inline-flex items-center bg-gray-100 p-1 rounded-full shadow-inner">
             
             <button
               onClick={() => setActiveTab('Configuracion')}
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
               onClick={() => setActiveTab('Areas')}
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

        {/* 3. Contenido de la Pestaña */}
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