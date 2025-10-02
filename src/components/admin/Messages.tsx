import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Message, User as UserType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Récupérer tous les messages
  const getMessages = async () => {
    try {
      const res = await axios.get("http://localhost:4005/message/");
      setMessages(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
    }
  };

  // Récupérer tous les utilisateurs
  const getUtilisateurs = async () => {
    try {
      const res = await axios.get("http://localhost:4005/utilisateur/");
      setUsers(res.data);
      if (res.data.length > 0) setSelectedUser(res.data[0]);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  // Charger messages et utilisateurs + intervalle pour refresh
  useEffect(() => {
    getMessages();
    getUtilisateurs();

    const interval = setInterval(() => {
      getMessages();
    }, 3000); // rafraîchissement toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  // Envoyer un message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    const messagePayload = {
      dateEnvoie: new Date().toISOString(),
      contenuMessage: newMessage,
      expediteurId: user.id,
      destinataireId: selectedUser.id,
    };

    try {
      await axios.post("http://localhost:4005/message", messagePayload);
      setNewMessage('');
      getMessages(); // récupérer les messages à jour
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  // Filtrer les messages entre l'admin et le client sélectionné
  const filteredMessages = messages.filter(
    msg =>
      (msg.expediteurId === user?.id && msg.destinataireId === selectedUser?.id) ||
      (msg.expediteurId === selectedUser?.id && msg.destinataireId === user?.id)
  );

  const clients = users.filter(u => u.role.toLowerCase() === 'client');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communication avec les clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card title="Clients" className="lg:col-span-1">
          <div className="space-y-2">
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedUser(client)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === client.id ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{client.nom}</p>
                    <p className="text-xs text-gray-600">{client.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          {selectedUser ? (
            <div className="flex flex-col h-96">
              <div className="border-b pb-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedUser.nom}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {filteredMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.expediteurId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.expediteurId === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.contenuMessage}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.expediteurId === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.dateEnvoie).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <p>Sélectionnez un client pour commencer la conversation</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
