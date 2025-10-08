"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import AreaCarousel from "@/components/olimpistas/AreaCarousel";
import OlimpistasTable from "@/components/olimpistas/OlimpistasTable";
import { fetchAreaCounters, fetchOlimpistas } from "@/libs/olimpistas.api";
import type { AreaCounter, OlimpistaRow } from "@/types/olimpista";
import RegisterOlimpistaModal from "@/components/olimpistas/RegisterOlimpistaModal";
import ImportCsvOlimpistasModal from "@/components/olimpistas/ImportCsvOlimpistasModal";
import RegisterGrupoModal from "@/components/olimpistas/RegisterGrupoModal";

export default function OlimpistasPage() {
  const [areas, setAreas] = useState<AreaCounter[]>([]);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [rows, setRows] = useState<OlimpistaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGrupo, setShowGrupo] = useState(false);

  const loadAreas = async () => {
    const data = await fetchAreaCounters();
    setAreas(data);
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const data = await fetchOlimpistas({ area: activeArea ?? undefined, q });
      setRows(data);
    } catch (e) {
      console.error("Error cargando olimpistas", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);
  useEffect(() => {
    loadRows();
  }, [activeArea, q]);

  const total = useMemo(() => rows.length, [rows]);

  return (
    <div className="p-6 space-y-6 overflow-hidden">
      {}
      <div>
        <h1 className="text-2xl font-bold text-black">Gestión de Olimpistas</h1>
        <p className="text-gray-500 text-sm">
          Administración de Olimpistas por Área de Competencia
        </p>
      </div>

      {}
      <AreaCarousel
        items={areas}
        active={activeArea ?? undefined}
        onSelect={setActiveArea}
      />

      {}
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

      {}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre, área, unidad o departamento"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-4 border rounded-md h-11 text-gray-600"
        />
      </div>

      {}
      <OlimpistasTable rows={rows} loading={loading} />

      {}
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
