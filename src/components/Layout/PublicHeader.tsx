import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Menu, X, User, LogIn } from 'lucide-react';
import Button from '../ui/Button';

const PublicHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/about', label: 'À propos' },
    { to: '/services', label: 'Services' },
    { to: '/destinations', label: 'Destinations' },
    { to: '/circuits', label: 'Circuits' },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
      <Link to="/" className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
         <img 
           src="/images/accueil/logo.jpg" 
           alt="Tsikidia Tour Logo" 
           className="w-full h-full object-contain"
         />
        </div>
        <span className="text-2xl font-bold text-gray-900">Tsikidia Tour</span>
      </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/register')}
            >
              <User className="w-4 h-4 mr-2" />
              S'inscrire
            </Button>
            <Button
              size="sm"
              className="bg-green-500/50 hover:bg-green-600/70 text-white px-4 py-2 rounded-lg shadow-md transition"
              onClick={() => navigate('/login')}
              >
                 <LogIn className="w-4 h-4 mr-2" />
                    Se Connecter
           </Button>

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate('/register');
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  S'inscrire
                </Button>
                <Button
                   size="sm"
                   className="w-full bg-green-500/50 hover:bg-green-600/70 text-white rounded-lg shadow-md transition"
                   onClick={() => {
                   navigate('/login');
                   setIsMenuOpen(false);
                    }}
                    >
                   <LogIn className="w-4 h-4 mr-2" />
                    Se Connecter
               </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;