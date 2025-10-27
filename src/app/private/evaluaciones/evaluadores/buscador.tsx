'use client';
import { useState } from 'react';

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
    <input
      type="text"
      placeholder="Buscar por nombre, CI o colegio..."
      className="w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400"
      value={query}
      onChange={handleChange}
    />
  );
}

