export interface User {
  id: number;
  nom: string;
  email: string;
  mot_de_passe: string;
  role: 'admin' | 'client';
  contact: string;
}

export interface Hebergement {
  id: number;
  nom: string;
  adresse: string;
  etoile: number;
  fraisParNuit: number;
  nombreNuit:number;
  calculerTotalFrais?: number;
}

export interface Voiture {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  capacite: number;
  nombreJours:number;
  coutParJours: number;
  calculerCoutTotal?: number;
}

export interface Visite {
  id: number;
  ville: string;
  dateVisite: string;
  ordreVisite: number;
  activiteId:number;
  hebergementId:number;
  activite?:Activite;
  hebergement?:Hebergement;
}

export interface Activite {
  id: number;
  descriptionActivite: string;
  dateActivite: string;
  lieuActivite: string;
}

export interface Offre {
  id: number;
  visiteId:number;
  voitureId:number;
  titreOffre: string;
  prixParPers: number;
  dateDepart: string;
  dateRetour: string;
  descriptionOffre: string;
  duree: number;
  placeDisponible: number;
  imagePrincipale: string;
  visite?: Visite;
  voiture?: Voiture;
 
}

export interface Reservation {
  id: number;
  nombrePers: number;
  dateReservation: string;
  dateExpiration?: string;
  prixParPersonne: number;
  montantTotal: number;
  statut: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE" | false; 
  utilisateurId: number;
  offreId: number;
  offre?: Offre;
  utilisateur?: User;
   offreTitre?: string; 
}

export interface Payement {
  id: number;
  montant:number;
  date: string;
  modePayement: string;
  status: string;
  description: string;
  utilisateurId: number;
  utilisateur?: User;
  reservationId: number;
  reservation?: Reservation;
}

export interface Commentaire {
  id: number;
  dateCommentaire: string;
  contenuCommentaire: string;
  notes: number;
  utilisateurId: number;
  offreId: number;
  offre?: Offre;
  utilisateur?: User;
}

export interface Message {
  id: number;
  dateEnvoie: string;
  contenuMessage: string;
  expediteurId: number;
  destinataireId: number;
  expediteur?: User;
  destinataire?: User;
}