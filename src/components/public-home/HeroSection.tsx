// src/components/public-home/HeroSection.tsx

import { Card, CardContent } from '@/components/ui/Card2'; // Revisa la ruta/nombre si usaste Card2
import { Award, Medal, Trophy, Users } from 'lucide-react';

interface HeroSectionProps {
  totalCompetitors: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
}

export function HeroSection({
  totalCompetitors,
  goldMedals,
  silverMedals,
  bronzeMedals,
}: HeroSectionProps) {
  return (
    <section className="bg-[var(--azul)] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Olimpiada en Ciencias y Tecnología
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Universidad Mayor de San Simón
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto ">
             <Card className="bg-[var(--blancoOpaco)] backdrop-blur border-white/20 text-white">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{totalCompetitors}</div>
                  <div className="text-sm text-blue-100">Clasificando</div>
                </CardContent>
              </Card>
              <Card className="bg-[var(--blancoOpaco)] backdrop-blur border-white/20 text-white">
                <CardContent className="pt-6">
                  <Award className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-3xl font-bold">{goldMedals}</div>
                  <div className="text-sm text-blue-100">Medallas Oro</div>
                </CardContent>
              </Card>
              <Card className="bg-[var(--blancoOpaco)] backdrop-blur border-white/20 text-white">
                <CardContent className="pt-6">
                  <Medal className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <div className="text-3xl font-bold">{silverMedals}</div>
                  <div className="text-sm text-blue-100">Medallas Plata</div>
                </CardContent>
              </Card>
              <Card className="bg-[var(--blancoOpaco)] backdrop-blur border-white/20 text-white">
                <CardContent className="pt-6">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                  <div className="text-3xl font-bold">{bronzeMedals}</div>
                  <div className="text-sm text-blue-100">Medallas Bronce</div>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
