// src/app/private/evaluaciones/evaluadores/layout.tsx
'use client';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {

  return (
   
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-none px-1 sm:px-6 py-4 sm:py-6">{children}</div>
        </main>
      </div>
    
  );
}