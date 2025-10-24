'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Competidor } from '@/types/notas';

interface Props {
  competidor: Competidor | null;
  onClose: () => void;
  onSubmit: (nota: number) => void;
}

export default function ModalEvaluacion({ competidor, onClose, onSubmit }: Props) {
  const [nota, setNota] = useState<number>(0);

  if (!competidor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Registrar nota para {competidor.nombres} {competidor.apellidos}
        </h2>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          className="w-full border rounded p-2 mb-4"
          value={nota}
          onChange={e => setNota(Number(e.target.value))}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSubmit(nota)}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
