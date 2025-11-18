//src/app/private/controlFases/responsables/layout.tsx
'use client';

export default function ResponsablesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      {children}
    </div>
  );
}
