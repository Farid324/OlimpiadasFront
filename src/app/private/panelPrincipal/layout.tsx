// src/app/private/panelPrincipal/layout.tsx
'use client';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-none px-1 sm:px-6 py-4 sm:py-6">
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="w-full max-w-none px-1 sm:px-6 py-4 sm:py-6">
          <div>
            <h1 className="text-black text-2xl font-bold">
              Panel de Control - Oh! SanSi 2025
            </h1>

            <p className="text-sm text-black">
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
