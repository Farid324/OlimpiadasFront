// Ruta: src/app/page.tsx (CORREGIDO - Final, Apariencia de la Imagen)
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

  // --- Estado, Carga de Datos y Lógica (Sin cambios) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMedal, setSelectedMedal] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('current');
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
        
        
      </div>
    );
  }

  return (
    // 🚨 CAMBIO 1: Contenedor principal con fondo BLANCO (bg-white)
    <div className="min-h-screen bg-white"> 
      <PublicNavbar onNavigateToLogin={handleNavigateToLogin} />

      {/* 🚨 CAMBIO 2: Fondo Azul Brillante (bg-blue-600 o similar) para la barra superior */}
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
      
      {/* El <main> está centrado sobre el fondo BLANCO */}
      {/* Añadimos un padding top negativo para que la ResultsSection se "monte" ligeramente sobre HeroSection */}
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