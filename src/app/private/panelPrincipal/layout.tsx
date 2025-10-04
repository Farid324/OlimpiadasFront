'use client';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#EEF6FB]">
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between py-6 px-8">
          <div>
            <h1 className="text-2xl font-bold">Panel de Control - Oh! SanSi 2024</h1>
            <p className="text-sm text-gray-600">
              Olimpiada en Ciencias y Tecnología San Simón - Gestión integral del proceso de evaluación
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100">🔔</button>
            <div className="bg-cyan-50 px-4 py-2 rounded-full text-sm">Olimpiadas 2025</div>
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
