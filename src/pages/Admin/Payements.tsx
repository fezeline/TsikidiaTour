import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PaiementList from '../../components/admin/Payements';
import { mockPayements } from '../../services/mockData';
import { Payement } from '../../types';

const Paiements: React.FC = () => {
  const [paiements, setPaiements] = useState<Payement[]>(mockPayements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaiement, setEditingPaiement] = useState<Payement | null>(null);

  const handleFormSubmit = (data: Payement) => {
    if (editingPaiement) {
      setPaiements(prev => prev.map(p => p.id === editingPaiement.id ? { ...data, id: editingPaiement.id } : p));
    } else {
      const newPaiement = { ...data, id: Math.max(...paiements.map(p => p.id), 0) + 1 };
      setPaiements(prev => [...prev, newPaiement]);
    }
    closeModal();
  };

  const openModal = (paiement?: Payement) => {
    setEditingPaiement(paiement || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPaiement(null);
  };

  const deletePaiement = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      setPaiements(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
      </div>

      <PaiementList
        
        
      />
    </div>
  );
};

export default Paiements;