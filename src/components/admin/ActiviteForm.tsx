// ActiviteForm.tsx
import React, { useEffect, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Activite } from '../../types';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface ActiviteFormProps {
  initialData?: Activite | null;
  onSubmit: (data: Activite, successMsg: string) => void; 
  onCancel: () => void;
}

const ActiviteForm: React.FC<ActiviteFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Activite>({
    defaultValues: initialData || {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  const handleFormSubmit = async (formData: Activite) => {
    setIsSubmitting(true);
    try {
      const isEdit = !!initialData?.id;
      let response;
      if (isEdit) {
        response = await axios.put(`http://localhost:4005/activite/${initialData!.id}`, formData);
      } else {
        response = await axios.post("http://localhost:4005/activite/", formData);
      }

      const successMsg = isEdit 
        ? "Activité modifiée avec succès !" 
        : "Activité ajoutée avec succès !";

      // on passe le message de succès au parent
      onSubmit(response.data, successMsg);

    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      alert("Une erreur est survenue !");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg overflow-y-auto max-h-[90vh] p-6">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Modifier l’activité" : "Ajouter une activité"}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="relative">
            <input
              placeholder="Description"
              {...register('descriptionActivite', { required: 'La description est requise' })}
              disabled={isSubmitting}
              className="peer block w-full rounded-lg border px-3 pt-5 pb-2"
            />
            {errors.descriptionActivite && <span className="text-red-500 text-xs">{errors.descriptionActivite.message}</span>}
          </div>

          <div className="relative">
            <input
              type="date"
              placeholder="Date"
              {...register('dateActivite', { required: 'La date est requise' })}
              disabled={isSubmitting}
              className="peer block w-full rounded-lg border px-3 pt-5 pb-2"
            />
            {errors.dateActivite && <span className="text-red-500 text-xs">{errors.dateActivite.message}</span>}
          </div>

          <div className="relative">
            <input
              placeholder="Lieu"
              {...register('lieuActivite', { required: 'Le lieu est requis' })}
              disabled={isSubmitting}
              className="peer block w-full rounded-lg border px-3 pt-5 pb-2"
            />
            {errors.lieuActivite && <span className="text-red-500 text-xs">{errors.lieuActivite.message}</span>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {initialData ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActiviteForm;
