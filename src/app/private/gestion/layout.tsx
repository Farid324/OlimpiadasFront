// src/app/private/gestion/page.tsx
'use client';

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-auto bg-gray-50">
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Usamos la variable de fondo que definiste previamente */}
        <main className="flex-1 overflow-auto bg-[var(--fondoAzulGris)]">
          <div className="max-w-7xl mx-auto py-1 px-1">{children}</div>
        </main>
      </div>
    </div>
  );
}