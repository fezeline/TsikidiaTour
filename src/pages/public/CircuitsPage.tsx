import React, { useState } from 'react';
import { Calendar, User, MessageSquare } from 'lucide-react';
import Card from '../../components/ui/Card';

const CircuitsPage: React.FC = () => {
  const circuits = [
    {
      id: 1,
      title: 'ANTANANARIVO : CIRCUIT DE 5 JOURS ',
      author: 'TsikiDia Tours Madagascar',
      date: '10 Juin au 15 Juin 2025',
      category: 'À propos de Sud de Madagascar',
      image: '/images/circuit/isalo.jpg',
      description:
        "Voyagez dans le sud de Madagascar, sans doute la région la plus spectaculaire et la plus diversifiée de la Grande Île. Dans la premerière partie de ce circuit, vous découvrirez les merveilles naturelles du parc national de l'Isalo, avec ses canyons impressionnants, ses piscines naturelles et sa faune unique. Vous visiterez également des villages locaux où vous pourrez rencontrer des artisans et en apprendre davantage sur les traditions malgaches. La deuxième partie du circuit vous emmènera vers la côte sud-ouest, où vous pourrez profiter des plages idylliques d'Ifaty et d'Anakao, célèbres pour leurs récifs coralliens et leurs eaux cristallines.Le 1er jour, vous arriverez à Antananarivo et serez accueilli par notre équipe. Vous passerez la nuit dans un hôtel confortable pour vous reposer avant de commencer votre aventure le lendemain."
    },
    {
      id: 2,
      title: 'MORONDAVA : CIRCUIT DE 7 JOURS ',
      author: 'TsikiDia Tours Madagascar',
      date: '20 au 27 Juin 2025',
      category: 'Expérience Tropicale',
      image: '/images/circuit/menabe.jpg',
      description:
        "Immersion totale à Nosy Be, surnommée l’île aux parfums, entre plages idylliques, plongée sous-marine exceptionnelle et villages de pêcheurs. Découvrez la nature généreuse, les lacs volcaniques et les couchers de soleil inoubliables de cette perle de l’océan Indien."
    },
    {
      id: 3,
      title: 'ISALO: CIRCUIT DE 20 JOURS',
      author: 'TsikiDia Tours Madagascar',
      date: '10 au 30 Octobre 2025',
      category: 'Aventure & Découverte',
      image: '/images/circuit/offre.jpg',
      description:
        "Ce circuit unique combine l’allée mythique des Baobabs, les formations spectaculaires des Tsingy de Bemaraha et la forêt de Kirindy. Entre patrimoine naturel et moments inoubliables, ce voyage offre une immersion totale dans la beauté sauvage de Madagascar."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero conservé */}
      <section className="relative py-20 text-white overflow-hidden h-[60vh] flex items-center justify-center">
        {['/images/circuit/tsiky.jpg', '/images/circuit/fia.jpg'].map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center scale-100 animate-[fadeZoom_12s_ease-in-out_infinite]"
            style={{
              backgroundImage: `url(${img})`,
              animationDelay: `${index * 4}s`
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-[fadeUp_1.5s_ease_forwards]">
            Nos Circuits
          </h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90 animate-[fadeUp_1.5s_ease_forwards_0.5s]">
            Des aventures soigneusement conçues pour découvrir Madagascar sous tous ses aspects, 
            de la nature sauvage aux traditions ancestrales.
          </p>
        </div>
      </section>

      {/* Liste des circuits */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {circuits.map((circuit) => (
          <Card key={circuit.id} className="mb-12 overflow-hidden">
            {/* Image avec animation */}
            <div className="relative h-80 w-full overflow-hidden">
              <img
                src={circuit.image}
                alt={circuit.title}
                className="absolute inset-0 w-full h-full object-cover animate-[zoomFade_12s_ease-in-out_infinite]"
              />
            </div>

            {/* Contenu */}
            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {circuit.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {circuit.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {circuit.date}
                </div>
                <span>{circuit.category}</span>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {circuit.description}
              </p>
            </div>
          </Card>
        ))}
      </section>

      {/* Keyframes pour l'animation */}
      <style>
        {`
          @keyframes zoomFade {
            0% { transform: scale(1); opacity: 0; }
            10% { transform: scale(1.05); opacity: 1; }
            90% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default CircuitsPage;
