// src/app/public/page.tsx
export default function PublicHome() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold">Página pública</h1>
      <p className="text-gray-600 mt-2">Contenido visible sin autenticación.</p>
    </main>
  );
}