import React, { useState, useEffect, useRef } from 'react';
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
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✅ Informations utilisateur
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    contact: user?.contact || ''
  });

  // ✅ Photo locale (non enregistrée dans la base)
  const [photo, setPhoto] = useState<string | null>(
    localStorage.getItem(`photo_${user?.id}`) || null
  );

  // ✅ Référence pour la vidéo (caméra)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // ✅ Ouvrir la caméra
  const openCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert("Impossible d'accéder à la caméra.");
      console.error(error);
    }
  };

  // ✅ Capturer la photo depuis la caméra
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      setPhoto(imageUrl);
      if (user?.id) localStorage.setItem(`photo_${user.id}`, imageUrl);
      stopCamera();
    }
  };

  // ✅ Fermer la caméra
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  // ✅ Gestion du changement de photo (fichier)
const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setPhoto(base64Data);
      if (user?.id) localStorage.setItem(`photo_${user.id}`, base64Data);
    };
    reader.readAsDataURL(file); // 👈 Convertit en base64
  }
};


  // ✅ Supprimer la photo
  const removePhoto = () => {
    setPhoto(null);
    if (user?.id) localStorage.removeItem(`photo_${user.id}`);
  };

  // ✅ Mise à jour des infos utilisateur (sans photo)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('tsikidia_token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      };
      const res = await axios.put(
        `http://localhost:4005/utilisateur/${user?.id}`,
        formData,
        config
      );
      setUser(res.data);
      setIsEditModalOpen(false);
      alert("Informations mises à jour avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Erreur lors de la mise à jour : " + (error.response?.data?.message || error.message));
    }
  };

  const [reservationsPaiements, setReservationsPaiements] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // ✅ Gestion notifications/messages (inchangé)
  const getReadNotifications = () => {
    const key = `readNotifications_${user?.role}_${user?.id}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  const markNotificationAsReadLocally = (id: number) => {
    const key = `readNotifications_${user?.role}_${user?.id}`;
    const readIds = JSON.parse(localStorage.getItem(key) || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(key, JSON.stringify(readIds));
    }
  };

  const getReadMessages = () => {
    const key = `readMessages_${user?.role}_${user?.id}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  const markMessageAsReadLocally = (id: number) => {
    const key = `readMessages_${user?.role}_${user?.id}`;
    const readIds = JSON.parse(localStorage.getItem(key) || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(key, JSON.stringify(readIds));
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
    setReservationsPaiements(prev => prev.map(n => (n.id === notif.id ? { ...n, lu: true } : n)));
    markNotificationAsReadLocally(notif.id);
    if (notif.lien) navigate(notif.lien);
  };

  const marquerMsgCommeLu = (msg: Message) => {
    setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, lu: true } : m)));
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
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative z-40">
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
              <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-xl overflow-hidden z-60 max-h-96 overflow-y-auto animate-fade-in">
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
              <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-xl overflow-hidden z-60 max-h-96 overflow-y-auto animate-fade-in">
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

      {/* Utilisateur */}
          <div className="relative">
            <div
              className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => setIsUserOpen(prev => !prev)}
            >
              {/* ✅ Photo utilisateur */}
              <div className="relative w-10 h-10">
                {photo ? (
                  <img
                    src={photo}
                    alt="Profil"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.nom?.charAt(0) || "U"}
                  </div>
                )}

                {/* Boutons */}
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <label
                    htmlFor="photoInput"
                    className="bg-white-500 text-white rounded-full p-1 cursor-pointer hover:bg-white-600 text-xs"
                    title="Changer la photo"
                  >
                    📁
                  </label>
                  <button
                    type="button"
                    onClick={openCamera}
                    className="bg-white-500 text-white rounded-full p-1 hover:bg-white-600 text-xs"
                    title="Prendre un selfie"
                  >
                    📷
                  </button>
                </div>

                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="text-sm">
                <p className="font-semibold text-gray-800">{user?.nom}</p>
                <p className="text-gray-500 text-xs">{user?.role}</p>
              </div>
            </div>
            {/* ✅ Caméra (selfie) */}
            {isCameraOpen && (
              <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50">
                <video ref={videoRef} autoPlay playsInline className="rounded-lg shadow-lg w-80 h-64 object-cover" />
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={capturePhoto}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Capturer
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {/* ✅ Menu utilisateur */}
            {isUserOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl border border-gray-200 rounded-2xl z-60 animate-cart-open">
                <div className="p-4 text-white font-semibold text-center rounded-t-2xl bg-blue-200">
                  👤 Informations
                </div>
                <div className="p-4 text-sm text-gray-700 space-y-2">
                  <p><span className="font-semibold">Nom:</span> {user?.nom}</p>
                  <p><span className="font-semibold">Email:</span> {user?.email}</p>
                  <p><span className="font-semibold">Rôle:</span> {user?.role}</p>
                  {user?.contact && <p><span className="font-semibold">Contact:</span> {user.contact}</p>}
                </div>
                <div className="p-3 border-t text-center">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-blue-400 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Modifier mes informations
                  </button>
                  {photo && (
                    <button
                      onClick={removePhoto}
                      className="ml-2 bg-gray-300 text-sm px-3 py-1 rounded-lg hover:bg-gray-400"
                    >
                      Supprimer la photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ✅ Fenêtre modale de modification */}
            {isEditModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-70">
                <div className="bg-white w-96 rounded-2xl shadow-xl p-6 animate-cart-open">
                  <h3 className="text-lg font-semibold mb-4 text-center text-blue-700">
                    Modifier mes informations
                  </h3>
                  <form onSubmit={handleUpdateUser} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom</label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full border rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact</label>
                      <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full border rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
