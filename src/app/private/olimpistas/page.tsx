// src/app/private/olimpistas/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import AreaCarousel from "@/components/olimpistas/AreaCarousel";
import OlimpistasTable from "@/components/olimpistas/OlimpistasTable";
import { fetchAreaCounters, fetchOlimpistas } from "@/libs/olimpistas.api";
import type { AreaCounter, OlimpistaRow } from "@/types/olimpista";
import RegisterOlimpistaModal from "@/components/olimpistas/RegisterOlimpistaModal";
import ImportCsvOlimpistasModal from "@/components/olimpistas/ImportCsvOlimpistasModal";
import RegisterGrupoModal from "@/components/olimpistas/RegisterGrupoModal";
import { usePageHeader } from '@/contexts/pageHeader';
import { Search } from 'lucide-react';

export default function OlimpistasPage() {
  const [areas, setAreas] = useState<AreaCounter[]>([]);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [rows, setRows] = useState<OlimpistaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGrupo, setShowGrupo] = useState(false);
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
    setTitle('Olimpistas');
  }, [setTitle]);

  return (
    <div className="p-6 space-y-6 overflow-hidden">
      { }
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Olimpistas</h1>
        <p className="text-gray-500 text-sm">
          Administración de Olimpistas por Área de Competencia
        </p>
      </div>

      { }
      <AreaCarousel
        items={areas}
        active={activeArea ?? undefined}
        onSelect={setActiveArea}
      />

      { }
      <div className="flex gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium inline-flex items-center gap-2"
        >
          <Plus size={18} /> Agregar Olimpista
        </button>

        <button
          onClick={() => setShowGrupo(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium inline-flex items-center gap-2"
        >
          <Plus size={18} /> Agregar Grupo Olimpista
        </button>

        <button
          onClick={() => setShowImport(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium inline-flex items-center gap-2"
        >
          <Download size={18} /> Importar csv
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Buscar por nombre, área, unidad o departamento"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="
        w-full h-12 pl-12 pr-10 rounded-lg bg-gray-50 border border-gray-200
        text-gray-800 placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
        transition
      "
            aria-label="Buscar"
          />

          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none
                   text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>


      { }
      <OlimpistasTable rows={rows} loading={loading} />

      { }
      {showModal && (
        <RegisterOlimpistaModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            loadAreas();
            loadRows();
            setShowModal(false);
          }}
        />
      )}

      {/*botón Importar CSV */}
      {showImport && (
        <ImportCsvOlimpistasModal
          onClose={() => setShowImport(false)}
          onImported={() => {
            loadAreas();
            loadRows();
          }}
        />
      )}

      {/*buscador y tabla*/}
      {showGrupo && (
        <RegisterGrupoModal
          onClose={() => setShowGrupo(false)}
          onSuccess={() => {
            loadAreas();
            loadRows();
          }}
        />
      )}
    </div>
  );
}
