// ARQUIVO: components/PassengerForm.tsx

import React, { useState, useEffect } from 'react';
import { Passenger } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { UserPlusIcon } from './icons';

interface PassengerFormProps {
  editingPassenger: Passenger | null;
  onDone: () => void;
}

const PassengerForm: React.FC<PassengerFormProps> = ({ editingPassenger, onDone }) => {
  const { addPassenger, updatePassenger } = useAppContext();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(''); // NOVO: Estado para o telefone
  const [valuePerTrip, setValuePerTrip] = useState('');
  const [errors, setErrors] = useState<{ name?: string; address?: string; phone?: string; valuePerTrip?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingPassenger) {
      setName(editingPassenger.name);
      setAddress(editingPassenger.address);
      setPhone(editingPassenger.phone || ''); // ATUALIZADO
      setValuePerTrip(editingPassenger.valuePerTrip.toString());
    } else {
      setName('');
      setAddress('');
      setPhone(''); // ATUALIZADO
      setValuePerTrip('');
    }
    setErrors({});
  }, [editingPassenger]);

  const validate = () => {
    const newErrors: { name?: string; address?: string; phone?: string; valuePerTrip?: string } = {};
    if (!name.trim()) newErrors.name = "Nome é obrigatório.";
    if (!address.trim()) newErrors.address = "Endereço é obrigatório.";
    if (!phone.trim()) newErrors.phone = "Telefone é obrigatório."; // ATUALIZADO
    if (!valuePerTrip.trim()) {
      newErrors.valuePerTrip = "Valor por viagem é obrigatório.";
    } else if (isNaN(parseFloat(valuePerTrip)) || parseFloat(valuePerTrip) <= 0) {
      newErrors.valuePerTrip = "Valor deve ser um número positivo.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const passengerData = {
      name,
      address,
      phone, // ATUALIZADO
      valuePerTrip: parseFloat(valuePerTrip),
    };
    
    try {
      if (editingPassenger) {
        await updatePassenger({ ...editingPassenger, ...passengerData });
      } else {
        await addPassenger(passengerData as any);
      }
      onDone();
    } catch (error) {
        alert("Erro ao salvar passageiro. Verifique o console.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <h3 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
        <UserPlusIcon className="w-8 h-8 mr-3 text-blue-600" />
        {editingPassenger ? 'Editar Passageiro' : 'Registrar Novo Passageiro'}
      </h3>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: João da Silva"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: Rua das Palmeiras, 123"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      {/* NOVO CAMPO DE TELEFONE */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
        <input
          type="text"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="(99) 99999-9999"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="valuePerTrip" className="block text-sm font-medium text-gray-700 mb-1">Valor por Viagem (R$)</label>
        <input
          type="number"
          id="valuePerTrip"
          value={valuePerTrip}
          onChange={(e) => setValuePerTrip(e.target.value)}
          min="0.01"
          step="0.01"
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.valuePerTrip ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: 15.50"
        />
        {errors.valuePerTrip && <p className="text-red-500 text-xs mt-1">{errors.valuePerTrip}</p>}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-4 gap-3 sm:gap-0">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : (editingPassenger ? 'Salvar Alterações' : 'Registrar Passageiro')}
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
export default PassengerForm;