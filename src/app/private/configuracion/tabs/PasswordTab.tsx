// src/app/private/configuracion/tabs/PasswordTab.tsx
'use client';

import { useState } from 'react';
import { api } from '@/libs/api';
import { Button } from '@/components/ui/Button';

export default function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!currentPassword.trim()) {
      setError('Ingresa tu contraseña actual.');
      return;
    }

    if (!newPassword.trim()) {
      setError('Ingresa la nueva contraseña.');
      return;
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setMessage('Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      let backendMsg = 'Ocurrió un error al actualizar la contraseña.';

      if (typeof err === 'object' && err !== null) {
        const axiosErr = err as {
          response?: { data?: { message?: unknown } };
        };

        if (axiosErr.response?.data?.message !== undefined) {
          backendMsg = String(axiosErr.response.data.message);
        }
      }

      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔹 Ahora simplemente ocupa todo el ancho disponible, igual que las otras cards
    <div className="w-full">
      <div className="w-full bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña actual
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--azulPrincipal)] focus:border-[var(--azulPrincipal)]"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--azulPrincipal)] focus:border-[var(--azulPrincipal)]"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--azulPrincipal)] focus:border-[var(--azulPrincipal)]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-600">
              {message}
            </p>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
