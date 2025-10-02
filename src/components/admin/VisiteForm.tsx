import React, { useEffect, useState } from 'react'; 
import { MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Visite } from '../../types';

interface Activite {
  id: number;
  nom: string;
  descriptionActivite: string;
}

interface Hebergement {
  id: number;
  nom: string;
}

interface VisiteFormProps {
  initialData?: Visite | null;
  onSuccess: (visite: Visite) => void;
  onCancel: () => void;
}

const VisiteForm: React.FC<VisiteFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Visite>({
    defaultValues: initialData || {}
  });

  const [activites, setActivites] = useState<Activite[]>([]);
  const [hebergements, setHebergements] = useState<Hebergement[]>([]);

  useEffect(() => { reset(initialData || {}); }, [initialData, reset]);

  useEffect(() => {
    axios.get("http://localhost:4005/activite/").then(res => setActivites(res.data || []));
    axios.get("http://localhost:4005/hebergement/").then(res => setHebergements(res.data || []));
  }, []);

  const submitForm = async (data: Visite) => {
    try {
      const response = initialData?.id 
        ? await axios.put(`http://localhost:4005/visite/${initialData.id}`, data)
        : await axios.post('http://localhost:4005/visite', data);

      if (response?.data) {
          onSuccess(response.data);
          setTimeout(() => reset(), 200); // reset après fermeture visuelle
       }
    } catch (err) {
      console.error('Erreur API:', err);
    }
  };

  return (
    <form 
      id="visiteForm"
      onSubmit={handleSubmit(submitForm)} 
      className="space-y-5"
    >
      {/* Ville */}
      <div className="relative">
        <input
          type="text"
          placeholder="Ville"
          {...register('ville', { required: 'La ville est requise' })}
          className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
        <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
          Ville
        </label>
        {errors.ville && <span className="text-red-500 text-xs">{errors.ville.message}</span>}
      </div>

      {/* Date de visite */}
      <div className="relative">
        <input
          type="date"
          placeholder="Date de visite"
          {...register('dateVisite', { required: 'La date est requise' })}
          className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
        <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
          Date de visite
        </label>
        {errors.dateVisite && <span className="text-red-500 text-xs">{errors.dateVisite.message}</span>}
      </div>

      {/* Ordre de visite */}
      <div className="relative">
        <input
          type="number"
          placeholder="Ordre de visite"
          {...register('ordreVisite', { required: "L'ordre est requis", min: { value: 1, message: "Au moins 1" } })}
          className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
        <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
          Ordre de visite
        </label>
        {errors.ordreVisite && <span className="text-red-500 text-xs">{errors.ordreVisite.message}</span>}
      </div>

      {/* Activité */}
      <div className="relative">
        <select
          {...register('activiteId', { required: "L'activité est requise" })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        >
          <option value="">-- Sélectionner une activité --</option>
          {activites.map(a => (
            <option key={a.id} value={a.id}>{a.descriptionActivite || a.nom}</option>
          ))}
        </select>
        {errors.activiteId && <span className="text-red-500 text-xs">{errors.activiteId.message}</span>}
      </div>

      {/* Hébergement */}
      <div className="relative">
        <select
          {...register('hebergementId', { required: "L'hébergement est requis" })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        >
          <option value="">-- Sélectionner un hébergement --</option>
          {hebergements.map(h => (
            <option key={h.id} value={h.id}>{h.nom}</option>
          ))}
        </select>
        {errors.hebergementId && <span className="text-red-500 text-xs">{errors.hebergementId.message}</span>}
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {initialData ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default VisiteForm;
