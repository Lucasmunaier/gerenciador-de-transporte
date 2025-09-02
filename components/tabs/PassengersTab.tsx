import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import PassengerForm from '../PassengerForm';
import { Passenger } from '../../types';
import { PencilIcon, TrashIcon, UserPlusIcon, LocationMarkerIcon } from '../icons';

const PassengersTab: React.FC = () => {
  const { passengers, deletePassenger } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);

  const handleAddNew = () => {
    setEditingPassenger(null);
    setShowForm(true);
  };

  const handleEdit = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    setShowForm(true);
  };

  const handleDelete = async (passengerId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este passageiro e todas as suas viagens associadas?")) {
      try {
        await deletePassenger(passengerId);
      } catch (error) {
        alert("Erro ao excluir passageiro.");
      }
    }
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingPassenger(null);
  };

  if (showForm) {
    return <PassengerForm editingPassenger={editingPassenger} onDone={handleFormDone} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Gerenciar Passageiros</h2>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          <span className="truncate">Novo Passageiro</span>
        </button>
      </div>

      <div>
        {passengers.length === 0 ? (
          <p className="p-8 text-center text-gray-500 text-lg bg-white rounded-lg shadow-md">Nenhum passageiro registrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {passengers.map((passenger) => (
              <div key={passenger.id} className="bg-white rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:scale-105">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-bold text-blue-700 mb-2">{passenger.name}</h4>
                    <div className="flex space-x-2 flex-shrink-0 ml-2">
                      <button onClick={() => handleEdit(passenger)} className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full" title="Editar"><PencilIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(passenger.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Excluir"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 flex items-start mt-1">
                    <LocationMarkerIcon className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>{passenger.address}</span>
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed">
                    <p className="text-sm text-gray-600">
                      Valor por Viagem: <span className="font-bold text-lg text-green-600">R$ {passenger.valuePerTrip.toFixed(2)}</span>
                    </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengersTab;