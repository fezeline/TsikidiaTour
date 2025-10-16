import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Reservation } from "../../types";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, CreditCard, User, Tag, Gift } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface ReservationFormProps {
  reservation?: Reservation;
  onSubmit: (data: Reservation) => Promise<void>; // attention : doit retourner une promesse
  onCancel: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ reservation, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<Reservation>({
    id: reservation?.id || 0,
    nombrePers: reservation?.nombrePers || 0,
    dateReservation: reservation?.dateReservation || "",
    prixParPersonne: reservation?.prixParPersonne || 0,
    montantTotal: reservation?.montantTotal || 0,
    statut: reservation?.statut && reservation.statut !== "ANNULEE" ? reservation.statut : "EN_ATTENTE",
    utilisateurId: reservation?.utilisateurId || 0,
    offreId: reservation?.offreId || 0,
  });

  const [offres, setOffres] = useState<{ id: number; titreOffre: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les offres
  useEffect(() => {
    const fetchData = async () => {
      try {
        const offreRes = await axios.get("http://localhost:4005/offre/");
        setOffres(offreRes.data);
      } catch (err) {
        console.error("Erreur lors du chargement des offres:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const offre = offres.find((o) => o.id === formData.offreId);

  // Recalcul du montant total
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      montantTotal: prev.nombrePers * prev.prixParPersonne,
    }));
  }, [formData.nombrePers, formData.prixParPersonne]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    if (["nombrePers", "prixParPersonne", "utilisateurId", "offreId"].includes(name)) {
      newValue = Number(newValue);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      if (reservation?.id) {
        // Modification
        const response: AxiosResponse = await axios.put(`http://localhost:4005/reservation/${formData.id}`, formData);
        await onSubmit(response.data);
        alert("Réservation modifiée avec succès !");
      } else {
        // Création
        await onSubmit(formData); // doit retourner une promesse dans la prop onSubmit
        navigate("/client/reservation");
      }
    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      if (err.response?.status === 400) {
        alert("Données invalides. Vérifiez les informations saisies.");
      } else {
        alert("Erreur : " + (err.response?.data?.error || err.message));
      }
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl">
        {/* En-tête */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {reservation?.id ? "Modifier une réservation" : "Ajouter une réservation"}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre de personnes */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 mr-2 text-blue-600" /> Nombre de personnes
            </label>
            <input
              type="number"
              name="nombrePers"
              min={1}
              max={10}
              value={formData.nombrePers}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Date de réservation */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" /> Date de réservation
            </label>
            <input
              type="date"
              name="dateReservation"
              value={formData.dateReservation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Prix par personne et Montant total */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Tag className="w-4 h-4 mr-2 text-green-600" /> Prix par personne
              </label>
              <input
                type="number"
                name="prixParPersonne"
                value={formData.prixParPersonne}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <CreditCard className="w-4 h-4 mr-2 text-purple-600" /> Montant total
              </label>
              <input
                type="number"
                name="montantTotal"
                value={formData.montantTotal}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              name="statut"
              value={formData.statut ? formData.statut : "EN_ATTENTE"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  statut: e.target.value as "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            > 
              <option value="CONFIRMEE">Confirmée</option>  
            </select>
          </div>

          {/* Utilisateur connecté */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 mr-2 text-green-600" /> Utilisateur
            </label>
            <input
              type="text"
              value={user?.nom + " (" + user?.email + ")"}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          {/* Offre correspondante */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Gift className="w-4 h-4 mr-2 text-pink-600" /> Offre correspondante
            </label>
            <input
              type="text"
              value={offre ? offre.titreOffre : "Non spécifiée"}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium"
            />
          </div>

          {/* Pied du formulaire */}
          <div className="flex justify-end gap-3 border-t px-6 py-4 bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md"
            >
              {reservation?.id ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
