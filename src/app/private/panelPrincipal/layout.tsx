// src/app/private/panelPrincipal/layout.tsx
'use client';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-auto bg-gray-50">
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 px-4">{children}</div>
        </main>
      </div>
    </div>
  );
}