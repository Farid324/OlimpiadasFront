// src/components/features/auth.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ROLE_HOME } from '@/config/security';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    /*if (!email.endsWith('@gmail.com')) {
      setError('El correo debe pertenecer al dominio "@gmail.com".');
      setLoading(false);
      return;
    }*/
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Navbar siempre arriba */}
      <Navbar
        title="Oh! SanSi 2025"
        tittleButton='Inicio'
        links={[
          { label: 'Inicio', href: '/' },
          { label: 'Áreas', href: '/areas' },
          { label: 'Inscritos', href: '/inscritos' },
          { label: 'Resultados', href: '/resultados' },
        ]}
        onLogout={() => {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        loginHref="/"
        className='!bg-[var(--blanco)] shadow-[0_1px_6px_rgba(0,0,0,0.1)]'
      />

      {/* Contenido centrado vertical y horizontalmente */}
      <main className="flex-1 grid place-items-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                className="rounded-full"
                src="/assets/logo1.png"
                alt="Logo principal del login"
                width={125}
                height={125}
              />
            </div>
            <h1 className="text-3xl font-bold text-[color:var(--negro)]">Oh! SanSi 2025</h1>
            <p className="text-[color:var(--negroGris)] mt-2">
              Olimpiada en Ciencias y Tecnología San Simón
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-center mb-1 text-[color:var(--negro)]">Iniciar Sesión</h2>
            <p className="text-center text-sm text-[color:var(--negroGris)] mb-4">
              Ingrese sus credenciales para acceder al sistema
            </p>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={onSubmit} onReset={onReset} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-bold text-[color:var(--negro)]" htmlFor="email">
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Ingrese correo electronico"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    const sanitized = value.replace(/[^a-zA-Z0-9@.]/g, '');
                    setEmail(sanitized);
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-[color:var(--negro)]" htmlFor="password">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingrese contraseña"
                  value={password}
                  maxLength={30}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full !font-bold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verificando...
                  </>
                ) : (
                  <>Ingresar</>
                )}
              </Button>

              <Button
                variant="tertiary"
                type="reset"
                className="w-full text-[color:var(--negro)] !font-bold"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}