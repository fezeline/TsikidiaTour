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
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate('/', { replace: true }), 50);
  };

  const confirmLogout = () => setShowConfirm(true);
  const cancelLogout = () => setShowConfirm(false);
  const proceedLogout = () => {
    setShowConfirm(false);
    handleLogout();
  };

  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Tableau de bord' },
    { to: '/admin/offres', icon: Gift, label: 'Offres' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/admin/reservations', icon: Calendar, label: 'Réservations' },
    { to: '/admin/payements', icon: CreditCard, label: 'Payements' },
    { to: '/admin/commentaires', icon: CreditCard, label: 'Commentaires' },
    { to: '/admin/utilisateurs', icon: Star, label: 'Utilisateurs' },
  ];

  const clientLinks = [
    { to: '/client', icon: Home, label: 'Accueil' },
    { to: '/client/offres', icon: Gift, label: 'Offres disponibles' },
    { to: '/client/reservation', icon: Calendar, label: 'Mes réservations' },
    { to: '/client/payements', icon: CreditCard, label: 'Payements' },
    { to: '/client/commentaires', icon: Star, label: 'Commentaires' },
    { to: '/client/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const servicesLinks = [
    { to: '/admin/hebergements', icon: Building, label: 'Hébergements' },
    { to: '/admin/voitures', icon: Car, label: 'Voitures' },
    { to: '/admin/activites', icon: Activity, label: 'Activités' },
    { to: '/admin/visites', icon: MapPin, label: 'Visites' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <>
      {/* === SIDEBAR === */}
      <div className="bg-white text-gray-800 w-64 h-screen flex flex-col shadow-lg">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <img
            src="/images/accueil/logo.jpg"
            alt="Logo Tsikidia Tour"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-green-700">Tsikidia Tour</h1>
            <p className="text-sm text-gray-500">
              {isAdmin ? 'Administration' : 'Espace Client'}
            </p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
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

        {/* DÉCONNEXION */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={confirmLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-green-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* === MODALE DE CONFIRMATION === */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center w-80">
            <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment vous déconnecter ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={proceedLogout}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
