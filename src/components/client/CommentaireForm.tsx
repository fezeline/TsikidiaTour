import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Commentaire, Offre, User } from '../../types';
import axios from 'axios';
import { Star } from 'lucide-react';

interface CommentaireFormProps {
  commentaire?: Commentaire;
  onSubmit: (data: Commentaire) => Promise<void>;
  onCancel: () => void;
}


const CommentaireForm: React.FC<CommentaireFormProps> = ({ 
  commentaire, 
  onSubmit, 
  onCancel 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<Commentaire>();

  // Charger les offres et utilisateurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [offresResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:4005/offre/"),
          axios.get("http://localhost:4005/utilisateur/")
        ]);
        setOffres(offresResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Impossible de charger les données nécessaires");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Initialiser valeurs par défaut
  useEffect(() => {
    if (commentaire) {
      const formattedDate = commentaire.dateCommentaire.includes('T') 
        ? commentaire.dateCommentaire.split('T')[0] 
        : commentaire.dateCommentaire;
      reset({
        ...commentaire,
        dateCommentaire: formattedDate,
        notes: Number(commentaire.notes)
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      reset({
        dateCommentaire: today,
        contenuCommentaire: '',
        notes: 0,
        offreId: offres[0]?.id || undefined,
        utilisateurId: users[0]?.id || undefined,
      });
    }
  }, [commentaire, offres, users, reset]);

  // Appels API
  const postCommentaire = async (data: Commentaire) => {
    const payload = {
      ...data,
      notes: parseFloat(data.notes.toString()),
      dateCommentaire: new Date(data.dateCommentaire).toISOString(),
    };
    const res = await axios.post("http://localhost:4005/commentaire/", payload);
    return res.data;
  };

  const putCommentaire = async (data: Commentaire) => {
    const payload = {
      ...data,
      notes: parseFloat(data.notes.toString()),
      dateCommentaire: new Date(data.dateCommentaire).toISOString(),
    };
    const res = await axios.put(`http://localhost:4005/commentaire/${commentaire?.id}`, payload);
    return res.data;
  };

const onSubmitForm = async (data: Commentaire) => {
  setIsSubmitting(true);
  setError(null);
  setSuccessMessage(null);
  try {
    await onSubmit(data); // <-- appelle la fonction du parent
    setSuccessMessage(commentaire ? "Votre commentaire a été mis à jour !" : "Votre commentaire a été publié !");
    setTimeout(() => onCancel(), 1500); // ferme le modal automatiquement
  } catch (err: any) {
    setError(err.message || "Erreur lors de l'envoi");
  } finally {
    setIsSubmitting(false);
  }
};

  // Rendu étoiles
  const renderStarRating = () => {
    const current = watch('notes') || 0;
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setValue('notes', i + 1)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                i < current ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-400'
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({current}/5)</span>
      </div>
    );
  };

  if (loading) return <div className="text-center py-6">Chargement...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Sélection Offre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Offre</label>
        <select
          {...register('offreId', { valueAsNumber: true })}
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="">Sélectionnez une offre</option>
          {offres.map((offre) => (
            <option key={offre.id} value={offre.id}>{offre.titreOffre}</option>
          ))}
        </select>
      </div>

      {/* Sélection Utilisateur */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Utilisateur <span className="text-red-500">*</span>
        </label>
        <select
          {...register('utilisateurId', { required: 'Sélection obligatoire', valueAsNumber: true })}
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="">Sélectionnez un utilisateur</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.email}</option>
          ))}
        </select>
        {errors.utilisateurId && <p className="text-red-600 text-sm">{errors.utilisateurId.message}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
        <input
          type="date"
          {...register('dateCommentaire', { required: 'La date est obligatoire' })}
          className="w-full border px-3 py-2 rounded-md"
        />
        {errors.dateCommentaire && <p className="text-red-600 text-sm">{errors.dateCommentaire.message}</p>}
      </div>

      {/* Commentaire */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire *</label>
        <textarea
          rows={4}
          {...register('contenuCommentaire', { required: 'Le commentaire est requis', minLength: { value: 10, message: '10 caractères minimum' } })}
          className="w-full border px-3 py-2 rounded-md"
          placeholder="Partagez votre avis..."
        />
        {errors.contenuCommentaire && <p className="text-red-600 text-sm">{errors.contenuCommentaire.message}</p>}
      </div>

      {/* Notes étoiles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note *</label>
        {renderStarRating()}
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md">Annuler</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          {isSubmitting ? "Envoi..." : commentaire ? "Mettre à jour" : "Publier"}
        </button>
      </div>
    </form>
  );
};

export default CommentaireForm;
