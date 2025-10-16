import React, { useEffect, useState } from 'react';
import { Trash2, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import axios from 'axios';
import { Payement } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { jsPDF } from 'jspdf';

const headers = ['ID','Utilisateur','Resevation', 'Montant', 'Date', 'Mode de paiement', 'Statut', 'Description', 'Actions'];

const PaiementList: React.FC = () => {
  const { user } = useAuth();
  const [paiements, setPaiements] = useState<Payement[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  const getPaiementUserId = (p: Payement): number | null => {
    if (p.utilisateurId) return Number(p.utilisateurId);
    if (p.utilisateur?.id) return Number(p.utilisateur.id);
    if (p.reservation?.utilisateurId) return Number(p.reservation.utilisateurId);
    if (p.reservation?.utilisateur?.id) return Number(p.reservation.utilisateur.id);
    return null;
  };

  const getPaiements = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4005/payement/");
      const data: Payement[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      const userId = Number(user.id);
      const filtered = data.filter((p: Payement) => {
        if (user.role === "admin") return true;
        return getPaiementUserId(p) === userId;
      });
      setPaiements(filtered);
    } catch (error) {
      console.error("Erreur API:", error);
      setPaiements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:4005/payement/${id}`);
      setPaiements(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerifyStatus = async (id: number) => {
    setUpdating(id);
    try {
      const res = await axios.get(`http://localhost:4005/payement/${id}/status`);
      if (res.data.status === "SUCCES") {
        getPaiements();
        alert("✅ Paiement confirmé !");
      } else {
        alert(`Statut actuel: ${res.data.status}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la vérification du statut");
    }
    setUpdating(null);
  };

  const handleMarkAsSuccess = async (id: number) => {
    if (!window.confirm("Marquer ce paiement comme réussi ?")) return;
    setUpdating(id);
    try {
      const res = await axios.post(`http://localhost:4005/payement/${id}/confirm`);
      if (res.data.payement) {
        setPaiements(prev =>
          prev.map(p => p.id === id ? { ...p, status: "SUCCES" } : p)
        );
        alert("✅ Paiement marqué comme réussi !");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la confirmation du paiement");
    }
    setUpdating(null);
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
    doc.text(`Réservation : #${paiement.reservationId || paiement.reservation?.id}`, 20, 60);
    doc.text(`Date : ${new Date(paiement.date).toLocaleDateString()}`, 20, 80);
    doc.text(`Mode de paiement : ${paiement.modePayement}`, 20, 90);
    doc.text(`Statut : ${paiement.status}`, 20, 100);
    doc.text(`Montant : ${paiement.montant} €`, 20, 70);
    if (paiement.description) doc.text(`Description : ${paiement.description}`, 20, 110);
    
     const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(
    "Merci pour votre paiement !",
    pageWidth - 20, // marge droite de 20 mm
    130,
    { align: "right" } // alignement à droite
  );


    doc.save(`facture_${paiement.id}.pdf`);
  };

  useEffect(() => { getPaiements(); }, [user]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SUCCES': return 'bg-green-100 text-green-800';
  case 'EN_ATTENTE': return 'bg-green-100 text-green-800';
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

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Chargement des paiements...</span>
    </div>
  );

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-bold text-gray-800">
          {user?.role === "admin" ? "Tous les Paiements" : "Mes Paiements"}
        </h2>
        <button
          onClick={getPaiements}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Rafraîchir
        </button>
      </div>

      {paiements.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {user?.role === "admin" 
            ? "Aucun paiement trouvé dans le système" 
            : "Vous n'avez effectué aucun paiement"
          }
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
            {paiements.map(paiement => {
              
              return (
                <tr key={paiement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{paiement.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paiement.utilisateur?.nom || paiement.utilisateurId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paiement.reservationId || paiement.reservation?.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paiement.montant} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(paiement.date).toLocaleDateString("fr-FR", {
                      year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
                    })}
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
                      {/* Vérifier / Marquer */}
                      {paiement.status !== 'SUCCES' && (
                        <>
                          <button
                            disabled={updating === paiement.id}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                            onClick={() => handleVerifyStatus(paiement.id)}
                            title="Vérifier le statut"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            disabled={updating === paiement.id}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                            onClick={() => handleMarkAsSuccess(paiement.id)}
                            title="Marquer comme réussi"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      
                      {/* BOUTON TÉLÉCHARGER FACTURE */}
                        <button
                            type="button"
                            disabled={user?.role === 'admin'}
                            className={`p-2 rounded transition-colors ${
                                user?.role === 'admin'
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                            }`}
                            onClick={() => generateInvoice(paiement)}
                            title={user?.role === 'admin' ? "Téléchargement non autorisé pour l'admin" : "Télécharger facture"}
                        >
                            <Download className="w-4 h-4" />
                        </button>


                      {/* Supprimer */}
                      <button
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                        onClick={() => { if (window.confirm('Supprimer ce paiement ?')) handleDelete(paiement.id); }}
                        title="Supprimer"
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

export default PaiementList;
