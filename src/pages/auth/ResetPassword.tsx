import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // icônes pour show/hide

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmMotDePasse, setConfirmMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Nouveaux états pour afficher/masquer
  const [showMotDePasse, setShowMotDePasse] = useState(false);
  const [showConfirmMotDePasse, setShowConfirmMotDePasse] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (motDePasse !== confirmMotDePasse) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:4005/api/mot/reset-password/${token}`,
        { mot_de_passe: motDePasse }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur serveur");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Réinitialiser le mot de passe</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showMotDePasse ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              className="border w-full p-2 rounded"
            />
            <button
              type="button"
              onClick={() => setShowMotDePasse(!showMotDePasse)}
              className="absolute right-2 top-2 text-gray-500"
            >
              {showMotDePasse ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmMotDePasse ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmMotDePasse}
              onChange={(e) => setConfirmMotDePasse(e.target.value)}
              required
              className="border w-full p-2 rounded"
            />
            <button
              type="button"
              onClick={() => setShowConfirmMotDePasse(!showConfirmMotDePasse)}
              className="absolute right-2 top-2 text-gray-500"
            >
              {showConfirmMotDePasse ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="bg-green-500 text-white w-full p-2 rounded"
          >
            Réinitialiser
          </button>
        </form>

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
