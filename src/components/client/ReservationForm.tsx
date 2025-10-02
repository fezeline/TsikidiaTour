import React, { useEffect, useState } from "react";
import axios from "axios";
import { Reservation } from "../../types";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, CreditCard, User, Tag, CheckCircle, X } from "lucide-react";


interface ReservationFormProps {
  reservation?: Reservation;
  onSubmit: (data: Reservation) => void;
  onCancel: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ reservation, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Reservation>({
    id: reservation?.id || 0,
    nombrePers: reservation?.nombrePers || 1,
    dateReservation: reservation?.dateReservation || "",
    prixParPersonne: reservation?.prixParPersonne || 0,
    montantTotal: reservation?.montantTotal || 0,
    statut: reservation?.statut || "EN_ATTENTE",
    utilisateurId: reservation?.utilisateurId || 0,
    offreId: reservation?.offreId || 0,
  });

  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingAvailability, setVerifyingAvailability] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, offresRes] = await Promise.all([
          axios.get("http://localhost:4005/utilisateur/"),
          axios.get("http://localhost:4005/offre/")
        ]);
        
        setUtilisateurs(usersRes.data);
        setOffres(offresRes.data);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      montantTotal: prev.nombrePers * prev.prixParPersonne
    }));
  }, [formData.nombrePers, formData.prixParPersonne]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    if (["nombrePers", "prixParPersonne", "utilisateurId", "offreId"].includes(name)) {
      newValue = Number(newValue);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    navigate("/client/reservation");
  };

  const handleEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.put(`http://localhost:4005/reservation/${formData.id}`, formData);
    onSubmit(response.data);
    alert("Réservation modifiée avec succès !");
  } catch (err: any) {
    console.error(err);
    alert("Erreur lors de la modification : " + (err.response?.data?.error || err.message));
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
     

      {/* Formulaire avec défilement */}
      <div className="max-h-[60vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de personnes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Nombre de personnes
            </label>
            <input
              type="number"
              name="nombrePers"
              min="1"
              max="10"
              value={formData.nombrePers}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Date de réservation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Date de réservation
            </label>
            <input
              type="date"
              name="dateReservation"
              value={formData.dateReservation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Prix par personne */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-green-600" />
              Prix par personne
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                name="prixParPersonne"
                value={formData.prixParPersonne}
                disabled
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
              />
            </div>
          </div>

          {/* Montant total */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
              Montant total
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                name="montantTotal"
                value={formData.montantTotal}
                disabled
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 font-semibold"
              />
            </div>
            <p className="text-sm text-gray-500">
              Calculé automatiquement: {formData.nombrePers} personne(s) × €{formData.prixParPersonne}
            </p>
          </div>

          {/* Statut */}
          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
          <select
            name="statut"
            value={formData.statut}
            onChange={(e) =>
              setFormData({ ...formData, statut: e.target.value as "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE" })
            }
            className="border rounded p-2"
          >
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="ANNULEE">Annulée</option>
          </select>

            
          </div>

          {/* Utilisateur */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-2 text-orange-600" />
              Utilisateur
            </label>
            <select
              name="utilisateurId"
              value={formData.utilisateurId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {utilisateurs.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nom} {u.prenom} - {u.email}
                </option>
              ))}
            </select>
          </div>

          {/* Offre */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-red-600" />
              Offre
            </label>
            <select
              name="offreId"
              value={formData.offreId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Sélectionner une offre</option>
              {offres.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.titreOffre || o.titre} - €{o.prixParPers}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Footer avec boutons */}
      <div className="bg-gray-50 p-6 border-t border-gray-200">
        <div className="flex justify-end space-x-4">
           <button
             type="button"
             onClick={onCancel}
             className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all"
           >
             Annuler
           </button>

            {reservation?.id ? (
            <button
              type="button"
              onClick={handleEdit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
            > 
              Modifier 
            </button>
           ) : (
            <button
               type="button"
               onClick={handleSubmit}
               className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Ajouter 
            </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default ReservationForm;