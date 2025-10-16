import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import axios from 'axios';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    confirmPassword: '',
    contact: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Animation de l'image
  useEffect(() => {
    let direction = 1;
    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.x + 0.2 * direction;
        let newY = prev.y + 0.1 * direction;
        if (Math.abs(newX) > 20) direction *= -1;
        return { x: newX, y: newY };
      });
    }, 10);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.role) {
      setError('Veuillez sélectionner un rôle');
      setLoading(false);
      return;
    }
    if (formData.mot_de_passe !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    if (formData.mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...apiData } = formData;
      const response = await axios.post('http://localhost:4005/api/auth/register', apiData, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 201) {
        navigate('/login', { state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' } });
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 409) setError('Cet email est déjà utilisé');
        else if (err.response.status === 400) setError('Données invalides');
        else setError('Une erreur est survenue lors de l\'inscription');
      } else if (err.request) setError('Problème de connexion. Veuillez vérifier votre connexion internet.');
      else setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Fond d'image animé */}
      <img
        src="/images/accueil/logo.jpg"
        alt="Logo Tsikidia"
        className="absolute w-full h-full object-cover opacity-20"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.03s linear'
        }}
      />

      {/* Overlay pour lisibilité */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Contenu du formulaire */}
      <div className="relative z-10 max-w-md w-full px-4">
        <div className="text-center mb-8">
          <p className="text-white text-lg">Créez votre compte </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Nom complet" name="nom" value={formData.nom} onChange={handleChange} placeholder="Votre nom complet" required />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
            <Input label="Contact" name="contact" value={formData.contact} onChange={handleChange} placeholder="+261 34 00 000 00" required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                
                <option value="CLIENT">CLIENT</option>
                
              </select>
            </div>

            <div className="relative">
              <Input label="Mot de passe" type={showPassword ? 'text' : 'password'} name="mot_de_passe" value={formData.mot_de_passe} onChange={handleChange} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input label="Confirmer le mot de passe" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{error}</p></div>}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
