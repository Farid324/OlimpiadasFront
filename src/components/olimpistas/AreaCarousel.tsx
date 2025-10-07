// src/components/olimpistas/AreaCarousel.tsx

"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { AreaCounter } from "@/types/olimpista";

type Props = {
  items: AreaCounter[];
  active?: string;
  onSelect: (area: string | null) => void;
};

export default function AreaCarousel({ items, active, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dx: number) =>
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="relative">
      <button
        aria-label="Anterior"
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-blue-600 border rounded-full p-2 shadow hover:bg-gray-50"
        onClick={() => scrollBy(-300)}
      >
        <ChevronLeft />
      </button>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto no-scrollbar px-8 py-2"
      >
        {}
        <button
          onClick={() => onSelect(null)}
          className={`min-w-[230px] h-28 bg-white p-4 rounded-lg shadow relative text-left border
            ${!active ? "border-blue-600" : "border-transparent"}`}
        >
          <p className="text-sm text-gray-500">Todos los</p>
          <p className="text-2xl font-bold text-black mt-2">Olimpistas</p>
        </button>

        {items.map((it) => (
          <button
            key={it.nombre_area}
            onClick={() => onSelect(it.nombre_area)}
            className={`min-w-[230px] h-28 bg-white p-4 rounded-lg shadow relative text-left border
              ${
                active === it.nombre_area
                  ? "border-blue-600"
                  : "border-transparent"
              }`}
          >
            <p className="text-sm text-gray-500">{it.nombre_area}</p>
            <p className="text-2xl font-bold text-black mt-2">
              {it.total} Olimpistas
            </p>
            {}
            <span className="absolute top-3 right-3 text-black/60">👥</span>
          </button>
        ))}
      </div>

      <button
        aria-label="Siguiente"
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-blue-600 border rounded-full p-2 shadow hover:bg-gray-50"
        onClick={() => scrollBy(300)}
      >
        <ChevronRight />
      </button>
    </div>
  );
}
