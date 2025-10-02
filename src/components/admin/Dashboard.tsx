import React, { useEffect, useState } from "react";
import { 
  Users, Car, Gift, Calendar, CreditCard, TrendingUp, Activity, CheckCircle, Zap,Target,
  Award, RefreshCw, BarChart3, PieChart as PieChartIcon, Download, Star, ChevronUp,
  ChevronDown, Settings, Bell, Filter
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import axios from "axios";

interface Reservation {
  id: number;
  statut: 'CONFIRMEE' | 'EN_ATTENTE' | 'ANNULEE';
  dateReservation: string;
  dateExpiration?: string;
  nombrePers: number;
  montantTotal?: number;
  voitureId?: number;
  utilisateur: {
    email: string;
  };
  offre: {
    id: number;
    titreOffre: string;
  };
}

interface Offre {
  id: number;
  titreOffre: string;
}

interface Payement {
  id: number;
  montant: number; // float, TypeScript le considère comme number
  date: string;
  reservationId?: number;
  utilisateurEmail?: string;
}


interface Voiture {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
}

interface Utilisateur {
  id: number;
  email: string;
}

interface RevenusTemporels {
  date: string;
  montant: number;
}


const Dashboard = () => {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [payements, setPayements] = useState<Payement[]>([]);
  const [users, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offresRes, reservationsRes, voituresRes, payementsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:4005/offre/"),
        axios.get("http://localhost:4005/reservation/"),
        axios.get("http://localhost:4005/voiture/"),
        axios.get("http://localhost:4005/payement/"),
        axios.get("http://localhost:4005/utilisateur/"),
      ]);

      setOffres(offresRes.data);
      setReservations(reservationsRes.data);
      setVoitures(voituresRes.data);
      setPayements(payementsRes.data);
      setUtilisateurs(usersRes.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 800);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = (reservation: Reservation) => {
  if (!reservation.dateExpiration) return false;
  const expirationDate = new Date(reservation.dateExpiration);
  const now = new Date();
  return now >= expirationDate && reservation.statut === 'EN_ATTENTE';
};

const getStatutAffiche = (reservation: Reservation) => {
  return isExpired(reservation) ? 'ANNULEE' : reservation.statut;
};

  // 📊 Calculs statistiques
  const reservationsConfirmees = reservations.filter(r => getStatutAffiche(r) === "CONFIRMEE").length;
const reservationsEnAttente = reservations.filter(r => getStatutAffiche(r) === "EN_ATTENTE").length;
const reservationsAnnulees = reservations.filter(r => getStatutAffiche(r) === "ANNULEE").length;


  const isReservationActive = (reservation: Reservation) => {
  return (
    getStatutAffiche(reservation) === "CONFIRMEE" &&
    (!reservation.dateExpiration || new Date(reservation.dateExpiration) > new Date())
  );
};

const voituresOccupees = voitures.filter(v =>
  reservations.some(r => r.voitureId === v.id && isReservationActive(r))
).length;

const voituresDisponibles = voitures.length - voituresOccupees;

 const revenusTotaux = payements.reduce((sum, p) => sum + (p.montant ?? 0), 0);

  const now = new Date();
const revenusMensuels = payements
  .filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  })
  .reduce((sum, p) => sum + (p.montant ?? 0), 0);

const revenusHebdo = payements
  .filter(p => {
    const paymentDate = new Date(p.date);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return paymentDate >= weekAgo;
  })
  .reduce((sum, p) => sum + (p.montant ?? 0), 0);

  const tauxConfirmation = reservations.length > 0 ? ((reservationsConfirmees / reservations.length) * 100).toFixed(1) : 0;

  const stats = [
    { 
      title: "Revenus Totaux", 
      value: `${revenusTotaux.toLocaleString()} €`, 
      icon: CreditCard, 
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      subtitle: `${revenusMensuels.toLocaleString()} € ce mois`,
      trendUp: true
    },
    {
      title: "Taux Confirmation",
      value: `${tauxConfirmation}%`,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      trendUp: true
    },
    
    {
      title: "Revenus 7j",
      value: `${revenusHebdo.toLocaleString()} €`,
      icon: Zap,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      trendUp: true
    }
  ];

  // 📈 Données graphiques
  const revenusParMois = Array.from({ length: 12 }, (_, i) => ({
    mois: new Date(0, i).toLocaleString("fr", { month: "short" }),
    total: payements
      .filter((p) => new Date(p.date).getMonth() === i)
      .reduce((sum, p) => sum + (p.montant ?? 0), 0),
    reservations: reservations
      .filter((r) => new Date(r.dateReservation).getMonth() === i)
      .length
  }));

const revenusTemporels: RevenusTemporels[] = payements
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .reduce<RevenusTemporels[]>((acc, payment) => {
    const date = new Date(payment.date).toLocaleDateString('fr-FR');
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.montant += payment.montant || 0;
    } else {
      acc.push({ date, montant: payment.montant || 0 });
    }
    return acc;
  }, []);


const topOffres = offres
  .map((o) => {
    const offreReservations = reservations.filter((r) => r.offre?.id === o.id);

    const confirmees = offreReservations.filter(r => getStatutAffiche(r) === "CONFIRMEE").length;
    const enAttente = offreReservations.filter(r => getStatutAffiche(r) === "EN_ATTENTE").length;
    const annulees = offreReservations.filter(r => getStatutAffiche(r) === "ANNULEE").length;

    const revenus = offreReservations
      .filter(r => getStatutAffiche(r) === "CONFIRMEE")
      .reduce((sum, r) => sum + (r.montantTotal || 0), 0);

    return {
      ...o,
      reservations: offreReservations.length,
      confirmees,
      enAttente,
      annulees,
      revenus,
      tauxConfirmation: offreReservations.length > 0 
        ? ((confirmees / offreReservations.length) * 100).toFixed(1) 
        : 0
    };
  })
  .sort((a, b) => b.reservations - a.reservations)
  .slice(0, 8);


  // 📈 Données du graphique
const reservationStatusData = [
  { name: "Confirmées", value: reservationsConfirmees, color: "#10b981" },
  { name: "En attente", value: reservationsEnAttente, color: "#f59e0b" },
  { name: "Annulées", value: reservationsAnnulees, color: "#ef4444" }
];


  const voitureStatusData = [
    { name: "Disponibles", value: voituresDisponibles, color: "#10b981" },
    { name: "Occupés", value: voituresOccupees, color: "#ef4444" }
  ];

  return (
     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative z-30">
      {/* Header avec design moderne */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tableau de bord Administrateur
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRefresh}
                className={`p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-300 ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 p-6 space-y-8">
        {/* Statistiques améliorées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    {stat.subtitle}
                  </p>
                )}
              </div>
              
              {/* Effet de survol */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Graphique des revenus mensuels */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  Revenus mensuels
                </h2>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenusParMois}>
                    <defs>
                      <linearGradient id="revenusGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mois" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        borderRadius: '12px', 
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area 
                      type="monotone"
                      dataKey="total" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fill="url(#revenusGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Répartition des réservations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  État des réservations
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reservationStatusData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={30}
                      >
                        {reservationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
               <div className="space-y-2">
                  {reservationStatusData.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: stat.color }}></span>
                        <span className="text-gray-700">{stat.name}</span>
                      </div>
                      <span className="font-semibold">{stat.value}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-8">
            {/* Évolution temporelle des revenus */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                Évolution des revenus
              </h2>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenusTemporels}>
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        borderRadius: '12px', 
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="montant" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparaison revenus vs réservations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                Revenus vs Réservations
              </h2>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenusParMois}>
                    <XAxis dataKey="mois" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        borderRadius: '12px', 
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar yAxisId="left" dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="reservations" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Top Offres amélioré */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              Top Offres Performantes
            </h2>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topOffres.map((offre, idx) => (
              <div key={offre.id} className="group relative p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm ${
                    idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                    idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                    'bg-gradient-to-r from-blue-400 to-blue-600'
                  }`}>
                    {idx + 1}
                  </div>
                  
                  {idx < 3 && (
                    <div className="flex items-center">
                      {idx === 0 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      {idx === 1 && <Award className="w-4 h-4 text-gray-500" />}
                      {idx === 2 && <Target className="w-4 h-4 text-orange-500" />}
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-3 text-sm leading-tight">
                  {offre.titreOffre}
                </h3>
                
               <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Réservations</span>
                    <span className="font-semibold text-blue-600">{offre.reservations}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Confirmées</span>
                    <span className="font-semibold text-green-600">{offre.confirmees}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">En attente</span>
                    <span className="font-semibold text-yellow-600">{offre.enAttente}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Annulées</span>
                    <span className="font-semibold text-red-600">{offre.annulees}</span>
                  </div>
                </div>

                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Taux confirmation</span>
                    <div className="flex items-center">
                      {/* Assurez-vous que c'est un nombre pour la comparaison */}
                      {(() => {
                        const taux = Number(offre.tauxConfirmation);
                        const colorClass =
                          taux >= 80 ? 'text-green-600' :
                          taux >= 60 ? 'text-yellow-600' :
                          'text-red-600';
                        return <span className={`text-xs font-bold ${colorClass}`}>{taux}%</span>;
                      })()}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        Number(offre.tauxConfirmation) >= 80
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : Number(offre.tauxConfirmation) >= 60
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${Number(offre.tauxConfirmation)}%` }}
                    ></div>
                  </div>
                </div>

                
                {/* Effet de survol */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques avancées des véhicules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Car className="w-5 h-5 text-pink-600" />
              </div>
              État de la flotte
            </h2>
            
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
                  <span className="font-medium text-gray-800">Véhicules non disponibles</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{voituresOccupees}</span>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Taux d'utilisation</span>
                  <span>{((voituresOccupees / voitures.length) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${(voituresOccupees / voitures.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              Activité récente
            </h2>
            
            <div className="space-y-4">
              {reservations.slice(0, 5).map((reservation, idx) => (
                <div key={reservation.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-3 h-3 rounded-full mr-4 ${reservation.statut ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {reservation.utilisateur.email} - {reservation.offre.titreOffre}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(reservation.dateReservation).toLocaleDateString('fr-FR')} • {reservation.nombrePers} pers.
                    </p>
                  </div>
                  <div 
                    className={`w-3 h-3 rounded-full mr-4 
                      ${getStatutAffiche(reservation) === "CONFIRMEE" ? 'bg-green-500' :
                        getStatutAffiche(reservation) === "EN_ATTENTE" ? 'bg-yellow-500' :
                        'bg-red-500'}`}>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs ${
                      getStatutAffiche(reservation) === "CONFIRMEE" ? 'text-green-600' :
                      getStatutAffiche(reservation) === "EN_ATTENTE" ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getStatutAffiche(reservation) === "CONFIRMEE" ? 'Confirmée' :
                      getStatutAffiche(reservation) === "EN_ATTENTE" ? 'En attente' :
                      'Annulée'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Dashboard;