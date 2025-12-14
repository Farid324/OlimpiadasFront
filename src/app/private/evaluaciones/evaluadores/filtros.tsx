//src/app/private/evaluaciones/evaluadores/filtros.tsx
'use client';

interface Props {
  active: string;
  onChange: (filter: string) => void;
}

const tabs = ['Todos', 'Pendientes', 'Evaluados'];

export default function FilterTabs({ active, onChange }: Props) {
  const base =
    'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200';
  const activeStyle = 'bg-white text-black shadow';
  const inactiveStyle = 'text-gray-700 hover:bg-gray-200';

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`${base} ${
            active === tab ? activeStyle : inactiveStyle
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
