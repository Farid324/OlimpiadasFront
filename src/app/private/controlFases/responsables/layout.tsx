// src/app/private/controlFases/responsables/layout.tsx
'use client';

import React, { useEffect } from 'react';
import { usePageHeader } from '@/contexts/pageHeader';

export default function LayoutResp({ children }: { children: React.ReactNode }) {
  const { setTitle } = usePageHeader();
  useEffect(() => setTitle('Control de Fases (Responsable)'), [setTitle]);

  return <>{children}</>;
}
