import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import OffreList from '../../components/admin/OffreList';
import OffreForm from '../../components/admin/OffreForm';
import { mockOffres } from '../../services/mockData';
import { Offre } from '../../types';

const Offres: React.FC = () => {
  const [offres, setOffres] = useState<Offre[]>(mockOffres);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null); // ✅ toast state

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); // disparaît après 3 secondes
  };

  const handleFormSubmit = (data: Offre) => {
    if (editingOffre) {
      setOffres(prev => prev.map(o => o.id === editingOffre.id ? { ...data, id: editingOffre.id } : o));
      showToast("Offre modifiée avec succès ✅");
    } else {
      const newOffre = { ...data, id: Math.max(...offres.map(o => o.id), 0) + 1 };
      setOffres(prev => [...prev, newOffre]);
      showToast("Offre ajoutée avec succès ✅");
    }
    closeModal();
  };

  const openModal = (offre?: Offre) => {
    setEditingOffre(offre || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffre(null);
  };

  const deleteOffre = (id: number) => {
    setOffres(prev => prev.filter(o => o.id !== id));
    showToast("Offre supprimée avec succès ✅");
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">✨ Nos Offres ✨</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter 
        </button>
      </div>

      {/* 🔹 Toast */}
      {toastMessage && (
        <div className="px-6 py-3 rounded-lg text-green-700 font-semibold bg-black bg-opacity-10 shadow-md animate-fadeIn absolute top-0 left-1/2 transform -translate-x-1/2 z-50">
          {toastMessage}
        </div>
      )}

      <OffreList
        offres={offres}
        onEdit={openModal}
        onDelete={deleteOffre} // suppression + toast
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[500px]">
            <h2 className="text-lg font-bold mb-4">
              {editingOffre ? 'Modifier l\'offre' : 'Ajouter une offre'}
            </h2>
            <OffreForm
              initialData={editingOffre}
              onSubmit={handleFormSubmit} // ✅ utilise handleFormSubmit
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Offres;
