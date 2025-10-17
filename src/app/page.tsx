'use client';

import Navbar from '@/components/ui/Navbar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const router = useRouter();

  // Simulación de usuario logeado o no logeado
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const handleLogout = () => {
    setUser(null);
    router.push('/auth'); // volver al login
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar
        title="Oh! SanSi 2025"
        tittleButton="Iniciar Sesión"
        user={user}
        onLogout={handleLogout}
        className="shadow-sm bg-[var(--blanco)]"
        loginHref="/auth"
      />

      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenido al Sistema de Gestión de Olimpiadas
        </h1>
        <p className="text-gray-600 mb-8">
          Accede a las áreas, inscritos y resultados del evento académico más importante del año.
        </p>

        {!user ? (
          <button
            onClick={() => setUser({ name: 'Farid Arancibia', role: 'Administrador' })}
            className="rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition"
          >
            Simular inicio de sesión
          </button>
        ) : (
          <p className="text-gray-700">Sesión activa como {user.name}</p>
        )}
      </section>
    </main>
  );
}
