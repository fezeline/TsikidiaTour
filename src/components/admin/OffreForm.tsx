import React, { useEffect, useState } from "react";
import { Tag, X } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Offre } from "../../types";

interface OffreFormProps {
  initialData?: Offre | null;
  onSubmit: (data: Offre) => void;
  onCancel: () => void;
}

const OffreForm: React.FC<OffreFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Offre>({
    defaultValues: initialData || {}
  });

  const [visites, setVisites] = useState<any[]>([]);
  const [voitures, setVoitures] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    reset(initialData || {});
    if (initialData?.imagePrincipale) {
      setPreview(`data:image/jpeg;base64,${initialData.imagePrincipale}`);
    }
    axios.get("http://localhost:4005/visite").then(res => setVisites(res.data));
    axios.get("http://localhost:4005/voiture").then(res => setVoitures(res.data));
    
  }, [initialData, reset]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else setPreview(null);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const formatDate = (dateString: string) => new Date(dateString).toISOString().split("T")[0];

  const submitForm = async (data: Offre) => {
    setIsSubmitting(true);
    try {
      if (!imageFile && !initialData?.imagePrincipale) {
        alert("L'image principale est obligatoire !");
        setIsSubmitting(false);
        return;
      }

      const imageBase64 = imageFile
        ? (await fileToBase64(imageFile)).split(",")[1]
        : initialData?.imagePrincipale || "";

      const payload = {
        ...data,
        dateDepart: formatDate(data.dateDepart as string),
        dateRetour: formatDate(data.dateRetour as string),
        imagePrincipale: imageBase64,
        visiteId: data.visiteId ? Number(data.visiteId) : null,
        voitureId: data.voitureId ? Number(data.voitureId) : null,
        
      };

      const response = initialData?.id
        ? await axios.put(`http://localhost:4005/offre/${initialData.id}`, payload)
        : await axios.post("http://localhost:4005/offre", payload);

      if (response.data) {
        onSubmit(response.data);
        reset();
        setImageFile(null);
        setPreview(null);
      }
    } catch (err) {
      console.error("Erreur API :", err);
      alert("Une erreur est survenue lors de l'envoi du formulaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-y-auto max-h-[90vh] p-6 animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4">{initialData ? "Modifier l'offre" : "Ajouter une offre"}</h2>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          {/* Titre */}
          <div className="relative">
            <input
              placeholder="Titre"
              {...register("titreOffre", { required: "Le titre est requis" })}
              disabled={isSubmitting}
              className="peer block w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
              Titre *
            </label>
            {errors.titreOffre && <span className="text-red-500 text-xs">{errors.titreOffre.message}</span>}
          </div>

          {/* Prix et Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="Prix"
                {...register("prixParPers", { required: "Le prix est requis", valueAsNumber: true })}
                disabled={isSubmitting}
                className="peer block w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
                Prix par personne (€) *
              </label>
              {errors.prixParPers && <span className="text-red-500 text-xs">{errors.prixParPers.message}</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  {...register("dateDepart", { required: "Date de départ requise" })}
                  className="peer block w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  disabled={isSubmitting}
                />
                <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
                  Départ *
                </label>
              </div>
              <div className="relative">
                <input
                  type="date"
                  {...register("dateRetour", { required: "Date de retour requise" })}
                  className="peer block w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  disabled={isSubmitting}
                />
                <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
                  Retour *
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="relative">
            <textarea
              rows={3}
              placeholder="Description"
              {...register("descriptionOffre", { required: "La description est requise" })}
              className="peer block w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              disabled={isSubmitting}
            />
            <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
              Description *
            </label>
            {errors.descriptionOffre && <span className="text-red-500 text-xs">{errors.descriptionOffre.message}</span>}
          </div>

          {/* Durée et Places */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="number"
                placeholder="Durée"
                {...register("duree", { required: "Durée requise", valueAsNumber: true })}
                disabled={isSubmitting}
                className="peer block w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
                Durée (jours) *
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Places"
                {...register("placeDisponible", { required: "Nombre de places requis", valueAsNumber: true })}
                disabled={isSubmitting}
                className="peer block w-full rounded-lg border border-gray-300 px-3 pt-5 pb-2 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-600 peer-focus:text-sm">
                Places disponibles *
              </label>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image principale *</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => handleImageChange(e.target.files?.[0] || null)}
              className="mt-1 block w-full"
              disabled={isSubmitting}
            />
            {preview && <img src={preview} alt="Aperçu" className="mt-2 w-40 h-32 object-cover rounded shadow" />}
          </div>

          {/* Sélections */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Visite</label>
              <select {...register("visiteId")} className="mt-1 block w-full border rounded px-3 py-2" disabled={isSubmitting}>
                <option value="">Sélectionner une visite</option>
                {visites.map(v => <option key={v.id} value={v.id}>{v.ville}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Voiture</label>
              <select {...register("voitureId")} className="mt-1 block w-full border rounded px-3 py-2" disabled={isSubmitting}>
                <option value="">Sélectionner une voiture</option>
                {voitures.map(v => <option key={v.id} value={v.id}>{v.marque} {v.modele}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              {isSubmitting ? "Envoi..." : (initialData ? "Modifier" : "Ajouter")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OffreForm;
