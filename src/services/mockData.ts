import { User, Hebergement, Voiture, Visite, Activite, Offre, Reservation, Payement, Commentaire, Message } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    nom: 'Admin User',
    email: 'admin@tsikidia.com',
    mot_de_passe: 'admin123',
    role: 'admin',
    contact: '+261340000001'
  },
  {
    id: 2,
    nom: 'Jean Rakoto',
    email: 'jean@client.com',
    mot_de_passe: 'client123',
    role: 'client',
    contact: '+261340000002'
  }
];

export const mockHebergements: Hebergement[] = [
  {
    id: 1,
    nom: 'Hôtel Colbert',
    adresse: 'Antananarivo',
    etoile: 4,
    fraisParNuit: 150000,
    nombreNuit:5
  },
  {
    id: 2,
    nom: 'Relais des Plateaux',
    adresse: 'Antsirabe',
    etoile: 3,
    fraisParNuit: 80000,
    nombreNuit:3
    
  }
];

export const mockVoitures: Voiture[] = [
  {
    id: 1,
    immatriculation: '1234 TAA',
    marque: 'Toyota',
    modele: 'Hiace',
    capacite: 12,
    nombreJours:5,
    coutParJours: 200000
  },
  {
    id: 2,
    immatriculation: '5678 TAA',
    marque: 'Mitsubishi',
    modele: 'Pajero',
    capacite: 7,
    nombreJours:2,
    coutParJours: 150000
  }
];

export const mockActivites: Activite[] = [
  {
    id: 1,
    descriptionActivite: 'Découverte de l\'histoire royale malgache',
    dateActivite: '09:00',
    lieuActivite: 'Antananarivo'
  },
  {
    id: 2,
    descriptionActivite: 'Trek dans les montagnes d\'Ankaratra',
    dateActivite: '06:00',
    lieuActivite: 'Antsirabe'
  }
];

export const mockVisites: Visite[] = [
  {
    id: 1,
    activiteId:1,
    hebergementId:1,
    ville: 'Antananarivo',
    dateVisite: '2024-03-15',
    ordreVisite: 1
  },
  {
    id: 2,
    activiteId:1,
    hebergementId:1,
    ville: 'Antsirabe',
    dateVisite: '2024-03-16',
    ordreVisite: 2
  }
];

export const mockCommentaires: Commentaire[] = [
  {
    id: 1,
    dateCommentaire: '2024-02-20',
    contenuCommentaire: 'Excellente expérience ! Guide très professionnel.',
    notes: 5,
    utilisateurId: 1,
    offreId: 1
  }
];

export const mockOffres: Offre[] = [
  {
    id: 1,
    visiteId:1,
    voitureId:1,
    titreOffre: 'Circuit des Hauts Plateaux',
    prixParPers: 500000,
    dateDepart: '2024-03-15',
    dateRetour: '2024-03-18',
    descriptionOffre: 'Découverte des merveilles des Hauts Plateaux malgaches',
    duree: 4,
    placeDisponible: 8,
    imagePrincipale: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
  }
];

export const mockReservations: Reservation[] = [
  {
    id: 1,
    nombrePers: 2,
    dateReservation: '2024-02-10',
    dateExpiration:'2024-02-10' ,
    prixParPersonne:20,
    montantTotal: 1000000,
    statut: false,
    utilisateurId: 1,
    offreId: 1,
    offre: mockOffres[0],
    utilisateur: mockUsers[1]
  }
];

export const mockPayements: Payement[] = [
  {
    id: 1,
    montant: 1000000,
    date: '2024-02-10',
    modePayement: 'Mobile Money',
    status: 'Confirmé',
    description: 'paiement pour reserver',
    reservationId: 1,
    utilisateurId: 2,
    reservation: mockReservations[0]
  }
];

export const mockMessages: Message[] = [
  {
    id: 1,
    dateEnvoie: '2024-02-25T10:30:00',
    contenuMessage: 'Bonjour, je souhaite avoir des informations sur votre circuit des Hauts Plateaux.',
    expediteurId: 1,
    destinataireId:5
  },
  {
    id: 2,
    dateEnvoie: '2024-02-25T10:45:00',
    contenuMessage: 'Bonjour ! Je serais ravi de vous renseigner. Ce circuit dure 4 jours et comprend la visite d\'Antananarivo et Antsirabe.',
    expediteurId: 2,
    destinataireId:1
  }
];