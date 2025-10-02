import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import VisiteList from '../../components/admin/VisiteList';
import VisiteForm from '../../components/admin/VisiteForm';
import { mockVisites } from '../../services/mockData';
import { Visite } from '../../types';

const Visites: React.FC = () => {
  const [visites, setVisites] = useState<Visite[]>(mockVisites);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisite, setEditingVisite] = useState<Visite | null>(null);

  const handleFormSubmit = (data: Visite) => {
    if (editingVisite) {
      setVisites(prev => prev.map(v => v.id === editingVisite.id ? { ...data, id: editingVisite.id } : v));
    } else {
      const newVisite = { ...data, id: Math.max(...visites.map(v => v.id), 0) + 1 };
      setVisites(prev => [...prev, newVisite]);
    }
    closeModal();
  };

  const openModal = (visite?: Visite) => {
    setEditingVisite(visite || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVisite(null);
  };

  const deleteVisite = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette visite ?')) {
      setVisites(prev => prev.filter(v => v.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Visites</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter 
        </button>
      </div>

      <VisiteList
        visites={visites}
        onEdit={openModal}
        onDelete={deleteVisite}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[350px]">
            <h2 className="text-lg font-bold mb-4">
              {editingVisite ? 'Modifier la visite' : 'Ajouter une visite'}
            </h2>
            <VisiteForm
            initialData={editingVisite}
            onSuccess={handleFormSubmit}   // ✅ correction
            onCancel={closeModal}
           />

          </div>
        </div>
      )}
    </div>
  );
};

export default Visites;