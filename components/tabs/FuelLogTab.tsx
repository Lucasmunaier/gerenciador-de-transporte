import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import FuelLogForm from '../FuelLogForm';
import { FuelLog } from '../../types';
import { PencilIcon, TrashIcon, FuelPumpIcon } from '../icons';


const FuelLogTab: React.FC = () => {
  const { fuelLogs, deleteFuelLog } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLog | null>(null);

  const handleAddNew = () => {
    setEditingFuelLog(null);
    setShowForm(true);
  };

  const handleEdit = (log: FuelLog) => {
    setEditingFuelLog(log);
    setShowForm(true);
  };

  const handleDelete = async (logId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro de abastecimento?")) {
      try {
        await deleteFuelLog(logId);
      } catch (error) {
        alert("Erro ao excluir o registro de abastecimento.");
      }
    }
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingFuelLog(null);
  };
  
  const sortedFuelLogs = useMemo(() => {
    return [...fuelLogs].sort((a,b) => b.odometer - a.odometer);
  }, [fuelLogs]);


  if (showForm) {
    return <FuelLogForm editingFuelLog={editingFuelLog} onDone={handleFormDone} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Controle de Abastecimentos</h2>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          <FuelPumpIcon className="w-5 h-5 mr-2" />
          <span className="truncate">Registrar Novo Abastecimento</span>
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {/* --- VISUALIZAÇÃO DE TABELA PARA TELAS GRANDES (hidden sm:block) --- */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odômetro</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Litros</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumo (km/L)</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFuelLogs.length > 0 ? sortedFuelLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{log.odometer.toLocaleString('pt-BR')} km</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{log.liters.toFixed(2)} L</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">R$ {log.cost.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                    {log.km_per_liter ? `${log.km_per_liter.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                    <button onClick={() => handleEdit(log)} className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full transition duration-150" title="Editar"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(log.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition duration-150" title="Excluir"><TrashIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Nenhum abastecimento registrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- VISUALIZAÇÃO DE CARDS PARA CELULAR (block sm:hidden) --- */}
        <div className="block sm:hidden">
          {sortedFuelLogs.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {sortedFuelLogs.map(log => (
                <li key={log.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      <p className="text-sm text-gray-600">{log.odometer.toLocaleString('pt-BR')} km</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEdit(log)} className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full"><PencilIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(log.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">Litros</p>
                      <p className="font-medium text-gray-800">{log.liters.toFixed(2)} L</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-md">
                      <p className="text-xs text-green-700">Custo</p>
                      <p className="font-medium text-green-800">R$ {log.cost.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-md">
                      <p className="text-xs text-blue-700">Consumo</p>
                      <p className="font-medium text-blue-800">{log.km_per_liter ? `${log.km_per_liter.toFixed(2)} km/L` : '-'}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-10 text-gray-500">Nenhum abastecimento registrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuelLogTab;