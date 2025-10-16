import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Gift,
  Calendar,
  Star,
  TrendingUp,
  Search,
  MapPin,
  User,
  CheckCircle,
  Car
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axios from 'axios';

interface Reservation {
  id: number;
  statut: 'CONFIRMEE' | 'EN_ATTENTE' | 'ANNULEE';
  dateReservation: string;
  dateExpiration?: string;
  nombrePers: number;
  montantTotal?: number;
  destination?: string;
  utilisateur: {
    email: string;
  };
  offre: {
    id: number;
    titreOffre: string;
    prix: number;
  };
  voitureId?: number;
}

interface Commentaire {
  id: number;
  notes: number;
  contenuCommentaire: string;
  dateCommentaire: string;
}

interface Offre {
  id: number;
  titreOffre: string;
  description: string;
  prix: number;
  duree: number;
  destination: string;
}

interface Voiture {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy] = useState<'date' | 'destination'>('date');

  useEffect(() => {
    if (!user) return;
    let timer: number;

    const fetchData = async () => {
      const startTime = Date.now();
      try {
        console.log("🔄 Chargement des données...");
        
        const [resReservations, resCommentaires, resOffres, resVoitures] = await Promise.all([
          axios.get(`http://localhost:4005/reservation?utilisateurId=${user.id}`),
          axios.get(`http://localhost:4005/commentaire?utilisateurId=${user.id}`),
          axios.get(`http://localhost:4005/offre/`),
          axios.get(`http://localhost:4005/voiture/`)
        ]);

        console.log("✅ Voitures reçues:", resVoitures.data);
        console.log("✅ Réservations reçues:", resReservations.data);

        setReservations(resReservations.data || []);
        setCommentaires(resCommentaires.data || []);
        setOffres(resOffres.data || []);
        setVoitures(resVoitures.data || []);

        console.log(`✅ ${resVoitures.data?.length || 0} voitures chargées`);

      } catch (error) {
        console.error("❌ Erreur lors du chargement des données :", error);
        if (axios.isAxiosError(error)) {
          console.error("Détails de l'erreur:", {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
          });
        }
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 2000 - elapsed);
        timer = window.setTimeout(() => {
          setIsLoading(false);
          console.log("📊 État final - Voitures:", voitures);
        }, remaining);
      }
    };

    fetchData();
    return () => clearTimeout(timer);
  }, [user]);

  // Fonctions de calcul similaires au dashboard admin
  const isExpired = (reservation: Reservation) => {
    if (!reservation.dateExpiration) return false;
    const expirationDate = new Date(reservation.dateExpiration);
    const now = new Date();
    return now >= expirationDate && reservation.statut === 'EN_ATTENTE';
  };

  const getStatutAffiche = (reservation: Reservation) => {
    return isExpired(reservation) ? 'ANNULEE' : reservation.statut;
  };

  // Calculs statistiques comme dans le dashboard admin
  const reservationsConfirmees = reservations.filter(r => getStatutAffiche(r) === "CONFIRMEE").length;
  const reservationsEnAttente = reservations.filter(r => getStatutAffiche(r) === "EN_ATTENTE").length;
  const reservationsAnnulees = reservations.filter(r => getStatutAffiche(r) === "ANNULEE").length;

  const moyenneNotes = commentaires.length > 0 
    ? (commentaires.reduce((sum, c) => sum + c.notes, 0) / commentaires.length).toFixed(1)
    : "0.0";

  // Calculs basés sur les offres et voitures

  const tauxConfirmation = reservations.length > 0 ? 
    ((reservationsConfirmees / reservations.length) * 100).toFixed(1) : "0.0";

  // CALCUL DU STATUT DES VOITURES BASÉ SUR LES RÉSERVATIONS
  const getStatutVoiture = (voitureId: number) => {
    const reservationActive = reservations.find(r => 
      r.voitureId === voitureId && 
      getStatutAffiche(r) === "CONFIRMEE" &&
      (!r.dateExpiration || new Date(r.dateExpiration) > new Date())
    );
    
    return reservationActive ? 'OCCUPEE' : 'DISPONIBLE';
  };

  // Statistiques des voitures - calculées dynamiquement
  const voituresAvecStatut = voitures.map(voiture => ({
    ...voiture,
    statut: getStatutVoiture(voiture.id)
  }));

  const voituresDisponibles = voituresAvecStatut.filter(v => v.statut === 'DISPONIBLE').length;
  const voituresOccupees = voituresAvecStatut.filter(v => v.statut === 'OCCUPEE').length;

  console.log("📊 Statistiques voitures:", {
    total: voitures.length,
    disponibles: voituresDisponibles,
    occupees: voituresOccupees
  });

  // Données pour les graphiques

  const reservationStatusData = [
    { name: "Confirmées", value: reservationsConfirmees, color: "#10b981" },
    { name: "En attente", value: reservationsEnAttente, color: "#f59e0b" },
    { name: "Annulées", value: reservationsAnnulees, color: "#ef4444" }
  ];

  

  // Top offres populaires
  const topOffres = offres
    .map((offre) => {
      const offreReservations = reservations.filter(r => r.offre?.id === offre.id);
      return {
        ...offre,
        reservations: offreReservations.length,
        confirmees: offreReservations.filter(r => getStatutAffiche(r) === "CONFIRMEE").length,
        enAttente: offreReservations.filter(r => getStatutAffiche(r) === "EN_ATTENTE").length,
        annulees: offreReservations.filter(r => getStatutAffiche(r) === "ANNULEE").length,
        revenus: offreReservations
          .filter(r => getStatutAffiche(r) === "CONFIRMEE")
          .reduce((sum, r) => sum + (r.montantTotal || offre.prix || 0), 0),
        tauxConfirmation: offreReservations.length > 0 
          ? ((offreReservations.filter(r => getStatutAffiche(r) === "CONFIRMEE").length / offreReservations.length) * 100).toFixed(1)
          : "0.0"
      };
    })
    .sort((a, b) => b.reservations - a.reservations)
    .slice(0, 4);

  // Filtrage et tri des réservations
  let filteredReservations = selectedMonth !== null
    ? reservations.filter(r => new Date(r.dateReservation).getMonth() === selectedMonth)
    : reservations;

  if (searchTerm) {
    filteredReservations = filteredReservations.filter(r =>
      r.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.offre?.titreOffre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filteredReservations.sort((a, b) => {
    if (sortBy === 'date') return new Date(b.dateReservation).getTime() - new Date(a.dateReservation).getTime();
    return (a.destination || '').localeCompare(b.destination || '');
  });

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-pulse"></div>
            <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 animate-pulse">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-12">

      {/* Navigation par onglets */}
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-2 flex gap-2 mb-8 mt-20">
          {[
              { id: 'overview', label: 'Aperçu', icon: TrendingUp },
              { id: 'reservations', label: 'Réservations', icon: Calendar, badge: reservations.length },
              { id: 'reviews', label: 'Avis', icon: Star, badge: commentaires.length },
              { id: 'offres', label: 'Offres', icon: Gift, badge: offres.length }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => { setActiveTab(tab.id); setSelectedMonth(null); }}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {/* CORRECTION : Vérification que badge existe et est > 0 */}
                {(tab.badge && tab.badge > 0) && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-white text-green-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
        </div>

        {/* ONGLET APERÇU */}
        {activeTab === 'overview' && (
          <>
            {/* Cartes statistiques principales */}
            <div className="flex flex-wrap gap-4 mb-8">
               <Card className="flex-1 min-w-[250px] text-center p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-yellow-500 mb-1">{moyenneNotes}</p>
                <p className="text-gray-600 text-sm font-medium">Note moyenne</p>
                <p className="text-xs text-gray-500 mt-1">{commentaires.length} avis</p>
              </Card>

              <Card className="flex-1 min-w-[250px] text-center p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">{voituresDisponibles}</p>
                <p className="text-gray-600 text-sm font-medium">Véhicules dispo</p>
                <p className="text-xs text-gray-500 mt-1">sur {voitures.length} total</p>
              </Card>
              
               <Card className="flex-1 min-w-[250px] text-center p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">{tauxConfirmation}%</p>
                <p className="text-gray-600 text-sm font-medium">Taux confirmation</p>
              </Card>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

              {/* État des réservations */}
              <Card title="📊 État des réservations" className="hover:shadow-xl transition-shadow">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 text-center">
                    <p className="text-2xl font-bold text-green-600">{reservationsConfirmees}</p>
                    <p className="text-sm text-gray-600">Confirmées</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{reservationsEnAttente}</p>
                    <p className="text-sm text-gray-600">En attente</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-600">{reservationsAnnulees}</p>
                    <p className="text-sm text-gray-600">Annulées</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={reservationStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        >
                          {reservationStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                </div>
              </Card>

              {/* État de la flotte */}
              <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-pink-50 rounded-lg">
                      <Car className="w-5 h-5 text-pink-600" />
                    </div>
                    État de la flotte
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-800">Véhicules disponibles</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{voituresDisponibles}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-800">Véhicules occupés</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{voituresOccupees}</span>
                  </div>

                  {/* Détails des voitures */}
                  {voitures.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Détails des véhicules :</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {voituresAvecStatut.map((voiture) => (
                          <div key={voiture.id} className="flex justify-between items-center text-xs">
                            <span className="font-medium">{voiture.marque} {voiture.modele}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              voiture.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {voiture.statut.toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Top Offres */}
            <Card title="🏆 Offres populaires" className="hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                {topOffres.map((offre, idx) => (
                  <div key={offre.id} className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{offre.titreOffre}</h3>
                      <div className={`flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-500' :
                        idx === 1 ? 'bg-gray-500' :
                        idx === 2 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}>
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{offre.reservations} réservations</span>
                      <span className="font-bold text-green-600">{offre.prix} €</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-600 transition-all duration-500"
                        style={{ width: `${Number(offre.tauxConfirmation)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-gray-500">Taux confirmation</span>
                      <span className="font-semibold">{offre.tauxConfirmation}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ONGLET RÉSERVATIONS */}
        {activeTab === 'reservations' && (
          <Card title="✈️ Mes réservations" className="mb-8">
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredReservations.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? 'Aucune réservation ne correspond à votre recherche' : 'Aucune réservation trouvée'}
                  </p>
                </div>
              ) : (
                filteredReservations.map((res, i) => (
                  <div 
                    key={i} 
                    className="group p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                              {res.destination || res.offre?.titreOffre}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(res.dateReservation).toLocaleDateString("fr-FR", { 
                                weekday: 'long',
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <User className="w-4 h-4" />
                          <span>{res.nombrePers} personne{res.nombrePers > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                          getStatutAffiche(res) === "CONFIRMEE" ? 'bg-green-100 text-green-700' :
                          getStatutAffiche(res) === "EN_ATTENTE" ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {getStatutAffiche(res) === "CONFIRMEE" ? 'Confirmée' :
                           getStatutAffiche(res) === "EN_ATTENTE" ? 'En attente' : 'Annulée'}
                        </span>
                        {(res.montantTotal || res.offre?.prix) && (
                          <span className="text-2xl font-bold text-green-600">
                            {res.montantTotal || res.offre?.prix} €
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* ONGLET AVIS */}
        {activeTab === 'reviews' && (
          <Card title="⭐ Mes avis et commentaires" className="mb-8">
            <div className="space-y-4">
              {commentaires.length === 0 ? (
                <div className="text-center py-16">
                  <Star className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">Vous n'avez pas encore laissé d'avis</p>
                  <Button>
                    <Star className="w-4 h-4 mr-2" />
                    Donner mon premier avis
                  </Button>
                </div>
              ) : (
                commentaires.map((com, i) => (
                  <div 
                    key={i} 
                    className="p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-2xl shadow-md hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                          <Star className="w-6 h-6 text-white fill-current" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            {new Date(com.dateCommentaire).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star 
                            key={index}
                            className={`w-6 h-6 ${index < com.notes ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 italic leading-relaxed">
                      " {com.contenuCommentaire} "
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* ONGLET OFFRES */}
        {activeTab === 'offres' && (
          <Card title="🎁 Nos offres" className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offres.map((offre) => (
                <div 
                  key={offre.id}
                  className="group p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">{offre.prix} €</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                    {offre.titreOffre}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {offre.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>📍 {offre.destination}</span>
                    <span>⏱️ {offre.duree} jours</span>
                  </div>
                  
                  <Button className="w-full mt-4 group-hover:bg-green-600 group-hover:scale-105 transition-all">
                    <Calendar className="w-4 h-4 mr-2" />
                    Réserver maintenant
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;