// ARQUIVO: components/tabs/FuelLogTab.tsx

import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import FuelLogForm from '../FuelLogForm';
import { FuelLog } from '../../types';
import { PencilIcon, TrashIcon } from '../icons';

const FuelLogTab: React.FC = () => {
  const { fuelLogs, deleteFuelLog } = useAppContext();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLog | null>(null);

  const handleEdit = (log: FuelLog) => {
    setEditingFuelLog(log);
    setIsFormVisible(true);
  };

  const handleDelete = async (logId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro de abastecimento?")) {
      try {
        await deleteFuelLog(logId);
      } catch (error) {
        alert("Erro ao excluir registro.");
      }
    }
  };

  const handleFormDone = () => {
    setIsFormVisible(false);
    setEditingFuelLog(null);
  };

  if (isFormVisible) {
    return <FuelLogForm editingFuelLog={editingFuelLog} onDone={handleFormDone} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Controle de Abastecimentos</h2>
        <button
          onClick={() => setIsFormVisible(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700"
        >
          Registrar Novo Abastecimento
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odômetro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Litros</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumo (km/L)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fuelLogs.length > 0 ? fuelLogs.map(log => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.odometer.toLocaleString('pt-BR')} km</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.liters.toFixed(2)} L</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">R$ {log.cost.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{log.km_per_liter ? log.km_per_liter.toFixed(2) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleEdit(log)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(log.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Nenhum abastecimento registrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FuelLogTab;