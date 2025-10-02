import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, RefreshCw, Car, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { Voiture } from '../../types';

// props
interface VoitureListProps {
  voitures:Voiture[];
  onEdit: (voiture: Voiture) => void;
  onDelete: (id: number) => void;
}

const VoitureList: React.FC<VoitureListProps> = ({ onEdit, onDelete }) => {
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voitureToDelete, setVoitureToDelete] = useState<Voiture | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 🔹 État pour le message de confirmation (toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Dictionnaire marque → image
  const carImageMap: Record<string, string> = {
    mercedes: "/images/voiture/mercedes.jpg",
    karenjy: "/images/voiture/karenjy.jpg",
    toyota: "/images/voiture/toyota.jpg",
    bmw: "/images/voiture/bmw.jpg",
    // ajoute d'autres marques ici
  };

  const defaultCarImage = "/images/voiture/default.jpg";

  const getCarImage = (marque?: string) => {
    if (!marque) return defaultCarImage;
    const key = marque.toLowerCase();
    return carImageMap[key] || defaultCarImage;
  };

  const getVoitures = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:4005/voiture");

      let voituresData: Voiture[] = [];

      if (Array.isArray(res.data)) {
        voituresData = res.data;
      } else if (Array.isArray(res.data.voitures)) {
        voituresData = res.data.voitures;
      } else if (Array.isArray(res.data.data)) {
        voituresData = res.data.data;
      } else if (res.data && typeof res.data === "object") {
        voituresData = Object.values(res.data);
      } else {
        setError("Format de données inattendu");
        return;
      }

      setVoitures(voituresData);
    } catch (error: any) {
      setError(`Erreur de chargement: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (voiture: Voiture) => {
    setVoitureToDelete(voiture);
    setShowConfirmDialog(true);
  };

const handleDeleteConfirm = async () => {
  if (!voitureToDelete) return;

  try {
    // Assure-toi que l'ID est bien un nombre si ton backend attend un number
    await axios.delete(`http://localhost:4005/voiture/${voitureToDelete.id}`);

    // Supprime la voiture de l'état local
    setVoitures(voitures.filter(v => v.id !== voitureToDelete.id));

    // Affiche le toast
    showToast(`Voiture "${voitureToDelete.marque} ${voitureToDelete.modele}" supprimée ✅`);

    // Ferme le dialogue
    setShowConfirmDialog(false);
    setVoitureToDelete(null);
  } catch (error: any) {
    console.error(error);
    setError("Erreur lors de la suppression");
    setShowConfirmDialog(false);
  }
};


  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setVoitureToDelete(null);
  };

  useEffect(() => {
    getVoitures();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
        <span>Chargement des voitures...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={getVoitures}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (voitures.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Aucune voiture trouvée.</p>
        <button
          onClick={getVoitures}
          className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Actualiser
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-gray-800">Liste des voitures</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {voitures.map((voiture) => (
          <div
            key={voiture.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
              <div className="relative w-full h-full">
                <img
                  src={getCarImage(voiture.marque)}
                  alt={`${voiture.marque} ${voiture.modele}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultCarImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1">
                  ID: {voiture.id}
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {voiture.marque} {voiture.modele}
                </h3>
                <div className="flex flex-col items-end space-y-1">
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    Disponible
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {voiture.capacite} pers.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Immatriculation</span>
                  <span className="font-medium">{voiture.immatriculation}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Coût/jour</span>
                  <span className="font-medium">{voiture.coutParJours?.toLocaleString() ?? '-' } €</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Jours réservés</span>
                  <span className="font-medium">{voiture.nombreJours ?? '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium text-green-600">
                    {voiture.coutParJours && voiture.nombreJours
                      ? (voiture.coutParJours * voiture.nombreJours).toLocaleString()
                      : '-'} €
                  </span>
                </div>
              </div>

              <div className="flex justify-end items-center pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center"
                    onClick={() => onEdit(voiture)}
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center"
                    onClick={() => handleDeleteClick(voiture)}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && voitureToDelete && (
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
              Êtes-vous sûr de vouloir supprimer la voiture "{voitureToDelete.marque} {voitureToDelete.modele}" 
              ({voitureToDelete.immatriculation}) ?
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

{/* Toast confirmation */}
{toastMessage && (
  <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-600 bg-opacity-90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
    {toastMessage}
  </div>
)}

    </div>
  );
};

export default VoitureList;
