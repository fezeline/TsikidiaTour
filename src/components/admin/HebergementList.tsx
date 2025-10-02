import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, MapPin, Star, X, AlertTriangle } from 'lucide-react';
import { Hebergement } from '../../types';
import axios from 'axios';
import HebergementForm from './HebergementForm';

// 📌 Dictionnaire des images par nom d'hébergement
const hebergementImages: Record<string, string> = {
  "hotel": "/images/hebergement/hotel.jpg",
  "resto": "/images/hebergement/resto.jpg",
  "default": "/images/hebergement/default.jpg"
};

interface HebergementListProps {
  hebergements:Hebergement[];
  onEdit: (hebergement: Hebergement) => void;
  onDelete: (id: number) => void;
}

const HebergementList: React.FC<HebergementListProps> = (onEdit,onDelete) => {
  const [hebergements, setHebergements] = useState<Hebergement[]>([]);
  const [editingHebergement, setEditingHebergement] = useState<Hebergement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [hebergementToDelete, setHebergementToDelete] = useState<Hebergement | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getHebergement = async () => {
    try {
      const res = await axios.get("http://localhost:4005/hebergement/");
      if (res.data) setHebergements(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des hébergements:", error);
    }
  };

  const handleDeleteClick = (hebergement: Hebergement) => {
    setHebergementToDelete(hebergement);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!hebergementToDelete) return;
    
    try {
      await axios.delete(`http://localhost:4005/hebergement/${hebergementToDelete.id}`);
      setHebergements(hebergements.filter(h => h.id !== hebergementToDelete.id));
      setShowConfirmDialog(false);
      setHebergementToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'hébergement:", error);
      alert("Erreur lors de la suppression de l'hébergement");
      setShowConfirmDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setHebergementToDelete(null);
  };

  const handleEdit = (hebergement: Hebergement) => {
    setEditingHebergement(hebergement);
    setShowForm(true);
  };

const handleSuccess = (updatedHebergement: Hebergement) => {
  const isEdit = !!editingHebergement; // vrai si on modifie, faux si on ajoute

  // Mettre à jour la liste
  setHebergements(prev => {
    if (isEdit) {
      return prev.map(h => (h.id === updatedHebergement.id ? updatedHebergement : h));
    } else {
      return [updatedHebergement, ...prev]; // ajouter au début
    }
  });

  // Fermer le formulaire avant d’afficher le message
  setEditingHebergement(null);
  setShowForm(false);

  // Afficher le message de succès au-dessus de la liste
  setSuccessMessage(isEdit
    ? "Hébergement modifié avec succès !"
    : "Hébergement ajouté avec succès !"
  );

  // Faire disparaître le message après 3 secondes
  setTimeout(() => setSuccessMessage(null), 3000);
};


  const handleCancel = () => {
    setEditingHebergement(null);
    setShowForm(false);
  };

  useEffect(() => {
    getHebergement();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10 relative">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        🌍 Liste des Hébergements
      </h1>

      {successMessage && (
        <div className="mb-4 text-center bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          {successMessage}
        </div>
    )}

      {/* Liste avec blur si modal ouvert */}
      <div className={showForm ? "blur-sm pointer-events-none" : ""}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {hebergements.map((hebergement) => (
            <div
              key={hebergement.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
            >
              {/* Image spécifique par nom */}
              <img
                src={hebergementImages[hebergement.nom?.toLowerCase()] || hebergementImages["default"]}
                alt={hebergement.nom}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  e.currentTarget.src = hebergementImages["default"];
                }}
              />

              {/* Infos */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{hebergement.nom}</h2>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: hebergement.etoile || 0 }, (_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-500" />
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" /> {hebergement.adresse}
                </p>
                <p className="text-gray-700">
                  Frais: <span className="font-bold">{hebergement.fraisParNuit?.toLocaleString() || '0'} €</span> / nuit
                </p>
                <p className="text-gray-700">Durée: {hebergement.nombreNuit} nuit(s)</p>
                <p className="text-gray-900 font-bold mt-2">
                  Total: {((hebergement.fraisParNuit || 0) * (hebergement.nombreNuit || 0)).toLocaleString()} €
                </p>

                {/* Boutons */}
                <div className="mt-auto pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center"
                    onClick={() => handleEdit(hebergement)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                   
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center"
                    onClick={() => handleDeleteClick(hebergement)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg">
            <HebergementForm
              initialData={editingHebergement}
              onSubmit={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && hebergementToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                Confirmer la suppression
              </h3>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'hébergement "{hebergementToDelete.nom}" ?
              {hebergementToDelete.adresse && (
                <span className="block mt-2 text-sm">📍 {hebergementToDelete.adresse}</span>
              )}
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
               
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HebergementList;