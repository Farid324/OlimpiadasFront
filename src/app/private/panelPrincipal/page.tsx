'use client';

type Area = {
  id: number;
  name: string;
  level: 'Primaria' | 'Secundaria';
  participants: number;
  status: 'Evaluando' | 'Clasificando' | 'Completado';
};

// 🔹 Datos de ejemplo (luego se reemplazan con fetch al backend)
const areas: Area[] = [
  { id: 1, name: 'MATEMATICAS', level: 'Primaria', participants: 24, status: 'Evaluando' },
  { id: 2, name: 'FISICA', level: 'Secundaria', participants: 30, status: 'Clasificando' },
  { id: 3, name: 'QUIMICA', level: 'Secundaria', participants: 28, status: 'Completado' },
];

export default function PanelPrincipalPage() {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      {/* Título sección */}
      <h2 className="text-lg font-semibold mb-1">Estado por Área de Competencia</h2>
      <p className="text-sm text-gray-600 mb-6">
        Seguimiento del progreso de evaluación en cada disciplina
      </p>

      {/* Lista de áreas */}
      <div className="space-y-4">
        {areas.map((area) => (
          <div
            key={area.id}
            className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
          >
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold uppercase">{area.name}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {area.level}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {area.participants} participantes registrados
              </p>
            </div>

            {/* Badge de estado */}
            <div>
              {area.status === 'Evaluando' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 ring-1 ring-amber-200">
                  Evaluando
                </span>
              )}
              {area.status === 'Clasificando' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200">
                  Clasificando
                </span>
              )}
              {area.status === 'Completado' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ring-1 ring-green-200">
                  Completado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

