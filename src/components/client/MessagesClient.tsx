import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Message, User as UserType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [admin, setAdmin] = useState<UserType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth(); // client connecté

  // Scroll automatique
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Récupérer l'admin
  const getAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:4005/utilisateur/");
      const adminUser = res.data.find((u: UserType) => u.role.toLowerCase() === 'admin');
      if (adminUser) setAdmin(adminUser);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'admin:", error);
    }
  };

  // Récupérer les messages du client et de l'admin
  const getMessages = async () => {
    try {
      const res = await axios.get("http://localhost:4005/message/");
      // Filtrer uniquement les messages entre le client et l'admin
      const filtered = res.data.filter(
        (msg: Message) =>
          (msg.expediteurId === user?.id && msg.destinataireId === admin?.id) ||
          (msg.expediteurId === admin?.id && msg.destinataireId === user?.id)
      );
      setMessages(filtered);
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
    }
  };

  useEffect(() => {
    getAdmin();
  }, []);

  // Quand l'admin est défini, récupérer les messages
  useEffect(() => {
    if (admin) getMessages();
  }, [admin]);

  // Envoyer un message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !admin || !user) return;

    const messagePayload = {
      dateEnvoie: new Date().toISOString(),
      contenuMessage: newMessage,
      expediteurId: user.id,       // client
      destinataireId: admin.id,    // admin
    };

    try {
      const res = await axios.post("http://localhost:4005/message", messagePayload);
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Conversation avec l'admin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card title="Admin" className="lg:col-span-1">
          {admin && (
            <div className="p-3 rounded-lg bg-blue-100 border-blue-300">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{admin.nom}</p>
                  <p className="text-xs text-gray-600">{admin.email}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-3">
          {admin ? (
            <div className="flex flex-col h-96">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map(message => (
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
                      <p className="text-xs mt-1 ${
                        message.expediteurId === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }">
                        {new Date(message.dateEnvoie).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
              <p>Chargement de l'admin...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
