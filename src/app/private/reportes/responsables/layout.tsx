// src/app/private/reportes/responsables/layout.tsx
'use client';

export default function ResponsablesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✅ padding mínimo en móvil, normal en desktop, sin limitar ancho
    <div className="w-full max-w-none px-1 sm:px-6 py-4 sm:py-6">
      {children}
    </div>
  );
}
