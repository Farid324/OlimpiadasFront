// src/components/public-home/PublicNavbar.tsx

import { Button } from '@/components/ui/Button';
import { LogIn } from 'lucide-react';
import Image from 'next/image';
interface PublicNavbarProps {
  onNavigateToLogin: () => void;
}

export function PublicNavbar({ onNavigateToLogin }: PublicNavbarProps) {
  return (
    <nav className="bg-white border-b shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo2.png" alt="Logo" width={50} height={50} />
          </div>
          <Button
            onClick={onNavigateToLogin}
            className="bg-[var(--azul)] hover:bg-blue-700"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}
