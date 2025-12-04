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
import { api } from '@/libs/api';

// Pequeña ayuda para leer mensajes de error del backend sin usar "any"
function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const apiError = err as { response?: { data?: { message?: unknown } } };
    const msg = apiError.response?.data?.message;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);

  // Estados para recuperación de contraseña
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<'options' | 'byData' | 'byEmail'>('options');

  // Opción 1: por nombre + correo + CI
  const [fullName, setFullName] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [ci, setCi] = useState('');

  // Opción 2: solo por correo
  const [recoveryEmailOnly, setRecoveryEmailOnly] = useState('');

  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // ===================== LOGIN NORMAL =====================
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, complete todos los campos.');
      setLoading(false);
      return;
    }

    if (password.length < 6 || password.length > 20) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      const userStr = localStorage.getItem('user');
      const role = userStr
        ? (JSON.parse(userStr).role as keyof typeof ROLE_HOME)
        : 'ADMINISTRADOR';
      router.replace(ROLE_HOME[role]);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Credenciales incorrectas');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmail('');
    setPassword('');
  };

  // ===================== RECUPERACIÓN – OPCIÓN 1 =====================
  const handleRecoverByData = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryMessage(null);

    if (!fullName.trim() || !recoveryEmail.trim() || !ci.trim()) {
      setRecoveryError('Por favor, complete todos los campos.');
      return;
    }

    try {
      setRecoveryLoading(true);
      await api.post('/auth/recover/by-data', {
        fullName,
        email: recoveryEmail,
        ci,
      });

      setRecoveryMessage(
        'Tu contraseña ha sido actualizada a tu CI actual. Intenta iniciar sesión de nuevo.',
      );

      // Opcional: limpiar campos
      setFullName('');
      setRecoveryEmail('');
      setCi('');
    } catch (err: unknown) {
      const msg = getErrorMessage(
        err,
        'No se encontraron datos que coincidan. Verifica la información ingresada.',
      );
      setRecoveryError(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  // ===================== RECUPERACIÓN – OPCIÓN 2 =====================
  const handleRecoverByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryMessage(null);

    if (!recoveryEmailOnly.trim()) {
      setRecoveryError('Por favor, ingresa tu correo.');
      return;
    }

    try {
      setRecoveryLoading(true);
      await api.post('/auth/recover/by-email', {
        email: recoveryEmailOnly,
      });

      setRecoveryMessage(
        'Se ha enviado una contraseña temporal a tu correo. Revisa tu bandeja de entrada.',
      );
      setRecoveryEmailOnly('');
    } catch (err: unknown) {
      const msg = getErrorMessage(
        err,
        'No se encontró una cuenta asociada a ese correo.',
      );
      setRecoveryError(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const closeRecovery = () => {
    setShowRecovery(false);
    setRecoveryMode('options');
    setRecoveryError(null);
    setRecoveryMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Navbar siempre arriba */}
      <Navbar
        title="Oh! SanSi 2025"
        tittleButton="Inicio"
        onLogout={() => {
          localStorage.removeItem('user');
          window.location.href = '/auth';
        }}
        loginHref="/"
        className="!bg-[var(--blanco)] shadow-[0_1px_6px_rgba(0,0,0,0.1)]"
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
            <h1 className="text-3xl font-bold text-[color:var(--negro)]">
              Oh! SanSi 2025
            </h1>
            <p className="text-[color:var(--negroGris)] mt-2">
              Olimpiada en Ciencias y Tecnología San Simón
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-center mb-1 text-[color:var(--negro)]">
              Iniciar Sesión
            </h2>
            <p className="text-center text-sm text-[color:var(--negroGris)] mb-4">
              Ingrese sus credenciales para acceder al sistema
            </p>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={onSubmit} onReset={onReset} className="space-y-3">
              <div className="space-y-1">
                <label
                  className="text-sm font-bold text-[color:var(--negro)]"
                  htmlFor="email"
                >
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
                <label
                  className="text-sm font-bold text-[color:var(--negro)]"
                  htmlFor="password"
                >
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

              <Button
                type="submit"
                className="w-full !font-bold"
                disabled={isLoading}
              >
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

            {/* 🔗 Olvidaste tu contraseña */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowRecovery(true);
                  setRecoveryMode('options');
                  setRecoveryError(null);
                  setRecoveryMessage(null);
                }}
                className="text-sm font-bold text-black underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE RECUPERACIÓN */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg relative">
            {/* Header modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-[color:var(--negro)]">
                Recuperar contraseña
              </h3>
              <button
                onClick={closeRecovery}
                className="text-gray-500 hover:text-gray-700 text-xl"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Contenido modal */}
            <div className="px-4 py-4 space-y-4 text-sm text-[color:var(--negro)]">
              {recoveryMode === 'options' && (
                <>
                  <p className="text-[color:var(--negroGris)] mb-2">
                    Elige una opción para recuperar tu acceso:
                  </p>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setRecoveryMode('byData')}
                      className="w-full text-left border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <p className="font-semibold">
                        1. Verificar por nombre completo, correo y CI
                      </p>
                      <p className="text-xs text-[color:var(--negroGris)]">
                        Si los datos coinciden, tu contraseña se actualizará a tu
                        CI actual.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecoveryMode('byEmail')}
                      className="w-full text-left border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <p className="font-semibold">
                        2. Enviar una contraseña temporal a tu correo
                      </p>
                      <p className="text-xs text-[color:var(--negroGris)]">
                        Te enviaremos una contraseña alfanumérica temporal a tu
                        correo vinculado.
                      </p>
                    </button>
                  </div>
                </>
              )}

              {recoveryMode === 'byData' && (
                <form onSubmit={handleRecoverByData} className="space-y-3">
                  <p className="text-[color:var(--negroGris)]">
                    Ingresa tu nombre completo, correo y CI. Si coinciden con un
                    registro, tu contraseña se actualizará a tu CI actual.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">
                      Nombre completo
                    </label>
                    <Input
                      type="text"
                      placeholder="Ej: Juan Pérez López"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">
                      Correo electrónico
                    </label>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">CI</label>
                    <Input
                      type="text"
                      placeholder="Número de CI"
                      value={ci}
                      onChange={(e) => setCi(e.target.value)}
                    />
                  </div>

                  {recoveryError && (
                    <p className="text-xs text-red-600">{recoveryError}</p>
                  )}
                  {recoveryMessage && (
                    <p className="text-xs text-green-600">{recoveryMessage}</p>
                  )}

                  <div className="flex justify-between gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      onClick={() => {
                        setRecoveryMode('options');
                        setRecoveryError(null);
                        setRecoveryMessage(null);
                      }}
                    >
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={recoveryLoading}
                    >
                      {recoveryLoading ? 'Verificando…' : 'Actualizar a CI'}
                    </Button>
                  </div>
                </form>
              )}

              {recoveryMode === 'byEmail' && (
                <form onSubmit={handleRecoverByEmail} className="space-y-3">
                  <p className="text-[color:var(--negroGris)]">
                    Ingresa el correo vinculado a tu cuenta. Te enviaremos una
                    contraseña temporal alfanumérica.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">
                      Correo electrónico
                    </label>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={recoveryEmailOnly}
                      onChange={(e) => setRecoveryEmailOnly(e.target.value)}
                    />
                  </div>

                  {recoveryError && (
                    <p className="text-xs text-red-600">{recoveryError}</p>
                  )}
                  {recoveryMessage && (
                    <p className="text-xs text-green-600">{recoveryMessage}</p>
                  )}

                  <div className="flex justify-between gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      onClick={() => {
                        setRecoveryMode('options');
                        setRecoveryError(null);
                        setRecoveryMessage(null);
                      }}
                    >
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={recoveryLoading}
                    >
                      {recoveryLoading ? 'Enviando…' : 'Enviar temporal'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
