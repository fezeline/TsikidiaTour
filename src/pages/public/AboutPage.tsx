import React from 'react';
import { Award, Heart, Target, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';


const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Rakoto Andry',
      role: 'Fondateur & Directeur',
      image: '/images/propos/directeur.jpg',
      description: 'Passionné de tourisme depuis plus de 15 ans'
    },
    {
      name: 'Hery Rasoamanana',
      role: 'Guide principal',
      image: '/images/propos/guide.jpg',
      description: 'Expert en faune et flore malgache'
    },
    {
      name: 'Naina Razafy',
      role: 'Responsable logistique',
      image: '/images/propos/respo.jpg',
      description: 'Spécialiste en organisation de voyages'
    }
  ];

  return (
    <div className="min-h-screen">
   {/* Hero Section */}
     <section className="relative h-[70vh] flex items-center justify-center overflow-hidden text-white">
      {/* Image de fond animée */}
       <div
          className="absolute inset-0 bg-cover bg-center scale-100 animate-[kenburns_25s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: "url('/images/propos/logo.jpg')" }}
       />

       {/* Overlay animé */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 animate-[gradientMove_10s_ease_infinite] bg-[length:200%_200%]" />

  {/* Contenu */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-5xl md:text-7xl font-bold mb-6 opacity-0 animate-[fadeUp_1.5s_ease_forwards]">
      À propos de Tsikidia Tour
    </h1>
    <p className="text-xl max-w-3xl mx-auto opacity-0 animate-[fadeUp_1.5s_ease_forwards_0.5s]">
      Depuis plus de 10 ans, nous sommes votre partenaire de confiance pour découvrir 
      les merveilles cachées de Madagascar avec passion et expertise.
    </p>
  </div>

  {/* Définition des keyframes inline via Tailwind */}
    <style>
    {`
      @keyframes kenburns {
        0% { transform: scale(1) translate(0, 0); }
        50% { transform: scale(1.2) translate(-5%, -5%); }
        100% { transform: scale(1.1) translate(5%, 5%); }
      }
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
         }
        `}
       </style>
     </section>



      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre histoire</h2>
              <p className="text-lg text-gray-600 mb-6">
                Tsikidia Tour est né de la passion de faire découvrir Madagascar, cette île unique 
                au monde, à travers des expériences authentiques et mémorables. Fondée en 2014 par 
                des guides locaux expérimentés, notre agence s'est rapidement imposée comme une 
                référence dans le tourisme responsable à Madagascar.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Nous croyons fermement que chaque voyage doit être une aventure personnalisée, 
                respectueuse de l'environnement et bénéfique pour les communautés locales. 
                C'est pourquoi nous travaillons exclusivement avec des partenaires locaux 
                et privilégions un tourisme durable.
              </p>
            </div>
            <div className="relative">
              <img
                src="/images/propos/fasy.jpg"
                alt="Notre équipe"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision avec animation */}
      <section className="relative py-20 bg-gradient-to-r from-white via-blue-50 to-white overflow-hidden">
        {/* Dégradé animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-50 to-white animate-gradient" />
      
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-animate text-center bg-white/80 backdrop-blur-md border border-gray-100 hover:shadow-2xl">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4 icon-animate" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Notre Mission</h3>
              <p className="text-gray-600">
                Faire découvrir Madagascar de manière authentique et responsable, 
                en créant des liens durables entre les voyageurs et les communautés locales.
              </p>
            </Card>

            <Card className="card-animate text-center bg-white/80 backdrop-blur-md border border-gray-100 hover:shadow-2xl">
              <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4 icon-animate" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Notre Vision</h3>
              <p className="text-gray-600">
                Devenir la référence du tourisme durable à Madagascar, 
                en préservant la richesse naturelle et culturelle de l'île.
              </p>
            </Card>

            <Card className="card-animate text-center bg-white/80 backdrop-blur-md border border-gray-100 hover:shadow-2xl">
              <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4 icon-animate" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nos Valeurs</h3>
              <p className="text-gray-600">
                Authenticité, respect de l'environnement, soutien aux communautés locales 
                et excellence dans le service client.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Nos certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Tourisme Responsable','Guide Certifié','Sécurité Voyage','Écotourisme'].map((cert, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
