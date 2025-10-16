import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, mot_de_passe: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isClient: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('tsikidia_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = async (email: string, mot_de_passe: string): Promise<boolean> => {
    try {
      const res = await axios.post('http://localhost:4005/api/auth/login', {
        email,
        mot_de_passe
      });

      if (res.data?.user && res.data?.token) {
        setUser(res.data.user);
        localStorage.setItem('tsikidia_user', JSON.stringify(res.data.user));
        localStorage.setItem('tsikidia_token', res.data.token); // pour utiliser le token dans les requêtes
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur login:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tsikidia_user');
    localStorage.removeItem('tsikidia_token');
  };

  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isClient, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
