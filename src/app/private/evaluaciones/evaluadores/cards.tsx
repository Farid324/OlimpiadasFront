"use client";

import React, { useEffect, useState } from "react";
import { Users, ClipboardList, CheckCircle, Award } from "lucide-react";
import Card from "../../../../components/ui/card";
import { api } from "@/libs/api";

// 🔹 Tipo de datos que devuelve el backend
interface EvaluadorStats {
  total: number;
  pendientes: number;
  evaluados: number;
  clasificados: number;
}

export default function CardsSummary() {
  const [stats, setStats] = useState<EvaluadorStats>({
    total: 0,
    pendientes: 0,
    evaluados: 0,
    clasificados: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchStats = async () => {
       try {
         const { data } = await api.get('/admin/evaluaciones/resumen');
         setStats(data);
       } catch (error) {
         console.error("Error cargando estadísticas:", error);
       } finally {
         setLoading(false);
       }
     };

     fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        <div className="h-28 bg-gray-100 rounded-2xl" />
        <div className="h-28 bg-gray-100 rounded-2xl" />
        <div className="h-28 bg-gray-100 rounded-2xl" />
        <div className="h-28 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Total competidores"
        value={stats.total}
        icon={<Users className="text-blue-500" />}
        className="bg-blue-50"
      />
      <Card
        title="Pendientes"
        value={stats.pendientes}
        icon={<ClipboardList className="text-yellow-500" />}
        className="bg-yellow-50"
      />
      <Card
        title="Evaluados"
        value={stats.evaluados}
        icon={<CheckCircle className="text-green-500" />}
        className="bg-green-50"
      />
      <Card
        title="Clasificados"
        value={stats.clasificados}
        icon={<Award className="text-purple-500" />}
        className="bg-purple-50"
      />
    </div>
  );
}
