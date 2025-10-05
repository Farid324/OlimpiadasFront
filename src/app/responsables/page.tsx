// src/app/responsables/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import RegisterResponsableModal from '@/components/registroResponsables/RegisterResponsableModal';
import { Button } from '@/components/ui/Button';

export default function ResponsablesPage() {
  const [responsables, setResponsables] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    const { data } = await axios.get('/api/responsables');
    setResponsables(data);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Gestión de Responsables</h1>
        <Button onClick={() => setShowModal(true)}>+ Agregar Responsable</Button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Área</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {responsables.map((r, i) => (
            <tr key={i}>
              <td>{r.usuario.nombre}</td>
              <td>{r.usuario.correo}</td>
              <td>{r.area.nombre}</td>
              <td>{r.activo ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <RegisterResponsableModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}