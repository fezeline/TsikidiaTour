import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Euro, Trash2, Search, Filter, X, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Reservation } from '../../types';
import axios from 'axios';

interface ReservationListProps {
  reservations:Reservation[];
  onDelete: (id: number) => void;
}

const ReservationList: React.FC<ReservationListProps> = (onDelete) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);
  

  const API_BASE = "http://localhost:4005";

  // 🔹 Vérifie si une réservation est expirée
  const isExpired = (reservation: Reservation) => {
    if (!reservation.dateExpiration) return false;
    const expirationDate = new Date(reservation.dateExpiration);
    const now = new Date();
    return now >= expirationDate && reservation.statut === 'EN_ATTENTE';
  };

  // 🔹 Retourne le statut à afficher
  const getStatutAffiche = (reservation: Reservation) => {
    return isExpired(reservation) ? 'ANNULEE' : reservation.statut;
  };

   // 🔹 Fonction pour ouvrir le dialogue de suppression
  const handleDeleteClick = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setShowConfirmDialog(true);
  };


// 🔹 Dans ton useEffect de récupération des réservations
const getReservation = async () => {
  try {
    const [resReservations, resOffres] = await Promise.all([
      axios.get(`${API_BASE}/reservation/`),
      axios.get(`${API_BASE}/offre/`)
    ]);

    // Construire map des titres d'offres
    const offresMap: { [id: number]: string } = {};
    resOffres.data.forEach((o: any) => {
      offresMap[o.id] = o.titre || o.titreOffre;
    });

    // Ajouter le titre de l'offre à chaque réservation
    const updatedReservations = resReservations.data.map((r: any) => ({
      ...r,
      offreTitre: offresMap[r.offreId] || "Offre inconnue"
    }));

    setReservations(updatedReservations);
    setFilteredReservations(updatedReservations);
  } catch (error) {
    console.error("Erreur API:", error);
  }
};


const handleDeleteConfirm = async () => {
  if (!reservationToDelete) return;
  try {
    await axios.delete(`${API_BASE}/reservation/${reservationToDelete.id}`);

    // Supprimer de la liste
    setReservations(reservations.filter(r => r.id !== reservationToDelete.id));

    // Fermer le modal
    setShowConfirmDialog(false);
    setReservationToDelete(null);

    // Message de succès
    setTimeout(() => {
      alert('Réservation supprimée avec succès!');
    }, 100); // léger délai pour s'assurer que le modal est fermé
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    alert("Erreur lors de la suppression de la réservation");
    setShowConfirmDialog(false);
  }
};

  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setReservationToDelete(null);
  };

  useEffect(() => {
    getReservation();
    const interval = setInterval(getReservation, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtrage et tri
  useEffect(() => {
    let result = [...reservations];

   if (searchTerm) {
      
      result = result.filter(reservation =>
        reservation.id.toString().includes(searchTerm.toLowerCase())
        
      );
    }

    if (statusFilter !== 'TOUS') {
      result = result.filter(reservation => getStatutAffiche(reservation) === statusFilter);
    }

    if (showExpiredOnly) {
      result = result.filter(reservation => isExpired(reservation));
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.dateReservation).getTime() - new Date(b.dateReservation).getTime()
          : new Date(b.dateReservation).getTime() - new Date(a.dateReservation).getTime();
      } else if (sortBy === 'montant') {
        const totalA = a.nombrePers * a.prixParPersonne;
        const totalB = b.nombrePers * b.prixParPersonne;
        return sortOrder === 'asc' ? totalA - totalB : totalB - totalA;
      } else if (sortBy === 'id') {
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      }
      return 0;
    });

    setFilteredReservations(result);
  }, [reservations, searchTerm, statusFilter, sortBy, sortOrder, showExpiredOnly]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Rendu cartes
  const renderReservationCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredReservations.map((reservation) => {
        const statutAffiche = getStatutAffiche(reservation);

        return (
          <Card key={reservation.id} className="rounded-2xl overflow-hidden shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative h-40 bg-green-600">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Réservation #{reservation.id}</h3>
                <div className="flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                    <span className="truncate">{reservation.offreTitre}</span>
                </div>
              </div>
              <div className={`absolute top-4 right-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                statutAffiche === 'ANNULEE' ? 'bg-red-100 text-red-800' :
                statutAffiche === 'CONFIRMEE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {statutAffiche === 'ANNULEE' ? '❌ Annulée' :
                 statutAffiche === 'CONFIRMEE' ? '✅ Confirmée' : '⏳ En attente'}
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium text-sm">{formatDate(reservation.dateReservation)}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Personnes</p>
                    <p className="font-medium text-sm">{reservation.nombrePers}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-lg text-green-700">{(reservation.nombrePers * reservation.prixParPersonne).toLocaleString()} €</p>
                </div>
                <Euro className="text-gray-400" size={20} />
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => handleDeleteClick(reservation)}
                  className="!px-3 !py-2 flex items-center"
                  title="Supprimer"
                >
                  <Trash2 size={14} className="mr-1" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderReservationList = () => (
    <div className="space-y-4">
      {filteredReservations.map((reservation) => {
        const statutAffiche = getStatutAffiche(reservation);

        return (
          <Card key={reservation.id} className="p-5 rounded-2xl shadow-lg border-0 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Réservation #{reservation.id}</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    statutAffiche === 'ANNULEE' ? 'bg-red-100 text-red-800' :
                    statutAffiche === 'CONFIRMEE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {statutAffiche === 'ANNULEE' ? '❌ Annulée' :
                     statutAffiche === 'CONFIRMEE' ? '✅ Confirmée' : '⏳ En attente'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{formatDate(reservation.dateReservation)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    <span>{reservation.nombrePers} personne(s)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                    <span className="truncate">{reservation.offreTitre || "Offre inconnue"}</span>
                  </div>
                  <div className="flex items-center font-semibold text-green-700">
                    <Euro className="w-4 h-4 mr-2" />
                    <span>{(reservation.nombrePers * reservation.prixParPersonne).toLocaleString()} €</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-end mt-4 md:mt-0">
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => handleDeleteClick(reservation)} 
                  className="flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> 
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Gestion des Réservations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gérez toutes les réservations en un seul endroit
          </p>
        </div>

        <Card className="p-6 mb-8 rounded-2xl shadow-lg border-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par ID ou destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              />
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex items-center bg-white rounded-xl border border-gray-300 overflow-hidden">
              <Button 
                variant={viewMode === 'grid' ? 'primary' : 'secondary'} 
                onClick={() => setViewMode('grid')}
                className="!px-3 !py-2 rounded-r-none border-r border-gray-200"
              >
                Grille
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'primary' : 'secondary'} 
                onClick={() => setViewMode('list')}
                className="!px-3 !py-2 rounded-l-none"
              >
                Liste
              </Button>
              </div>

              <Button 
                variant="secondary" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtres
              </Button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="CONFIRMEE">Confirmée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="font-medium text-gray-700">Trier par:</span>
                <Button variant={sortBy === 'id' ? 'primary' : 'secondary'} size="sm" onClick={() => toggleSort('id')}>ID</Button>
                <Button variant={sortBy === 'date' ? 'primary' : 'secondary'} size="sm" onClick={() => toggleSort('date')}>Date</Button>
                <Button variant={sortBy === 'montant' ? 'primary' : 'secondary'} size="sm" onClick={() => toggleSort('montant')}>Montant</Button>
              </div>
            </div>
          )}
        </Card>

        {viewMode === 'grid' ? renderReservationCards() : renderReservationList()}

        {filteredReservations.length === 0 && (
          <Card className="text-center py-12 rounded-2xl shadow-lg border-0">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune réservation trouvée</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {reservations.length === 0 
                ? "Aucune réservation n'a été trouvée." 
                : "Aucune réservation ne correspond à vos critères de recherche."}
            </p>
          </Card>
        )}

        {showConfirmDialog && reservationToDelete && (
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
                Êtes-vous sûr de vouloir supprimer définitivement la réservation #{reservationToDelete.id} ?
                <span className="block mt-2 text-sm">
                  👥 Personnes: {reservationToDelete.nombrePers}
                  <br />
                  💰 Total: {(reservationToDelete.nombrePers * reservationToDelete.prixParPersonne).toLocaleString()} €
                  <br />
                  📅 Date: {formatDate(reservationToDelete.dateReservation)}
                  {reservationToDelete.dateExpiration && (
                    <>
                      <br />
                      ⏳ Expiration: {formatDate(reservationToDelete.dateExpiration)}
                    </>
                  )}
                </span>
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationList;
