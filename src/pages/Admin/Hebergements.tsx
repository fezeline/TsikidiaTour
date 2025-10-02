import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import HebergementList from '../../components/admin/HebergementList';
import HebergementForm from '../../components/admin/HebergementForm';
import { mockHebergements } from '../../services/mockData';
import { Hebergement } from '../../types';

const Hebergements: React.FC = () => {
  const [hebergements, setHebergements] = useState<Hebergement[]>(mockHebergements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHebergement, setEditingHebergement] = useState<Hebergement | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFormSubmit = (data: Hebergement) => {
    if (editingHebergement) {
      setHebergements(prev =>
        prev.map(h => (h.id === editingHebergement.id ? { ...data, id: editingHebergement.id } : h))
      );
      showSuccess("Hébergement modifié avec succès !");
    } else {
      const newHebergement = { ...data, id: Math.max(...hebergements.map(h => h.id), 0) + 1 };
      setHebergements(prev => [...prev, newHebergement]);
      showSuccess("Hébergement ajouté avec succès !");
    }
    closeModal();
  };

const deleteHebergement = (id: number) => {
  // Au lieu de window.confirm, tu peux utiliser une confirmation React
  const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cet hébergement ?');
  if (confirmed) {
    setHebergements(prev => prev.filter(h => h.id !== id));
    showSuccess("Hébergement supprimé avec succès !");
  }
};


const showSuccess = (message: string) => {
  setSuccessMessage(message);
  setTimeout(() => setSuccessMessage(null), 3000);
};

  const openModal = (hebergement?: Hebergement) => {
    setEditingHebergement(hebergement || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHebergement(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Hébergements</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </button>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="text-center bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          {successMessage}
        </div>
      )}

      <HebergementList
        hebergements={hebergements}
        onEdit={openModal}
        onDelete={deleteHebergement}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[400px]">
            <h2 className="text-lg font-bold mb-4">
              {editingHebergement ? 'Modifier l\'hébergement' : 'Ajouter un hébergement'}
            </h2>
            <HebergementForm
              initialData={editingHebergement}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Hebergements;
