//src/components/controlFases/StatCard.tsx
import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      {/* Título: primera letra de cada palabra en mayúscula */}
      <div className="text-[11px] capitalize tracking-wide text-slate-500">
        {title}
      </div>

      {/* Valor principal */}
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>

      {/* Subtítulo: también primera letra de cada palabra en mayúscula */}
      {subtitle && (
        <div className="mt-1 text-xs text-slate-500 capitalize">
          {subtitle}
        </div>
      )}
    </div>
  );
}
