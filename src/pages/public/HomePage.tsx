import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, MapPin, Calendar, Award, Shield, Headphones, Car, Building } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import axios from 'axios';

function useTypewriterLoopKeep(text: string, speed = 100, pause = 2000) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index <= text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, index));
        setIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Pause à la fin avant de recommencer
      const timeout = setTimeout(() => {
        setIndex(0);
      }, pause);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed, pause]);

  return displayedText;
}

interface Testimonial {
  contenuCommentaire: string;
  dateCommentaire: string;
  notes: number;
  utilisateur: { nom: string; location?: string };
  offre: { titre: string };
}

const HomePage: React.FC = () => {
  const features = [
    { icon: Award, title: 'Expertise locale', description: "Plus de 10 ans d'expérience dans le tourisme malgache" },
    { icon: Shield, title: 'Voyages sécurisés', description: 'Assurance voyage et guides certifiés pour votre sécurité' },
    { icon: Headphones, title: 'Support 24/7', description: 'Une équipe dédiée à votre service avant, pendant et après votre voyage' }
  ];

  const images = [
    '/images/accueil/menabe.jpg',
    '/images/accueil/isalo.jpg',
    '/images/accueil/maki.jpg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [textAnimate, setTextAnimate] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Slideshow + animation texte toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setTextAnimate(false);
      setTimeout(() => setTextAnimate(true), 50); // relance animation
    }, 4000); // toutes les 2 secondes
    return () => clearInterval(interval);
  }, [images.length]);

  // Récupérer les témoignages depuis l'API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get('http://localhost:4005/commentaire');
        setTestimonials(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des commentaires :', error);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section avec slideshow */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${textAnimate ? 'animate-fade-in' : ''}`}>
            Bienvenue Chez TsikiDia Tour
          </h1>
          <p className={`text-xl md:text-2xl mb-8 opacity-90 ${textAnimate ? 'animate-fade-in-delay' : ''}`}>
            L'île continent vous attend avec ses paysages époustouflants, sa faune unique et sa culture authentique
          </p>
        </div>

        {/* Inline CSS pour animation */}
        <style>{`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInDelay {
            0% { opacity: 0; transform: translateY(20px); }
            50% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .animate-fade-in-delay {
            animation: fadeInDelay 0.8s ease-out forwards;
          }
        `}</style>
      </section>

      {/* À propos de Tsikidia Tour */}
      <section className="relative py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">À propos de Tsikidia Tour</h2>
            <p className="text-lg text-gray-500 mb-6">
              Bienvenue chez <span className="font-semibold text-gray-900">Tsikidia Tour</span>, votre partenaire de confiance pour explorer Madagascar de manière authentique et responsable.
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Nous combinons expertise locale, passion du voyage et service personnalisé pour rendre votre aventure inoubliable.
              Notre mission : faire découvrir la richesse culturelle et naturelle de Madagascar tout en soutenant les communautés locales.
              Nos valeurs : authenticité, respect de l'environnement, sécurité et excellence dans chaque détail de votre voyage.
            </p>
          </div>
            {/* 🔥 Bouton ajouté */}
      <div className="text-center mt-6">
        <Link to="/about">
          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4">
            En savoir plus
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
        </div>
      </section>

      {/* Features Section */}
<section
  className="py-20 bg-cover bg-center"
  style={{ backgroundImage: "url('/images/destination/dest.jpg')" }}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {/* Partie texte avec animation */}
      <div className="text-white bg-black/30 p-6 rounded-xl">
        <h2 className="text-4xl font-bold mb-4">
        {useTypewriterLoopKeep("Pourquoi choisir Tsikidia Tour ?", 100, 2000)}
      </h2>

      <p className="text-xl max-w-2xl">
        {useTypewriterLoopKeep(
          "Nous nous engageons à vous offrir une expérience de voyage exceptionnelle avec un service personnalisé et une expertise locale incomparable.",
          30,
          3000
        )}
</p>

      </div>

      {/* Partie droite (image) */}
      <div className="flex justify-center">
        <img
          src="/images/accueil/tsikidia.jpg"
          alt="Voyage Tsikidia"
          className="w-full h-auto rounded-2xl shadow-lg object-cover"
        />
      </div>
    </div>
  </div>
</section>





      
{/* Services Section */}
<section className="py-20 bg-gray-50 group relative overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services</h2>
      <p className="text-xl text-gray-600">Des prestations adaptées à vos besoins pour un voyage parfait</p>
    </div>

    {/* Conteneur des cartes */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
      {[
        {
          icon: Calendar,
          title: "Circuits organisés",
          description: "Nous planifions vos circuits sur mesure selon vos envies et votre budget."
        },
        {
          icon: Users,
          title: "Guides spécialisés",
          description: "Des guides locaux passionnés pour vous accompagner en toute sécurité."
        },
        {
          icon: Building,
          title: "Hébergements",
          description: "Une sélection d'hôtels et lodges de qualité pour tous les budgets"
        },
        {
          icon: Car,
          title: "Transport",
          description: "Véhicules adaptés et chauffeurs expérimentés pour vos déplacements"
        }
      ].map((service, index) => (
        <Card
          key={index}
          className={`
            opacity-0 transform transition-all duration-700 ease-in-out
            group-hover:opacity-100
            ${index < 2 ? 'translate-x-[-200%] group-hover:translate-x-0' : 'translate-x-[200%] group-hover:translate-x-0'}
            p-6 text-center
          `}
        >
          {/* Cercle vert pour l’icône */}
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <service.icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
          <p className="text-gray-600">{service.description}</p>
        </Card>
      ))}
    </div>
    <div className="text-center mt-12">
      <Link to="/services">
        <Button size="lg" className="bg-green-500/50 hover:bg-green-600/70 text-white px-8 py-4 rounded-lg shadow-md transition">
          Voir tous nos services
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </Link>
    </div>
  </div>
</section>


     {/* Destinations */}
<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Destinations populaires</h2>
      <p className="text-xl text-gray-600">Explorez les plus beaux endroits de Madagascar</p>
    </div>

    {/* Conteneur hover */}
    <div className="relative group overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Antananarivo', image: '/images/accueil/resto.jpg', description: 'La capitale historique' },
          { name: 'Andasibe', image: '/images/accueil/grotte.jpg', description: 'Parc national des lémuriens' },
          { name: 'Morondava', image: '/images/accueil/isalo.jpg', description: "L'allée des baobabs" },
          { name: 'Nosy Be', image: '/images/accueil/maki.jpg', description: "L'île aux parfums" }
        ].map((destination, index) => (
        <div
            key={index}
            className={`
            relative cursor-pointer overflow-hidden rounded-lg shadow-lg transform transition-all duration-2000 
            ${index % 2 === 0 
            ? 'translate-x-[-150%] group-hover:translate-x-0'  
            : 'translate-x-[150%] group-hover:translate-x-0'   
            }
           `}
        >
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
              <p className="text-sm opacity-90">{destination.description}</p>
           </div>
         </div>

        ))}
      </div>
       {/* 🔥 Bouton ajouté */}
    <div className="text-center mt-12">
      <Link to="/destinations">
        <Button size="lg" className="bg-green-500/50 hover:bg-green-600/70 text-white px-8 py-4 rounded-lg shadow-md transition">
          Voir toutes les destinations
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </Link>
    </div>
    </div>
  </div>
</section>


      {/* Circuits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Circuits</h2>
            <p className="text-xl text-gray-600">Découvrez nos itinéraires phares à Madagascar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "ANTANANARIVO : CIRCUIT DE 5 JOURS",
                image: "/images/circuit/isalo.jpg",
              },
              {
                name: "MORONDAVA : CIRCUIT DE 7 JOURS",
                image: "/images/circuit/menabe.jpg",
              },
              {
                name: "ISALO: CIRCUIT DE 20 JOURS",
                image: "/images/circuit/offre.jpg",
              }
            ].map((circuit, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg"
              >
                <img
                  src={circuit.image}
                  alt={circuit.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{circuit.name}</h3>
                
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/circuits">
           <Button
              size="lg"
              className="bg-green-500/50 hover:bg-green-600/70 text-white px-8 py-4 rounded-lg shadow-md transition"
           >
             Voir tous les circuits
          <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials dynamiques */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-gray-600">Des milliers de voyageurs nous font confiance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
               <div className="flex items-center mb-2">
                  {[...Array(testimonial.notes)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                 ))}
                </div>
                  <p className="text-gray-600 mb-2 italic">{testimonial.contenuCommentaire}</p>
                <div className="mb-1 text-sm text-gray-500 italic">
                  Date : {new Date(testimonial.dateCommentaire).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                   <Users className="w-5 h-5 text-white" />
                </div>
                 <div>
                  <p className="font-semibold text-gray-900">{testimonial.utilisateur?.nom}</p>
                 </div>
                </div>
             </Card>
 
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500">Aucun commentaire disponible pour le moment.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
