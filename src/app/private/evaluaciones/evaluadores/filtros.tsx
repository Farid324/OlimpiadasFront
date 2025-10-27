'use client';
interface Props {
  active: string;
  onChange: (filter: string) => void;
}

const tabs = ['Todos', 'Pendientes', 'Evaluados'];

export default function FilterTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-3 border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 ${
            active === tab
              ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
              : 'text-gray-500 hover:text-blue-500'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
