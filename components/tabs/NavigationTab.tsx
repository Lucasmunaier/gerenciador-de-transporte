// ARQUIVO: components/tabs/NavigationTab.tsx (NOVO ARQUIVO)

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Passenger } from '../../types';

// Função para calcular a distância em metros entre duas coordenadas (Haversine)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Raio da Terra em metros
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
    // Inicializa a lista de passageiros disponíveis que têm coordenadas
    const validPassengers = passengers.filter(p => p.latitude != null && p.longitude != null);
    setAvailablePassengers(validPassengers);
  }, [passengers]);

  const addToRoute = (passenger: Passenger) => {
    setRoute([...route, passenger]);
    setAvailablePassengers(availablePassengers.filter(p => p.id !== passenger.id));
  };

  const removeFromRoute = (passenger: Passenger) => {
    setAvailablePassengers([...availablePassengers, passenger]);
    setRoute(route.filter(p => p.id !== passenger.id));
  };

  const startNavigation = () => {
    if (route.length === 0) {
      alert("Adicione pelo menos um passageiro à rota para começar.");
      return;
    }
    setIsNavigating(true);
    setCurrentStopIndex(0);
    setShowNotification(false);

    // Configura o áudio de notificação
    if (!notificationAudioRef.current) {
        notificationAudioRef.current = new Audio('/notification.mp3'); // Certifique-se de ter um som em /public/notification.mp3
    }
    
    // Inicia o monitoramento do GPS
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lon: longitude });
      },
      (error) => {
        console.error("Erro no GPS:", error);
        alert("Não foi possível obter sua localização. Verifique as permissões de GPS.");
        stopNavigation();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setCurrentPosition(null);
    setDistanceToNext(null);
  };

  const nextStop = () => {
    if (currentStopIndex < route.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
      setShowNotification(false);
    } else {
      alert("Rota finalizada!");
      stopNavigation();
    }
  };

  // Calcula a distância quando a posição ou o passageiro atual muda
  useEffect(() => {
    if (isNavigating && currentPosition && route[currentStopIndex]) {
      const currentPassenger = route[currentStopIndex];
      if (currentPassenger.latitude && currentPassenger.longitude) {
        const dist = getDistance(currentPosition.lat, currentPosition.lon, currentPassenger.latitude, currentPassenger.longitude);
        setDistanceToNext(dist);

        const notificationDist = currentPassenger.notification_distance || 200;
        if (dist <= notificationDist && !showNotification) {
          setShowNotification(true);
          notificationAudioRef.current?.play();
        }
      }
    }
  }, [currentPosition, currentStopIndex, isNavigating, route, showNotification]);

  const sendWhatsAppNotification = () => {
    const passenger = route[currentStopIndex];
    if (!passenger.phone) return;
    const phone = `55${passenger.phone.replace(/\D/g, '')}`;
    const message = "Já estou chegando, pode sair.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (isNavigating) {
    const passenger = route[currentStopIndex];
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Próxima Parada: {passenger.name}</h2>
        <p className="text-gray-600 mb-4">{passenger.address}</p>
        
        {distanceToNext !== null ? (
          <p className="text-4xl font-bold my-8">
            {distanceToNext > 1000 
                ? `${(distanceToNext/1000).toFixed(2)} km` 
                : `${Math.round(distanceToNext)} metros`}
          </p>
        ) : (
          <p className="my-8">Calculando distância...</p>
        )}

        {showNotification && (
          <div className="my-4 p-4 bg-green-100 border border-green-400 rounded-lg">
            <p className="font-bold text-green-800">Você está perto!</p>
            <button onClick={sendWhatsAppNotification} className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded">
              Avisar {passenger.name} via WhatsApp
            </button>
          </div>
        )}

        <button onClick={nextStop} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded mb-4">
          Passageiro a Bordo / Próxima Parada
        </button>
        <button onClick={stopNavigation} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Finalizar Rota
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Passageiros Disponíveis</h3>
        <ul className="bg-white p-4 rounded-lg shadow h-96 overflow-y-auto">
          {availablePassengers.map(p => (
            <li key={p.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
              <span>{p.name}</span>
              <button onClick={() => addToRoute(p)} className="text-blue-500 hover:text-blue-700 font-semibold">+</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Rota do Dia</h3>
        <ul className="bg-white p-4 rounded-lg shadow h-96 overflow-y-auto">
           {route.map((p, index) => (
            <li key={p.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
              <span>{index + 1}. {p.name}</span>
              <button onClick={() => removeFromRoute(p)} className="text-red-500 hover:text-red-700 font-semibold">-</button>
            </li>
          ))}
        </ul>
        <button onClick={startNavigation} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Iniciar Trajeto
        </button>
      </div>
    </div>
  );
};

export default NavigationTab;