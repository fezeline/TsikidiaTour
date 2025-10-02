import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Car,
  MapPin,
  Building,
  Gift,
  Activity,
  MessageSquare,
  Calendar,
  CreditCard,
  Star,
  Home,
  LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate('/', { replace: true }), 50);
  };

  // Liens principaux admin
  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Tableau de bord' },
    { to: '/admin/offres', icon: Gift, label: 'Offres' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/admin/reservations', icon: Calendar, label: 'Réservations' },
    { to: '/admin/payements', icon: CreditCard, label: 'Payements' },
    { to: '/admin/commentaires', icon: CreditCard, label: 'Commentaires' },
    { to: '/admin/utilisateurs', icon: Star, label: 'Utilisateurs' },
  ];

  // Liens client
  const clientLinks = [
    { to: '/client', icon: Home, label: 'Accueil' },
    { to: '/client/offres', icon: Gift, label: 'Offres disponibles' },
    { to: '/client/reservation', icon: Calendar, label: 'Mes réservations' },
    { to: '/client/payements', icon: CreditCard, label: 'Payements' },
    { to: '/client/commentaires', icon: Star, label: 'Commentaires' },
    { to: '/client/messages', icon: MessageSquare, label: 'Messages' },
  ];

  // Sous-menu Services
  const servicesLinks = [
    { to: '/admin/hebergements', icon: Building, label: 'Hébergements' },
    { to: '/admin/voitures', icon: Car, label: 'Voitures' },
    { to: '/admin/activites', icon: Activity, label: 'Activités' },
    { to: '/admin/visites', icon: MapPin, label: 'Visites' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <div className="bg-white text-gray-800 w-64 h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          {/* Logo image */}
          <img 
            src="/images/accueil/logo.jpg"  // 👉 mets ici le chemin de ton logo
            alt="Logo Tsikidia Tour" 
            className="w-10 h-10 object-contain"
          />

          {/* Nom + sous-titre */}
          <div>
            <h1 className="text-2xl font-bold text-green-700">Tsikidia Tour</h1>
            <p className="text-sm text-gray-500">
              {isAdmin ? 'Administration' : 'Espace Client'}
            </p>
          </div>
        </div>


      {/* Menu links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {/* Tableau de bord toujours en haut */}
          {isAdmin && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green-700'
                  }`
                }
              >
                <Home className="w-5 h-5 mr-3" />
                Tableau de bord
              </NavLink>
            </li>
          )}

          {/* Services déroulant uniquement pour admin */}
          {isAdmin && (
            <li>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-700 transition-colors justify-between"
              >
                <span className="flex items-center">
                  <Activity className="w-5 h-5 mr-3" />
                  Services
                </span>
                <span>{isServicesOpen ? '▲' : '▼'}</span>
              </button>
              {isServicesOpen && (
                <ul className="pl-8 mt-1 space-y-1">
                  {servicesLinks.map((sublink) => (
                    <li key={sublink.to}>
                      <NavLink
                        to={sublink.to}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-green-100 text-green-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-green-700'
                          }`
                        }
                      >
                        <sublink.icon className="w-4 h-4 mr-2" />
                        {sublink.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}

          {/* Autres menus */}
          {links
            .filter((link) => link.to !== '/admin')
            .map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-green-700'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-green-700 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
