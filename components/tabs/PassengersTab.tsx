// ARQUIVO: components/tabs/PassengersTab.tsx

import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import PassengerForm from '../PassengerForm';
import { Passenger } from '../../types';
import { PencilIcon, TrashIcon } from '../icons';

const PassengersTab: React.FC = () => {
  const { passengers, deletePassenger } = useAppContext();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);

  const handleEdit = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    setIsFormVisible(true);
  };

  const handleDelete = async (passenger_id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este passageiro? Esta ação não pode ser desfeita.")) {
      try {
        await deletePassenger(passenger_id);
      } catch (error) {
        alert("Erro ao excluir passageiro.");
      }
    }
  };

  const handleFormDone = () => {
    setIsFormVisible(false);
    setEditingPassenger(null);
  };

  if (isFormVisible) {
    return <PassengerForm editingPassenger={editingPassenger} onDone={handleFormDone} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Passageiros</h2>
        <button
          onClick={() => setIsFormVisible(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
        >
          Registrar Novo Passageiro
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor/Viagem</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {passengers.length > 0 ? passengers.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {p.valuePerTrip.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">Nenhum passageiro cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PassengersTab;