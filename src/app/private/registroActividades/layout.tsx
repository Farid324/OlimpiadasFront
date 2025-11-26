// src/app/private/registroActividades/responsablesLayout.tsx
'use client';

export default function ResponsablesLayout({ children }: { children: React.ReactNode }) {
  return (
    // Es CRÍTICO que tenga w-full y un padding lateral pequeño/nulo.
    <div className="w-full py-6 px-4"> 
      {children}
    </div>
  );
}
