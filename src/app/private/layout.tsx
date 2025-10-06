// src/app/private/layout.tsx
import { Suspense } from 'react';
import PrivateLayoutContent from './PrivateLayoutContent';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </Suspense>
  );
}