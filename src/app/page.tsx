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
        // Usamos un timeout simulado para probar el estado de carga en desarrollo
        // await new Promise(resolve => setTimeout(resolve, 1000)); 
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

  // --- Datos Derivados ---
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
    return competitors.filter((c) => {
      const matchesSearch =
        t === '' || c.ci.toLowerCase().includes(t);
      const matchesArea =
        selectedArea === 'all' || c.area === selectedArea;
      const matchesYear =
        selectedYear === 'all' ||
        c.year.toString() === selectedYear;
      const matchesMedal =
        selectedMedal === 'all' || c.medal === selectedMedal;

      const currentYear = new Date().getFullYear();
      const matchesStatus =
        activeTab === 'current'
          ? c.year === currentYear
          : c.year < currentYear;

      return (
        matchesSearch &&
        matchesArea &&
        matchesYear &&
        matchesMedal &&
        matchesStatus
      );
    });
  }, [
    competitors,
    searchTerm,
    selectedArea,
    selectedYear,
    selectedMedal,
    activeTab
  ]);

  const currentYearStats = useMemo(
    () => competitors.filter((c) => c.year === new Date().getFullYear()),
    [competitors]
  );

  const goldMedals = currentYearStats.filter((c) => c.medal === 'Oro').length;
  const silverMedals = currentYearStats.filter((c) => c.medal === 'Plata').length;
  const bronzeMedals = currentYearStats.filter((c) => c.medal === 'Bronce').length;

  // --- Funciones Auxiliares ---
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
        {/* Usamos un spinner visual simple */}
        

[Image of a simple loading spinner for web]

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PublicNavbar onNavigateToLogin={handleNavigateToLogin} />

      {/* Contenedor principal del contenido:
        - max-w-7xl: Limita el ancho en pantallas muy grandes.
        - mx-auto: Centra el contenido.
        - px-4: Padding horizontal por defecto (móvil).
        - sm:px-6 lg:px-8: Aumenta el padding en breakpoints más grandes.
      */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <HeroSection
          totalCompetitors={currentYearStats.length}
          goldMedals={goldMedals}
          silverMedals={silverMedals}
          bronzeMedals={bronzeMedals}
        />

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
          selectedMedal={selectedMedal}
          onSelectedMedalChange={setSelectedMedal}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          onDownloadPDF={downloadPDF}
          getMedalColor={getMedalColor}
        />
      </main>

      <PublicFooter />
    </div>
  );
}