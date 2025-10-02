import React, { useEffect, useState } from 'react';
import { Trash2, CheckCircle, XCircle, RefreshCw, X, AlertTriangle, Download } from 'lucide-react';
import axios from 'axios';
import { Payement } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { jsPDF } from 'jspdf';

const headers = [
  'ID',
  'Utilisateur',
  'Reservation',
  'Montant',
  'Date',
  'Mode de paiement',
  'Statut',
  'Description',
  'Actions'
];



const PaiementList: React.FC = () => {
  const { user } = useAuth();
  const [paiements, setPaiements] = useState<Payement[]>([]);
  const [loading, setLoading] = useState(false);
  const [paiementToDelete, setPaiementToDelete] = useState<Payement | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const role = user?.role?.toUpperCase();

  const getPaiementUserId = (p: Payement): number | null => {
    if (p.utilisateurId) return Number(p.utilisateurId);
    if (p.utilisateur?.id) return Number(p.utilisateur.id);
    if (p.reservation?.utilisateurId) return Number(p.reservation.utilisateurId);
    if (p.reservation?.utilisateur?.id) return Number(p.reservation.utilisateur.id);
    return null;
  };

  const canModifyPayment = (paiement: Payement) => {
    if (!user) return false;
    if (role === 'ADMIN') return true;
    if (role === 'CLIENT') {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      const paymentUserId = getPaiementUserId(paiement);
      return paymentUserId === userId;
    }
    return false;
  };

  const getPaiements = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4005/payement/");
      const data: Payement[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

      let filtered: Payement[] = [];
      const userId = Number(user.id);

      if (role === 'ADMIN') {
        filtered = data;
      } else if (role === 'CLIENT') {
        filtered = data.filter((p: Payement) => getPaiementUserId(p) === userId);
      }

      setPaiements(filtered);
    } catch (error) {
      console.error("Erreur API:", error);
      setPaiements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (paiement: Payement) => {
    setPaiementToDelete(paiement);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paiementToDelete) return;
    try {
      await axios.delete(`http://localhost:4005/payement/${paiementToDelete.id}`);
      setPaiements(prev => prev.filter(p => p.id !== paiementToDelete.id));

      // ✅ Affichage du message de succès
      setSuccessMessage(`Le paiement #${paiementToDelete.id} a été supprimé avec succès !`);
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error("Erreur lors de la suppression du paiement:", error);
      alert("Erreur lors de la suppression du paiement");
    } finally {
      setShowConfirmDialog(false);
      setPaiementToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setPaiementToDelete(null);
  };

  // ---------- Génération facture PDF ----------
  const generateInvoice = (paiement: Payement) => {
    const doc = new jsPDF();

    const logoUrl = "/images/accueil/logo.jpg"; 
    const imgWidth = 40;  
    const imgHeight = 20;  
    doc.addImage(logoUrl, 'JPEG', 20, 5, imgWidth, imgHeight);
        
    const textX = 20 + 40 + 10; 
    const textY = 5 + 20 / 2 + 5; 
    doc.setFontSize(18);
    doc.text("Facture de paiement de TsikiDia Tour", textX, textY);

    doc.setFontSize(12);
    doc.text(`ID Paiement : ${paiement.id}`, 20, 40);
    doc.text(`Utilisateur : ${paiement.utilisateur?.nom || paiement.utilisateurId}`, 20, 50);
    doc.text(`Réservation : #${paiement.reservation?.id || paiement.reservationId}`, 20, 60);
    doc.text(`Montant : ${paiement.montant} €`, 20, 70);
    doc.text(`Date : ${new Date(paiement.date).toLocaleDateString()}`, 20, 80);
    doc.text(`Mode de paiement : ${paiement.modePayement}`, 20, 90);
    doc.text(`Statut : ${paiement.status}`, 20, 100);
    if (paiement.description) doc.text(`Description : ${paiement.description}`, 20, 110);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(
      "Merci pour votre paiement !",
      pageWidth - 20, 
      130,
      { align: "right" } 
    );

    doc.save(`facture_${paiement.id}.pdf`);
  };

  useEffect(() => { getPaiements(); }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des paiements...</span>
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SUCCES': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ECHEC': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCES': return <CheckCircle className="w-4 h-4" />;
      case 'ECHEC': return <XCircle className="w-4 h-4" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow relative">

      {/* Toast succès */}
     
     {successMessage && (
        <div className="fixed top-5 right-5 bg-transparent text-green-500 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fadeIn border border-green-500">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
       )}


      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-bold text-gray-800">
          {role === "ADMIN" ? "Tous les Paiements" : "Mes Paiements"}
        </h2>
      </div>

      {paiements.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {role === "ADMIN"
            ? "Aucun paiement trouvé dans le système"
            : "Vous n'avez effectué aucun paiement"}
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(header => (
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
            {paiements.map(paiement => (
              <tr key={paiement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paiement.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paiement.utilisateur?.nom ?? "Utilisateur inconnu"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paiement.reservation?.id ?? "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paiement.montant} €</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(paiement.date).toLocaleDateString("fr-FR", { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paiement.modePayement}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(paiement.status)}`}>
                    {getStatusIcon(paiement.status)} {paiement.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{paiement.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      disabled={role === 'ADMIN'}
                      className={`p-2 rounded transition-colors ${
                        role === 'ADMIN'
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                      }`}
                      onClick={() => role !== 'ADMIN' && generateInvoice(paiement)}
                      title={role === 'ADMIN' ? "Téléchargement non autorisé pour l'admin" : "Télécharger facture"}
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={!canModifyPayment(paiement)}
                      className={`p-2 rounded transition-colors ${
                        canModifyPayment(paiement)
                          ? "text-red-600 hover:text-red-800 hover:bg-red-100"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() => canModifyPayment(paiement) && handleDeleteClick(paiement)}
                      title={canModifyPayment(paiement) ? "Supprimer" : "Suppression non autorisée"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Boîte de confirmation de suppression */}
      {showConfirmDialog && paiementToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                Confirmer la suppression
              </h3>
              <button onClick={handleDeleteCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le paiement #{paiementToDelete.id} ?
              <span className="block mt-2 text-sm">
                💰 Montant: {paiementToDelete.montant} €
                <br />
                📅 Date: {new Date(paiementToDelete.date).toLocaleDateString('fr-FR')}
                <br />
                🏷 Statut: <span className={getStatusClass(paiementToDelete.status)}>{paiementToDelete.status}</span>
              </span>
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={handleDeleteCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
                Annuler
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementList;
