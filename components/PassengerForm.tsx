import React, { useState, useEffect } from 'react';
import { Passenger } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { UserPlusIcon, MagnifyingGlassIcon } from './icons';

// A INTERFACE QUE FALTAVA FOI ADICIONADA AQUI
interface PassengerFormProps {
  editingPassenger: Passenger | null;
  onDone: () => void;
}

const PassengerForm: React.FC<PassengerFormProps> = ({ editingPassenger, onDone }) => {
  const { addPassenger, updatePassenger } = useAppContext();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [valuePerTrip, setValuePerTrip] = useState('');
  const [notificationDistance, setNotificationDistance] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [errors, setErrors] = useState<{ name?: string; address?: string; phone?: string; valuePerTrip?: string; latitude?: string; longitude?: string; }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (editingPassenger) {
      setName(editingPassenger.name);
      setAddress(editingPassenger.address);
      setPhone(editingPassenger.phone || '');
      setValuePerTrip(editingPassenger.valuePerTrip.toString());
      setNotificationDistance(editingPassenger.notification_distance?.toString() || '200');
      setLatitude(editingPassenger.latitude?.toString() || '');
      setLongitude(editingPassenger.longitude?.toString() || '');
    } else {
      setName('');
      setAddress('');
      setPhone('');
      setValuePerTrip('');
      setNotificationDistance('200');
      setLatitude('');
      setLongitude('');
    }
    setErrors({});
  }, [editingPassenger]);
  
  const handleGeocodeAddress = async () => {
    if (!address.trim()) {
      alert("Por favor, preencha o campo de endereço antes de buscar as coordenadas.");
      return;
    }
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setLatitude(lat);
        setLongitude(lon);
        alert("Coordenadas encontradas e preenchidas!");
      } else {
        alert("Não foi possível encontrar coordenadas para este endereço. Tente ser mais específico.");
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
      alert("Ocorreu um erro ao buscar as coordenadas. Verifique o console.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const validate = () => {
    const newErrors: { name?: string; address?: string; phone?: string; valuePerTrip?: string; latitude?: string; longitude?: string; } = {};
    if (!name.trim()) newErrors.name = "Nome é obrigatório.";
    if (!address.trim()) newErrors.address = "Endereço é obrigatório.";
    if (!phone.trim()) newErrors.phone = "Telefone é obrigatório.";
    if (!valuePerTrip.trim() || isNaN(parseFloat(valuePerTrip)) || parseFloat(valuePerTrip) <= 0) {
      newErrors.valuePerTrip = "Valor deve ser um número positivo.";
    }
    if (latitude.trim() && isNaN(parseFloat(latitude))) {
        newErrors.latitude = "Latitude deve ser um número válido.";
    }
    if (longitude.trim() && isNaN(parseFloat(longitude))) {
        newErrors.longitude = "Longitude deve ser um número válido.";
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
      phone,
      valuePerTrip: parseFloat(valuePerTrip),
      notification_distance: notificationDistance ? parseInt(notificationDistance, 10) : null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
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
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-4 py-2 border rounded-md shadow-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`} required />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
        <div className="flex items-center space-x-2">
            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className={`w-full px-4 py-2 border rounded-md shadow-sm ${errors.address ? 'border-red-500' : 'border-gray-300'}`} placeholder="Ex: Rua, Número, Bairro, Cidade" required />
            <button type="button" onClick={handleGeocodeAddress} disabled={isGeocoding} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border rounded-md disabled:opacity-50" title="Buscar coordenadas automaticamente">
                {isGeocoding ? <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div> : <MagnifyingGlassIcon className="w-5 h-5 text-gray-600"/>}
            </button>
        </div>
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
        <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`w-full px-4 py-2 border rounded-md shadow-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} required />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

       <div>
        <label htmlFor="valuePerTrip" className="block text-sm font-medium text-gray-700 mb-1">Valor por Viagem (R$)</label>
        <input type="number" id="valuePerTrip" value={valuePerTrip} onChange={(e) => setValuePerTrip(e.target.value)} min="0.01" step="0.01" className={`w-full px-4 py-2 border rounded-md shadow-sm ${errors.valuePerTrip ? 'border-red-500' : 'border-gray-300'}`} required/>
        {errors.valuePerTrip && <p className="text-red-500 text-xs mt-1">{errors.valuePerTrip}</p>}
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-lg font-semibold text-gray-700">Configurações de Navegação</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input type="text" id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} className={`w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`} placeholder="Preenchido pela busca"/>
                {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
            </div>
            <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input type="text" id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} className={`w-full px-4 py-2 border rounded-md shadow-sm bg-gray-50 ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`} placeholder="Preenchido pela busca"/>
                {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
            </div>
        </div>
        
        <div className="mt-4">
            <label htmlFor="notificationDistance" className="block text-sm font-medium text-gray-700 mb-1">Distância para Notificação (metros)</label>
            <input type="number" id="notificationDistance" value={notificationDistance} onChange={(e) => setNotificationDistance(e.target.value)} min="50" step="10" className="w-full md:w-1/2 px-4 py-2 border rounded-md shadow-sm border-gray-300"/>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-4 gap-3 sm:gap-0">
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Salvando...' : (editingPassenger ? 'Salvar Alterações' : 'Registrar Passageiro')}
        </button>
        <button type="button" onClick={onDone} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </form>
  );
};
export default PassengerForm;