import React from 'react';
import { Car } from 'lucide-react';
import { Voiture } from '../../types';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface VoitureFormProps {
  initialData?: Voiture | null;
  onSubmit: (data: Voiture) => void;
  onCancel: () => void;
}

const VoitureForm: React.FC<VoitureFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Voiture>({ defaultValues: initialData || {} });

  React.useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  const handleFormSubmit = async (formData: Voiture) => {
    try {
      if (initialData && initialData.id) {
        const req = await axios.put(`http://localhost:4005/voiture/${initialData.id}`, formData);
        onSubmit(req.data);
      } else {
        const req = await axios.post("http://localhost:4005/voiture/", formData);
        onSubmit(req.data);
      }
    } catch (error: any) {
      console.error("Erreur :", error);
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-scaleIn">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {initialData ? 'Modifier la voiture' : 'Ajouter une voiture'}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/** Input flottant moderne */}
          {[
            { name: 'immatriculation', label: 'Immatriculation', type: 'text', pattern: /^[A-Z0-9-]+$/, required: true },
            { name: 'marque', label: 'Marque', type: 'text', minLength: 2, required: true },
            { name: 'modele', label: 'Modèle', type: 'text', minLength: 1, required: true },
            { name: 'capacite', label: 'Capacité (personnes)', type: 'number', min: 1, max: 20, required: true },
            { name: 'coutParJours', label: 'Coût par jour (€)', type: 'number', min: 0.01, step: 0.01, required: true },
            { name: 'nombreJours', label: 'Nombre de jours', type: 'number', min: 1 },
          ].map((field) => (
            <div key={field.name} className="relative">
             <input
                type={field.type}
                step={field.step} 
                min={field.min} 
                max={field.max}
                {...register(field.name as keyof Voiture, {
                  required: field.required ? `Le champ ${field.label} est requis` : false,
                  minLength: field.minLength,
                  pattern: field.pattern && { value: field.pattern, message: 'Format invalide' },
                  min: field.type === 'number' ? undefined : field.min, 
                  max: field.type === 'number' ? undefined : field.max, 
                })}
                className={`peer block w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`}
                placeholder={field.label}
              />
              <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
                {field.label}
              </label>
              {errors[field.name as keyof Voiture] && (
                <span className="text-red-500 text-xs mt-1 block">
                  {errors[field.name as keyof Voiture]?.message as string}
                </span>
              )}
            </div>
          ))}

            <div className="flex justify-end space-x-3 pt-4">
             <button
             type="button"
             onClick={onCancel}
             disabled={isSubmitting}
             className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
               Annuler
              </button>
              <button
               type="submit"
               disabled={isSubmitting}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {isSubmitting ? (
           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                  <Car className="w-4 h-4 mr-2" />
              )}
               {initialData ? 'Modifier' : 'Ajouter'}
             </button>
           </div>

        </form>
      </div>
    </div>
  );
};

export default VoitureForm;
