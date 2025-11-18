// src/app/private/evaluadores/layout.tsx
'use client';

export default function EvaluadoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-6">{children}</div>;
}
