// src/app/private/configuracion/tabs/MedalleroTab.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/libs/api';
import { 
    Edit, 
    Settings, 
    Award,    
    Shield,   
    Medal,    
    X,        
    Save      
} from 'lucide-react'; 

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

/* -------------------- Component -------------------- */
export default function MedalleroTab() {
  const [items, setItems] = useState<MedalleroItem[]>([]);
  const [loading, setLoading] = useState(false);

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
    fetchAll();
  }, [fetchAll]);

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

  function getPercent(item: MedalleroItem): number { 
    const participantes = item.participantes ?? 0;
    const total = getTotal(item);
    if (!participantes) return 0;
    return (total / participantes) * 100;
  }

  /* -------------------- Render -------------------- */
  return (
    <div className="space-y-6">

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
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
          icon={<Medal className="w-6 h-6 text-gray-400"/>} 
          subValue={metrics.totalPremios > 0 ? (metrics.platas / metrics.totalPremios * 100).toFixed(1) + '%' : '0.0%'} 
          totalValue={metrics.totalParticipantes}
          />
        <CardMetricWithPercent 
          label="Bronce Total" value={metrics.bronces} total={metrics.totalPremios} 
          icon={<Medal className="w-6 h-6 text-amber-800"/>} 
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
          icon={<Shield className="w-6 h-6 text-gray-500"/>} 
          subValue={metrics.totalParticipantes > 0 ? (metrics.totalPremiados / metrics.totalParticipantes * 100).toFixed(1) + '% premiados' : '0.0% premiados'}
          totalValue={metrics.totalParticipantes}
          />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <h2 className="font-semibold text-gray-700 mb-2">
          Configuración por Área
        </h2>
        <p className="text-sm text-gray-500 mb-4">Distribución de medallas y menciones para cada área de competencia</p>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Cargando...</p>
        ) : items.length === 0 ? (
          <div className="border rounded-md p-6 text-gray-500 text-center bg-gray-50">
            No hay configuraciones disponibles
          </div>
        ) : (
          <div className="max-h-[540px] overflow-y-auto">
            <div className="w-full overflow-x-auto" tabIndex={0}>
              <table className="border-collapse text-sm w-full"> 
                <thead className="sticky top-0 bg-white z-10 border-b border-black">
                  <tr className="text-gray-700">
                    <th className="py-3 px-4 text-left font-semibold w-auto whitespace-nowrap">Área / Nivel</th> 
                    <th className="py-3 px-4 text-center font-semibold whitespace-nowrap">Participantes</th>
                    
                    {/* Cabeceras de Medallas */}
                    <th className="py-3 px-1 text-center font-semibold whitespace-nowrap">
                      <Award className="w-5 h-5 text-yellow-600 mx-auto mb-1"/> 
                      <div className="text-[11px]">Oro</div>
                    </th>
                    <th className="py-3 px-1 text-center font-semibold whitespace-nowrap">
                      <Medal className="w-5 h-5 text-gray-400 mx-auto mb-1"/> 
                      <div className="text-[11px]">Plata</div>
                    </th>
                    <th className="py-3 px-1 text-center font-semibold whitespace-nowrap">
                      <Medal className="w-5 h-5 text-amber-800 mx-auto mb-1"/> 
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
                  {items.map((it) => {
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
                        <td className="py-4 px-4 text-gray-800 font-semibold text-left">{areaNivel}</td> 
                        <td className="py-4 px-4 text-gray-700 text-center">{participantes}</td>
                        
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
                        
                        <td className="py-4 px-2 text-gray-700 text-center"> 
                            <div className="inline-block text-xs font-semibold bg-gray-100 rounded-md py-1 px-2 whitespace-nowrap"> 
                                {percent.toFixed(1)}%
                            </div>
                        </td>
                        <td className="py-4 px-4 text-left">
                          <button
                            onClick={() => openEdit(it)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
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
        
        {/* Recomendaciones */}
        <div className="pt-4 mt-4 border-t border-gray-200 text-gray-900">
            <h3 className="font-semibold text-gray-900 mb-2">Configuración Recomendada</h3>
            <p className="text-sm text-gray-700 mb-4">Sugerencias basadas en estándares internacionales</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                    <h4 className="font-bold mb-2 text-gray-900">Para áreas individuales (100+ participantes):</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-900">
                        <li><span className="font-semibold text-yellow-600">Oro</span>: 2-3%</li>
                        <li><span className="font-semibold text-gray-500">Plata</span>: 3-5%</li>
                        <li><span className="font-semibold text-amber-800">Bronce</span>: 5-8%</li>
                        <li><span className="font-semibold text-gray-800">Menciones</span>: 8-12%</li> 
                    </ul>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
                    <h4 className="font-bold mb-2 text-gray-900">Para áreas grupales o menos participantes:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-900">
                        <li><span className="font-semibold text-yellow-600">Oro</span>: 1-2 máx</li>
                        <li><span className="font-semibold text-gray-500">Plata</span>: 2-3</li>
                        <li><span className="font-semibold text-amber-800">Bronce</span>: 3-4</li>
                        <li><span className="font-semibold text-gray-800">Menciones</span>: 5-8</li> 
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-gray-900"> 
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Editar Configuración de Medallero</h3>
              <p className="text-sm text-gray-500">{editing.area_nombre} - {editing.nivel_nombre} ({editing.participantes} participantes)</p>
            </div>
            <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Medallas de Oro</span>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-600 pointer-events-none"/>
              <input
              type="number"
              min={0}
              value={editing.oros === 0 ? '' : editing.oros ?? 0}
              onChange={(e) => updateEditingField('oros', e.target.value === '' ? 0 : Number(e.target.value))}
              className="pl-9 w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>
              </label>

              <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Medallas de Plata</span>
            <div className="relative">
              <Medal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
              <input
              type="number"
              min={0}
              value={editing.platas === 0 ? '' : editing.platas ?? 0}
              onChange={(e) => updateEditingField('platas', e.target.value === '' ? 0 : Number(e.target.value))}
              className="pl-9 w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>
              </label>

              <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Medallas de Bronce</span>
            <div className="relative">
              <Medal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 pointer-events-none"/>
              <input
              type="number"
              min={0}
              value={editing.bronces === 0 ? '' : editing.bronces ?? 0}
              onChange={(e) => updateEditingField('bronces', e.target.value === '' ? 0 : Number(e.target.value))}
              className="pl-9 w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>
              </label>

              <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Menciones de Honor</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 font-bold flex items-center justify-center text-xs pointer-events-none">M</span>
              <input
              type="number"
              min={0}
              value={editing.menciones === 0 ? '' : editing.menciones ?? 0}
              onChange={(e) => updateEditingField('menciones', e.target.value === '' ? 0 : Number(e.target.value))}
              className="pl-9 w-full p-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>
              </label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center"> 
              <p className="text-sm text-blue-800">
            Total de premios configurados: 
              </p>
              <div className="text-right">
              <span className="text-lg font-bold text-blue-900">{getTotal(editing)}</span>
              {editing.participantes > 0 && 
              <span className="text-xs text-blue-600 block">
              ({getPercent(editing).toFixed(1)}% de los participantes)
              </span>
              }
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
            onClick={closeEdit} 
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
              >
            Cancelar
              </button>
              <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition"
              >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
            {!saving && <Save className="w-4 h-4" />}
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
          <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative border border-gray-100">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 font-semibold">{label}</p>
          <span className="text-gray-400">{icon}</span> 
        </div>
        <div className="flex flex-col">
          <p className="text-3xl font-bold text-black">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subValue}</p>
        </div>
          </div>
        );
      }

      function CardMetricWithPercent({ label, value, icon, subValue }: { label: string; value: React.ReactNode; total: number; icon: React.ReactNode; subValue: string; totalValue: number }) {
        const isTotalMedallas = label.includes('Total Medallas');
        
        return (
          <div className="bg-white p-4 rounded-lg shadow h-28 flex flex-col justify-between relative border border-gray-100">
        <div className="flex justify-between items-start">
          <p className="text-sm text-gray-500 font-semibold">{label}</p>
          <span className="text-xl font-bold">{icon}</span> 
        </div>
        <div className="flex flex-col">
          <p className="text-3xl font-bold text-black">{value}</p>
          <p className="text-xs text-gray-400 mt-1">
          {isTotalMedallas ? subValue : subValue.replace('%', '% del total')}
          </p>
        </div>
          </div>
        );
      }