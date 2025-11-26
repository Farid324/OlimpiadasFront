// src/app/private/configuracion/layout.tsx
'use client';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-auto bg-gray-50">
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 overflow-auto bg-[var(--fondoAzulGris)]">
          <div className="max-w-7xl mx-auto py-1 px-1">{children}</div>
        </main>
      </div>
    </div>
  );
}