'use client';

import { FiSearch } from 'react-icons/fi';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function Search({ value, onChange }: Props) {
  return (
    <div className="relative mt-4">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
      <input
        type="text"
        placeholder="Buscar por nombre, correo o institución"
        className="w-full pl-10 border rounded-md h-11 text-gray-700 placeholder:text-gray-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
