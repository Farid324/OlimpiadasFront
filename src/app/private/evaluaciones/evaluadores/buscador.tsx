'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Icono */}
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />

      {/* Input */}
      <input
        type="text"
        placeholder="Buscar por nombre, CI o colegio..."
        value={query}
        onChange={handleChange}
        className="
          w-full rounded-lg  border-gray-300 bg-white
          pl-9 pr-3 py-2 text-sm text-gray-700
          placeholder:text-gray-400 shadow-sm h-11 border  px-3
            focus:outline-none focus:ring-0 focus:border-gray-400 hover:border-gray-400 transition-colors
          "
      />
    </div>
  );
}

