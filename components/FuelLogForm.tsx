import React, { useState, useEffect } from 'react';
import { FuelLog } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { FuelPumpIcon } from './icons';

interface FuelLogFormProps {
  editingFuelLog: FuelLog | null;
  onDone: () => void;
}

const FuelLogForm: React.FC<FuelLogFormProps> = ({ editingFuelLog, onDone }) => {
  const { addFuelLog, updateFuelLog } = useAppContext();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState('');
  const [liters, setLiters] = useState('');
  const [cost, setCost] = useState('');
  const [errors, setErrors] = useState<{ date?: string; odometer?: string; liters?: string; cost?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // CORREÇÃO APLICADA AQUI
    if (editingFuelLog !== null) {
      setDate(editingFuelLog.date);
      setOdometer(editingFuelLog.odometer.toString());
      setLiters(editingFuelLog.liters.toString());
      setCost(editingFuelLog.cost.toString());
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setOdometer('');
      setLiters('');
      setCost('');
    }
    setErrors({});
  }, [editingFuelLog]);

  const validate = () => {
    const newErrors: { date?: string; odometer?: string; liters?: string; cost?: string } = {};
    if (!date) newErrors.date = "Data é obrigatória.";
    if (!odometer.trim() || isNaN(parseFloat(odometer)) || parseFloat(odometer) <= 0) {
      newErrors.odometer = "Odômetro deve ser um número positivo.";
    }
    if (!liters.trim() || isNaN(parseFloat(liters)) || parseFloat(liters) <= 0) {
      newErrors.liters = "Litros deve ser um número positivo.";
    }
    if (!cost.trim() || isNaN(parseFloat(cost)) || parseFloat(cost) <= 0) {
      newErrors.cost = "Custo deve ser um número positivo.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const fuelLogData = {
      date,
      odometer: parseFloat(odometer),
      liters: parseFloat(liters),
      cost: parseFloat(cost),
    };

    try {
      // CORREÇÃO APLICADA AQUI
      if (editingFuelLog !== null) {
        await updateFuelLog({ ...editingFuelLog, ...fuelLogData });
      } else {
        await addFuelLog(fuelLogData as any);
      }
      onDone();
    } catch (error) {
        alert("Erro ao salvar abastecimento. Verifique o console.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h3 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
        <FuelPumpIcon className="w-8 h-8 mr-3 text-purple-600" />
        {editingFuelLog ? 'Editar Abastecimento' : 'Registrar Novo Abastecimento'}
      </h3>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="odometer" className="block text-sm font-medium text-gray-700 mb-1">Odômetro (km)</label>
        <input
          type="number"
          id="odometer"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          min="0"
          step="0.1"
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${errors.odometer ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: 150320.5"
        />
        {errors.odometer && <p className="text-red-500 text-xs mt-1">{errors.odometer}</p>}
      </div>

      <div>
        <label htmlFor="liters" className="block text-sm font-medium text-gray-700 mb-1">Litros Abastecidos</label>
        <input
          type="number"
          id="liters"
          value={liters}
          onChange={(e) => setLiters(e.target.value)}
          min="0.01"
          step="0.01"
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${errors.liters ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: 45.50"
        />
        {errors.liters && <p className="text-red-500 text-xs mt-1">{errors.liters}</p>}
      </div>

      <div>
        <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">Custo Total (R$)</label>
        <input
          type="number"
          id="cost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          min="0.01"
          step="0.01"
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${errors.cost ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: 250.00"
        />
        {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-4 gap-3 sm:gap-0">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : (editingFuelLog ? 'Salvar Alterações' : 'Registrar Abastecimento')}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
export default FuelLogForm;