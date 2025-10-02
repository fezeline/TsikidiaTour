import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Charger la clé publique depuis .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface PaymentFormData {
  montant: number;
  description: string;
}

const CheckoutForm: React.FC<{ montant: number; description: string }> = ({ montant, description }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Appeler ton backend pour créer le PaymentIntent
      const response = await fetch("http://localhost:4005/payement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montant,
          description,
          utilisateurId: 1,  // 🔹 à remplacer dynamiquement
          reservationId: 26, // 🔹 à remplacer dynamiquement
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur côté serveur : " + response.statusText);
      }

      const data = await response.json();
      const clientSecret = data.clientSecret;

      if (!stripe || !elements) {
        throw new Error("Stripe non initialisé");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Champ carte introuvable");
      }

      // Confirmer le paiement avec Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        setError(result.error.message || "Erreur lors du paiement");
      } else if (result.paymentIntent?.status === "succeeded") {
        setSuccess(true);

        // 🔹 Tu peux notifier ton backend ici pour marquer le paiement comme "succès"
        await fetch(`http://localhost:4005/payement/${data.payementId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statut: "SUCCES" }),
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors du paiement");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block text-sm font-medium text-gray-700">
        Carte de Crédit
      </label>
      <div className="p-3 border border-gray-300 rounded-md">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">✅ Paiement réussi !</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
      >
        {loading ? "Traitement..." : "Payer"}
      </button>
    </form>
  );
};

const PaymentForm: React.FC = () => {
  const [formData] = useState<PaymentFormData>({
    montant: 20.5,
    description: "Test paiement réservation",
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <CreditCard className="mr-2" />
        Formulaire de Paiement
      </h1>

      <Elements stripe={stripePromise}>
        <CheckoutForm montant={formData.montant} description={formData.description} />
      </Elements>
    </div>
  );
};

export default PaymentForm;
