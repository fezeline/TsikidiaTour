import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar fixe */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header fixe */}
        <Header />

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
