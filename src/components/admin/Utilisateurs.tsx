import React, { useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

interface User {
  id: number;
  nom: string;
  email: string;
  mot_de_passe: string;
  role: string;
  contact?: string;
}

const AdminUtilisateurs: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  

  // Confirmation suppression
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Modification utilisateur
  const [editOpen, setEditOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  // Ajout utilisateur
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    nom: "",
    email: "",
    mot_de_passe: "",
    role: "admin",
    contact: "",
  });

  // Récupérer le token depuis le localStorage
  const token = localStorage.getItem("token");

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4005/utilisateur", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
      const data = await res.json();
      setUsers(data as User[]);
    } catch (err) {
      console.error("Erreur API :", err);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Réinitialisation automatique des messages
  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  // ---------- Suppression ----------
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem("tsikidia_token");
      if (!token) {
        setError("Token manquant. Veuillez vous reconnecter.");
        return;
      }

      const res = await fetch(`http://localhost:4005/utilisateur/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccess(`${userToDelete.nom || "Utilisateur"} supprimé avec succès.`);
    } catch (err) {
      console.error("Erreur suppression :", err);
      setError("Échec de la suppression.");
    } finally {
      setConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  // ---------- Modification ----------
  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setFormData(user);
    setEditOpen(true);
  };

const confirmEdit = async () => {
  if (!userToEdit) return;
  try {
    const token = localStorage.getItem("tsikidia_token");
    if (!token) {
      setError("Token manquant. Veuillez vous reconnecter.");
      return;
    }

    // ⚡ Supprimer mot_de_passe si vide (ne pas l’envoyer)
    const dataToSend = { ...formData };
    if (!dataToSend.mot_de_passe) {
      delete dataToSend.mot_de_passe;
    }

    const res = await fetch(`http://localhost:4005/utilisateur/${userToEdit.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    if (!res.ok) throw new Error("Erreur lors de la modification");

    const updatedUser = await res.json();
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setSuccess(`${updatedUser.nom || "Utilisateur"} modifié avec succès.`);
  } catch (err) {
    console.error("Erreur modification :", err);
    setError("Échec de la modification.");
  } finally {
    setEditOpen(false);
    setUserToEdit(null);
  }
};

  // ---------- Ajout ----------
  const confirmAdd = async () => {
    try {
      const token = localStorage.getItem("tsikidia_token");
      if (!token) {
        setError("Token manquant. Veuillez vous reconnecter.");
        return;
      }

      const res = await fetch(`http://localhost:4005/utilisateur`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Erreur lors de l’ajout");

      const createdUser = await res.json();
      setUsers((prev) => [...prev, createdUser]);
      setSuccess(`${createdUser.nom || "Utilisateur"} ajouté avec succès.`);
    } catch (err) {
      console.error("Erreur ajout :", err);
      setError("Échec de l’ajout.");
    } finally {
      setAddOpen(false);
      setNewUser({ nom: "", email: "", mot_de_passe: "", role: "admin", contact: "" });
    }
  };

  // Initiales
  const getInitials = (nom?: string) => {
    if (!nom || nom.trim() === "") return "?";
    return nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Couleur rôle
  const getRoleColor = (role?: string) => {
    const r = (role || "").toLowerCase();
    if (r === "admin") return "bg-red-100 text-red-800 border-red-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
         <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestion des Utilisateurs</h1>
         <p className="text-gray-600">Gérez tous les utilisateurs de votre plateforme</p>
        </div>

         <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setNewUser({ nom: "", email: "", mot_de_passe: "", role: "admin", contact: "" });
            setAddOpen(true);
          }}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Ajouter
        </button>

          </div>


        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <p className="text-red-700 font-medium">Erreur</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
            <p className="text-green-700 font-medium">Succès</p>
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="bg-white p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
                    {getInitials(user.nom)}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      <span className="ml-1 capitalize">{user.role || "admin"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Infos utilisateur */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{user.nom || "Utilisateur inconnu"}</h3>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📧</span>
                    <span className="truncate">{user.email || "Email non fourni"}</span>
                  </div>

                  {user.contact && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📞</span>
                      <span>{user.contact}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🔒</span>
                    <span className="font-mono">••••••••</span>
                  </div>
                </div>

               <div className="mt-auto pt-4 flex justify-end space-x-2">
                {user.role === "admin" ? (
                  <>
                    {/* Bouton Modifier */}
                    <button
                      className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                      className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Si ce n’est pas admin → seulement Supprimer */}
                    <button
                      className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              </div>
            </div>
          ))}
        </div>

        {/* Modal Confirmation Suppression */}
        {confirmOpen && userToDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmation</h2>
              <p className="text-gray-600 mb-6">
                Voulez-vous vraiment supprimer{" "}
                <span className="font-medium">{userToDelete.nom}</span> ?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Modification */}
        {editOpen && userToEdit && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Modifier l’utilisateur</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.nom || ""}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe (laisser vide si inchangé)"
                  value={formData.mot_de_passe || ""}
                  onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Contact"
                  value={formData.contact || ""}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <select
                  value={formData.role || ""}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmEdit}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ajout */}
        {addOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un utilisateur</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom"
                  value={newUser.nom || ""}
                  onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={newUser.mot_de_passe || ""}
                  onChange={(e) => setNewUser({ ...newUser, mot_de_passe: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Contact"
                  value={newUser.contact || ""}
                  onChange={(e) => setNewUser({ ...newUser, contact: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <select
                  value={newUser.role || "user"}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAdd}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUtilisateurs;
