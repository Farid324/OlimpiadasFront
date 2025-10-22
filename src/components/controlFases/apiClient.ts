// src/components/controlFases/apiClient.ts

// ✅ Tu backend corre en el puerto 3001 y SIN prefijo /api/v1
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getFromAPI<T>(path: string): Promise<T> {
  // Asegura que el path empiece con "/"
  const fullPath = path.startsWith('/') ? path : `/${path}`;

  const res = await fetch(`${BASE_URL}${fullPath}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${fullPath} -> ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}
