// src/components/features/auth.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ROLE_HOME } from '@/config/security';
import { Trophy, User, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@olimpiadas.edu');
  const [password, setPassword] = useState('olimpiadas2024');
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const userStr = localStorage.getItem('user');
      const role = userStr ? (JSON.parse(userStr).role as keyof typeof ROLE_HOME) : 'ADMINISTRADOR';
      router.replace(ROLE_HOME[role]);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Oh! SanSi</h1>
          <p className="text-gray-600 mt-2">Olimpiada en Ciencias y Tecnología San Simón</p>
        </div>

        {/* Login Card simple */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-center mb-1">Iniciar Sesión</h2>
          <p className="text-center text-sm text-gray-500 mb-4">Ingrese sus credenciales para acceder al sistema</p>

          {error && (
            <div className="flex items-start gap-2 border border-red-200 bg-red-50 text-red-700 rounded-md p-3 mb-3">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--negro)]" htmlFor="email">Correo Electrónico</label>
              <Input className="bg-[var(--grisClaro)]" id="email" type="email" placeholder="usuario@olimpiadas.edu" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--negro)]" htmlFor="password">Contraseña</label>
              <Input className="bg-[var(--grisClaro)]" id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verificando...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Ingresar
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Universidad Mayor de San Simón</p>
          <p>Sistema de Gestión de Olimpiadas</p>
        </div>
      </div>
    </div>
  );
}
