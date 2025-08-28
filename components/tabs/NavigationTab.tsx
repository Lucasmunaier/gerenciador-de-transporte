import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Passenger } from '../../types';

// Helper function to calculate distance using Haversine formula
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- SVG Icon Components ---
const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);
const MinusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
);
const UserGroupIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a3.004 3.004 0 015.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const RouteIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
);
const WhatsAppIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.161l-1.331 4.869 4.869-1.332zM8.371 9.973c-.09-.272-.18-.272-.26-.272h-.15c-.09 0-.25.04-.38.21s-.51.51-.51 1.25.51 1.44.57 1.53c.06.09 1.03 1.63 2.51 2.2.37.14.63.18.82.12.2-.06.63-.26.72-.51s.09-.47 0-.51-.09-.09-.18-.18c-.09-.09-.24-.15-.38-.21-.12-.04-.27-.06-.38-.06s-.26.03-.38.09c-.12.06-.27.21-.38.33-.09.12-.18.15-.24.06-.06-.09-.27-.24-.51-.47s-.42-.42-.47-.51c-.06-.09-.03-.12 0-.18.03-.04.09-.12.18-.18.06-.04.09-.06.12-.12s.03-.12 0-.18c-.03-.06-.12-.18-.18-.18z"/></svg>
);


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
        // CORREÇÃO AQUI: Apenas adiciona de volta à lista de disponíveis e remove da rota.
        setAvailablePassengers([...availablePassengers, passenger]);
        setRoute(route.filter(p => p.id !== passenger.id));
    };

    const startNavigation = () => {
        if (route.length === 0) {
            alert("Please add at least one passenger to the route to begin.");
            return;
        }
        setIsNavigating(true);
        setCurrentStopIndex(0);
        setShowNotification(false);

        if (!notificationAudioRef.current) {
            notificationAudioRef.current = new Audio('/notification.mp3'); // Ensure this file is in your /public folder
        }
        
        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lon: longitude });
            },
            (error) => {
                console.error("GPS Error:", error);
                alert("Could not get your location. Please check GPS permissions.");
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
            setDistanceToNext(null);
        } else {
            alert("Route finished!");
            stopNavigation();
        }
    };

    useEffect(() => {
        if (isNavigating && currentPosition && route[currentStopIndex]) {
            const currentPassenger = route[currentStopIndex];
            if (currentPassenger.latitude && currentPassenger.longitude) {
                const dist = getDistance(currentPosition.lat, currentPosition.lon, currentPassenger.latitude, currentPassenger.longitude);
                setDistanceToNext(dist);

                const notificationDist = currentPassenger.notification_distance || 200;
                if (dist <= notificationDist && !showNotification) {
                    setShowNotification(true);
                    notificationAudioRef.current?.play().catch(e => console.error("Error playing sound:", e));
                }
            }
        }
    }, [currentPosition, currentStopIndex, isNavigating, route, showNotification]);

    const sendWhatsAppNotification = () => {
        const passenger = route[currentStopIndex];
        if (!passenger.phone) return;
        const phone = `55${passenger.phone.replace(/\D/g, '')}`;
        const message = "I'm arriving now, you can come out.";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (isNavigating) {
        const passenger = route[currentStopIndex];
        if (!passenger) return <div className="p-8">Loading...</div>; // Safety check
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 animate-fade-in">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center transition-all">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">NEXT STOP ({currentStopIndex + 1}/{route.length})</p>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{passenger.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{passenger.address}</p>
                    
                    <div className="my-8">
                         <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-gray-100 dark:bg-gray-700/50 rounded-full flex flex-col items-center justify-center shadow-inner">
                            {distanceToNext !== null ? (
                                <>
                                    <span className="text-5xl sm:text-6xl font-extrabold text-gray-800 dark:text-gray-100">
                                        {distanceToNext > 1000 ? (distanceToNext / 1000).toFixed(1) : Math.round(distanceToNext)}
                                    </span>
                                    <span className="text-lg text-gray-500 dark:text-gray-400 -mt-1">
                                        {distanceToNext > 1000 ? 'km' : 'meters'}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xl font-semibold text-gray-500 animate-pulse">Calculating...</span>
                            )}
                        </div>
                    </div>
                    
                    {showNotification && (
                      <div className="my-6 p-4 bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 rounded-lg text-left animate-fade-in">
                        <p className="font-bold text-green-800 dark:text-green-300">You are close!</p>
                        <button onClick={sendWhatsAppNotification} className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                          <WhatsAppIcon className="h-5 w-5"/>
                          Notify {passenger.name}
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col gap-4 w-full mt-8">
                        <button onClick={nextStop} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform transform hover:scale-105">
                            Passenger Boarded / Next Stop
                        </button>
                        <button onClick={stopNavigation} className="w-full bg-transparent hover:bg-red-500/10 text-red-500 font-semibold py-3 px-4 rounded-xl transition-colors">
                            End Route
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
      <div className="p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-gray-200">
          <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Plan Your Route</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col h-[70vh]">
                      <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
                          <UserGroupIcon className="h-6 w-6 text-indigo-500"/>
                          <h3 className="text-xl font-semibold">Available Passengers</h3>
                      </div>
                      <ul className="flex-grow overflow-y-auto p-4 space-y-2">
                        {availablePassengers.length > 0 ? availablePassengers.map(p => (
                          <li key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <span className="font-medium">{p.name}</span>
                            <button onClick={() => addToRoute(p)} title="Add to route" className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors">
                                <PlusIcon className="h-5 w-5"/>
                            </button>
                          </li>
                        )) : <li className="text-center p-8 text-gray-500">No more available passengers.</li>}
                      </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col h-[70vh]">
                      <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
                           <RouteIcon className="h-6 w-6 text-green-500"/>
                           <h3 className="text-xl font-semibold">Today's Route</h3>
                      </div>
                      <ul className="flex-grow overflow-y-auto p-4 space-y-2">
                        {route.length > 0 ? route.map((p, index) => (
                          <li key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 rounded-full h-7 w-7 flex items-center justify-center">{index + 1}</span>
                                <span className="font-medium">{p.name}</span>
                            </div>
                            <button onClick={() => removeFromRoute(p)} title="Remove from route" className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                                <MinusIcon className="h-5 w-5"/>
                            </button>
                          </li>
                        )) : <li className="text-center p-8 text-gray-500">Add passengers from the left to build your route.</li>}
                      </ul>
                      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                          <button 
                            onClick={startNavigation} 
                            disabled={route.length === 0}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                          >
                              Start Navigation
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
};

export default NavigationTab;