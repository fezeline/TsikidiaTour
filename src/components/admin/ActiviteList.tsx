import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Calendar, MapPin, X, AlertTriangle } from 'lucide-react';
import { Activite } from '../../types';
import axios from 'axios';

interface ActiviteListProps {
  activites: Activite[];
  onEdit: (activite: Activite) => void;
  onDelete: (id: number) => void; 
}

const ActiviteList: React.FC<ActiviteListProps> = ({ onEdit, onDelete }) => {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [activiteToDelete, setActiviteToDelete] = useState<Activite | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const getActivite = async () => {
    try {
      const res = await axios.get("http://localhost:4005/activite/");
      if (res.data) setActivites(res.data);
    } catch (error) {
      console.error("Erreur API :", error);
    }
  };

  const handleDeleteClick = (activite: Activite) => {
    setActiviteToDelete(activite);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activiteToDelete) return;

    try {
      await axios.delete(`http://localhost:4005/activite/${activiteToDelete.id}`);
      setActivites(prev => prev.filter(a => a.id !== activiteToDelete.id));
      setShowConfirmDialog(false);
      onDelete(activiteToDelete.id); 
      setActiviteToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'activité:", error);
      alert("Erreur lors de la suppression de l'activité");
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setActiviteToDelete(null);
  };

  useEffect(() => {
    getActivite();
  }, []);

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-xl p-6">
      {/* 🔹 Ici on peut mettre un toast depuis le parent */}

      <table className="min-w-full border-collapse">
        <thead className="bg-white text-black">
          <tr>
            <th className="px-6 py-3 text-left">Description</th>
            <th className="px-6 py-3 text-left">Date</th>
            <th className="px-6 py-3 text-left">Lieu</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activites.map((activite) => (
            <tr key={activite.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4">{activite.descriptionActivite}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>
                    {activite.dateActivite
                      ? new Date(activite.dateActivite).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                      : "-"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>{activite.lieuActivite}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => onEdit(activite)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center inline-flex"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(activite)}
                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center inline-flex"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                  </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && activiteToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                Confirmer la suppression
              </h3>
              <button onClick={handleDeleteCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'activité "{activiteToDelete.descriptionActivite}" à {activiteToDelete.lieuActivite} ?
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
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiviteList;
