// ARQUIVO: components/tabs/NavigationTab.tsx (com Drag and Drop)

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Passenger } from '../../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Ícones (coloquei dentro do arquivo para facilitar, mas o ideal é estarem em /icons.tsx) ---
const UserGroupIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a3.004 3.004 0 015.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const RouteIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>);
const GripVerticalIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" transform="rotate(90 12 12)" /></svg>);

// Componente para cada item de passageiro que pode ser arrastado
const SortablePassengerItem: React.FC<{passenger: Passenger, index?: number}> = ({ passenger, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({id: passenger.id});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm touch-none">
             <div className="flex items-center gap-3">
                {index !== undefined && <span className="text-sm font-bold text-gray-500 bg-gray-200 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">{index + 1}</span>}
                <span className="font-medium text-gray-700">{passenger.name}</span>
            </div>
            <GripVerticalIcon className="h-5 w-5 text-gray-400 cursor-grab"/>
        </li>
    )
}

const NavigationTab: React.FC = () => {
    const { passengers } = useAppContext();
    const [availablePassengers, setAvailablePassengers] = useState<Passenger[]>([]);
    const [route, setRoute] = useState<Passenger[]>([]);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    useEffect(() => {
        const validPassengers = passengers.filter(p => p.latitude != null && p.longitude != null);
        const routeIds = new Set(route.map(p => p.id));
        setAvailablePassengers(validPassengers.filter(p => !routeIds.has(p.id)));
    }, [passengers, route]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        const isActiveInAvailable = availablePassengers.some(p => p.id === activeId);
        const isActiveInRoute = route.some(p => p.id === activeId);
        const isOverAvailable = availablePassengers.some(p => p.id === overId);
        const isOverRoute = route.some(p => p.id === overId);

        // Reordenar dentro da Rota do Dia
        if (isActiveInRoute && isOverRoute && activeId !== overId) {
            const oldIndex = route.findIndex(p => p.id === activeId);
            const newIndex = route.findIndex(p => p.id === overId);
            setRoute(arrayMove(route, oldIndex, newIndex));
        }
        // Mover de Disponíveis para Rota
        else if (isActiveInAvailable && (isOverRoute || over.id === 'route-drop-area')) {
            const passengerToMove = availablePassengers.find(p => p.id === activeId);
            if(passengerToMove) {
                setAvailablePassengers(availablePassengers.filter(p => p.id !== activeId));
                setRoute(prev => [...prev, passengerToMove]);
            }
        }
    };
    
    // As funções de navegação (startNavigation, etc.) continuam as mesmas da versão anterior.
    // ...

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Planeje sua Rota</h1>
                <p className="text-center text-gray-500 mb-8 -mt-6">Arraste os passageiros para a rota do dia e reordene como precisar.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* --- Passageiros Disponíveis --- */}
                    <div className="bg-white rounded-2xl shadow-lg flex flex-col h-[70vh]">
                        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                            <UserGroupIcon className="h-6 w-6 text-indigo-500"/>
                            <h3 className="text-xl font-semibold text-gray-800">Passageiros Disponíveis</h3>
                        </div>
                        <SortableContext items={availablePassengers.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            <ul className="flex-grow overflow-y-auto p-4 space-y-2">
                                {availablePassengers.length > 0 ? availablePassengers.map(p => (
                                    <SortablePassengerItem key={p.id} passenger={p} />
                                )) : <li className="text-center p-8 text-gray-500">Nenhum passageiro disponível.</li>}
                            </ul>
                        </SortableContext>
                    </div>
                    {/* --- Rota do Dia --- */}
                    <div className="bg-white rounded-2xl shadow-lg flex flex-col h-[70vh]">
                        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                            <RouteIcon className="h-6 w-6 text-green-500"/>
                            <h3 className="text-xl font-semibold text-gray-800">Rota do Dia</h3>
                        </div>
                        <SortableContext items={route.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            <ul id="route-drop-area" className="flex-grow overflow-y-auto p-4 space-y-2">
                                {route.length > 0 ? route.map((p, index) => (
                                    <SortablePassengerItem key={p.id} passenger={p} index={index} />
                                )) : <li className="text-center p-8 text-gray-500 h-full flex items-center justify-center">Arraste um passageiro aqui.</li>}
                            </ul>
                        </SortableContext>
                        <div className="p-6 border-t border-gray-200">
                            <button 
                                // onClick={startNavigation} 
                                disabled={route.length === 0}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
                            >
                                Iniciar Navegação
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </DndContext>
    );
};

export default NavigationTab;