import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, MapPin, Users, Star, X, Car, MessageCircle,
 Clock, Tag, ArrowRight, Shield, Award, User,
  CreditCard, CalendarDays, Hotel,
  Activity, Map, MessageSquare, Info, ChevronDown
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Offre, Reservation, Visite, Voiture, Commentaire } from '../../types';
import ReservationForm from '../../components/client/ReservationForm';
import { useAuth } from '../../contexts/AuthContext';

const OffresClient: React.FC = () => {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [visites, setVisites] = useState<Visite[]>([]);
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [activites, setActivites] = useState<any[]>([]);
  const [hebergements, setHebergements] = useState<any[]>([]);
  const [reservationOffre, setReservationOffre] = useState<Offre | null>(null);
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [filteredOffres, setFilteredOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentaireOffre, setCommentaireOffre] = useState<Offre | null>(null);
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [noteCommentaire, setNoteCommentaire] = useState(5);
  const [selectedActivite, setSelectedActivite] = useState<any | null>(null);
  const [selectedHebergement, setSelectedHebergement] = useState<any | null>(null);
  const [prixMax, setPrixMax] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openOffreInfoId, setOpenOffreInfoId] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [offresRes, visitesRes, voituresRes, commentairesRes, activitesRes, hebergementsRes, reservationsRes] = await Promise.all([
          axios.get('http://localhost:4005/offre/'),
          axios.get('http://localhost:4005/visite/'),
          axios.get('http://localhost:4005/voiture/'),
          axios.get('http://localhost:4005/commentaire/'),
          axios.get('http://localhost:4005/activite/'),
          axios.get('http://localhost:4005/hebergement/'),
          axios.get('http://localhost:4005/reservation/') 
        ]);

        let offresData: Offre[] = offresRes.data;
        const reservations: Reservation[] = reservationsRes.data;

        // 🔹 Calculer le nombre de places disponibles réelles
        offresData = offresData.map(offre => {
          const placesReservees = reservations
            .filter(r => r.offreId === offre.id &&  (r.statut === "CONFIRMEE" || r.statut === "EN_ATTENTE"))
            .reduce((acc, r) => acc + r.nombrePers, 0);
          return {
            ...offre,
            placeDisponible: Math.max(offre.placeDisponible - placesReservees, 0)
          };
        });

        setOffres(offresData);
        setFilteredOffres(offresData);
        setVisites(visitesRes.data);
        setVoitures(voituresRes.data);
        setCommentaires(commentairesRes.data);
        setActivites(activitesRes.data);
        setHebergements(hebergementsRes.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReservationSubmit = async (data: Reservation) => {
    try {
      const payload = { ...data, offreId: reservationOffre?.id };
      const response = await axios.post("http://localhost:4005/reservation/", payload);

      // Mettre à jour le nombre de places disponibles seulement si payé
      if (data.statut) {
        setOffres(prev =>
          prev.map(o =>
            o.id === reservationOffre?.id
              ? { ...o, placeDisponible: Math.max(o.placeDisponible - data.nombrePers, 0) }
              : o
          )
        );
        setFilteredOffres(prev =>
          prev.map(o =>
            o.id === reservationOffre?.id
              ? { ...o, placeDisponible: Math.max(o.placeDisponible - data.nombrePers, 0) }
              : o
          )
        );
      }

      alert("Réservation confirmée !");
      setReservationOffre(null);
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      alert("Une erreur est survenue.");
    }
  };


  // Fonction pour soumettre un commentaire
  const handleCommentaireSubmit = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      alert("Veuillez vous connecter pour commenter");
      return;
    }

    if (!commentaireOffre || !nouveauCommentaire.trim()) return;

    try {
      const commentaireData = {
        contenuCommentaire: nouveauCommentaire,
        notes: noteCommentaire,
        dateCommentaire: new Date().toISOString(),
        offreId: commentaireOffre.id,
        utilisateurId: user.id // Utilisation de l'ID de l'utilisateur connecté
      };

      const response = await axios.post('http://localhost:4005/commentaire/', commentaireData);
      
      // Ajouter le nouveau commentaire à la liste
      setCommentaires(prev => [...prev, response.data]);
      
      alert('Commentaire ajouté avec succès !');
      setNouveauCommentaire('');
      setNoteCommentaire(5);
      setCommentaireOffre(null);
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
      alert("Une erreur est survenue lors de l'ajout du commentaire.");
    }
  };

  // Fonction pour ouvrir le modal de commentaire
  const handleCommenterClick = (offre: Offre) => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      alert("Veuillez vous connecter pour commenter");
      return;
    }
    setCommentaireOffre(offre);
  };


  // Fonction pour fermer le modal de commentaire
  const handleCloseCommentModal = () => {
    setCommentaireOffre(null);
    setNouveauCommentaire('');
    setNoteCommentaire(5);
  };

  // Fonction pour convertir Buffer en base64
  const bufferToBase64 = (bufferObj: any): string => {
    if (!bufferObj || typeof bufferObj !== 'object') return '';
    try {
      const bufferValues = Object.values(bufferObj);
      const uint8Array = new Uint8Array(bufferValues as number[]);
      let binary = '';
      uint8Array.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      return window.btoa(binary);
    } catch (error) {
      return '';
    }
  };

  // Trouver les détails associés à une offre
  const findVisiteDetails = (visiteId: number | undefined) => {
    if (!visiteId) return null;
    return visites.find(v => v.id === visiteId);
  };

  const findVoitureDetails = (voitureId: number | undefined) => {
    if (!voitureId) return null;
    return voitures.find(v => v.id === voitureId);
  };

  const findCommentaireDetails = (commentaireId: number | undefined) => {
    if (!commentaireId) return null;
    return commentaires.find(c => c.id === commentaireId);
  };

  const findActiviteDetails = (activiteId: number | undefined) => {
    if (!activiteId) return null;
    return activites.find(a => a.id === activiteId);
  };

  const findHebergementDetails = (hebergementId: number | undefined) => {
    if (!hebergementId) return null;
    return hebergements.find(h => h.id === hebergementId);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  const handleReserverClick = (offre: Offre) => {
    setReservationOffre(offre);
  };

  const handleShowDetails = (offre: Offre) => {
    setSelectedOffre(offre);
  };

  const handleCloseModal = () => {
    setReservationOffre(null);
    setSelectedOffre(null);
  };


  const getRandomRating = () => (Math.random() * 1 + 4).toFixed(1);

  // Images associées aux visites
  const visiteImages: Record<string, string> = {
    antsirabe: "/images/visite/antsirabe.jpg",
    tulear: "/images/visite/tulear.jpg",
    default: "/images/visite/default.jpg"
  };

  // CORRECTION DE LA FONCTION QUI CAUSAIT L'ERREUR
  const getVisiteImage = (ville?: string) => {
    if (!ville || typeof ville !== 'string') return visiteImages.default;
    const key = ville.toLowerCase();
    return visiteImages[key] || visiteImages.default;
  };


  // Images associées aux voitures
const carImages: Record<string, string> = {
  mercedes: "/images/voiture/mercedes.jpg",
  karenjy: "/images/voiture/karenjy.jpg",
  toyota: "/images/voiture/toyota.jpg",
};

const getCarImage = (marque?: string) => {
  if (!marque) return carImages.default;
  const key = marque.toLowerCase();
  return carImages[key] || carImages.default;
};

  const getHebergementImage = (nom?: string) => {
    if (!nom) return "/images/hebergement/default.jpg";
    const key = nom.toLowerCase();
    return `/images/hebergement/${key}.jpg` || "/images/hebergement/default.jpg";
  };
  // Calculer le coût total de la voiture
  const calculateCoutTotalVoiture = (voiture: Voiture | null) => {
    if (!voiture || !voiture.coutParJours || !voiture.nombreJours) return 0;
    return voiture.coutParJours * voiture.nombreJours;
  };

  // Générer les étoiles pour la notation
  const renderStars = (note: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < note ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Offres de Voyage</h1>
        </div>
        {/* Barre de recherche */}
         <div className="mb-6 flex justify-end items-center space-x-3">
          <input
            type="number"
            min={0}
            value={prixMax}
            onChange={(e) => setPrixMax(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Prix max par personne (€)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-48"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre..."
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
          />
            <Button
              onClick={() => {
                setFilteredOffres(
                  offres.filter(o => {
                    const matchesPrice = prixMax === "" || (o.prixParPers || 0) <= Number(prixMax);
                    const matchesTitle = o.titreOffre.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesPrice && matchesTitle;
                  })
                );
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Filtrer
            </Button>

            {/* Bouton Réinitialiser */}
            {(prixMax !== "" || searchTerm !== "") && (
              <Button
                onClick={() => {
                  setPrixMax("");
                  setSearchTerm("");
                  setFilteredOffres(offres);
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Réinitialiser
              </Button>
            )}

        </div>

        {/* Liste des offres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOffres.map((offre) => {
            const rating = getRandomRating();
            return (
              <Card 
                key={offre.id} 
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 group"
              >
                {/* Image avec overlay */}
                <div className="relative overflow-hidden">
                  {offre.imagePrincipale ? (
                    <img
                      src={`data:image/jpeg;base64,${typeof offre.imagePrincipale === 'object' 
                        ? bufferToBase64(offre.imagePrincipale) 
                        : offre.imagePrincipale}`}
                      alt={offre.titreOffre}
                      className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-60 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold">Image non disponible</span>
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Badges */}
                 <div className="absolute top-4 left-4 flex space-x-2">
                   <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                     {offre.duree} jours
                   </div>

                     {offre.placeDisponible === 0 ? (
                   <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                       Complet
                   </div>
                       ) : offre.placeDisponible < 5 ? (
                   <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                          {offre.placeDisponible} place{offre.placeDisponible > 1 ? 's' : ''} restante{offre.placeDisponible > 1 ? 's' : ''}
                   </div>
                       ) : (
                   <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                       {offre.placeDisponible} places disponibles
                   </div>
                        )}
                   </div>

                  
                 
                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-900">{rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {offre.titreOffre}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {offre.descriptionOffre}
                  </p>

                 {/* Infos voyage déroulante */}
                  <div className="mb-5">
                     <button
                        onClick={() => setOpenOffreInfoId(openOffreInfoId === offre.id ? null : offre.id)}
                        className="flex items-center w-full text-gray-600 font-medium mb-2 px-3 py-2 rounded-lg hover:bg-gray-100 justify-between transition-colors"
                      >
                        <span className="flex items-center">
                          <Info className="w-4 h-4 mr-2 text-blue-500" />
                          Informations voyage
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                            openOffreInfoId === offre.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                    <div className={`transition-all duration-300 overflow-hidden ${openOffreInfoId === offre.id ? 'max-h-40' : 'max-h-0'}`}>
                      <ul className="pl-4 mt-2 space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{formatDate(offre.dateDepart)} - {formatDate(offre.dateRetour)}</span>
                        </li>
                        <li className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-green-500" />
                          <span>{offre.placeDisponible} places disponibles</span>
                        </li>
                        <li className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-purple-500" />
                          <span>Départ garanti</span>
                        </li>
                      </ul>
                    </div>
                  </div>


                  {/* Prix */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleShowDetails(offre)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        Détails
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleReserverClick(offre)}
                        disabled={offre.placeDisponible === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {offre.placeDisponible === 0 ? 'Complet' : 'Réserver'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      {/* Bouton Commenter - conditionné par la connexion */}
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleCommenterClick(offre)}
                        className="w-full text-gray-600 hover:text-green-600 hover:border-green-600"
                        disabled={!user} // Désactiver si l'utilisateur n'est pas connecté
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {user ? 'Commenter' : 'Connectez-vous pour commenter'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
{/* Modal de commentaire */}
{commentaireOffre && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[80vh] overflow-y-auto">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        onClick={handleCloseCommentModal}
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Commentaires</h2>
        <p className="text-gray-600">{commentaireOffre.titreOffre}</p>
      </div>

      {/* Liste des commentaires existants */}
      <div className="space-y-4 mb-6">
        {commentaires
          .filter(c => c.offreId === commentaireOffre.id)
          .map((c) => (
            <div key={c.id} className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">{c.utilisateur?.id || 'Utilisateur'}</span>
                <span className="text-xs text-gray-500">{formatDateTime(c.dateCommentaire)}</span>
              </div>
              <div className="flex items-center mb-1">
                {[1,2,3,4,5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= c.notes ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 text-sm">{c.contenuCommentaire}</p>
            </div>
          ))}
        {commentaires.filter(c => c.offreId === commentaireOffre.id).length === 0 && (
          <p className="text-gray-500 text-center text-sm">Aucun commentaire pour cette offre.</p>
        )}
      </div>

                {/* Formulaire pour ajouter un nouveau commentaire */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notez cette offre</label>
                    <div className="flex justify-center space-x-1">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Stoppe la propagation au parent
                            setNoteCommentaire(star);
                          }}
                          className="focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 ${star <= noteCommentaire ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        </button>

                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-2">
                      Votre commentaire
                    </label>
                    <textarea
                      id="commentaire"
                      rows={3}
                      value={nouveauCommentaire}
                      onChange={(e) => setNouveauCommentaire(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Partagez votre expérience..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCloseCommentModal}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCommentaireSubmit}
                      disabled={!nouveauCommentaire.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      Publier
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}


        {/* Empty state */}
        {filteredOffres.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucune offre disponible</h3>
            <p className="text-gray-600">Revenez plus tard pour découvrir nos nouvelles offres</p>
          </div>
        )}
      </div>

    
      {/* Modal de réservation */}
      {reservationOffre && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleCloseModal}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Réservation</h2>
              <p className="text-gray-600">{reservationOffre.titreOffre}</p>
            </div>

            <ReservationForm
              reservation={{
                offreId: reservationOffre.id,
                prixParPersonne: reservationOffre.prixParPers,
                nombrePers: 0,
                montantTotal: reservationOffre.prixParPers,
                dateReservation: "",
                statut: "ANNULEE",
                utilisateurId: 0,
                id: 0,
              }}
              onSubmit={handleReservationSubmit}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedOffre && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              onClick={handleCloseModal}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Récupération des détails associés */}
            {(() => {
              const visiteDetails = findVisiteDetails(selectedOffre.visiteId);
              const voitureDetails = findVoitureDetails(selectedOffre.voitureId);
              const commentairesDetails = commentaires.filter(
                (c) => Number(c.offreId) === Number(selectedOffre.id)
              );
              <div className="mt-4 text-sm text-gray-600">
                {commentairesDetails.length} commentaire{commentairesDetails.length > 1 ? "s" : ""}
              </div>
              const activiteDetails = visiteDetails ? findActiviteDetails(visiteDetails.activiteId) : null;
              const hebergementDetails = visiteDetails ? findHebergementDetails(visiteDetails.hebergementId) : null;
              const coutTotalVoiture = calculateCoutTotalVoiture(voitureDetails ?? null);

              return (
                <>
                  {/* Image Header */}
                  <div className="relative h-80">
                    {selectedOffre.imagePrincipale && (
                      <img
                        src={`data:image/jpeg;base64,${typeof selectedOffre.imagePrincipale === 'object' 
                          ? bufferToBase64(selectedOffre.imagePrincipale) 
                          : selectedOffre.imagePrincipale}`}
                        alt={selectedOffre.titreOffre}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h2 className="text-3xl font-bold mb-2">{selectedOffre.titreOffre}</h2>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-semibold">4.8</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>Madagascar</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Durée</p>
                        <p className="font-bold text-blue-800">{selectedOffre.duree} jours</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Places</p>
                        <p className="font-bold text-green-800">{selectedOffre.placeDisponible} disponibles</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <Tag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Prix</p>
                        <p className="font-bold text-purple-800">{selectedOffre.prixParPers?.toLocaleString()} €</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedOffre.descriptionOffre}</p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Date de départ</h4>
                        <p className="text-blue-600 font-medium">{formatDate(selectedOffre.dateDepart)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Date de retour</h4>
                        <p className="text-blue-600 font-medium">{formatDate(selectedOffre.dateRetour)}</p>
                      </div>
                    </div>

                    {/* Détails de la visite */}
                    {visiteDetails && (
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <Map className="w-6 h-6 mr-2 text-blue-600" />
                          Détails de la Visite
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                              <img 
                                src={getVisiteImage(visiteDetails.ville)} 
                                alt={visiteDetails.ville || 'Visite'}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                            <div className="md:w-2/3">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">{visiteDetails.ville || 'Destination'}</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
                                    Date de visite
                                  </p>
                                  <p className="font-medium">{visiteDetails.dateVisite ? formatDate(visiteDetails.dateVisite) : 'Non spécifiée'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Ordre de visite</p>
                                  <p className="font-medium">{visiteDetails.ordreVisite || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-green-500" />
                                    Activité
                                  </p>
                                  <p className="font-medium">
                                    {activiteDetails ? activiteDetails.nom : visiteDetails.activiteId ? `Activité #${visiteDetails.activiteId}` : 'Non spécifiée'}
                                  </p>
                                    {activiteDetails && (
                                     <Button
                                     size="sm"
                                     variant="secondary"
                                    onClick={() => setSelectedActivite(activiteDetails)}
                                    className="mt-1"
                                    >
                                   Voir plus
                                 </Button>
                                    )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <Hotel className="w-4 h-4 mr-2 text-purple-500" />
                                    Hébergement
                                  </p>
                                  <p className="font-medium">
                                    {hebergementDetails ? hebergementDetails.nom : visiteDetails.hebergementId ? `Hébergement #${visiteDetails.hebergementId}` : 'Non spécifié'}
                                  </p>

                                   {hebergementDetails && (
                                   <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setSelectedHebergement(hebergementDetails)}
                                    className="mt-1"
                                   >
                                  Voir plus
                                  </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  Explorez les merveilles de {visiteDetails.ville || 'cette destination'} avec nos guides experts. 
                                  {hebergementDetails && ` Séjournez dans ${hebergementDetails.nom.toLowerCase()}.`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

               {selectedActivite && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                 <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
                 <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedActivite(null)}
                 >
                 <X className="w-6 h-6" />
                 </button>

                <h2 className="text-2xl font-bold mb-4 text-green-600">{selectedActivite.lieuActivite}</h2>

                {/* Affichage formaté */}
               <div className="space-y-4 text-gray-700">
                <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-semibold">Lieu:</span>
                 <span>{selectedActivite.lieuActivite || 'Non spécifié'}</span>
                </div> 
                <div className="flex justify-between items-center border-b pb-2">
                 <span className="font-semibold">Date:</span>
                 <span>{selectedActivite.dateActivite ? formatDate(selectedActivite.dateActivite) : 'Non spécifiée'}</span>
                </div> 
                 {selectedActivite.descriptionActivite && (
                <div className="pt-4 border-t">
                  <p className="font-semibold mb-2">Description:</p>
                  <p className="text-sm leading-relaxed">{selectedActivite.descriptionActivite}</p>
                </div>
                )}
          {/* Informations supplémentaires */}
              <div className="pt-4 border-t">
               <p className="font-semibold mb-2">Informations:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span>Durée: 2-3 heures</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-green-500" />
              <span>Guide inclus</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-purple-500" />
              <span>Assurance incluse</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-yellow-500" />
              <span>Expérience locale</span>
             </div>
            </div>
          </div>
          </div>
          </div>
        </div>
       )}

        {/* Modal Hébergement - MODIFIÉ */}
          {selectedHebergement && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedHebergement(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-purple-600">{selectedHebergement.nom}</h2>

            {/* Image depuis le dossier public */}
            {selectedHebergement.nom && (
              <div className="mb-4">
                <img
                  src={getHebergementImage(selectedHebergement.nom)}
                  alt={selectedHebergement.nom}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/images/hebergement/default.jpg";
                  }}
                />
              </div>
            )}

            {/* Affichage formaté comme demandé */}
            <div className="space-y-4 text-gray-700">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">Frais:</span>
                <span>{selectedHebergement.fraisParNuit?.toLocaleString() || '0'} € / nuit</span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">Durée:</span>
                <span>{selectedHebergement.nombreNuit || '0'} nuit(s)</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 font-bold text-lg">
                <span>Total:</span>
                <span className="text-blue-600">
                  {((selectedHebergement.fraisParNuit || 0) * (selectedHebergement.nombreNuit || 0)).toLocaleString()} €
                </span>
              </div>
              
              {selectedHebergement.adresse && (
                <div className="flex items-start mt-4 pt-4 border-t">
                  <MapPin className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <span>{selectedHebergement.adresse}</span>
                </div>
              )}
              {selectedHebergement.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-semibold mb-2">Description:</p>
                  <p className="text-sm">{selectedHebergement.description}</p>
                </div>
              )}
                </div>
                </div>
              </div>
         )}

                    {/* Détails de la voiture */}
                    {voitureDetails && (
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <Car className="w-6 h-6 mr-2 text-green-600" />
                          Véhicule de Transport
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                              <div className="h-48 rounded-lg overflow-hidden">
                                <img
                                    src={getCarImage(voitureDetails.marque)}
                                    alt={`${voitureDetails.marque} ${voitureDetails.modele}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = carImages.default;
                                     }}
                                  />
                              </div>
                              <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500">Immatriculation</p>
                                <p className="font-mono font-bold text-gray-900">{voitureDetails.immatriculation || 'Non spécifiée'}</p>
                              </div>
                            </div>
                            <div className="md:w-2/3">
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-gray-600">Coût par jour</p>
                                  <p className="font-medium text-green-600">{voitureDetails.coutParJours?.toLocaleString() || '0'} €/jour</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Nombre de jours</p>
                                  <p className="font-medium">{voitureDetails.nombreJours || '0'} jours</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Coût total</p>
                                  <p className="font-medium text-blue-600">{coutTotalVoiture.toLocaleString()} €</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Disponibilité</p>
                                  <p className="font-medium text-green-600">✓ Disponible</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                   {/* Détails des commentaires */}
               {commentaires.filter(c => Number(c.offreId) === Number(selectedOffre.id)).length > 0 && (
                   <div className="mb-8">
                     <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                       <MessageCircle className="w-6 h-6 mr-2 text-purple-600" />
                           Avis des Voyageurs
                     </h3>
                   <div className="space-y-4">
                     {commentaires
                              .filter(c => Number(c.offreId) === Number(selectedOffre.id))
                               .map(c => (
                   <div key={c.id} className="bg-gray-50 rounded-xl p-6">
                       <div className="flex items-start">
                          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-purple-600" />
                       </div>
                     <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center">
                         <div className="flex mr-2">{renderStars(c.notes)}</div>
                            <span className="text-sm font-medium text-gray-900">{c.notes}/5</span>
                         </div>
                            <span className="text-sm text-gray-500">
                             {c.dateCommentaire ? formatDateTime(c.dateCommentaire) : 'Date non spécifiée'}
                            </span>
                         </div>
                            <p className="text-gray-700 mb-3 leading-relaxed">
                              "{c.contenuCommentaire || 'Aucun contenu'}"
                            </p>
                         </div>
                      </div>
                     </div>
                         ))}
                    </div>
                  </div>
                )}
                    {/* Récapitulatif des prix */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                     <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                          Récapitulatif des Prix
                    </h3>
                  <div className="space-y-3">
                     {/* Prix du voyage */}
                  <div className="flex justify-between">
                    <span>Voyage par personne:</span>
                    <span className="font-medium">{selectedOffre.prixParPers?.toLocaleString() || '0'} €</span>
                  </div>

                     {/* Prix du véhicule */}
                     {coutTotalVoiture > 0 && (
                  <div className="flex justify-between">
                    <span>Véhicule ({voitureDetails?.nombreJours} jours):</span>
                    <span className="font-medium">{coutTotalVoiture.toLocaleString()} €</span>
                  </div>
                      )}
 
                     {/* Prix de l'hébergement */}
                      {hebergementDetails && (
                  <div className="flex justify-between">
                       <span>Hébergement ({hebergementDetails.nombreNuit || 0} nuit(s)):</span>
                       <span className="font-medium">
                     {((hebergementDetails.fraisParNuit || 0) * (hebergementDetails.nombreNuit || 0)).toLocaleString()} €
                       </span>
                  </div>
                 )}

                    {/* Total estimé */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                         <span>Total estimé:</span>
                         <span className="text-blue-600">
                        {(
                          (selectedOffre.prixParPers || 0) +
                           coutTotalVoiture +
                           ((hebergementDetails?.fraisParNuit || 0) * (hebergementDetails?.nombreNuit || 0))
                         ).toLocaleString()} €
                         </span>
                    </div>
                  </div>
                 </div>
                </div>

                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default OffresClient;