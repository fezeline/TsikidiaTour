import React, { useEffect, useState, useCallback } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import { Commentaire } from '../../types';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const headers = [
  'ID',
  'Utilisateur',
  'Offre ID',
  'Date du commentaire',
  'Contenu du commentaire',
  'Notes',
  'Actions'
];

interface CommentaireListProps {
  onEdit: (commentaire: Commentaire) => void;
  refreshTrigger: number;
}

const CommentaireList: React.FC<CommentaireListProps> = ({ onEdit, refreshTrigger }) => {
  const [allCommentaires, setAllCommentaires] = useState<Commentaire[]>([]);
  const [displayedCommentaires, setDisplayedCommentaires] = useState<Commentaire[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  const getCommentaires = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4005/commentaire/");
      if (res.data) setAllCommentaires(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCommentaires();
  }, [refreshTrigger, getCommentaires]);

  // Filtrer les commentaires selon le rôle
  useEffect(() => {
    if (!user) {
      setDisplayedCommentaires([]);
      return;
    }

    const role = user.role?.toUpperCase();
    const userId = Number(user.id);

    if (role === 'ADMIN') {
      // Admin voit tous les commentaires
      setDisplayedCommentaires(allCommentaires);
    } else if (role === 'CLIENT') {
      // Client voit seulement ses commentaires
      const clientComments = allCommentaires.filter(c => Number(c.utilisateurId) === userId);
      setDisplayedCommentaires(clientComments);
    } else {
      setDisplayedCommentaires([]);
    }
  }, [allCommentaires, user]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:4005/commentaire/${id}`);
      await getCommentaires();
    } catch (error) {
      console.error(error);
    } finally {
      setShowConfirm(false);
      setCommentToDelete(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow relative">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(header => (
              <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayedCommentaires.map(commentaire => {
            const isOwner = Number(commentaire.utilisateurId) === Number(user?.id);
            const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
            return (
              <tr key={commentaire.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{commentaire.id}</td>
                <td className="px-6 py-4">Utilisateur {commentaire.utilisateurId} {isOwner && <span className="ml-2 text-xs text-blue-600">(Vous)</span>}</td>
                <td className="px-6 py-4">{commentaire.offreId}</td>
                <td className="px-6 py-4">{new Date(commentaire.dateCommentaire).toLocaleString('fr-FR')}</td>
                <td className="px-6 py-4">{commentaire.contenuCommentaire}</td>
                <td className="px-6 py-4">{commentaire.notes}/5</td>
                <td className="px-6 py-4 flex space-x-2">
                  {/* Modifier seulement si client et propriétaire */}
                  {isOwner && !isAdmin && (
                    <button onClick={() => onEdit(commentaire)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {/* Supprimer si admin ou propriétaire */}
                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => { setCommentToDelete(commentaire.id); setShowConfirm(true); }}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
              <button onClick={() => setShowConfirm(false)}><X /></button>
            </div>
            <p>Voulez-vous vraiment supprimer ce commentaire ?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Annuler</button>
              <button onClick={() => commentToDelete && handleDelete(commentToDelete)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentaireList;
