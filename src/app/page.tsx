// Ruta: src/app/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { api } from '@/libs/api';

// Importa los nuevos componentes
import { PublicNavbar } from '@/components/public-home/PublicNavbar';
import { HeroSection } from '@/components/public-home/HeroSection';
import { ResultsSection } from '@/components/public-home/ResultsSection';
import { PublicFooter } from '@/components/public-home/PublicFooter';

// Importa los tipos
import { CompetitorData, ActiveTab } from '@/types/principal';

// Define la interfaz de jspdf aquí o muévela a un archivo de declaración global (.d.ts)
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

// Componente principal de la página
export default function Page() {
  const router = useRouter();

  // --- Estado ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMedal, setSelectedMedal] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('current');
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Carga de Datos ---
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

  // --- Datos Derivados (Filtros, Estadísticas) ---
  const areas = useMemo(() => Array.from(new Set(competitors.map((c) => c.area))), [competitors]);
  const years = useMemo(() => Array.from(new Set(competitors.map((c) => c.year))).sort((a, b) => b - a), [competitors]);

  const filteredCompetitors = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    return competitors.filter((competitor) => {
      const matchesSearch = normalizedSearchTerm === '' || competitor.ci.toLowerCase().includes(normalizedSearchTerm);
      const matchesArea = selectedArea === 'all' || competitor.area === selectedArea;
      const matchesYear = selectedYear === 'all' || competitor.year.toString() === selectedYear;
      const matchesMedal = selectedMedal === 'all' || competitor.medal === selectedMedal;
      const matchesStatus = activeTab === 'current' ? competitor.year === new Date().getFullYear() : competitor.year < new Date().getFullYear();
      return matchesSearch && matchesArea && matchesYear && matchesMedal && matchesStatus;
    });
  }, [competitors, searchTerm, selectedArea, selectedYear, selectedMedal, activeTab]);

  const currentYearStats = useMemo(() => competitors.filter((c) => c.year === new Date().getFullYear()), [competitors]);
  const goldMedals = useMemo(() => currentYearStats.filter((c) => c.medal === 'Oro').length, [currentYearStats]);
  const silverMedals = useMemo(() => currentYearStats.filter((c) => c.medal === 'Plata').length, [currentYearStats]);
  const bronzeMedals = useMemo(() => currentYearStats.filter((c) => c.medal === 'Bronce').length, [currentYearStats]);


  // --- Funciones Auxiliares ---
  const handleNavigateToLogin = () => router.push('/auth');

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Oh! SanSi 2025', 14, 20);
    doc.setFontSize(12); doc.text('Olimpiada en Ciencias y Tecnología San Simón', 14, 28);
    doc.setFontSize(10); doc.text(`Lista de ${activeTab === 'current' ? 'Clasificando' : 'Clasificados Históricos'}`, 14, 35);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 41);
    const tableData = filteredCompetitors.map((c) => [c.name, c.ci, c.area, c.school, c.year.toString(), c.medal, c.score.toString()]);

    // CAMBIO 2: Llama a la función 'autoTable' importada,
    // pasando 'doc' como el primer argumento.
    autoTable(doc, {
        startY: 48,
        head: [['Nombre', 'CI', 'Área', 'Colegio', 'Año', 'Medalla', 'Puntaje']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`clasificados-ohsansi-${activeTab}-${new Date().getTime()}.pdf`);
};

  const getMedalColor = (medal: string) => {
    switch (medal) {
      case 'Oro': return 'bg-yellow-500 text-white';
      case 'Plata': return 'bg-gray-400 text-white';
      case 'Bronce': return 'bg-orange-600 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // --- Render ---
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Cargando datos...</p>
        {/* Aquí podrías poner un spinner o un esqueleto de UI más elaborado */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PublicNavbar onNavigateToLogin={handleNavigateToLogin} />
      <HeroSection
        totalCompetitors={currentYearStats.length}
        goldMedals={goldMedals}
        silverMedals={silverMedals}
        bronzeMedals={bronzeMedals}
      />
      <ResultsSection
        competitors={competitors} // Pasamos todos los competidores
        filteredCompetitors={filteredCompetitors} // Pasamos los filtrados para la tabla
        areas={areas}
        years={years}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        selectedArea={selectedArea}
        onSelectedAreaChange={setSelectedArea}
        selectedYear={selectedYear}
        onSelectedYearChange={setSelectedYear}
        selectedMedal={selectedMedal}
        onSelectedMedalChange={setSelectedMedal}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        onDownloadPDF={downloadPDF}
        getMedalColor={getMedalColor}
      />
      <PublicFooter />
    </div>
  );
}