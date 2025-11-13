"use client";

import React, { useEffect, useState } from "react";
import { Users, ClipboardList, CheckCircle, Award } from "lucide-react";
import Card from "../../../../components/ui/card";
import { api } from "@/libs/api";

interface EvaluadorStats {
  total: number;
  pendientes: number;
  evaluados: number;
  clasificados: number;
}

type CardsSummaryProps = {
  refreshToken?: string | number | boolean;
  idFase: 1 | 2;
};

export default function CardsSummary({ refreshToken, idFase }: CardsSummaryProps) {
  const [stats, setStats] = useState<EvaluadorStats>({
    total: 0,
    pendientes: 0,
    evaluados: 0,
    clasificados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/admin/evaluaciones/resumen", {
          params: { idFase },
        });

        const safe: EvaluadorStats = {
          total: Number(data?.total ?? 0),
          pendientes: Number(data?.pendientes ?? 0),
          evaluados: Number(data?.evaluados ?? 0),
          clasificados: Number(data?.clasificados ?? 0),
        };

        if (alive) setStats(safe);
      } catch (error) {
        if (alive) {
          console.error("Error cargando estadísticas:", error);
          setStats({ total: 0, pendientes: 0, evaluados: 0, clasificados: 0 });
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      alive = false;
    };
  }, [refreshToken, idFase]); // ✅ recarga al cambiar tab o refreshToken

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Total competidores"
        value={stats.total}
        icon={<Users className="text-black" />}
        className="bg-blue-50"
      />
      <Card
        title="Pendientes"
        value={stats.pendientes}
        icon={<ClipboardList className="text-yellow-500" />}
        className="bg-blue-50"
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
