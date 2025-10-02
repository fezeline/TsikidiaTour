import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import CommentaireList from '../../components/admin/CommentaireList';
import CommentaireForm from '../../components/client/CommentaireForm';
import { Commentaire } from '../../types';
import axios from 'axios';

const Commentaires: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommentaire, setEditingCommentaire] = useState<Commentaire | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openModal = (commentaire?: Commentaire) => {
    if (commentaire) {
      setEditingCommentaire(commentaire);
    } else {
      setEditingCommentaire(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCommentaire(null);
  };

  const handleSubmit = async (data: Commentaire) => {
    try {
      if (editingCommentaire) {
        await axios.put(`http://localhost:4005/commentaire/${editingCommentaire.id}`, data);
      } else {
        await axios.post("http://localhost:4005/commentaire/", data);
      }
      setRefreshTrigger(prev => prev + 1);
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du commentaire:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Commentaires</h1>
        </div>
      </div>

      <Card>
        <CommentaireList 
          onEdit={openModal} 
          refreshTrigger={refreshTrigger} 
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCommentaire ? 'Modifier le commentaire' : 'Ajouter un commentaire'}
      >
        <CommentaireForm
          commentaire={editingCommentaire || undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Commentaires;