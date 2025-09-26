// src/app/private/page.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function PrivateHome() {
  const { user } = useAuth();

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Bienvenido/a</h1>
        <p className="text-gray-700">
          {user?.name} — <span className="font-medium">{user?.role}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Esta es tu interfaz privada. Aquí verás solo tus datos y acciones según tu rol.
        </p>
      </div>
    </main>
  );
}
