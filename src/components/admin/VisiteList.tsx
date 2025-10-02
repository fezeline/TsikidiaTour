import React, { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, X, AlertTriangle } from "lucide-react";
import { Visite } from "../../types";
import axios from "axios";
import VisiteForm from "./VisiteForm";

interface VisiteListProps {
  visites:Visite[];
  onEdit: (visite: Visite) => void;
  onDelete: (id: number) => void;
}

const VisiteList: React.FC<VisiteListProps> = (onEdit, onDelete) => {
  const [visites, setVisites] = useState<Visite[]>([]);
  const [editingVisite, setEditingVisite] = useState<Visite | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [visiteToDelete, setVisiteToDelete] = useState<Visite | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Images associées aux visites - stockées dans public/images/visites/
  const visiteImages: Record<string, string> = {
    "antsirabe": "/images/visite/antsirabe.jpg",
    "tulear": "/images/visite/tulear.jpg",
    "tana": "/images/visite/tana.jpg",
    "default": "/images/visite/default.jpg"
  };

  // Fonction qui retourne l'image à afficher basée sur la ville
  const getVisiteImage = (ville: string): string => {
    if (!ville) return visiteImages["default"];
    
    const normalizedVille = ville.toLowerCase().trim();
    
    // Cherche une correspondance exacte
    if (visiteImages[normalizedVille]) {
      return visiteImages[normalizedVille];
    }
    
    // Cherche une correspondance partielle
    for (const [key, value] of Object.entries(visiteImages)) {
      if (normalizedVille.includes(key) || key.includes(normalizedVille)) {
        return value;
      }
    }
    
    return visiteImages["default"];
  };

  const getVisites = async () => {
    try {
      const res = await axios.get("http://localhost:4005/visite/");
      if (res.data) setVisites(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des visites:", error);
    }
  };

  const handleDeleteClick = (visite: Visite) => {
    setVisiteToDelete(visite);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!visiteToDelete) return;
    
    try {
      await axios.delete(`http://localhost:4005/visite/${visiteToDelete.id}`);
      setVisites(visites.filter((v) => v.id !== visiteToDelete.id));
      setShowConfirmDialog(false);
      setVisiteToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la visite:", error);
      alert("Erreur lors de la suppression de la visite");
      setShowConfirmDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setVisiteToDelete(null);
  };

  const handleEdit = (visite: Visite) => {
    setEditingVisite(visite);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingVisite(null);
    setShowForm(true);
  };

  const handleSuccess = (updatedVisite: Visite) => {
    if (editingVisite) {
      // Modification
      setVisites((prev) =>
        prev.map((v) => (v.id === updatedVisite.id ? updatedVisite : v))
      );
    } else {
      // Création
      setVisites((prev) => [...prev, updatedVisite]);
    }
    setEditingVisite(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setEditingVisite(null);
    setShowForm(false);
  };

  useEffect(() => {
    getVisites();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative">

      {/* Liste */}
      <div className={`${showForm ? "blur-sm pointer-events-none" : ""}`}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🌍 Liste des Visites
          </h2>

          {visites.length === 0 ? (
            <p className="text-center text-gray-600">Aucune visite trouvée.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visites.map((visite) => (
                <div
                  key={visite.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-2 hover:shadow-xl duration-300 flex flex-col"
                >
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${getVisiteImage(visite.ville)}')`,
                    }}
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{visite.ville}</h3>

                    <p className="text-sm mb-1 text-gray-600">
                      📅{" "}
                      <span className="font-medium">
                        {new Date(visite.dateVisite).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-sm mb-1 text-gray-600">
                      🔢 Ordre de visite :{" "}
                      <span className="font-medium">{visite.ordreVisite}</span>
                    </p>
                    {visite.activiteId && (
                      <p className="text-sm mb-1 text-gray-600">
                        🏷 Activité ID :{" "}
                        <span className="font-medium">{visite.activiteId}</span>
                      </p>
                    )}
                    {visite.hebergementId && (
                      <p className="text-sm mb-1 text-gray-600">
                        🏨 Hébergement ID :{" "}
                        <span className="font-medium">{visite.hebergementId}</span>
                      </p>
                    )}

                    <div className="mt-auto pt-4 flex justify-end space-x-2">
                      <button
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                        onClick={() => handleEdit(visite)}
                      >
                        <Edit2 className="w-4 h-4" /> 
                       
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        onClick={() => handleDeleteClick(visite)}
                      >
                        <Trash2 className="w-4 h-4" /> 
                    
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <VisiteForm
              initialData={editingVisite}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && visiteToDelete && (
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
              Êtes-vous sûr de vouloir supprimer la visite à "{visiteToDelete.ville}" 
              prévue le {visiteToDelete.dateVisite ? new Date(visiteToDelete.dateVisite).toLocaleDateString() : 'date non spécifiée'} ?
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

export default VisiteList;