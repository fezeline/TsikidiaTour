import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { LogIn, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, mot_de_passe);
      if (success) {
        const user = JSON.parse(localStorage.getItem('tsikidia_user') || '{}');
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/client');
        }
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/destination/centre.jpg')",
        animation: 'bg-pan 6s infinite alternate linear',
      }}
    >
      {/* Overlay animé */}
      <div className="absolute inset-0 bg-black bg-opacity-40 animate-pulseOverlay"></div>

      {/* Formulaire centré */}
      <div className="relative z-10 w-full max-w-md p-8 bg-black bg-opacity-40 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TsikiDia Tour</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre Email"
            required
            className="bg-white bg-opacity-90"
          />
          <Input
            label="Mot de passe"
            type="password"
            value={mot_de_passe}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="••••••••"
            required
            className="bg-white bg-opacity-90"
          />

          {/* Lien Mot de passe oublié */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-600 hover:text-blue-600 underline"
            >
              Mot de passe oublié ?
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 bg-opacity-50 text-white py-3 px-4 rounded-lg hover:bg-green-600 hover:bg-opacity-60 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>

      {/* Animations CSS */}
      <style>
        {`
          @keyframes bg-pan {
            0% { transform: scale(1) translate(0,0); }
            50% { transform: scale(1.05) translate(-10px, -10px); }
            100% { transform: scale(1.1) translate(-20px, -20px); }
          }

          @keyframes pulseOverlay {
            0%, 100% { background-color: rgba(0,0,0,0.4); }
            50% { background-color: rgba(0,0,0,0.2); }
          }

          .animate-pulseOverlay {
            animation: pulseOverlay 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
