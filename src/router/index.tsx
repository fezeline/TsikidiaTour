import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import MainLayout from '../components/Layout/MainLayout';
import PublicLayout from '../components/Layout/PublicLayout';
import ResetPassword from "../pages/auth/ResetPassword";
import ForgotPassword from '../pages/auth/forgotpassword';

// Public Pages
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ServicesPage from '../pages/public/ServicesPage';
import DestinationsPage from '../pages/public/DestinationsPage';
import CircuitsPage from '../pages/public/CircuitsPage';

// Admin Pages
import Dashboard from '../components/admin/Dashboard';
import Voitures from '../pages/Admin/Voitures';
import Hebergements from '../pages/Admin/Hebergements';
import Visites from '../pages/Admin/Visites';
import Activites from '../pages/Admin/Activites';
import Offres from '../pages/Admin/Offres';
import Reservations from '../pages/Admin/Reservations';
import Payements from '../pages/Admin/Payements';
import Messages from '../components/admin/Messages';
import Commentaires from '../pages/Admin/Commentaires';
import Utilisateurs from '../components/admin/Utilisateurs';

// Client Pages
import ClientDashboard from '../components/client/Dashboard';
import OffresClient from '../components/client/Offres';
import Reservation from '../components/client/Reservation';
import Payement from '../components/client/Payement';
import Commentaire from '../components/client/Commentaires';
import MessagesClient from '../components/client/MessagesClient';

 


const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'admin' | 'CLIENT' }> = ({ 
  children, 
  requiredRole 
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />;
  }

  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="circuits" element={<CircuitsPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={
          user ? <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          user ? <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace /> : <RegisterPage />
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="voitures" element={<Voitures />} />
          <Route path="messages" element={<Messages />} />
          <Route path="visites" element={<Visites />} /> 
          <Route path="hebergements" element={<Hebergements />} /> 
          <Route path="activites" element={<Activites />} /> 
          <Route path="offres" element={<Offres />} />         
          <Route path="reservations" element={<Reservations />} />         
          <Route path="payements" element={<Payements />} />   
          <Route path="commentaires" element={<Commentaires />} />      
          <Route path="utilisateurs" element={<Utilisateurs />} />
        </Route>

        {/* Client Routes */}
        <Route path="/client" element={
          <ProtectedRoute requiredRole="CLIENT">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ClientDashboard />} />
          <Route path="offres" element={<OffresClient />} />
          <Route path="reservation" element={<Reservation />} />          
          <Route path="payements" element={<Payements/>} />
          <Route path="commentaires" element={<Commentaires />} />
          <Route path="messages" element={<MessagesClient />} />      
       </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;