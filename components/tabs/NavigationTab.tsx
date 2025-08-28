import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Passenger } from '../../types';
import { UserGroupIcon, RouteIcon, PlusIcon, MinusIcon, WhatsAppIcon } from './icons'; // Supondo que PlusIcon e MinusIcon já estão em icons.tsx

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const NavigationTab: React.FC = () => {
    const { passengers } = useAppContext();
    const [route, setRoute] = useState<Passenger[]>([]);
    const [availablePassengers, setAvailablePassengers] = useState<Passenger[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lon: number } | null>(null);
    const [distanceToNext, setDistanceToNext] = useState<number | null>(null);
    const [showNotification, setShowNotification] = useState(false);

    const watchId = useRef<number | null>(null);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const validPassengers = passengers.filter(p => p.latitude != null && p.longitude != null);
        const routeIds = new Set(route.map(p => p.id));
        setAvailablePassengers(validPassengers.filter(p => !routeIds.has(p.id)));
    }, [passengers, route]);

    const addToRoute = (passenger: Passenger) => {
        setRoute([...route, passenger]);
    };

    const removeFromRoute = (passenger: Passenger) => {
        setRoute(route.filter(p => p.id !== passenger.id));
    };

    const startNavigation = () => {
        if (route.length === 0) {
            alert("Adicione pelo menos um passageiro à rota para começar.");
            return;
        }
        setIsNavigating(true);
        // ... restante da lógica de navegação
    };

    const stopNavigation = () => { setIsNavigating(false); /* ... */ };
    const nextStop = () => { /* ... */ };
    const sendWhatsAppNotification = () => { /* ... */ };

    // A lógica interna (useEffect, startNavigation, etc.) permanece a mesma.
    // O foco da mudança é o JSX retornado abaixo.

    if (isNavigating) {
        const passenger = route[currentStopIndex];
        return (
            // --- TELA DE NAVEGAÇÃO ATIVA ---
            <div className="flex flex-col items-center justify-center min-h-full bg-white p-4 rounded-lg shadow-xl">
                {/* ... (O layout da navegação ativa já está bom e continua o mesmo) ... */}
            </div>
        );
    }

    // --- TELA DE PREPARAÇÃO DA ROTA ---
    return (
      <div className="space-y-6">
          <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Planejar Rota</h2>
              <p className="text-gray-500">Adicione passageiros para a rota do dia.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Coluna de Passageiros Disponíveis */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Passageiros Disponíveis</h3>
                  <ul className="h-[60vh] overflow-y-auto space-y-3 pr-2">
                    {availablePassengers.length > 0 ? availablePassengers.map(p => (
                      <li key={p.id} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm">
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.address}</p>
                        </div>
                        <button onClick={() => addToRoute(p)} title="Adicionar à Rota" className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full">
                          <PlusIcon className="h-6 w-6"/>
                        </button>
                      </li>
                    )) : (
                      <div className="text-center p-8 text-gray-400">
                        <p>Nenhum passageiro disponível.</p>
                      </div>
                    )}
                  </ul>
              </div>
              
              {/* Coluna da Rota do Dia */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Rota do Dia</h3>
                  <ul className="h-[60vh] overflow-y-auto space-y-3 pr-2">
                    {route.length > 0 ? route.map((p, index) => (
                      <li key={p.id} className="flex justify-between items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-800">{index + 1}.</span>
                          <div>
                            <p className="font-semibold text-blue-900">{p.name}</p>
                            <p className="text-xs text-blue-700">{p.address}</p>
                          </div>
                        </div>
                        <button onClick={() => removeFromRoute(p)} title="Remover da Rota" className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full">
                          <MinusIcon className="h-6 w-6"/>
                        </button>
                      </li>
                    )) : (
                      <div className="text-center p-8 text-gray-400 h-full flex items-center justify-center">
                        <p>Adicione passageiros da lista à esquerda.</p>
                      </div>
                    )}
                  </ul>
              </div>
          </div>
          <button 
            onClick={startNavigation} 
            disabled={route.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Iniciar Trajeto
          </button>
      </div>
    );
};

export default NavigationTab;