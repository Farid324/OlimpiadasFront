'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

type HeaderState = {
  title: string;
  right?: React.ReactNode;
  setTitle: (v: string) => void;
  setRight: (v?: React.ReactNode) => void;
};

const Ctx = createContext<HeaderState | null>(null);

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState('');
  const [right, setRight] = useState<React.ReactNode>();
  const value = useMemo(() => ({ title, right, setTitle, setRight }), [title, right]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePageHeader() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePageHeader debe usarse dentro de PageHeaderProvider');
  return ctx;
}
