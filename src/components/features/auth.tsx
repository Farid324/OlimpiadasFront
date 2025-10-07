// src/components/features/auth.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ROLE_HOME } from '@/config/security';
import { Trophy, User } from 'lucide-react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

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
    if (!email || !password) {
      setError('Por favor, complete todos los campos.');
      setLoading(false);
      return;
    }
    if (!email.endsWith('@olimpiadas.edu')) {
      setError('El correo debe pertenecer al dominio "@olimpiadas.edu".');
      setLoading(false);
      return;
    }
    if (password.length < 8 || password.length > 30) {
      setError('La contraseña debe tener entre 8 y 30 caracteres.');
      setLoading(false);
      return;
    }
    
    try {
      await login(email, password);
      const userStr = localStorage.getItem('user');
      const role = userStr ? (JSON.parse(userStr).role as keyof typeof ROLE_HOME) : 'ADMINISTRADOR';
      router.replace(ROLE_HOME[role]);
    } catch (err: unknown) {
        let errorMessage = 'Credenciales incorrectas';
        
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (err && typeof err === 'object' && 'response' in err) {
          const apiError = err as { response?: { data?: { message?: string } } };
          errorMessage = apiError?.response?.data?.message ?? 'Credenciales incorrectas';
        }
        
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmail('');
    setPassword('');
  }


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
          <h1 className="text-2xl font-bold text-gray-900">Oh! SanSi 2025</h1>
          <p className="text-gray-400 mt-2">Olimpiada en Ciencias y Tecnología San Simón</p>
        </div>

        {/* Login Card simple */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-1">Iniciar Sesión</h2>
          <p className="text-center text-sm text-gray-500 mb-4">Ingrese sus credenciales para acceder al sistema</p>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={onSubmit} onReset={onReset} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="email">Correo Electrónico</label>
              <Input id="email" type="text" placeholder="usuario@olimpiadas.edu" value={email} onChange={e => { const value = e.target.value; const sanitized = value.replace(/[^a-zA-Z0-9@.]/g, ''); setEmail(sanitized);}}/>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
              <Input id="password" type="password" placeholder="••••••••" value={password} maxLength={30} onChange={e => setPassword(e.target.value)} />
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

            <Button variant="tertiary" type="reset" className="w-full" disabled={isLoading}>
              Cancelar
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