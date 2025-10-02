import React from 'react';
import { Car, Building, MapPin, Users, Camera, Compass, Shield, Headphones } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ServicesPage: React.FC = () => {
  const mainServices = [
    {
      icon: MapPin,
      title: 'Circuits organisés',
      description: 'Des itinéraires soigneusement conçus pour découvrir les plus beaux sites de Madagascar',
      features: ['Circuits de 3 à 21 jours', 'Groupes de 2 à 15 personnes', 'Guides expérimentés', 'Transport inclus'],
      image: '/images/service/circuit.jpg'
    },
    {
      icon: Building,
      title: 'Hébergements',
      description: 'Une sélection d\'hôtels et lodges de qualité pour tous les budgets',
      features: ['Hôtels 3 à 5 étoiles', 'Lodges écologiques', 'Maisons d\'hôtes', 'Campings aménagés'],
      image: '/images/service/hebergement.jpg'
    },
    {
      icon: Car,
      title: 'Transport',
      description: 'Véhicules adaptés et chauffeurs expérimentés pour vos déplacements',
      features: ['4x4 tout terrain', 'Minibus climatisés', 'Chauffeurs-guides', 'Assurance complète'],
      image: '/images/service/voiture.jpg'
    },
    {
      icon: Users,
      title: 'Guides spécialisés',
      description: 'Des guides locaux passionnés et certifiés pour enrichir votre expérience',
      features: ['Guides naturalistes', 'Guides culturels', 'Multilingues', 'Formés en premiers secours'],
      image: '/images/service/guide.jpg'
    }
  ];

  const additionalServices = [
    {
      icon: Camera,
      title: 'Safaris photo',
      description: 'Expéditions spécialisées pour les passionnés de photographie animalière'
    },
    {
      icon: Compass,
      title: 'Trekking & randonnée',
      description: 'Aventures pédestres dans les parcs nationaux et réserves naturelles'
    },
    {
      icon: Shield,
      title: 'Assurance voyage',
      description: 'Couverture complète pour voyager en toute sérénité'
    },
    {
      icon: Headphones,
      title: 'Support 24/7',
      description: 'Assistance permanente pendant toute la durée de votre séjour'
    }
  ];

  return (
    <div className="min-h-screen">
    {/* Hero Section animée avec fond image */}
<section className="relative py-20 text-white overflow-hidden">
  {/* Image de fond animée (fade in/out) */}
  <div
    className="absolute inset-0 bg-cover bg-center animate-[fadeInOut_6s_ease-in-out_infinite]"
    style={{ backgroundImage: "url('/images/service/tsiky.jpg')" }} // mets ton image ici
  />

  {/* Overlay léger pour lisibilité */}
  <div className="absolute inset-0 bg-black/30" />

  {/* Contenu */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-5xl font-bold mb-6">Nos Services</h1>
    <p className="text-xl max-w-3xl mx-auto opacity-90">
      Des services complets et personnalisés pour faire de votre voyage à Madagascar 
      une expérience inoubliable et sans souci.
    </p>
  </div>

  {/* Keyframes inline pour fade-in / fade-out */}
  <style>
    {`
      @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
      }
    `}
  </style>
</section>


      {/* Main Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Services principaux</h2>
            <p className="text-xl text-gray-600">
              Tout ce dont vous avez besoin pour un voyage réussi
            </p>
          </div>

          <div className="space-y-16">
            {mainServices.map((service, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <service.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{service.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="rounded-lg shadow-xl w-full h-80 object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Services complémentaires</h2>
            <p className="text-xl text-gray-600">
              Des options supplémentaires pour enrichir votre expérience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <service.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;