import React, { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import VoitureList from '../../components/admin/VoitureList';
import VoitureForm from '../../components/admin/VoitureForm';
import { mockVoitures } from '../../services/mockData';
import { Voiture } from '../../types';

const Voitures: React.FC = () => {
  const [voitures, setVoitures] = useState<Voiture[]>(mockVoitures);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoiture, setEditingVoiture] = useState<Voiture | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fonction pour afficher le toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); // disparaît après 3 secondes
  };

  // Soumission du formulaire (ajout / modification)
  const handleFormSubmit = (data: Voiture) => {
    if (editingVoiture) {
      setVoitures(prev => prev.map(v => v.id === editingVoiture.id ? { ...data, id: editingVoiture.id } : v));
      showToast(`Voiture "${data.marque} ${data.modele}" modifiée ✅`);
    } else {
      const newVoiture = { ...data, id: Math.max(...voitures.map(v => v.id), 0) + 1 };
      setVoitures(prev => [...prev, newVoiture]);
      showToast(`Voiture "${data.marque} ${data.modele}" ajoutée ✅`);
    }
    closeModal();
  };

  const openModal = (voiture?: Voiture) => {
    setEditingVoiture(voiture || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVoiture(null);
  };

  // Suppression avec confirmation toast
  const deleteVoiture = (id: number) => {
    const voiture = voitures.find(v => v.id === id);
    if (!voiture) return;

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la voiture "${voiture.marque} ${voiture.modele}" ?`)) {
      setVoitures(prev => prev.filter(v => v.id !== id));
      showToast(`Voiture "${voiture.marque} ${voiture.modele}" supprimée ✅`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Voitures</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter 
        </button>
      </div>

      {/* 🔹 Toast au-dessus de la liste */}
      {toastMessage && (
        <div className="mb-4 px-6 py-3 rounded-lg bg-black bg-opacity-10 text-green-600 font-semibold flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Liste des voitures */}
      <VoitureList
        voitures={voitures}
        onEdit={openModal}
        onDelete={deleteVoiture}
      />

      {/* Modal ajout / modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[350px]">
            <h2 className="text-lg font-bold mb-4">
              {editingVoiture ? 'Modifier la voiture' : 'Ajouter une voiture'}
            </h2>
            <VoitureForm
              initialData={editingVoiture}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Voitures;
