import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ActiviteList from '../../components/admin/ActiviteList';
import ActiviteForm from '../../components/admin/ActiviteForm';
import { mockActivites } from '../../services/mockData';
import { Activite } from '../../types';

const Activites: React.FC = () => {
  const [activites, setActivites] = useState<Activite[]>(mockActivites);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivite, setEditingActivite] = useState<Activite | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); // disparaît après 3 secondes
  };

  const handleFormSubmit = (data: Activite, successMsg: string) => {
    if (editingActivite) {
      setActivites(prev =>
        prev.map(a => (a.id === editingActivite.id ? { ...data, id: editingActivite.id } : a))
      );
    } else {
      const newActivite = { ...data, id: Math.max(...activites.map(a => a.id), 0) + 1 };
      setActivites(prev => [...prev, newActivite]);
    }
    showToast(successMsg); // toast en haut de la liste
    closeModal();
  };

  const openModal = (activite?: Activite) => {
    setEditingActivite(activite || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingActivite(null);
  };

  const handleDelete = (id: number) => {
    // suppression directe
    setActivites(prev => prev.filter(a => a.id !== id));
    showToast("Activité supprimée avec succès ✅");
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Activités</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter 
        </button>
      </div>

      {/* 🔹 Toast juste au-dessus de la liste */}
      {toastMessage && (
        <div className="px-6 py-3 rounded-lg text-green-600 font-semibold bg-black bg-opacity-10 shadow-md animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Liste des activités */}
      <ActiviteList
        activites={activites}
        onEdit={openModal}
        onDelete={handleDelete} // suppression sans window.confirm, toast en haut
      />

      {isModalOpen && (
        <ActiviteForm
          initialData={editingActivite}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};

export default Activites;
