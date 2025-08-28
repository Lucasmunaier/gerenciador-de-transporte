import React, { useState, useEffect } from 'react';
import { Passenger } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { UserPlusIcon } from './icons';

// Interface para o tipo de sugestão da API Geoapify
interface GeoapifySuggestion {
  properties: {
    place_id: string;
    formatted: string;
    lat: number;
    lon: number;
  };
}

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

  const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; address?: string; phone?: string; valuePerTrip?: string; latitude?: string; longitude?: string; }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // SUA CHAVE DA API VAI AQUI
  const GEOAPIFY_API_KEY = "8317afb8ac164227b779b0d6d003679a";

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
  
  useEffect(() => {
    if (address.length < 3) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}`);
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // Um pouco mais rápido para uma melhor experiência

    return () => {
      clearTimeout(handler);
    };
  }, [address]);

  const handleSuggestionClick = (suggestion: GeoapifySuggestion) => {
    setAddress(suggestion.properties.formatted);
    setLatitude(suggestion.properties.lat.toString());
    setLongitude(suggestion.properties.lon.toString());
    setSuggestions([]);
  };

  const validate = (): boolean => {
      // Implemente a validação conforme necessário
      return true;
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
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-md shadow-sm" required />
      </div>
      
      <div className="relative">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
        <input 
          type="text" 
          id="address" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          className="w-full px-4 py-2 border rounded-md shadow-sm"
          placeholder="Comece a digitar o endereço..." 
          required 
          autoComplete="off"
        />
        {isSearching && <div className="absolute top-9 right-3 w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((s) => (
              <li 
                key={s.properties.place_id} 
                onClick={() => handleSuggestionClick(s)}
                className="p-3 hover:bg-blue-50 cursor-pointer text-sm"
              >
                {s.properties.formatted}
              </li>
            ))}
          </ul>
        )}
      </div>

       <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
        <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-md shadow-sm" required />
      </div>
       <div>
        <label htmlFor="valuePerTrip" className="block text-sm font-medium text-gray-700 mb-1">Valor por Viagem (R$)</label>
        <input type="number" id="valuePerTrip" value={valuePerTrip} onChange={(e) => setValuePerTrip(e.target.value)} min="0.01" step="0.01" className="w-full px-4 py-2 border rounded-md shadow-sm" required/>
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-lg font-semibold text-gray-700">Configurações de Navegação</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input type="text" id="latitude" value={latitude} readOnly className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-100" placeholder="Automático"/>
            </div>
            <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input type="text" id="longitude" value={longitude} readOnly className="w-full px-4 py-2 border rounded-md shadow-sm bg-gray-100" placeholder="Automático"/>
            </div>
        </div>
        <div className="mt-4">
            <label htmlFor="notificationDistance" className="block text-sm font-medium text-gray-700 mb-1">Distância para Notificação (metros)</label>
            <input type="number" id="notificationDistance" value={notificationDistance} onChange={(e) => setNotificationDistance(e.target.value)} min="50" step="10" className="w-full md:w-1/2 px-4 py-2 border rounded-md shadow-sm"/>
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