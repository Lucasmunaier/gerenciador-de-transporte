import React, { useState, useEffect } from 'react';
import { Trip, TripType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { TRIP_TYPE_OPTIONS } from '../constants';
import { CalendarDaysIcon } from './icons';

interface TripFormProps {
  editingTrip: Trip | null;
  onDone: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ editingTrip, onDone }) => {
  const { passengers, addTrip, updateTrip } = useAppContext();
  const [passenger_id, setpassenger_id] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TripType>(TripType.IDA);
  const [errors, setErrors] = useState<{ passenger_id?: string; date?: string; type?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // CORREÇÃO APLICADA AQUI
    if (editingTrip !== null) {
      setpassenger_id(editingTrip.passenger_id);
      setDate(editingTrip.date);
      setType(editingTrip.type);
    } else {
      if (passengers.length > 0) {
        setpassenger_id(passengers[0].id);
      }
      setDate(new Date().toISOString().split('T')[0]);
      setType(TripType.IDA);
    }
    setErrors({});
  }, [editingTrip, passengers]);

  const validate = () => {
    const newErrors: { passenger_id?: string; date?: string; type?: string } = {};
    if (!passenger_id) newErrors.passenger_id = "Selecione um passageiro.";
    if (!date) newErrors.date = "Data é obrigatória.";
    if (!type) newErrors.type = "Tipo de viagem é obrigatório.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const selectedPassenger = passengers.find(p => p.id === passenger_id);
    if (!selectedPassenger) {
        setErrors(prev => ({...prev, passenger_id: "Passageiro inválido selecionado."}));
        setIsSubmitting(false);
        return;
    }
    
    const tripData = {
      passenger_id: passenger_id,
      date,
      type,
      paid: editingTrip ? editingTrip.paid : false, // Mantém o status de pago se estiver editando
      tripValue: selectedPassenger.valuePerTrip * (type === TripType.AMBOS ? 2 : 1)
    };

    try {
      // CORREÇÃO APLICADA AQUI
      if (editingTrip !== null) {
        await updateTrip({ ...editingTrip, ...tripData });
      } else {
        await addTrip(tripData as any);
      }
      onDone();
    } catch (error) {
        console.error("Falha ao salvar viagem:", error);
        alert("Não foi possível salvar a viagem. Verifique o console para mais detalhes.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (passengers.length === 0 && !editingTrip) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow-sm">
        <p className="text-yellow-700 text-center">
          Você precisa registrar passageiros antes de adicionar viagens.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h3 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
        {editingTrip ? <CalendarDaysIcon className="w-8 h-8 mr-3 text-green-600" /> : <CalendarDaysIcon className="w-8 h-8 mr-3 text-blue-600" />}
        {editingTrip ? 'Editar Viagem' : 'Registrar Nova Viagem'}
      </h3>

      <div>
        <label htmlFor="passenger_id" className="block text-sm font-medium text-gray-700 mb-1">Passageiro</label>
        <select
          id="passenger_id"
          value={passenger_id}
          onChange={(e) => setpassenger_id(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.passenger_id ? 'border-red-500' : 'border-gray-300'}`}
          disabled={passengers.length === 0}
        >
          <option value="" disabled>Selecione um passageiro</option>
          {passengers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {errors.passenger_id && <p className="text-red-500 text-xs mt-1">{errors.passenger_id}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Viagem</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as TripType)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
        >
          {TRIP_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-4 gap-3 sm:gap-0">
        <button
          type="submit"
          disabled={isSubmitting || (passengers.length === 0 && !editingTrip)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : (editingTrip ? 'Salvar Alterações' : 'Registrar Viagem')}
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
export default TripForm;