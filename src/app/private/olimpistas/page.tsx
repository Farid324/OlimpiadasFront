// src/app/private/olimpistas/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Plus, Search, X, CheckCircle2 } from "lucide-react";
import AreaCarousel from "@/components/olimpistas/AreaCarousel";
import OlimpistasTable from "@/components/olimpistas/OlimpistasTable";
import { fetchAreaCounters, fetchOlimpistas } from "@/libs/olimpistas.api";
import type { AreaCounter, OlimpistaRow } from "@/types/olimpista";
import RegisterOlimpistaModal from "@/components/olimpistas/RegisterOlimpistaModal";
import ImportCsvOlimpistasModal from "@/components/olimpistas/ImportCsvOlimpistasModal";
import RegisterGrupoModal from "@/components/olimpistas/RegisterGrupoModal";
import { usePageHeader } from "@/contexts/pageHeader";
import { api } from "@/libs/api";

export default function OlimpistasPage() {
  const [areas, setAreas] = useState<AreaCounter[]>([]);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [rows, setRows] = useState<OlimpistaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGrupo, setShowGrupo] = useState(false);

  // Para eliminar
  const [confirmDelete, setConfirmDelete] = useState<OlimpistaRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Para edición
  const [editingRow, setEditingRow] = useState<OlimpistaRow | null>(null);

  const { setTitle } = usePageHeader();

  const loadAreas = useCallback(async () => {
    const data = await fetchAreaCounters();
    setAreas(data);
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOlimpistas({ area: activeArea ?? undefined, q });
      setRows(data);
    } catch (e) {
      console.error("Error cargando olimpistas", e);
    } finally {
      setLoading(false);
    }
  }, [activeArea, q]);

  useEffect(() => {
    void loadAreas();
  }, [loadAreas]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setTitle("Olimpistas");
  }, [setTitle]);

  // Ocultar mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (!deleteSuccess) return;
    const t = setTimeout(() => setDeleteSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [deleteSuccess]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/olimpistas/${confirmDelete.id}`);
      setConfirmDelete(null);
      await loadAreas();
      await loadRows();
      setDeleteSuccess("Olimpista eliminado con éxito");
    } catch (e) {
      console.error("Error eliminando olimpista", e);
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 overflow-hidden">
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Olimpistas</h1>
        <p className="text-gray-500 text-sm">
          Administración de Olimpistas por Área de Competencia
        </p>
      </div>

      {/* Mensaje de éxito al eliminar */}
      {deleteSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{deleteSuccess}</span>
        </div>
      )}

      {/* Carrusel de areas */}
      <AreaCarousel
        items={areas}
        active={activeArea ?? undefined}
        onSelect={setActiveArea}
      />

      {/* Botones */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
        <button
          onClick={() => {
            setEditingRow(null); // modo creación
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Agregar Olimpista
        </button>

        <button
          onClick={() => setShowGrupo(true)}
          className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Agregar Grupo Olimpista
        </button>

        <button
          onClick={() => setShowImport(true)}
          className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2"
        >
          <Download size={18} /> Importar csv
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Buscar por nombre, área, unidad o departamento"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-12 pl-12 pr-10 rounded-lg bg-gray-50 border border-gray-200
                       text-gray-800 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                       transition"
            aria-label="Buscar"
          />

          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none
                         text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabla responsive */}
      <OlimpistasTable
        rows={rows}
        loading={loading}
        onEdit={(row) => {
          setEditingRow(row);
          setShowModal(true);
        }}
        onDelete={(row) => setConfirmDelete(row)}
      />

      {/* Modal crear / editar */}
      {showModal && (
        <RegisterOlimpistaModal
          mode={editingRow ? "edit" : "create"}
          olimpistaId={editingRow?.id}
          onClose={() => {
            setShowModal(false);
            setEditingRow(null);
          }}
          onSuccess={() => {
            loadAreas();
            loadRows();
            setShowModal(false);
            setEditingRow(null);
          }}
        />
      )}

      {/* Modal import CSV */}
      {showImport && (
        <ImportCsvOlimpistasModal
          onClose={() => setShowImport(false)}
          onImported={() => {
            loadAreas();
            loadRows();
          }}
        />
      )}

      {/* Modal grupo */}
      {showGrupo && (
        <RegisterGrupoModal
          onClose={() => setShowGrupo(false)}
          onSuccess={() => {
            loadAreas();
            loadRows();
          }}
        />
      )}

      {/* Modal de confirmación de eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Eliminar olimpista</h3>
              <button
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setConfirmDelete(null)}
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-4 py-4 text-sm text-black">
              ¿Seguro que deseas eliminar a{" "}
              <span className="font-semibold">
                {confirmDelete.nombreCompleto}
              </span>
              ? Esta acción no se puede deshacer.
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-black hover:bg-gray-50"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
