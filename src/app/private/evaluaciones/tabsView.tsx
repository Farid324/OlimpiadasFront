'use client';
import { useState } from "react";

interface TabsViewProps {
  onChange: (tab: "clasificar" | "premiacion") => void;
}

export default function TabsView({ onChange }: TabsViewProps) {
  const [active, setActive] = useState<"clasificar" | "premiacion">("clasificar");

  const handleTabClick = (tab: "clasificar" | "premiacion") => {
    setActive(tab);
    onChange(tab);
  };

  const base = "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200";
  const activeStyle = "bg-white text-black shadow";
  const inactiveStyle = "text-gray-700 hover:bg-gray-200";

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
      <button
        onClick={() => handleTabClick("clasificar")}
        className={`${base} ${active === "clasificar" ? activeStyle : inactiveStyle}`}
      >
        Clasificar
      </button>
      <button
        onClick={() => handleTabClick("premiacion")}
        className={`${base} ${active === "premiacion" ? activeStyle : inactiveStyle}`}
      >
        Premiación
      </button>
    </div>
  );
}
