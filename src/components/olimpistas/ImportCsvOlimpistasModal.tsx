// src/components/olimpistas/ImportCsvOlimpistasModal.tsx
"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Loader2, TriangleAlert } from "lucide-react";
import {
  validateCsvOlimpistas,
  importCsvOlimpistas,
  type CsvSummary,
} from "@/libs/olimpistas.api";
import type { AxiosError } from "axios";
type Props = {
  onClose: () => void;
  onImported: () => void;
};

function getErrorMessage(err: unknown): string {
  // AxiosError con response.message del backend
  if (typeof err === "object" && err !== null && "isAxiosError" in err) {
    const ax = err as AxiosError<{ message?: string }>;
    return ax.response?.data?.message ?? ax.message ?? "Ocurrió un error.";
  }
  // Error normal
  if (err instanceof Error) return err.message;
  // Fallback
  return "Ocurrió un error.";
}

export default function ImportCsvOlimpistasModal({
  onClose,
  onImported,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [summary, setSummary] = useState<CsvSummary | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSummary(null);
    setFile(e.target.files?.[0] ?? null);
  };

  const onValidate = async () => {
    if (!file) return setError("Selecciona un archivo CSV.");
    setError(null);
    setValidating(true);
    try {
      const res = await validateCsvOlimpistas(file);
      setSummary(res);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setValidating(false);
    }
  };


  const onImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      await importCsvOlimpistas(file);
      onImported();
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "nombreCompleto",
      "ci",
      "tutorContacto",
      "unidadEducativa",
      "departamento",
      "area",
      "nivel",
      "gradoEscolar",
      "nivelCompetidor",
      "grado",
    ].join(",");

    const blob = new Blob([headers + "\n"], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_olimpistas.csv";
    a.click();
    URL.revokeObjectURL(url);

  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-[680px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-black">Importar CSV</h2>
        <p className="text-gray-500 mb-4">
          Sube un archivo .csv con los olimpistas a registrar.
        </p>

        <div className="space-y-4">
          { }
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileUp className="text-blue-600" />
              <div>
                <p className="font-semibold text-black">
                  {file?.name ?? "Ningún archivo seleccionado"}
                </p>
                <p className="text-xs text-gray-500">
                  Campos requeridos: nombreCompleto, ci, tutorContacto,
                  unidadEducativa, departamento, area, nivel
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-black hover:bg-gray-50"
              >
                <Download size={16} className="text-black" /> Plantilla
              </button>

              <button
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Seleccionar
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={onPick}
              />
            </div>
          </div>

          { }
          {!summary && (
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-black hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={onValidate}
                disabled={!file || validating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {validating && <Loader2 className="animate-spin" size={16} />}
                Validar
              </button>
            </div>
          )}

          { }
          {summary && (
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Resultado de validación</p>
                <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Total: </span>
                    <b className="text-black">{summary.total}</b>
                  </div>
                  <div>
                    <span className="text-gray-500">OK: </span>
                    <b className="text-black">{summary.ok}</b>
                  </div>
                  <div>
                    <span className="text-gray-500">Creadas: </span>
                    <b className="text-black">{summary.createdInsc ?? "-"}</b>
                  </div>
                  <div>
                    <span className="text-gray-500">Saltadas: </span>
                    <b className="text-black">{summary.skippedInsc ?? "-"}</b>
                  </div>
                </div>

                {summary.errors?.length ? (
                  <div className="mt-3 max-h-40 overflow-y-auto border-t pt-2">
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                      <TriangleAlert size={16} />{" "}
                      <b>{summary.errors.length} errores</b>
                    </div>
                    <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                      {summary.errors.slice(0, 50).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {summary.errors.length > 50 && (
                        <li className="text-gray-500">
                          …y {summary.errors.length - 50} más
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-green-700 text-sm mt-2">
                    Sin errores detectados.
                  </p>
                )}
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSummary(null);
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Volver
                </button>
                <button
                  onClick={onImport}
                  disabled={importing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {importing && <Loader2 className="animate-spin" size={16} />}
                  Confirmar importación
                </button>
              </div>
            </div>
          )}

          {error && !summary && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
