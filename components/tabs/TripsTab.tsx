import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import TripForm from '../TripForm';
import { Trip, TripType } from '../../types';
import { PencilIcon, TrashIcon, CalendarDaysIcon, CheckCircleIcon, XCircleIcon } from '../icons';
import { TRIP_TYPE_OPTIONS } from '../../constants';

const TripsTab: React.FC = () => {
  const { trips, passengers, deleteTrip, updateTrip } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [filterPassengerId, setFilterPassengerId] = useState<string>('');
  const [filterTripType, setFilterTripType] = useState<string>('');

  const handleAddNew = () => {
    if (passengers.length === 0) {
      alert("Por favor, registre passageiros antes de adicionar viagens.");
      return;
    }
    setEditingTrip(null);
    setShowForm(true);
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleDelete = async (tripId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta viagem?")) {
      try {
        await deleteTrip(tripId);
      } catch (error) {
        alert("Erro ao excluir viagem.");
      }
    }
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingTrip(null);
  };

  const getPassengerName = (passenger_id: string) => {
    const passenger = passengers.find(p => p.id === passenger_id);
    return passenger ? passenger.name : 'Desconhecido';
  };

  const getTripTypeLabel = (type: TripType) => {
    return TRIP_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type;
  };

  const filteredTrips = useMemo(() => {
    return trips
      .filter(trip => filterPassengerId ? trip.passenger_id === filterPassengerId : true)
      .filter(trip => filterTripType ? trip.type === filterTripType : true)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trips, filterPassengerId, filterTripType]);

  if (showForm) {
    return <TripForm editingTrip={editingTrip} onDone={handleFormDone} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Registro de Viagens</h2>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
          disabled={passengers.length === 0}
        >
          <CalendarDaysIcon className="w-5 h-5 mr-2" />
          <span className="truncate">Nova Viagem</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg shadow">
        <div>
          <label htmlFor="filterPassenger" className="block text-sm font-medium text-gray-700">Filtrar por Passageiro:</label>
          <select 
            id="filterPassenger"
            value={filterPassengerId} 
            onChange={(e) => setFilterPassengerId(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Todos os Passageiros</option>
            {passengers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filterTripType" className="block text-sm font-medium text-gray-700">Filtrar por Tipo:</label>
          <select 
            id="filterTripType"
            value={filterTripType}
            onChange={(e) => setFilterTripType(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Todos os Tipos</option>
            {TRIP_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
    
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passageiro</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(trip.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{getPassengerName(trip.passenger_id)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{getTripTypeLabel(trip.type)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">R$ {trip.tripValue.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {trip.paid ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-4 h-4 mr-1" /> Pago
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="w-4 h-4 mr-1" /> Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                    <button
                      onClick={() => handleEdit(trip)}
                      className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition duration-150"
                      title="Editar Viagem"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition duration-150"
                      title="Excluir Viagem"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TripsTab;
