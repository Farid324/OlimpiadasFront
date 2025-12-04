// src/app/private/configuracion/tabs/PasswordTab.tsx
'use client';

import { useState } from 'react';
import { api } from '@/libs/api';
import { Button } from '@/components/ui/Button';
import { XCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="w-full">
      <div className="w-full bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* BANNERS DE ESTADO (arriba, como en el modal) */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {message && !error && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}

          {/* CAMPOS */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700">
              Contraseña actual
            </label>
            <input
              type="password"
              className="
                mt-1 w-full rounded-lg
                bg-white border border-gray-200
                px-3 py-2 text-sm text-gray-900
                placeholder:text-gray-400
                outline-none
                focus:outline-none
                focus:ring-0
                focus:border-gray-200
                focus:shadow-none
                transition
              "
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="
                mt-1 w-full rounded-lg
                bg-white border border-gray-200
                px-3 py-2 text-sm text-gray-900
                placeholder:text-gray-400
                outline-none
                focus:outline-none
                focus:ring-0
                focus:border-gray-200
                focus:shadow-none
                transition
              "
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              className="
                mt-1 w-full rounded-lg
                bg-white border border-gray-200
                px-3 py-2 text-sm text-gray-900
                placeholder:text-gray-400
                outline-none
                focus:outline-none
                focus:ring-0
                focus:border-gray-200
                focus:shadow-none
                transition
              "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

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
