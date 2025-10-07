// src/app/private/panelPrincipal/layout.tsx
'use client';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#EEF6FB]">
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between py-6 px-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--grisOscuro)' }}>
              Panel de Control - Oh! SanSi 2024
            </h1>

            <p className="text-sm text-gray-600">
              Olimpiada en Ciencias y Tecnología San Simón - Gestión integral del proceso de evaluación
            </p>
          </div>

          
        </div>

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
