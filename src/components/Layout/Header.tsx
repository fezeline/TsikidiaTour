import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, MessageSquare, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  type: string;
  titre: string;
  description: string;
  lu: boolean;
  lien?: string;
}

interface Message {
  id: number;
  contenuMessage: string;
  destinataireId: number;
  lu: boolean;
  lien?: string;
}

// Interfaces pour les données de l'API
interface Reservation {
  id: number;
  utilisateurId: number;
  statut: string;
  dateReservation: string;
}

interface Paiement {
  id: number;
  utilisateurId: number;
  reservationId: number;
  status: string;
}

interface ApiMessage {
  id: number;
  contenuMessage: string;
  destinataireId: number;
}

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reservationsPaiements, setReservationsPaiements] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // LocalStorage notifications
  const getReadNotifications = () => JSON.parse(localStorage.getItem('readNotifications') || '[]');
  const markNotificationAsReadLocally = (id: number) => {
    const readIds = getReadNotifications();
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('readNotifications', JSON.stringify(readIds));
    }
  };

  // LocalStorage messages
  const getReadMessages = () => JSON.parse(localStorage.getItem('readMessages') || '[]');
  const markMessageAsReadLocally = (id: number) => {
    const readIds = getReadMessages();
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('readMessages', JSON.stringify(readIds));
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const [resReservations, resMessages, resPaiements] = await Promise.all([
          axios.get(`http://localhost:4005/reservation`),
          axios.get(`http://localhost:4005/message`),
          axios.get(`http://localhost:4005/payement`)
        ]);

        let reservations: any[] = [];
        let msgs: any[] = [];
        let paiements: any[] = [];

        const role = user.role.toLowerCase();

        if (role === "admin") {
          reservations = resReservations.data || [];
          msgs = resMessages.data || [];
          paiements = resPaiements.data || [];
        } else {
          reservations = (resReservations.data || []).filter((r: Reservation) => r.utilisateurId === user.id);
          msgs = (resMessages.data || []).filter((m: ApiMessage) => m.destinataireId === user.id);
          paiements = (resPaiements.data || []).filter((p: Paiement) => p.utilisateurId === user.id && p.status === "SUCCES");
        }

        const readNotifIds = getReadNotifications();
        const readMsgIds = getReadMessages();

        const notifList: Notification[] = [];

        reservations.forEach((r: Reservation) => {
          const expiration = new Date(r.dateReservation);
          expiration.setHours(expiration.getHours() + 24);
          const now = new Date();

          const lienReservation = role === "admin" ? `/admin/reservations` : `/client/reservation`;

          if (r.statut === "CONFIRMEE") {
            notifList.push({
              id: r.id,
              type: "RESERVATION_CONFIRMEE",
              titre: "Réservation confirmée",
              description: `Réservation #${r.id} est confirmée.`,
              lu: readNotifIds.includes(r.id),
              lien: lienReservation
            });
          }

          if (r.statut === "EN_ATTENTE" && now > expiration) {
            notifList.push({
              id: r.id,
              type: "RESERVATION_EXPIRÉE",
              titre: "Réservation expirée",
              description: `Réservation #${r.id} a expiré.`,
              lu: readNotifIds.includes(r.id),
              lien: lienReservation
            });
          }
        });

        paiements.forEach((p: Paiement) => notifList.push({
          id: p.id + 10000,
          type: "PAIEMENT_CONFIRME",
          titre: "Paiement confirmé",
          description: `Le paiement de la réservation #${p.reservationId} a été effectué.`,
          lu: readNotifIds.includes(p.id + 10000),
          lien: role === "admin" ? `/admin/payements` : `/client/payements`
        }));

        setReservationsPaiements(notifList.sort((a, b) => b.id - a.id));

        setMessages(msgs.map((m: ApiMessage) => ({
          id: m.id,
          contenuMessage: m.contenuMessage,
          destinataireId: m.destinataireId,
          lu: readMsgIds.includes(m.id),
          lien: role === "admin" ? `/admin/messages` : `/client/messages`
        })));

      } catch (error) {
        console.error("Erreur lors du chargement des notifications :", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const notifCount = reservationsPaiements.filter(n => !n.lu).length;
  const msgCount = messages.filter(m => !m.lu).length;

  const marquerNotifCommeLu = (notif: Notification) => {
    setReservationsPaiements(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, lu: true } : n))
    );
    markNotificationAsReadLocally(notif.id);
    if (notif.lien) navigate(notif.lien);
  };

  const marquerMsgCommeLu = (msg: Message) => {
    setMessages(prev =>
      prev.map(m => (m.id === msg.id ? { ...m, lu: true } : m))
    );
    markMessageAsReadLocally(msg.id);
    if (msg.lien) navigate(msg.lien);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "RESERVATION_CONFIRMEE": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "RESERVATION_EXPIRÉE": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "PAIEMENT_CONFIRME": return <CreditCard className="w-5 h-5 text-yellow-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative z-40"> {/* ✅ Augmenté à z-40 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center space-x-6">

          {/* Messages */}
          <div className="relative">
            <button
              className="relative p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition"
              onClick={() => setIsMsgOpen(prev => !prev)}
            >
              <MessageSquare className="w-6 h-6 text-gray-700" />
              {msgCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {msgCount}
                </span>
              )}
            </button>
            {isMsgOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-xl overflow-hidden z-60 max-h-96 overflow-y-auto animate-fade-in"> {/* ✅ z-60 */}
                <div className="p-3 border-b bg-blue-50 text-blue-700 font-semibold">📩 Messages</div>
                {messages.length === 0 ? (
                  <p className="p-4 text-gray-500 text-sm">Aucun message.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 flex gap-3 items-start hover:bg-gray-100 transition cursor-pointer ${!m.lu ? "bg-yellow-50" : ""}`}
                      onClick={() => marquerMsgCommeLu(m)}
                    >
                      <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">Nouveau message</h4>
                        <p className="text-xs text-gray-600">{m.contenuMessage}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 rounded-full bg-gray-100 hover:bg-green-100 transition"
              onClick={() => setIsNotifOpen(prev => !prev)}
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-xl overflow-hidden z-60 max-h-96 overflow-y-auto animate-fade-in"> {/* ✅ z-60 */}
                <div className="p-3 border-b bg-green-50 text-green-700 font-semibold">🔔 Notifications</div>
                {reservationsPaiements.length === 0 ? (
                  <p className="p-4 text-gray-500 text-sm">Aucune notification.</p>
                ) : (
                  reservationsPaiements.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 flex gap-3 items-start hover:bg-gray-100 transition cursor-pointer ${!notif.lu ? "bg-yellow-50" : ""}`}
                      onClick={() => marquerNotifCommeLu(notif)}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{notif.titre}</h4>
                        <p className="text-xs text-gray-600">{notif.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Utilisateur sous forme de carte */}
          <div className="relative">
            <div
              className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => setIsUserOpen(prev => !prev)}
            >
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.nom?.charAt(0) || "U"}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{user?.nom}</p>
                <p className="text-gray-500 text-xs">{user?.role}</p>
              </div>
            </div>

            {isUserOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl border border-gray-200 rounded-2xl z-60 transform transition-all duration-300 animate-cart-open"> {/* ✅ z-60 */}
                <div className="p-4 text-white font-semibold text-center rounded-t-2xl bg-blue-600">
                  👤 Informations
                </div>
                <div className="p-4 text-sm text-gray-700 space-y-2">
                  <p><span className="font-semibold">Nom:</span> {user?.nom}</p>
                  <p><span className="font-semibold">Email:</span> {user?.email}</p>
                  <p><span className="font-semibold">Rôle:</span> {user?.role}</p>
                  {user?.contact && <p><span className="font-semibold">Contact:</span> {user.contact}</p>}
                </div>
              </div>
            )}

            <style>
              {`
                @keyframes cart-open {
                  0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-cart-open {
                  animation: cart-open 0.25s ease-out forwards;
                }
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(-5px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                  animation: fade-in 0.2s ease-out;
                }
              `}
            </style>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;