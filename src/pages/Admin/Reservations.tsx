import React, { useState } from 'react';
import ReservationList from '../../components/admin/Reservations';
import { mockReservations } from '../../services/mockData';
import { Reservation } from '../../types';

const Reservations: React.FC = () => {
  const [reservations] = useState<Reservation[]>(mockReservations);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Liste des Réservations
        </h1>
      </div>

      {/* On affiche juste la liste, sans options */}
      <ReservationList
        reservations={reservations}
       // onEdit={undefined}   // pas besoin
        onDelete={undefined} // pas besoin
      />
    </div>
  );
};

export default Reservations;
