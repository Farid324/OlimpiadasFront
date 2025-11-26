// src/components/olimpistas/OlimpistasTable.tsx
"use client";
import type { OlimpistaRow } from "@/types/olimpista";

type Props = {
  rows: OlimpistaRow[];
  loading?: boolean;
};

const fmtScore = (v: number | null): string => {
  if (v === null || Number.isNaN(v)) return "—";
  return Number(v).toFixed(2);
};

export default function OlimpistasTable({ rows, loading }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4">
      <h2 className="font-semibold text-gray-700 mb-2">
        Olimpistas Registrados ({rows.length})
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Lista completa de los Olimpistas registrados en el sistema
      </p>

      {loading ? (
        <p className="text-gray-500 text-center">Cargando...</p>
      ) : rows.length === 0 ? (
        <div className="border rounded-md p-6 text-gray-500 text-center">
          No hay olimpistas registrados
        </div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto">
          {/* wrapper con scroll horizontal en cel */}
          <div
            className="w-full overflow-x-auto md:overflow-x-visible"
            role="region"
            aria-label="Lista de olimpistas con desplazamiento horizontal"
            tabIndex={0}
          >
            <table className="min-w-[700px] md:min-w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="text-gray-700 border-b">
                  <th className="pb-3 px-4 text-left">Nombre completo</th>
                  <th className="pb-3 px-4 text-left">Área</th>
                  <th className="pb-3 px-4 text-left">Nivel</th>
                  <th className="pb-3 px-4 text-left">Unidad Educativa</th>
                  <th className="pb-3 px-4 text-left">Departamento</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-black">{r.nombreCompleto}</td>
                    <td className="py-3 px-4 text-black">{r.area}</td>
                    <td className="py-3 px-4 text-black">{r.nivel}</td>
                    <td className="py-3 px-4 text-black">
                      {r.unidadEducativa}
                    </td>
                    <td className="py-3 px-4 text-black">{r.departamento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
