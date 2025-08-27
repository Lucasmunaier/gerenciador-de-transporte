import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import ChargeModal from '../ChargeModal';
import { Passenger, Trip } from '../../types';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon } from '../icons';

interface PassengerBillingInfo extends Passenger {
  totalDue: number;
  totalPaid: number;
  unpaidTrips: Trip[];
}

const BillingTab: React.FC = () => {
  const { passengers, trips } = useAppContext();
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const billingData = useMemo((): PassengerBillingInfo[] => {
    return passengers.map(passenger => {
      const passengerTrips = trips.filter(trip => trip.passenger_id === passenger.id);
      const unpaidTrips = passengerTrips.filter(trip => !trip.paid);
      const totalDue = unpaidTrips.reduce((sum, trip) => sum + trip.tripValue, 0);
      const totalPaid = passengerTrips.filter(trip => trip.paid).reduce((sum, trip) => sum + trip.tripValue, 0);
      
      return {
        ...passenger,
        unpaidTrips,
        totalDue,
        totalPaid,
      };
    }).sort((a, b) => b.totalDue - a.totalDue);
  }, [passengers, trips]);

  const handleOpenChargeModal = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPassenger(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Cobrança de Passageiros</h2>
      
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {passengers.length === 0 ? (
          <p className="p-8 text-center text-gray-500 text-lg">Nenhum passageiro registrado para exibir cobranças.</p>
        ) : billingData.length === 0 ? (
          <p className="p-8 text-center text-gray-500 text-lg">Nenhum passageiro com pagamentos pendentes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {billingData.map((info) => (
              <div key={info.id} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <h3 className="text-xl font-semibold text-blue-700 mb-3 truncate">{info.name}</h3>
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
                </div>
                <button
                  onClick={() => handleOpenChargeModal(info)}
                  className="mt-6 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                  disabled={info.unpaidTrips.length === 0}
                >
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  {info.unpaidTrips.length > 0 ? 'Realizar Cobrança' : 'Ver Detalhes'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedPassenger && (
        <ChargeModal 
          passenger={selectedPassenger}
          unpaidTrips={billingData.find(d => d.id === selectedPassenger.id)?.unpaidTrips || []}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BillingTab;