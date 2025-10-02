import React, { useEffect } from "react";
import { Building } from "lucide-react";
import { Hebergement } from "../../types";
import { useForm } from "react-hook-form";

interface HebergementFormProps {
  initialData?: Hebergement | null;
  onSubmit: (data: Hebergement) => void;
  onCancel: () => void;
}

const HebergementForm: React.FC<HebergementFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Hebergement>({
    defaultValues: initialData || {}
  });
  

  useEffect(() => {
    reset(initialData || {});
  }, [initialData, reset]);

  const onSubmitForm = async (data: Hebergement) => {
    try {
      const response = await fetch(
        initialData?.id 
          ? `http://localhost:4005/hebergement/${initialData.id}`
          : "http://localhost:4005/hebergement/",
        {
          method: initialData?.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();
      onSubmit(data);
    } catch (err) {
      console.error("Erreur API Hebergement:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
      {/* Nom */}
      <div className="relative">
        <input
          placeholder="Nom"
          {...register("nom", { required: "Le nom est requis" })}
          className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
        <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
          Nom
        </label>
        {errors.nom && <span className="text-red-500 text-xs">{errors.nom.message}</span>}
      </div>

      {/* Adresse */}
      <div className="relative">
        <input
          placeholder="Adresse"
          {...register("adresse", { required: "L'adresse est requise" })}
          className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
        <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
          Adresse
        </label>
        {errors.adresse && <span className="text-red-500 text-xs">{errors.adresse.message}</span>}
      </div>

      {/* Étoiles */}
      <div className="relative">
        <select
          {...register("etoile", { required: "Le nombre d'étoiles est requis", valueAsNumber: true })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        >
          <option value="">Sélectionner</option>
          {[1,2,3,4,5].map(n => (
            <option key={n} value={n}>{n} {n>1 ? "étoiles" : "étoile"}</option>
          ))}
        </select>
        {errors.etoile && <span className="text-red-500 text-xs">{errors.etoile.message}</span>}
      </div>

      {/* Frais par nuit */}
      <div className="relative">
        <input
          type="number"
          placeholder="Frais par nuit"
          {...register("fraisParNuit", {
            required: "Les frais par nuit sont requis",
            min: { value: 1, message: "Les frais doivent être supérieurs à 0" },
            valueAsNumber: true
          })}
          className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
        <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
          Frais par nuit (€)
        </label>
        {errors.fraisParNuit && <span className="text-red-500 text-xs">{errors.fraisParNuit.message}</span>}
      </div>

      {/* Nombre de nuits */}
      <div className="relative">
        <input
          type="number"
          placeholder="Nombre de nuits"
          {...register("nombreNuit", {
            required: "Le nombre de nuits est requis",
            min: { value: 1, message: "Le nombre de nuits doit être au moins 1" },
            valueAsNumber: true
          })}
          className="peer w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
        <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
          Nombre de nuits
        </label>
        {errors.nombreNuit && <span className="text-red-500 text-xs">{errors.nombreNuit.message}</span>}
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
          <Building className="w-4 h-4 mr-2" />
          {initialData ? "Modifier" : "Ajouter"}
        </button>
      </div>
    </form>
  );
};

export default HebergementForm;
