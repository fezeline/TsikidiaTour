import React, { useEffect, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
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
  showOnlyUserComments?: boolean;
}

const CommentaireList: React.FC<CommentaireListProps> = ({ 
  onEdit, 
  refreshTrigger, 
  showOnlyUserComments = false 
}) => {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [filteredCommentaires, setFilteredCommentaires] = useState<Commentaire[]>([]);
  const { user } = useAuth();
  const [userNames, setUserNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  // Récupérer les commentaires depuis l'API
  const getCommentaires = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4005/commentaire/");
      if (res.data) {
        setCommentaires(res.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le nom de l'utilisateur
  const getUserName = async (userId: number) => {
    try {
      const res = await axios.get(`http://localhost:4005/utilisateur/${userId}`);
      return res.data.nom || res.data.email || `Utilisateur ${userId}`;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return `Utilisateur ${userId}`;
    }
  };

  // Charger les noms d'utilisateurs
  useEffect(() => {
    const loadUserNames = async () => {
      const uniqueUserIds = [...new Set(commentaires.map(c => c.utilisateurId))];
      const names: Record<number, string> = {};
      
      for (const userId of uniqueUserIds) {
        names[userId] = await getUserName(userId);
      }
      
      setUserNames(names);
    };

    if (commentaires.length > 0) {
      loadUserNames();
    }
  }, [commentaires]);

  // Filtrer les commentaires selon l'utilisateur connecté
  useEffect(() => {
    if (showOnlyUserComments && user) {
      // Conversion des IDs en nombres pour la comparaison
      const userIdNumber = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      
      // Filtrer pour n'afficher que les commentaires de l'utilisateur connecté
      const userComments = commentaires.filter(commentaire => {
        const commentUserId = typeof commentaire.utilisateurId === 'string' 
          ? parseInt(commentaire.utilisateurId) 
          : commentaire.utilisateurId;
        
        return commentUserId === userIdNumber;
      });
      
      setFilteredCommentaires(userComments);
    } else {
      // Afficher tous les commentaires
      setFilteredCommentaires(commentaires);
    }
  }, [commentaires, user, showOnlyUserComments]);

  // Supprimer un commentaire
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:4005/commentaire/${id}`);
      // Mettre à jour les deux états
      setCommentaires(prev => prev.filter((c) => c.id !== id));
      setFilteredCommentaires(prev => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
    }
  };

  useEffect(() => {
    getCommentaires();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      {/* En-tête avec information sur le filtrage */}
      {showOnlyUserComments && user && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <p className="text-blue-800 font-medium">
            Affichage de vos commentaires seulement ({filteredCommentaires.length} commentaire(s))
          </p>
        </div>
      )}
      
      {filteredCommentaires.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 text-lg">
            {showOnlyUserComments && user 
              ? "Vous n'avez pas encore de commentaires." 
              : "Aucun commentaire à afficher."
            }
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCommentaires.map((commentaire) => {
              // Conversion des IDs pour la comparaison
              const commentUserId = typeof commentaire.utilisateurId === 'string' 
                ? parseInt(commentaire.utilisateurId) 
                : commentaire.utilisateurId;
              
              const userIdNumber = user && (typeof user.id === 'string' 
                ? parseInt(user.id) 
                : user.id);
              
              const isCurrentUserComment = user && commentUserId === userIdNumber;

              return (
                <tr key={commentaire.id} className="hover:bg-gray-50">
                  {/* Colonne ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {commentaire.id}
                  </td>
                  
                  {/* Colonne Utilisateur */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {userNames[commentaire.utilisateurId] || `Utilisateur ${commentaire.utilisateurId}`}
                      </span>
                      {isCurrentUserComment && (
                        <span className="text-xs text-blue-600 font-semibold">(Vous)</span>
                      )}
                    </div>
                  </td>
                  
                  {/* Colonne Offre ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commentaire.offreId}
                  </td>

                  {/* Colonne DateCommentaire */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(commentaire.dateCommentaire).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  
                  {/* Colonne ContentCommentaire */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md">
                      {commentaire.contenuCommentaire}
                    </div>
                  </td>
                  
                  {/* Colonne Notes */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{commentaire.notes}/5</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < commentaire.notes ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                  
                  {/* Colonne Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        onClick={() => onEdit(commentaire)}
                        title="Modifier le commentaire"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                        onClick={() => {
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
                            handleDelete(commentaire.id);
                          }
                        }}
                        title="Supprimer le commentaire"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CommentaireList;