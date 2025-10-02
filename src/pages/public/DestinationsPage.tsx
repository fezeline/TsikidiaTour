import React, { useState } from 'react';
import { MapPin, Camera, Clock, Users, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const DestinationsPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('all');

  const destinations = [
    {
      id: 1,
      name: 'Antananarivo',
      region: 'hauts-plateaux',
      image: '/images/destination/tana.jpg',
      description: 'La capitale historique de Madagascar, riche en culture et en histoire.',
      highlights: ['Palais de la Reine', 'Marché Analakely', 'Lac Anosy'],
      rating: 4.5
    },
    {
      id: 2,
      name: 'Andasibe-Mantadia',
      region: 'hauts-plateaux',
      image: '/images/destination/activite.jpg',
      description: 'Parc national célèbre pour ses lémuriens indri et sa forêt tropicale.',
      highlights: ['Lémuriens Indri', 'Forêt primaire', 'Orchidées rares'],
      rating: 4.8
    },
    {
      id: 3,
      name: 'Morondava',
      region: 'ouest',
      image: '/images/destination/desti.jpg',
      description: 'Célèbre pour son allée des baobabs et ses couchers de soleil magiques.',
      highlights: ['Allée des Baobabs', 'Forêt de Kirindy', 'Plages sauvages'],
      rating: 4.9
    },
    {
      id: 4,
      name: 'Nosy Be',
      region: 'nord',
      image: '/images/destination/dest.jpg',
      description: 'L\'île aux parfums, paradis tropical aux plages de sable blanc.',
      highlights: ['Plages paradisiaques', 'Plantations d\'ylang-ylang', 'Réserve de Lokobe'],
      rating: 4.7
    },
    {
      id: 5,
      name: 'Isalo',
      region: 'sud',
      image: '/images/destination/tsiky.jpg',
      description: 'Parc national aux paysages lunaires et canyons spectaculaires.',
      highlights: ['Canyon des Makis', 'Piscine Naturelle', 'Formations rocheuses'],
      rating: 4.6
    },
    {
      id: 6,
      name: 'Anakao',
      region: 'sud',
      image: '/images/destination/centre.jpg',
      description: 'Village de pêcheurs aux plages immaculées et récifs coralliens.',
      highlights: ['Plongée sous-marine', 'Pêche traditionnelle', 'Récifs coralliens'],
      rating: 4.4
    }
  ];

  const regions = [
    { id: 'all', name: 'Toutes les régions' },
    { id: 'hauts-plateaux', name: 'Hauts Plateaux' },
    { id: 'nord', name: 'Nord' },
    { id: 'ouest', name: 'Ouest' },
    { id: 'sud', name: 'Sud' },
    { id: 'est', name: 'Est' }
  ];

  const filteredDestinations = selectedRegion === 'all' 
    ? destinations 
    : destinations.filter(dest => dest.region === selectedRegion);

 
  return (
    <div className="min-h-screen">
{/* Hero Section Destinations animée avec hauteur réduite */}
<section className="relative py-20 text-white overflow-hidden h-[50vh] flex items-center justify-center">
  {/* Image animée en slideshow */}
  {['/images/destination/centre.jpg'].map((img, index) => (
    <div
      key={index}
      className={`absolute inset-0 bg-cover bg-center scale-100 animate-[fadeZoom_9s_ease-in-out_infinite]`}
      style={{ 
        backgroundImage: `url(${img})`,
        animationDelay: `${index * 3}s`
      }}
    />
  ))}

  {/* Overlay pour lisibilité */}
  <div className="absolute inset-0 bg-black/30" />

  {/* Contenu */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-[fadeUp_1.5s_ease_forwards]">
      Destinations
    </h1>
    <p className="text-xl max-w-3xl mx-auto opacity-90 animate-[fadeUp_1.5s_ease_forwards_0.5s]">
      Explorez les merveilles de Madagascar, de la capitale historique aux parcs nationaux, 
      en passant par les plages paradisiaques et les paysages lunaires.
    </p>
  </div>

  {/* Keyframes inline */}
  <style>
    {`
      @keyframes fadeZoom {
        0% { opacity: 0; transform: scale(1); }
        10% { opacity: 1; transform: scale(1.05); }
        30% { opacity: 1; transform: scale(1.05); }
        40% { opacity: 0; transform: scale(1.1); }
        100% { opacity: 0; transform: scale(1); }
      }
      @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `}
  </style>
</section>

{/* Introduction avant les boutons */}
<section className="py-12 bg-gray-100">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl font-bold text-gray-900 mb-4">
      Découvrez Madagascar avec TsikiDia Tour
    </h2>
    <p className="text-lg text-gray-600 mb-3">
      Tsikidia Tour vous propose des destinations uniques pour explorer les richesses naturelles et culturelles de Madagascar.
    </p>
    <p className="text-lg text-gray-600">
      Voici les destinations à visiter la prochaine fois. 
      N'hésitez pas à nous envoyer un message pour plus d'informations.
    </p>
  </div>
</section>


      {/* Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`px-6 py-2 rounded-full transition-colors ${
                  selectedRegion === region.id
                    ? 'bg-white-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-lg flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-orange-600 mr-2" />
                    <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{destination.description}</p>
               
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>   
    </div>
  );
};

export default DestinationsPage;