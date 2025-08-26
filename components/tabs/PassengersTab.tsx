import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import PassengerForm from '../PassengerForm';
import { Passenger } from '../../types';
import { PencilIcon, TrashIcon, UserPlusIcon, MapPinIcon } from '../icons';

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
          className="flex items-center justify-center sm:justify-start bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          <span className="truncate">Novo Passageiro</span>
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {passengers.length === 0 ? (
          <p className="p-8 text-center text-gray-500 text-lg">Nenhum passageiro registrado ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {passengers.map((passenger) => (
              <li key={passenger.id} className="p-4 sm:p-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-semibold text-blue-700 truncate">{passenger.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1 truncate">
                      <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{passenger.address}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Valor por Viagem: <span className="font-medium text-green-600">R$ {passenger.valuePerTrip.toFixed(2)}</span>
                    </p>
                  </div>
                  {/* Botões ficam na lateral em telas grandes, e embaixo em telas pequenas */}
                  <div className="flex space-x-3 ml-0 mt-4 sm:mt-0 sm:ml-4">
                    <button
                      onClick={() => handleEdit(passenger)}
                      className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition duration-150"
                      title="Editar Passageiro"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(passenger.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition duration-150"
                      title="Excluir Passageiro"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PassengersTab;