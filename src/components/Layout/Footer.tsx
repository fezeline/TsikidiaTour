import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/images/accueil/logo.jpg" 
                alt="Tsikidia Logo" 
                className="w-10 h-10 object-contain rounded-full" 
              />
             <span className="text-2xl font-bold">Tsikidia Tour</span>
             </div>

            <p className="text-gray-300 mb-4">
              Votre partenaire de confiance pour découvrir les merveilles de Madagascar. 
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61575783743170" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" />
              </a>
              <a href="https://twitter.com/tsikidia" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              </a>
              <a href="https://www.instagram.com/tsikidia" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-500 cursor-pointer transition-colors" />
              </a>
              <a href="https://www.youtube.com/@tsikidia" target="_blank" rel="noopener noreferrer">
                <Youtube className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Accueil</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">À propos</a></li>
              <li><a href="/services" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="/destinations" className="text-gray-300 hover:text-white transition-colors">Destinations</a></li>
              <li><a href="/circuits" className="text-gray-300 hover:text-white transition-colors">Circuits</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nos services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Circuits organisés</span></li>
              <li><span className="text-gray-300">Hébergements</span></li>
              <li><span className="text-gray-300">Transport</span></li>
              <li><span className="text-gray-300">Guide touristique</span></li>
              <li><span className="text-gray-300">Activités sur mesure</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Fianarantsoa+Madagascar" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Fianarantsoa, Madagascar
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <a href="tel:+261383793053" className="text-gray-300 hover:text-white transition-colors">
                  +261 38 37 930 53
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:tsikidia@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  tsikidia@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Tsikidia Tour. Tous droits réservés. Fait avec ❤️ à Madagascar.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
