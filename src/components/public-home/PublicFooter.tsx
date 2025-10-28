// src/components/public-home/PublicFooter.tsx
import { Trophy } from 'lucide-react';
export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-6 w-6" />
              <span className="font-semibold">Oh! SanSi 2024</span>
            </div>
            <p className="text-gray-400 text-sm">
              Olimpiada en Ciencias y Tecnología San Simón
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contacto</h3>
            <p className="text-gray-400 text-sm">
              Universidad Mayor de San Simón
            </p>
            <p className="text-gray-400 text-sm">Cochabamba, Bolivia</p>
            <p className="text-gray-400 text-sm">info@ohsansi.edu.bo</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Enlaces</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Acerca de</a></li>
              <li><a href="#" className="hover:text-white">Reglamento</a></li>
              <li><a href="#" className="hover:text-white">Preguntas Frecuentes</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          © 2024 Oh! SanSi - Universidad Mayor de San Simón. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}