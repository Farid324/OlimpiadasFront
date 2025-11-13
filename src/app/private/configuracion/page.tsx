'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
// ✨ IMPORTACIONES COMPLETAS Y ESTÉTICAS DE LUCIDE ICONS
import { 
    Search, 
    Edit, 
    Settings, // Para Áreas
    Award,    // Para Oro
    Shield,   // Para Total Medallas
    Medal,    // Para Plata y Bronce
    X,        // Para cerrar modal
    Save      // Para botón de guardar
} from 'lucide-react'; 
import { usePageHeader } from '@/contexts/pageHeader';
import { Input } from '@/components/ui/Input'; // Aunque la barra de búsqueda se elimina, se mantiene el import por si se requiere en el futuro.

/* -------------------- Types -------------------- */
type MedalleroItem = {
  id_medallero: number;
  id_area: number;
  id_nivel: number;
  area_nombre: string;
  nivel_nombre: string;
  participantes: number;
  oros: number;
  platas: number;
  bronces: number;
  menciones: number;
};

/* -------------------- Page -------------------- */
export default function MedalleroConfigPage() {
  const [items, setItems] = useState<MedalleroItem[]>([]);
  // const [q, setQ] = useState(''); // ✨ Eliminado: Barra de búsqueda
  const [loading, setLoading] = useState(false);

  const { setTitle } = usePageHeader();

  // modal state
  const [editing, setEditing] = useState<MedalleroItem | null>(null);
  const [saving, setSaving] = useState(false);

  // fetch
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<MedalleroItem[]>('/medallero-config'); 
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error cargando medallero-config:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTitle('Configuración de Medallero');
    fetchAll();
  }, [fetchAll, setTitle]);

  // metrics
  const metrics = useMemo(() => {
    const totalAreas = new Set(items.map(i => i.id_area)).size; 
    const oros = items.reduce((s, i) => s + (i.oros ?? 0), 0);
    const platas = items.reduce((s, i) => s + (i.platas ?? 0), 0);
    const bronces = items.reduce((s, i) => s + (i.bronces ?? 0), 0);
    const menciones = items.reduce((s, i) => s + (i.menciones ?? 0), 0);
    const totalPremios = oros + platas + bronces + menciones;
    const totalParticipantes = items.reduce((s, i) => s + (i.participantes ?? 0), 0);
    const totalPremiados = items.reduce((s, i) => s + getTotal(i), 0);

    return { 
      totalAreas, 
      oros, 
      platas, 
      bronces, 
      menciones, 
      totalPremios,
      totalParticipantes,
      totalPremiados,
    };
  }, [items]);

  // filtered list by search (search by area_nombre + nivel_nombre)
  const filtered = useMemo(() => {
    // ✨ Eliminado: Lógica de filtrado por búsqueda
    // if (!q.trim()) return items;
    // const qq = q.trim().toLowerCase();
    
    // return items.filter((it) => 
    //   it.area_nombre.toLowerCase().includes(qq) || it.nivel_nombre.toLowerCase().includes(qq)
    // );
    return items; // Retorna todos los items ya que no hay búsqueda
  }, [items /* , q */]); // ✨ Eliminado: dependencia 'q'

  /* -------------------- Handlers -------------------- */
  function openEdit(item: MedalleroItem) {
    setEditing({ ...item });
  }

  function closeEdit() {
    setEditing(null);
  }

  function updateEditingField(field: keyof MedalleroItem, value: number | string | null) {
    if (!editing) return;
    const newValue = (field === 'oros' || field === 'platas' || field === 'bronces' || field === 'menciones')
        ? (value !== null ? Number(value) : 0)
        : value;
    
    setEditing({ ...editing, [field]: newValue } as MedalleroItem);
  }

  async function handleSave() {
      if (!editing) return;
      setSaving(true);
      try {
        const dto = {
          id_area: editing.id_area,
          id_nivel: editing.id_nivel, 
          oros: Number(editing.oros ?? 0),
          platas: Number(editing.platas ?? 0),
          bronces: Number(editing.bronces ?? 0),
          menciones: Number(editing.menciones ?? 0),
        };

        const res = await api.put<MedalleroItem>( 
          `/medallero-config/${editing.id_medallero}`,
          dto
        );
        
        const updatedApiItem = res.data;

        const updatedItem: MedalleroItem = {
            ...updatedApiItem,
            area_nombre: editing.area_nombre, 
            nivel_nombre: editing.nivel_nombre, 
            participantes: editing.participantes 
        };


        setItems((prev) => {
          const key = `${updatedItem.id_area}-${updatedItem.id_nivel}`;
          const exists = prev.find((p) => `${p.id_area}-${p.id_nivel}` === key);

          if (exists) {
            return prev.map((p) =>
              `${p.id_area}-${p.id_nivel}` === key ? updatedItem : p
            );
          } else {
            return [...prev, updatedItem];
          }
        });

        closeEdit();
      } catch (err) {
        console.error('Error guardando medallero:', err);
        await fetchAll(); 
        closeEdit();
      } finally {
        setSaving(false);
      }
  }


  /* -------------------- Helpers -------------------- */
  function getTotal(item: MedalleroItem) {
    return (item.oros ?? 0) + (item.platas ?? 0) + (item.bronces ?? 0) + (item.menciones ?? 0);
  }

  function getPercent(item: MedalleroItem): number { // Retorna un número directamente
    const participantes = item.participantes ?? 0;
    const total = getTotal(item);
    if (!participantes) return 0;
    return (total / participantes) * 100;
  }

  // function formatPercentage(value: number, total: number): string { // Esta función ya no es necesaria en CardMetricWithPercent
  //   if (total === 0) return '0.0%';
  //   return ((value / total) * 100).toFixed(1) + '%';
  // }

  /* -------------------- Render -------------------- */
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-gray-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Configuración de Medallero</h1>
        <p className="text-gray-500 text-sm">Parametrización de medallas y menciones por área de competencia</p>
      </div>

      {/* Metrics (Íconos Intercambiados) */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        <CardMetricNoIcon 
            label="Áreas" 
            value={metrics.totalAreas} 
            subValue="Configuradas" 
            icon={<Settings className="w-6 h-6 text-gray-400"/>} 
        /> 
        <CardMetricWithPercent 
          label="Oro Total" value={metrics.oros} total={metrics.totalPremios} 
          icon={<Award className="w-6 h-6 text-yellow-600"/>} 
          subValue={metrics.totalPremios > 0 ? (metrics.oros / metrics.totalPremios * 100).toFixed(1) + '%' : '0.0%'} 
          totalValue={metrics.totalParticipantes}
          />
        <CardMetricWithPercent 
          label="Plata Total" value={metrics.platas} total={metrics.totalPremios} 
          icon={<Medal className="w-6 h-6 text-gray-400"/>} // Usa Medal
          subValue={metrics.totalPremios > 0 ? (metrics.platas / metrics.totalPremios * 100).toFixed(1) + '%' : '0.0%'} 
          totalValue={metrics.totalParticipantes}
          />
        <CardMetricWithPercent 
          label="Bronce Total" value={metrics.bronces} total={metrics.totalPremios} 
          icon={<Medal className="w-6 h-6 text-amber-800"/>} // ✨ ICONO DE BRONCE CORREGIDO
          subValue={metrics.totalPremios > 0 ? (metrics.bronces / metrics.totalPremios * 100).toFixed(1) + '%' : '0.0%'} 
          totalValue={metrics.totalParticipantes}
          />
        <CardMetricWithPercent 
          label="Menciones" value={metrics.menciones} total={metrics.totalPremios} 
          icon={<span className="text-xl font-bold text-gray-500">M</span>} 
          subValue={metrics.totalPremios > 0 ? (metrics.menciones / metrics.totalPremios * 100).toFixed(1) + '%' : '0.0%'} 
          totalValue={metrics.totalParticipantes}
          />
        <CardMetricWithPercent 
          label="Total Medallas" value={metrics.totalPremios} total={metrics.totalPremios} 
          icon={<Shield className="w-6 h-6 text-gray-500"/>} // Usa Shield (Escudo)
          subValue={metrics.totalParticipantes > 0 ? (metrics.totalPremiados / metrics.totalParticipantes * 100).toFixed(1) + '% premiados' : '0.0% premiados'}
          totalValue={metrics.totalParticipantes}
          />
      </div>

      {/* Filters (Barra de búsqueda eliminada) */}
      {/* <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por área o nivel..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 w-full rounded-md border-gray-300 text-gray-900"
          />
        </div>
      </div>
      */}

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-gray-700 mb-2">
          Configuración por Área
        </h2>
        <p className="text-sm text-gray-500 mb-4">Distribución de medallas y menciones para cada área de competencia</p>

        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center bg-gray-50">
            No hay configuraciones { /* q ? 'para la búsqueda actual' : */ 'disponibles'}
          </div>
        ) : (
          <div className="max-h-[540px] overflow-y-auto">
            <div
              className="w-full overflow-x-auto" // Permite scroll si se desborda
              tabIndex={0}
              role="region"
              aria-label="Tabla de configuración de medallero"
            >
              <table className="border-collapse text-sm w-full"> 
                <thead className="sticky top-0 bg-white z-10 border-b border-black">
                  <tr className="text-gray-700">
                    <th className="py-3 px-4 text-left font-semibold w-auto whitespace-nowrap">Área / Nivel</th> 
                    
                    {/* Centrado en cabeceras de datos */}
                    <th className="py-3 px-4 text-center font-semibold whitespace-nowrap">Participantes</th>
                    
                    {/* Cabeceras de Medallas Verticales y compactas (px-1) */}
                    <th className="py-3 px-1 text-center font-semibold whitespace-nowrap">
                      <Award className="w-5 h-5 text-yellow-600 mx-auto mb-1"/> 
                      <div className="text-[11px]">Oro</div>
                    </th>
                    <th className="py-3 px-1 text-center font-semibold whitespace-nowrap">
                      <Medal className="w-5 h-5 text-gray-400 mx-auto mb-1"/> 
                      <div className="text-[11px]">Plata</div>
                    </th>
                    <th className="py-3 px-1 text-center font-semibold whitespace-nowrap">
                      <Medal className="w-5 h-5 text-amber-800 mx-auto mb-1"/> {/* ✨ ICONO DE BRONCE CORREGIDO */}
                      <div className="text-[11px]">Bronce</div>
                    </th>
                    <th className="py-3 px-1 text-center font-semibold whitespace-nowrap">
                      <span className="font-bold text-gray-500 text-xl block">M</span> 
                      <div className="text-[11px] -mt-1">Menciones</div>
                    </th>

                    <th className="py-3 px-4 text-center font-semibold whitespace-nowrap">Total Premios</th>
                    <th className="py-3 px-4 text-center font-semibold whitespace-nowrap">% Premiados</th>
                    <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it) => {
                    const areaNivel = (
                        <>
                            {it.area_nombre}
                            <div className="text-xs font-normal text-gray-500">{it.nivel_nombre}</div>
                        </>
                    );
                    const participantes = it.participantes ?? 0;
                    const total = getTotal(it);
                    const percent = getPercent(it);

                    return (
                      <tr key={`${it.id_area}-${it.id_nivel}`} className="border-b border-gray-200 hover:bg-gray-50">
                        {/* Celda de Área/Nivel (w-auto) */}
                        <td className="py-4 px-4 text-gray-800 font-semibold text-left">{areaNivel}</td> 
                        
                        {/* Celdas de datos numéricos centradas (px-4) */}
                        <td className="py-4 px-4 text-gray-700 text-center">{participantes}</td>
                        
                        {/* Celdas de Medalla compactas y centradas (px-1) */}
                        <td className="py-4 px-1 text-center text-gray-700 whitespace-nowrap">
                          <span className="font-bold">{it.oros}</span>
                          <div className="text-[10px] text-gray-500 font-normal mt-0.5">{participantes > 0 ? (it.oros / participantes * 100).toFixed(1) + '%' : '0.0%'}</div>
                        </td>
                        <td className="py-4 px-1 text-center text-gray-700 whitespace-nowrap">
                          <span className="font-bold">{it.platas}</span>
                          <div className="text-[10px] text-gray-500 font-normal mt-0.5">{participantes > 0 ? (it.platas / participantes * 100).toFixed(1) + '%' : '0.0%'}</div>
                        </td>
                        <td className="py-4 px-1 text-center text-gray-700 whitespace-nowrap">
                          <span className="font-bold">{it.bronces}</span>
                          <div className="text-[10px] text-gray-500 font-normal mt-0.5">{participantes > 0 ? (it.bronces / participantes * 100).toFixed(1) + '%' : '0.0%'}</div>
                        </td>
                        <td className="py-4 px-1 text-center text-gray-700 whitespace-nowrap">
                          <span className="font-bold">{it.menciones}</span>
                          <div className="text-[10px] text-gray-500 font-normal mt-0.5">{participantes > 0 ? (it.menciones / participantes * 100).toFixed(1) + '%' : '0.0%'}</div>
                        </td>

                        <td className="py-4 px-4 text-gray-700 text-center">{total}</td>
                        
                        {/* Columna % Premiados centrada y compacta (px-2) */}
                        <td className="py-4 px-2 text-gray-700 text-center"> 
                            <div className="inline-block text-xs font-semibold bg-gray-100 rounded-md py-1 px-2 whitespace-nowrap"> 
                                {percent.toFixed(1)}%
                            </div>
                        </td>
                        <td className="py-4 px-4 text-left">
                          <button
                            onClick={() => openEdit(it)}
                            className="p-1 text-gray-600 hover:text-gray-900"
                            title="Editar medallero"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Recomendaciones: Todo en Negro/Gris Oscuro */}
        <div className="pt-4 mt-4 border-t border-gray-200 text-gray-900">
            <h3 className="font-semibold text-gray-900 mb-2">Configuración Recomendada</h3>
            <p className="text-sm text-gray-700 mb-4">Sugerencias basadas en estándares internacionales de olimpiadas académicas</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                    <h4 className="font-bold mb-2 text-gray-900">Para áreas individuales (100+ participantes):</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-900">
                        <li><span className="font-semibold text-yellow-600">Oro</span>: 2-3% de participantes (2-3 medallas por cada 100)</li>
                        <li><span className="font-semibold text-gray-500">Plata</span>: 3-5% de participantes (3-5 medallas por cada 100)</li>
                        <li><span className="font-semibold text-amber-800">Bronce</span>: 5-8% de participantes (5-8 medallas por cada 100)</li>
                        {/* Texto de menciones en gris oscuro */}
                        <li><span className="font-semibold text-gray-800">Menciones</span>: 8-12% de participantes (8-12 por cada 100)</li> 
                    </ul>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                    <h4 className="font-bold mb-2 text-gray-900">Para áreas grupales o con menos participantes:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-900">
                        <li><span className="font-semibold text-yellow-600">Oro</span>: 1-2 medallas máximo</li>
                        <li><span className="font-semibold text-gray-500">Plata</span>: 2-3 medallas</li>
                        <li><span className="font-semibold text-amber-800">Bronce</span>: 3-4 medallas</li>
                        {/* Texto de menciones en gris oscuro */}
                        <li><span className="font-semibold text-gray-800">Menciones</span>: 5-8 menciones</li> 
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Edit Modal (Todo en blanco/negro) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          
          <div className="bg-white rounded-lg shadow-lg w-[680px] z-10 overflow-hidden text-gray-900"> 
            <div className="flex justify-between items-center p-4 border-b border-gray-200"> {/* Borde gris más claro */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Editar Configuración de Medallero</h3>
                {/* ✨ Detalle de área/nivel/participantes en el modal */}
                <p className="text-sm text-gray-500">{editing.area_nombre} - {editing.nivel_nombre} ({editing.participantes} participantes)</p>
              </div>
              <button onClick={closeEdit} className="text-gray-600 hover:text-black p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" /> {/* ✨ Icono X para cerrar */}
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm text-gray-700">Medallas de Oro</span> {/* ✨ Texto más específico */}
                  <input
                    type="number"
                    min={0}
                    value={editing.oros ?? 0}
                    onChange={(e) => updateEditingField('oros', Number(e.target.value))}
                    className="mt-1 p-2 border border-gray-300 rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500" // ✨ Estilo de input mejorado
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-gray-700">Medallas de Plata</span> {/* ✨ Texto más específico */}
                  <input
                    type="number"
                    min={0}
                    value={editing.platas ?? 0}
                    onChange={(e) => updateEditingField('platas', Number(e.target.value))}
                    className="mt-1 p-2 border border-gray-300 rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-gray-700">Medallas de Bronce</span> {/* ✨ Texto más específico */}
                  <input
                    type="number"
                    min={0}
                    value={editing.bronces ?? 0}
                    onChange={(e) => updateEditingField('bronces', Number(e.target.value))}
                    className="mt-1 p-2 border border-gray-300 rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-gray-700">Menciones de Honor</span> {/* ✨ Texto más específico */}
                  <input
                    type="number"
                    min={0}
                    value={editing.menciones ?? 0}
                    onChange={(e) => updateEditingField('menciones', Number(e.target.value))}
                    className="mt-1 p-2 border border-gray-300 rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </label>
              </div>

              {/* ✨ "Total de premios: 28(8.6% de 324 participantes)" */}
              <div className="pt-2"> 
                <p className="text-sm text-gray-600">
                  Total de premios: <span className="font-semibold text-gray-800">{getTotal(editing)}</span>
                  {editing.participantes > 0 && 
                    <span className="ml-1 text-gray-500">
                      ({getPercent(editing).toFixed(1)}% de {editing.participantes} participantes)
                    </span>
                  }
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200"> {/* ✨ Borde superior en los botones */}
                <button 
                  onClick={closeEdit} 
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50" // ✨ Estilo de botón Cancelar
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" // ✨ Estilo de botón Guardar con icono
                >
                  <Save className="w-5 h-5" /> {/* ✨ Icono de Guardar */}
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------- Componentes Auxiliares --------------------

function CardMetricNoIcon({ label, value, subValue, icon }: { label: string; value: React.ReactNode; subValue: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 font-semibold">{label}</p>
        <span className="text-gray-400">{icon}</span> 
      </div>
      <div className="flex flex-col">
        <p className="text-3xl font-bold text-black">{value}</p>
        <p className="text-sm text-gray-500">{subValue}</p>
      </div>
    </div>
  );
}

function CardMetricWithPercent({ label, value, icon, subValue }: { label: string; value: React.ReactNode; total: number; icon: React.ReactNode; subValue: string; totalValue: number }) {
  const isTotalMedallas = label.includes('Total Medallas');
  
  return (
    <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-500 font-semibold">{label}</p>
        <span className="text-xl font-bold">{icon}</span> 
      </div>
      <div className="flex flex-col">
        <p className="text-3xl font-bold text-black">{value}</p>
        <p className="text-sm font-normal text-gray-500">
            {isTotalMedallas ? subValue : subValue.replace('%', '% del total')}
        </p>
      </div>
    </div>
  );
}