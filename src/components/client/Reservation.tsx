import React, { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, Euro } from 'lucide-react';
import { Clock, AlertTriangle,Edit2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Reservation } from '../../types';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../../contexts/AuthContext'; 
import ReservationForm from './ReservationForm';

// 🔹 Utiliser la clé publique Stripe depuis .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const API_BASE = "http://localhost:4005";

// ReservationStatusMessage removed (not used)


const ReservationList: React.FC = () => {
  const { user } = useAuth(); // 🔹 Utilisateur connecté

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  
useEffect(() => {
  const fetchData = async () => {
    if (!user) return;

    try {
      const [resResa, resOffres] = await Promise.all([
        axios.get(`${API_BASE}/reservation/`),
        axios.get(`${API_BASE}/offre/`),
        axios.get(`${API_BASE}/utilisateur/`),
      ]);

      // Construire map des offres
      const map: { [id: number]: string } = {};
      resOffres.data.forEach((o: any) => map[o.id] = o.titre || o.titreOffre);

      // Filtrer les réservations de l'utilisateur connecté
      let userReservations = resResa.data.filter((r: any) => r.utilisateurId === user.id);

      const now = new Date();

      // Vérifier si une réservation en attente a expiré
      const updatedReservations = userReservations.map((r: any) => {
        const expiration = new Date(r.dateReservation);
        expiration.setHours(expiration.getHours() + 24);

        let statutFinal = r.statut;
        if (r.statut === "EN_ATTENTE" && expiration <= now) {
          statutFinal = "ANNULEE"; // 🔹 Mettre à jour le statut si expirée
        }

        return {
          ...r,
          statut: statutFinal,
          offreTitre: map[r.offreId] || "Offre inconnue"
        };
      });

      setReservations(updatedReservations);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, [user]);


// 🔹 Filtrage par recherche et statut
useEffect(() => {
  let result = [...reservations];
  if (searchTerm) {
    result = result.filter(r =>
      r.id.toString().includes(searchTerm.toLowerCase()) ||
      r.offreTitre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (statusFilter !== 'TOUS') {
    result = result.filter(r => r.statut === statusFilter);
  }
  setFilteredReservations(result);
}, [reservations, searchTerm, statusFilter]);


    // 🔹 Calcul du temps restant jusqu’à expiration
  const getTimeRemaining = (dateReservation: string): string => {
    const expiration = new Date(dateReservation);
    expiration.setHours(expiration.getHours() + 24); // +24h

    const now = new Date();
    const diffMs = expiration.getTime() - now.getTime();

    if (diffMs <= 0) return "Expirée";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m restantes`;
  };


// handlePayer removed (not used in this component)




  const handleBackToList = () => {
    setShowPaymentForm(false);
    setSelectedReservation(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Mes Réservations</h1>

       {editingReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <ReservationForm
              reservation={editingReservation}
              onSubmit={async (updatedReservation) => {
                setReservations(prev =>
                  prev.map(r => r.id === updatedReservation.id ? updatedReservation : r)
                );
                setEditingReservation(null);
              }}
              onCancel={() => setEditingReservation(null)}
            />
          </div>
         )}

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
             type="text"
             placeholder="Rechercher par ID ou offre..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="flex-1 px-4 py-2 border rounded-lg"
           />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>

        {/* Liste des réservations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="rounded-xl shadow-lg p-4">
              <div className="mb-2 flex justify-between items-center">
                <h3 className="font-bold">Réservation #{reservation.id}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reservation.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-800' :
                  reservation.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {reservation.statut}
                </span>
              </div>
           {/* 🔹 Afficher titre de l'offre correctement */}
           <div className="mb-2 text-sm font-semibold">
               Offre : {reservation.offreTitre}
           </div>
              <div className="mb-2 text-sm">
                <Calendar size={14} className="inline mr-1" /> {formatDate(reservation.dateReservation)}
              </div>
              
              {/* ⏰ Expiration */}
                {reservation.statut === "EN_ATTENTE" && (
                 <div className="mb-2 text-sm flex items-center">
                   <Clock size={14} className="inline mr-1 text-orange-600" />
                   <span className="text-orange-600">
                   {getTimeRemaining(reservation.dateReservation)}
                   </span>
                 </div>
             )}

              {/* 🚨 Alerte si expirée */}
                {reservation.statut === "EN_ATTENTE" && getTimeRemaining(reservation.dateReservation) === "Expirée" && (
                 <div className="mb-2 text-sm flex items-center text-red-600 font-semibold">
                   <AlertTriangle size={14} className="inline mr-1" />
                    Cette réservation a expiré (non payée dans les 24h).
                </div>
           )}

              <div className="mb-2 text-sm">
                <Users size={14} className="inline mr-1" /> {reservation.nombrePers} personne(s)
              </div>
              
              <div className="mb-2 text-sm font-bold text-green-700">
                <Euro size={14} className="inline mr-1" /> {(reservation.nombrePers * reservation.prixParPersonne).toLocaleString()} €
              </div>

              {reservation.statut === "EN_ATTENTE" && getTimeRemaining(reservation.dateReservation) !== "Expirée" && (
               <div className="mt-3 flex gap-2 justify-center">
                  {/* Bouton Payer */}
                <Button
                   onClick={() => {
                   setSelectedReservation(reservation);
                   setShowPaymentForm(true); // 👉 ouvre StripePaymentForm
                 }}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 flex justify-center items-center gap-2 rounded-lg"
                >
                 <CreditCard size={16} /> Payer
                </Button>

                {/* Bouton Modifier */}
                  
                <button
                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                    onClick={() => {
                 if (!editingReservation) setEditingReservation(reservation);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>

              </div>
               )}

            </Card>
          ))}
         </div>

        {/* Modal Paiement */}
        {showPaymentForm && selectedReservation && (
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              reservation={selectedReservation}
              onBack={handleBackToList}
              onSuccess={(updatedReservation) => {
                setReservations(prev => prev.map(r => r.id === updatedReservation.id ? updatedReservation : r));
                handleBackToList();
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

// 🔹 Composant StripePaymentForm
const StripePaymentForm: React.FC<{
  reservation: Reservation;
  onBack: () => void;
  onSuccess: (updatedReservation: Reservation) => void;
}> = ({ reservation, onBack, onSuccess }) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(''); // 🔹 champ obligatoire

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!stripe || !elements) return;

  if (!description.trim()) {
    setError("La description est obligatoire.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // 1️⃣ Créer un paiement EN_ATTENTE côté backend
    const { data: paiementData } = await axios.post(`${API_BASE}/payement/`, {
      montant: reservation.nombrePers * reservation.prixParPersonne,
      reservationId: reservation.id,
      utilisateurId: reservation.utilisateurId,
      description
    });

    const clientSecret = paiementData.clientSecret;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) throw new Error("Element Card introuvable");

    // 2️⃣ Confirmer le paiement avec Stripe
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (result.error) {
      setError(result.error.message || "Erreur lors du paiement");
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      // 3️⃣ Notifier le backend que le paiement est réussi
      await axios.post(`${API_BASE}/reservation/${reservation.id}/confirmer-paiement`, {
        stripePaymentIntentId: result.paymentIntent.id
      });

      
      // Au lieu de GET reservation, on met à jour localement
     const updatedReservation: Reservation = { 
        ...reservation,
        statut: "CONFIRMEE"
      };


      alert(`✅ Paiement de la réservation #${reservation.id} réussi !`);

       // 👉 Appeler onSuccess pour mettre à jour la liste + fermer le modal
          onSuccess(updatedReservation);
    }

  } catch (err: any) {
    console.error(err);
    setError(err.response?.data?.error || err.message || "Erreur lors du paiement.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Paiement Réservation #{reservation.id}</h2>
          <Button variant="secondary" onClick={onBack}>X</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Utilisateur connecté */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
          <input
            type="text"
            value={user?.email || ""} // Affiche nom et email
            readOnly
            className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>


          {/* Description obligatoire */}
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Entrez une description pour le paiement"
            className="w-full p-3 border rounded-lg"
            required
          />

          {/* Carte de crédit */}
          <label className="block text-sm font-medium text-gray-700">Carte de Crédit</label>
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement options={{ hidePostalCode: true }} />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? "Traitement..." : `Payer ${(reservation.nombrePers * reservation.prixParPersonne).toLocaleString()} €`}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default ReservationList;
