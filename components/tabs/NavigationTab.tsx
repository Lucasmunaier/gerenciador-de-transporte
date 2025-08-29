import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Passenger } from '../../types';
import { CheckCircleIcon, UserIcon, WhatsAppIcon } from '../icons';

// --- Funções Auxiliares ---
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

// --- Componente Principal da Aba de Navegação ---
const NavigationTab: React.FC = () => {
    const { passengers } = useAppContext();
    const [route, setRoute] = useState<Passenger[]>([]);
    
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lon: number } | null>(null);
    const [distanceToNext, setDistanceToNext] = useState<number | null>(null);
    const [showNotification, setShowNotification] = useState(false);

    const watchId = useRef<number | null>(null);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

    const handleTogglePassenger = (passenger: Passenger) => {
        const isInRoute = route.some(p => p.id === passenger.id);
        if (isInRoute) {
            setRoute(route.filter(p => p.id !== passenger.id));
        } else {
            setRoute([...route, passenger]);
        }
    };
    
    const handleStartNavigation = () => {
        if (route.length > 0) {
            setIsNavigating(true);
        }
    };

    const stopNavigation = () => {
        setIsNavigating(false);
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setCurrentPosition(null);
        setDistanceToNext(null);
        setRoute([]); // Limpa a rota ao finalizar para um novo planejamento
    };
    
    useEffect(() => {
        if (!isNavigating || route.length === 0) {
          if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
          }
          return;
        }

        setCurrentStopIndex(0);
        setShowNotification(false);

        if (!notificationAudioRef.current) {
            notificationAudioRef.current = new Audio('/notification.mp3');
        }
        
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

        return () => {
          if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
          }
        };
    }, [isNavigating]);

    useEffect(() => {
        if (isNavigating && currentPosition && route[currentStopIndex]) {
            const currentPassenger = route[currentStopIndex];
            if (currentPassenger.latitude && currentPassenger.longitude) {
                const dist = getDistance(currentPosition.lat, currentPosition.lon, currentPassenger.latitude, currentPassenger.longitude);
                setDistanceToNext(dist);

                const notificationDist = currentPassenger.notification_distance || 200;
                if (dist <= notificationDist && !showNotification) {
                    setShowNotification(true);
                    notificationAudioRef.current?.play().catch(e => console.error("Erro ao tocar áudio:", e));
                }
            }
        }
    }, [currentPosition, isNavigating, route, showNotification, currentStopIndex]);
    
    const nextStop = () => {
        if (currentStopIndex < route.length - 1) {
            setCurrentStopIndex(currentStopIndex + 1);
            setShowNotification(false);
            setDistanceToNext(null);
        } else {
            alert("Rota finalizada!");
            stopNavigation();
        }
    };
    
    const sendWhatsAppNotification = () => {
        const passenger = route[currentStopIndex];
        if (!passenger.phone) return;
        const phone = `55${passenger.phone.replace(/\D/g, '')}`;
        const message = "Estou chegando, pode sair!";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const validPassengers = passengers.filter(p => p.latitude != null && p.longitude != null);

    if (isNavigating) {
        const passenger = route[currentStopIndex];
        if (!passenger) return <div className="p-8">Carregando...</div>;
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center transition-all">
                    <p className="text-sm font-medium text-indigo-600">PRÓXIMA PARADA ({currentStopIndex + 1}/{route.length})</p>
                    <h2 className="text-3xl font-bold text-gray-800 mt-1">{passenger.name}</h2>
                    <p className="text-gray-500 mt-1">{passenger.address}</p>
                    <div className="my-8">
                         <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-gray-100 rounded-full flex flex-col items-center justify-center shadow-inner">
                            {distanceToNext !== null ? (
                                <>
                                    <span className="text-5xl sm:text-6xl font-extrabold text-gray-800">
                                        {distanceToNext > 1000 ? (distanceToNext / 1000).toFixed(1) : Math.round(distanceToNext)}
                                    </span>
                                    <span className="text-lg text-gray-500 -mt-1">
                                        {distanceToNext > 1000 ? 'km' : 'metros'}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xl font-semibold text-gray-500 animate-pulse">Calculando...</span>
                            )}
                        </div>
                    </div>
                    {showNotification && (
                      <div className="my-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-left animate-fade-in">
                        <p className="font-bold text-green-800">Você está perto!</p>
                        <button onClick={sendWhatsAppNotification} className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 active:scale-95">
                          <WhatsAppIcon className="h-5 w-5"/>
                          Avisar {passenger.name}
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-4 w-full mt-8">
                        <button onClick={nextStop} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95">
                            Passageiro a Bordo / Próxima Parada
                        </button>
                        <button onClick={stopNavigation} className="w-full bg-transparent hover:bg-red-500/10 text-red-500 font-semibold py-3 px-4 rounded-xl transition-all transform active:scale-95">
                            Finalizar Rota
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- TELA DE PLANEJAMENTO ---
    return (
        <div className="bg-white rounded-2xl shadow-xl w-full h-full flex flex-col">
          <header className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800">Planeje sua Rota</h2>
          </header>
          <main className="flex-grow overflow-y-auto p-6">
            <p className="text-gray-600 mb-4">Clique nos passageiros na ordem que deseja adicioná-los à rota.</p>
            <ul className="space-y-3">
              {validPassengers.map(passenger => {
                const routeIndex = route.findIndex(p => p.id === passenger.id);
                const isSelected = routeIndex !== -1;
                return (
                  <li key={passenger.id} onClick={() => handleTogglePassenger(passenger)}
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-transparent hover:border-indigo-400 hover:bg-white'}`}
                    aria-selected={isSelected}>
                    <div className={`flex items-center justify-center flex-shrink-0 h-8 w-8 rounded-full mr-4 font-bold text-sm transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {isSelected ? routeIndex + 1 : <UserIcon className="h-5 w-5"/>}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">{passenger.name}</p>
                      <p className="text-sm text-gray-500">{passenger.address}</p>
                    </div>
                    {isSelected && <CheckCircleIcon className="w-6 h-6 text-indigo-500 flex-shrink-0 ml-4" />}
                  </li>
                );
              })}
            </ul>
          </main>
          <footer className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={handleStartNavigation}
              disabled={route.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:transform-none active:scale-95"
            >
              Iniciar Navegação ({route.length} paradas)
            </button>
          </footer>
        </div>
      );
};

export default NavigationTab;