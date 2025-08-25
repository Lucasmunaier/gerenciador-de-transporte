import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Passenger, Trip } from '../../types';
import ChargeModal from '../ChargeModal';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon } from '../icons';

interface PassengerBillingInfo extends Passenger {
  totalDue: number;
  totalPaid: number;
  unpaidTrips: Trip[];
}

const BillingTab: React.FC = () => {
  const { passengers, trips } = useAppContext();
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerBillingInfo | null>(null);
  const [showChargeModal, setShowChargeModal] = useState(false);

  const passengerBillingInfo = useMemo((): PassengerBillingInfo[] => {
    return passengers.map(passenger => {
      const passengerTrips = trips.filter(trip => trip.passenger_id === passenger.id);
      const totalDue = passengerTrips
        .filter(trip => !trip.paid)
        .reduce((sum, trip) => sum + trip.tripValue, 0);
      const totalPaid = passengerTrips
        .filter(trip => trip.paid)
        .reduce((sum, trip) => sum + trip.tripValue, 0);
      return {
        ...passenger,
        totalDue,
        totalPaid,
        unpaidTrips: passengerTrips.filter(trip => !trip.paid)
      };
    });
  }, [passengers, trips]);

  const handleOpenChargeModal = (passengerInfo: PassengerBillingInfo) => {
    setSelectedPassenger(passengerInfo);
    setShowChargeModal(true);
  };

  const handleCloseChargeModal = () => {
    setShowChargeModal(false);
    setSelectedPassenger(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Cobrança de Passageiros</h2>

      {passengers.length === 0 ? (
         <p className="p-8 text-center text-gray-500 text-lg bg-white shadow-xl rounded-lg">Nenhum passageiro registrado para exibir informações de cobrança.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passengerBillingInfo.map(info => (
            <div key={info.id} className="bg-white shadow-xl rounded-lg p-6 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">{info.name}</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between items-center text-red-600">
                  <span className="flex items-center"><XCircleIcon className="w-5 h-5 mr-2 text-red-400" />Total Devido:</span>
                  <span className="font-bold">R$ {info.totalDue.toFixed(2)}</span>
                </p>
                <p className="flex justify-between items-center text-green-600">
                  <span className="flex items-center"><CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" />Total Pago:</span>
                  <span className="font-bold">R$ {info.totalPaid.toFixed(2)}</span>
                </p>
              </div>
              <button
                onClick={() => handleOpenChargeModal(info)}
                className="mt-6 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                disabled={info.unpaidTrips.length === 0 && info.totalDue === 0}
              >
                <CreditCardIcon className="w-5 h-5 mr-2" />
                {info.unpaidTrips.length > 0 ? 'Realizar Cobrança' : 'Ver Detalhes'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showChargeModal && selectedPassenger && (
        <ChargeModal
          passenger={selectedPassenger}
          unpaidTrips={selectedPassenger.unpaidTrips}
          onClose={handleCloseChargeModal}
        />
      )}
    </div>
  );
};

export default BillingTab;
