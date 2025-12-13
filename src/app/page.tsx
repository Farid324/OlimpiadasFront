// Ruta: src/app/page.tsx (COMPLETO Y FINAL CON FILTRO CORREGIDO)
'use client'; 

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable, { UserOptions } from 'jspdf-autotable';

import { api } from '@/libs/api';

import { PublicNavbar } from '@/components/public-home/PublicNavbar';
import { HeroSection } from '@/components/public-home/HeroSection';
import { ResultsSection } from '@/components/public-home/ResultsSection';
import { PublicFooter } from '@/components/public-home/PublicFooter';

import { CompetitorData, ActiveTab } from '@/types/principal';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

// Exportar el tipo de fase para que ResultsSection lo use
export type ActivePhase = 'fase1' | 'fase2'; 

export default function Page() {
  const router = useRouter();

  // --- Estado ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('current');
  const [activePhase, setActivePhase] = useState<ActivePhase>('fase1'); 
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]); 
  const [allYears, setAllYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // --- LOGICA DE LLAMADAS API (Fetch Data) ---

  // 1. Obtener los años disponibles del Histórico (Solo al montar)
  useEffect(() => {
    async function fetchYears() {
      try {
        const { data } = await api.get<number[]>('/principal/historico/anios');
        setAllYears(data || []);
      } catch (error) {
        console.error('Error fetching historical years:', error);
      }
    }
    fetchYears();
  }, []); 

  // 2. Sincronizar el año al cambiar a la pestaña Histórico
  useEffect(() => {
    if (activeTab === 'historical' && selectedYear === 'all' && allYears.length > 0) {
      setSelectedYear(allYears[0].toString());
    }
  }, [activeTab, allYears, selectedYear]); 


  // Función para obtener los datos de la PESTAÑA/FASE activa
  const fetchActiveData = useCallback(async () => {
    setLoading(true);
    setCompetitors([]); 

    let endpoint = '';
    const params: Record<string, any> = {}; // Cambiado a 'any' para aceptar strings o numbers

    const idArea = selectedArea === 'all' ? undefined : parseInt(selectedArea);

    try {
      if (activeTab === 'current') {
        // GESTIÓN ACTUAL
        
        // --- COMIENZA LA CORRECCIÓN CLAVE ---
        if (activePhase === 'fase1') {
          endpoint = '/principal/competidores/clasificatoria';
          // El endpoint de Clasificatoria NO necesita el parámetro 'type'
        } else {
          endpoint = '/principal/competidores/final';
          // El endpoint de Final NO necesita el parámetro 'type'
        }
        // --- FIN DE LA CORRECCIÓN CLAVE ---

        if (idArea) params.idArea = idArea;
        
      } else {
        // HISTÓRICO
        endpoint = '/principal/competidores/historico';
        
        let anio: number | undefined;

        if (selectedYear !== 'all') {
            anio = parseInt(selectedYear);
        } else if (allYears.length > 0) {
             anio = allYears[0];
        }

        if (!anio || isNaN(anio)) {
            setLoading(false);
            return;
        }

        params.anio = anio;
        if (idArea) params.idArea = idArea;
      }
      
      const { data } = await api.get<CompetitorData[]>(endpoint, { params });
      setCompetitors(data || []);

    } catch (error) {
      console.error(`Error fetching data for ${activeTab}/${activePhase}:`, error);
      setCompetitors([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activePhase, selectedArea, selectedYear, allYears]); 

  // Disparar la carga cada vez que cambian las dependencias de la vista/filtro
  useEffect(() => {
    fetchActiveData();
  }, [fetchActiveData]); 

  // --- LOGICA DE FILTRADO LOCAL (useMemo) ---
  
  const areas = useMemo(
    () => Array.from(new Set(competitors.map((c) => c.area))),
    [competitors]
  );
  
  const years = useMemo(
    () => allYears,
    [allYears]
  );

  const filteredCompetitors = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    
    // 1. INICIALIZACIÓN
    let results = competitors; 

    // 2. FILTRO POR TÉRMINO DE BÚSQUEDA (CI o Nombre)
    if (t !== '') {
        results = results.filter(
            (c) => 
                c.ci.toLowerCase().includes(t) || 
                c.name.toLowerCase().includes(t)
        );
    }
    
    // El filtro por fase se eliminó correctamente, ya que el backend usa endpoints separados.
    
    return results;

  }, [competitors, searchTerm]); // Eliminé activeTab y activePhase del useMemo

  // --- ESTATUS Y MEDALLERO ---
  
  const currentYearStats = useMemo(() => {
    // Si la pestaña actual es 'historical', estos KPIs deben basarse en los datos del año seleccionado
    // Si es 'current', se basan en la gestión activa.
    const yearToFilter = activeTab === 'current' 
      ? new Date().getFullYear() 
      : parseInt(selectedYear);
      
    return competitors.filter((c) => c.year === yearToFilter);
  }, [competitors, activeTab, selectedYear]); 
  
  const goldMedals = currentYearStats.filter((c) => c.medal === 'ORO').length;
  const silverMedals = currentYearStats.filter((c) => c.medal === 'PLATA').length;
  const bronzeMedals = currentYearStats.filter((c) => c.medal === 'BRONCE').length;

  const handleNavigateToLogin = () => router.push('/auth');

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Oh! SanSi 2025', 14, 20);
    doc.setFontSize(12);
    doc.text('Olimpiada en Ciencias y Tecnología San Simón', 14, 28);
    doc.setFontSize(10);
    doc.text(
      `Lista de ${
        activeTab === 'current' ? 'Clasificando' : 'Clasificados Históricos'
      }`,
      14,
      35
    );
    doc.text(
      `Fase: ${activePhase === 'fase1' ? 'Clasificatoria' : 'Final'}`,
      14,
      41
    );

    autoTable(doc, {
      startY: 48,
      head: [
        ['Nombre', 'CI', 'Área', 'Colegio', 'Año', 'Medalla', 'Puntaje']
      ],
      body: filteredCompetitors.map((c) => [
        c.name,
        c.ci,
        c.area,
        c.school,
        c.year.toString(),
        c.medal ?? 'N/A', 
        c.score ? c.score.toString() : 'N/A'
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(
      `clasificados-ohsansi-${activeTab}-${activePhase}-${new Date().getTime()}.pdf`
    );
  };

  const getMedalColor = (medal: string | null) => {
    switch (medal) {
      case 'ORO':
        return 'bg-yellow-500 text-white';
      case 'PLATA':
        return 'bg-gray-400 text-white';
      case 'BRONCE':
        return 'bg-orange-600 text-white';
      case 'MENCION':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };


  // --- Render ---
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white p-4">
        <p className="animate-pulse text-xl font-bold text-blue-600">
          Cargando datos...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white"> 
      <PublicNavbar onNavigateToLogin={handleNavigateToLogin} />

      <div className="w-full bg-blue-600 pb-8"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <HeroSection
            totalCompetitors={currentYearStats.length}
            goldMedals={goldMedals}
            silverMedals={silverMedals}
            bronzeMedals={bronzeMedals}
          />
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pt-0 -mt-10 md:-mt-16"> 
        <ResultsSection
          competitors={competitors} 
          filteredCompetitors={filteredCompetitors} 
          areas={areas}
          years={years}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedArea={selectedArea}
          onSelectedAreaChange={setSelectedArea}
          selectedYear={selectedYear}
          onSelectedYearChange={setSelectedYear}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          activePhase={activePhase} 
          onActivePhaseChange={setActivePhase} 
          onDownloadPDF={downloadPDF}
          getMedalColor={getMedalColor}
        />
      </main>

      <PublicFooter />
    </div>
  );
}