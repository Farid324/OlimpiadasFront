// Ruta: src/app/page.tsx (CON FILTRO POR FASE IMPLEMENTADO)
'use client'; 

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
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

// 🚨 EXPORTAR EL TIPO DE FASE para que ResultsSection lo use
export type ActivePhase = 'fase1' | 'fase2'; 

export default function Page() {
  const router = useRouter();

  // --- Estado ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('current');
  // 🚨 AÑADIDO: Estado para la fase activa (solo relevante en activeTab='current')
  const [activePhase, setActivePhase] = useState<ActivePhase>('fase1'); 
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await api.get<CompetitorData[]>('/public/reportes/clasificados');
        setCompetitors(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCompetitors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const areas = useMemo(
    () => Array.from(new Set(competitors.map((c) => c.area))),
    [competitors]
  );
  
  const years = useMemo(
    () =>
      Array.from(new Set(competitors.map((c) => c.year))).sort(
        (a, b) => b - a
      ),
    [competitors]
  );

  const filteredCompetitors = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    
    // Obtenemos los competidores que coinciden con la búsqueda, área y año
    let results = competitors.filter((c) => {
      const matchesSearch = t === '' || c.ci.toLowerCase().includes(t);
      const matchesArea = selectedArea === 'all' || c.area === selectedArea;
      const matchesYear = selectedYear === 'all' || c.year.toString() === selectedYear;
      
      return matchesSearch && matchesArea && matchesYear;
    });

    // Filtro por Estatus (Actual/Histórico)
    const currentYear = new Date().getFullYear();
    results = results.filter((c) => {
        return activeTab === 'current'
          ? c.year === currentYear
          : c.year < currentYear;
    });

    // 🚨 FILTRO POR FASE: Solo si estamos en la pestaña 'current'
    if (activeTab === 'current') {
        // ASUNCIÓN CLAVE: c.phase debe existir en CompetitorData y contener 'fase1' o 'fase2'
        // Si no tienes este campo, aquí es donde la lógica falla.
        results = results.filter((c) => {
            
            return (c as CompetitorData & { phase?: string }).phase === activePhase;
        });
    }

    return results;

  }, [
    competitors,
    searchTerm,
    selectedArea,
    selectedYear,
    activeTab,
    activePhase // 🚨 AÑADIDO: activePhase al array de dependencias
  ]);

  const currentYearStats = useMemo(
    () => competitors.filter((c) => c.year === new Date().getFullYear()),
    [competitors]
  );

  const goldMedals = currentYearStats.filter((c) => c.medal === 'Oro').length;
  const silverMedals = currentYearStats.filter((c) => c.medal === 'Plata').length;
  const bronzeMedals = currentYearStats.filter((c) => c.medal === 'Bronce').length;

  const handleNavigateToLogin = () => router.push('/auth');

  const downloadPDF = () => {
    // ... (Lógica de downloadPDF sin cambios)
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
      `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
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
        c.medal,
        c.score.toString()
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(
      `clasificados-ohsansi-${activeTab}-${new Date().getTime()}.pdf`
    );
  };

  const getMedalColor = (medal: string) => {
    switch (medal) {
      case 'Oro':
        return 'bg-yellow-500 text-white';
      case 'Plata':
        return 'bg-gray-400 text-white';
      case 'Bronce':
        return 'bg-orange-600 text-white';
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
        
        

[Image of a simple loading spinner for web]


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
          // 🚨 NUEVOS PROPS
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