import React, { useEffect, useState } from "react";
import { Edit2, Trash2, X, AlertTriangle } from "lucide-react";
import { Offre } from "../../types";
import axios from "axios";
//import OffreForm from "./OffreForm";

// Fonction utilitaire pour convertir Buffer en base64
const bufferToBase64 = (bufferObj: any): string => {
  if (!bufferObj || typeof bufferObj !== "object") return "";

  try {
    const bufferValues = Object.values(bufferObj);
    const uint8Array = new Uint8Array(bufferValues as number[]);
    let binary = "";
    uint8Array.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  } catch (error) {
    console.error("Erreur de conversion Buffer vers base64:", error);
    return "";
  }
};

interface OffreListProps {
  offres?: Offre[];
  onEdit?: (offre: Offre) => void;
  onDelete?: (id: number) => void;
}

const OffreList: React.FC<OffreListProps> = ({ offres: offresProp, onEdit, onDelete }) => {
  const [offresLocal, setOffresLocal] = useState<Offre[]>(offresProp || []);
  //const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [offreToDelete, setOffreToDelete] = useState<Offre | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchTitre, setSearchTitre] = useState("");
  const [notification, setNotification] = useState<{ message: string; type?: "success" | "error" } | null>(null);

const showNotification = (message: string, type: "success" | "error" = "success") => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 3000); // disparait après 3 secondes
};


const getOffre = async () => {
    try {
      const res = await axios.get("http://localhost:4005/offre/");
      if (res.data) {
        const offresAvecImages = res.data.map((offre: any) => ({
          ...offre,
          imagePrincipale:
            offre.imagePrincipale && typeof offre.imagePrincipale === "object"
              ? bufferToBase64(offre.imagePrincipale)
              : offre.imagePrincipale,
        }));
        setOffresLocal(offresAvecImages);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des offres :", error);
    }
};

const handleDeleteClick = (offre: Offre) => {
    setOffreToDelete(offre);
    setShowConfirmDialog(true);
};

const handleDeleteConfirm = async () => {
  if (!offreToDelete) return;
  
  try {
    await axios.delete(`http://localhost:4005/offre/${offreToDelete.id}`);
    setOffresLocal(prev => prev.filter(h => h.id !== offreToDelete.id));
    setShowConfirmDialog(false);
    showNotification("Offre supprimée avec succès !");
    if (onDelete) onDelete(offreToDelete.id);
    setOffreToDelete(null);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'offre :", error);
    showNotification("Erreur lors de la suppression de l'offre.", "error");
    setShowConfirmDialog(false);
  }
};

const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setOffreToDelete(null);
};

const handleEditClick = (offre: Offre) => {
    if (onEdit) {
      onEdit(offre);
    } else {
      showNotification("Aucun gestionnaire d'édition fourni.", "error");
    }
};

useEffect(() => {
    getOffre();
  }, []);

return (
    <div className="p-6 relative">
    
      <div className="mb-6 flex justify-end">
        <input
          type="text"
          value={searchTitre}
          onChange={(e) => setSearchTitre(e.target.value)}
          placeholder="Rechercher par titre..."
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full sm:w-64"
        />
      </div>
          {notification && (
            <div
              className={`fixed top-5 right-5 z-50 px-4 py-2 rounded shadow-lg text-white 
                ${notification.type === "success" 
                  ? "bg-green-500/70"   
                  : "bg-red-500/80"     
                }`}
              style={{ minWidth: "200px", textAlign: "right" }} 
            >
              {notification.message}
            </div>
          )}

      {/* Liste d'offres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offresLocal
          .filter((offre) =>
            offre.titreOffre.toLowerCase().includes(searchTitre.toLowerCase())
          )
          .map((offre) => (

          <div
            key={offre.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 p-4 flex flex-col"
          >
            {offre.imagePrincipale ? (
              <img
                src={`data:image/jpeg;base64,${offre.imagePrincipale}`}
                alt={offre.titreOffre}
                className="w-full h-40 sm:h-48 object-cover rounded-xl mb-4 transition duration-300 hover:scale-105"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                Pas d'image
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900">{offre.titreOffre}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{offre.descriptionOffre ?? "Aucune description"}</p>

            <div className="mt-3 text-gray-800 font-medium">
              {offre.prixParPers ? `${offre.prixParPers.toLocaleString()} € / personne` : "-"}
            </div>

            <div className="mt-2 text-sm text-gray-500">
              📅 Départ: {new Date(offre.dateDepart).toLocaleDateString()}<br />
              🔙 Retour: {new Date(offre.dateRetour).toLocaleDateString()}<br />
              ⏳ Durée: {offre.duree} jours<br />
              👥 Places: {offre.placeDisponible}
            </div>

            <div className="mt-3 text-sm text-gray-700 space-y-1">
              🏞️ Visite: {offre.visite ? offre.visite.ville : "Aucune visite liée"}<br />
              🚗 Voiture: {offre.voiture ? offre.voiture.marque : "Aucune voiture liée"}<br />
             
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                className="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center"
                onClick={() => handleEditClick(offre)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
              </button>
              <button
                className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center"
                onClick={() => handleDeleteClick(offre)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Boîte de dialogue de confirmation */}
      {showConfirmDialog && offreToDelete && (
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
              Êtes-vous sûr de vouloir supprimer l'offre "{offreToDelete.titreOffre}" ?
              <span className="block mt-2 text-sm">
                💰 Prix: {offreToDelete.prixParPers?.toLocaleString() || '0'} €/personne
                <br />
                📅 Durée: {offreToDelete.duree} jours
                <br />
                👥 Places disponibles: {offreToDelete.placeDisponible}
              </span>
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

export default OffreList;