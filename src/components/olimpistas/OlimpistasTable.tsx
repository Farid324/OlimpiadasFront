// src/components/olimpistas/OlimpistasTable.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { OlimpistaRow } from "@/types/olimpista";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

type Props = {
  rows: OlimpistaRow[];
  loading?: boolean;
  /**
   * Callback opcional para editar un olimpista.
   * Si no se pasa, el botón de editar solo cerrará el menú.
   */
  onEdit?: (row: OlimpistaRow) => void;
  /**
   * Callback opcional para eliminar un olimpista.
   * Si no se pasa, el botón de eliminar solo cerrará el menú.
   */
  onDelete?: (row: OlimpistaRow) => void;
};

export default function OlimpistasTable({
  rows,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cerrar menú al hacer click fuera o con Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      const target = e.target as Node;
      if (!menuRef.current.contains(target)) {
        setMenuOpenId(null);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpenId(null);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4" ref={menuRef}>
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
                  {/* Columna de acciones */}
                  <th className="pb-3 px-2 text-right" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isMenuOpen = menuOpenId === r.id;

                  return (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-black">
                        {r.nombreCompleto}
                      </td>
                      <td className="py-3 px-4 text-black">{r.area}</td>
                      <td className="py-3 px-4 text-black">{r.nivel}</td>
                      <td className="py-3 px-4 text-black">
                        {r.unidadEducativa}
                      </td>
                      <td className="py-3 px-4 text-black">
                        {r.departamento}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-2 text-right relative">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setMenuOpenId((prev) =>
                              prev === r.id ? null : r.id
                            );
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 focus:outline-none"
                          aria-haspopup="menu"
                          aria-expanded={isMenuOpen}
                          aria-label="Acciones de olimpista"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-700" />
                        </button>

                        {isMenuOpen && (
                          <div
                            role="menu"
                            className="absolute right-2 bottom-2 z-20 w-40 rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null);
                                onEdit?.(r);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
                            >
                              <Pencil className="w-4 h-4" /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null);
                                onDelete?.(r);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
