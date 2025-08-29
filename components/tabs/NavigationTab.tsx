import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Passenger } from '../../types';
import { CheckCircleIcon, MapIcon, XMarkIcon, UserPlusIcon } from '../icons'; // Adicionado UserPlusIcon

// --- Funções e Ícones Auxiliares ---

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

const WhatsAppIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.161l-1.331 4.869 4.869-1.332zM8.371 9.973c-.09-.272-.18-.272-.26-.272h-.15c-.09 0-.25.04-.38.21s-.51.51-.51 1.25.51 1.44.57 1.53c.06.09 1.03 1.63 2.51 2.2.37.14.63.18.82.12.2-.06.63-.26.72-.51s.09-.47 0-.51-.09-.09-.18-.18c-.09-.09-.24-.15-.38-.21-.12-.04-.27-.06-.38-.06s-.26.03-.38.09c-.12.06-.27.21-.38.33-.09.12-.18.15-.24.06-.06-.09-.27-.24-.51-.47s-.42-.42-.47-.51c-.06-.09-.03-.12 0-.18.03-.04.09-.12.18-.18.06-.04.09-.06.12-.12s.03-.12 0-.18c-.03-.06-.12-.18-.18-.18z"/></svg>
);


// --- Componente do Modal de Seleção de Passageiros ---
interface PassengerSelectionModalProps {
  passengers: Passenger[];
  onClose: () => void;
  onStartNavigation: (route: Passenger[]) => void;
}

const PassengerSelectionModal: React.FC<PassengerSelectionModalProps> = ({ passengers, onClose, onStartNavigation }) => {
  const [selectedRoute, setSelectedRoute] = useState<Passenger[]>([]);

  const handleTogglePassenger = (passenger: Passenger) => {
    const isInRoute = selectedRoute.some(p => p.id === passenger.id);
    if (isInRoute) {
      setSelectedRoute(selectedRoute.filter(p => p.id !== passenger.id));
    } else {
      setSelectedRoute([...selectedRoute, passenger]);
    }
  };

  const handleConfirmRoute = () => {
    if (selectedRoute.length > 0) {
      onStartNavigation(selectedRoute);
    }
  };
  
  const validPassengers = passengers.filter(p => p.latitude != null && p.longitude != null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">Selecione os Passageiros na Ordem da Rota</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
        </div>
        
        <ul className="flex-grow overflow-y-auto p-4 space-y-2">
          {validPassengers.length > 0 ? validPassengers.map(passenger => {
            const routeIndex = selectedRoute.findIndex(p => p.id === passenger.id);
            const isSelected = routeIndex !== -1;
            return (
              <li key={passenger.id} onClick={() => handleTogglePassenger(passenger)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150 ${isSelected ? 'bg-blue-100 ring-2 ring-blue-300 shadow-sm' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center">
                  {isSelected && (
                    <span className={`flex items-center justify-center w-7 h-7 mr-4 text-sm font-bold text-white rounded-full ${routeIndex === 0 ? 'bg-green-500' : 'bg-blue-500'}`}>
                      {routeIndex + 1}
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>{passenger.name}</span>
                    {isSelected && routeIndex === 0 && (
                      <span className="mt-1 text-xs font-semibold text-green-800 bg-green-200 px-2 py-0.5 rounded-full w-fit">Ponto de Partida</span>
                    )}
                  </div>
                </div>
                {isSelected && <CheckCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />}
              </li>
            )
          }) : <li className="text-center p-8 text-gray-500">Nenhum passageiro com endereço válido para navegação.</li>}
        </ul>
        
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100">Cancelar</button>
            <button onClick={handleConfirmRoute} disabled={selectedRoute.length === 0} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-400 shadow-sm">
              {selectedRoute.length > 0 ? `Iniciar Rota com ${selectedRoute.length} Parada(s)` : 'Adicione Passageiros'}
            </button>
        </div>
      </div>
    </div>
  );
};


// --- Componente Principal da Aba de Navegação ---
const NavigationTab: React.FC = () => {
    const { passengers } = useAppContext();
    const [route, setRoute] = useState<Passenger[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lon: number } | null>(null);
    const [distanceToNext, setDistanceToNext] = useState<number | null>(null);
    const [showNotification, setShowNotification] = useState(false);

    const watchId = useRef<number | null>(null);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

    const handleStartNavigation = (plannedRoute: Passenger[]) => {
      setRoute(plannedRoute);
      setIsModalOpen(false);
      
      if (plannedRoute.length > 0) {
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
        // Não limpa a rota para que o usuário possa recomeçar se quiser
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
    }, [isNavigating, route]);

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
    }, [currentPosition, currentStopIndex, isNavigating, route, showNotification]);
    
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

    // --- RENDERIZAÇÃO DA NAVEGAÇÃO ATIVA ---
    if (isNavigating) {
        const passenger = route[currentStopIndex];
        if (!passenger) return <div className="p-8">Carregando...</div>;
        return (
            <div className="flex flex-col items-center justify-center min-h-full bg-gray-50 p-4 animate-fade-in">
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

    // --- RENDERIZAÇÃO DA TELA DE PLANEJAMENTO ---
    return (
      <div className="p-4 sm:p-6 lg:p-8">
          {isModalOpen && (
            <PassengerSelectionModal
              passengers={passengers}
              onClose={() => setIsModalOpen(false)}
              onStartNavigation={handleStartNavigation}
            />
          )}

          <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-6 border-b border-gray-200 gap-4">
                  <div className="flex items-center">
                    <MapIcon className="w-8 h-8 text-indigo-500 mr-4"/>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Rota do Dia</h2>
                      <p className="text-sm text-gray-500">
                        {route.length > 0 ? `${route.length} parada(s) definida(s).` : 'Nenhuma rota planejada.'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all">
                    {route.length > 0 ? 'Editar Rota' : 'Planejar Rota'}
                  </button>
                </div>

                {route.length > 0 ? (
                  <ul className="space-y-3 mb-8">
                    {route.map((p, index) => (
                      <li key={p.id} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pop-in">
                        <span className={`flex items-center justify-center w-7 h-7 mr-4 text-sm font-bold text-white rounded-full ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}>
                          {index + 1}
                        </span>
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.address}</p>
                        </div>
                         {index === 0 && (
                            <span className="text-xs font-semibold text-green-800 bg-green-200 px-2 py-1 rounded-full flex-shrink-0">
                                Ponto de Partida
                            </span>
                         )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10">
                    <UserPlusIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="text-gray-500 mt-4">Sua rota está vazia.</p>
                    <p className="text-sm text-gray-400 mt-1">Clique em "Planejar Rota" para começar.</p>
                  </div>
                )}

                <button 
                  onClick={() => setIsNavigating(true)} 
                  disabled={route.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                    Iniciar Navegação
                </button>
              </div>
          </div>
      </div>
    );
};

export default NavigationTab;