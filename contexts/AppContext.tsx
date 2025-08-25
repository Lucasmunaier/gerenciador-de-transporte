// ARQUIVO: contexts/AppContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppContextType, Passenger, Trip, FuelLog, TripType } from '../types';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface AppProviderProps {
  children: ReactNode;
  user: User | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children, user }: AppProviderProps) => {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);

    // --- Funções para buscar dados (agora separadas) ---
    const getPassengers = async () => {
        const { data, error } = await supabase.from('passengers').select('*');
        if (error) console.error('Erro ao buscar passageiros:', error);
        else setPassengers(data || []);
    };
    const getTrips = async () => {
        const { data, error } = await supabase.from('trips').select('*');
        if (error) console.error('Erro ao buscar viagens:', error);
        else setTrips(data || []);
    };
    const getFuelLogs = async () => {
        const { data, error } = await supabase.from('fuel_logs').select('*').order('odometer', { ascending: false });
        if (error) console.error('Erro ao buscar abastecimentos:', error);
        else setFuelLogs(data || []);
    };

    useEffect(() => {
        if (user) {
            getPassengers();
            getTrips();
            getFuelLogs();
        }
    }, [user]);

    // --- PASSAGEIROS ---
    const addPassenger = async (passengerData: Omit<Passenger, 'id' | 'created_at' | 'user_id'>) => {
        if (!user) throw new Error("Usuário não logado");
        const { error } = await supabase.from('passengers').insert([{ ...passengerData, user_id: user.id }]);
        if (error) { console.error(error); throw error; }
        await getPassengers(); // Re-busca a lista completa
    };
    const updatePassenger = async (updatedPassenger: Passenger) => {
        const { error } = await supabase.from('passengers').update(updatedPassenger).eq('id', updatedPassenger.id);
        if (error) { console.error(error); throw error; }
        await getPassengers(); // Re-busca a lista completa
    };
    const deletePassenger = async (passenger_id: string) => {
        const { error } = await supabase.from('passengers').delete().eq('id', passenger_id);
        if (error) { console.error(error); throw error; }
        await getPassengers(); // Re-busca a lista completa
    };

    // --- VIAGENS ---
    const addTrip = async (tripData: Omit<Trip, 'id' | 'created_at' | 'user_id' | 'paid' | 'tripValue'>) => {
        if (!user) throw new Error("Usuário não logado");
        const passenger = passengers.find(p => p.id === tripData.passenger_id);
        if (!passenger) throw new Error("Passageiro não encontrado");

        const calculatedTripValue = tripData.type === TripType.AMBOS ? passenger.valuePerTrip * 2 : passenger.valuePerTrip;
        const newTripData = { ...tripData, paid: false, tripValue: calculatedTripValue, user_id: user.id };

        const { error } = await supabase.from('trips').insert([newTripData]);
        if (error) { console.error(error); throw error; }
        await getTrips(); // Re-busca a lista completa
    };
    const updateTrip = async (updatedTrip: Trip) => {
        const { error } = await supabase.from('trips').update(updatedTrip).eq('id', updatedTrip.id);
        if (error) { console.error(error); throw error; }
        await getTrips(); // Re-busca a lista completa
    };
    const deleteTrip = async (tripId: string) => {
        const { error } = await supabase.from('trips').delete().eq('id', tripId);
        if (error) { console.error(error); throw error; }
        await getTrips(); // Re-busca a lista completa
    };
    const markTripsAsPaid = async (tripIds: string[]) => {
        const { error } = await supabase.from('trips').update({ paid: true }).in('id', tripIds);
        if (error) { console.error(error); throw error; }
        await getTrips(); // Re-busca a lista completa
    };

    // --- ABASTECIMENTOS ---
    const addFuelLog = async (fuelLogData: Omit<FuelLog, 'id' | 'created_at' | 'user_id' | 'kmPerLiter'>) => {
        if (!user) throw new Error("Usuário não logado");
        const { data: lastLog } = await supabase.from('fuel_logs').select('odometer').order('odometer', { ascending: false }).limit(1).single();
        let kmPerLiter: number | null = null;
        if (lastLog && lastLog.odometer < fuelLogData.odometer) {
            const kmTraveled = fuelLogData.odometer - lastLog.odometer;
            kmPerLiter = kmTraveled > 0 && fuelLogData.liters > 0 ? kmTraveled / fuelLogData.liters : null;
        }

        const newLogData = { ...fuelLogData, user_id: user.id, km_per_liter: kmPerLiter };
        const { error } = await supabase.from('fuel_logs').insert([newLogData]);
        if (error) { console.error(error); throw error; }
        await getFuelLogs(); // Re-busca a lista completa
    };
    const updateFuelLog = async (updatedFuelLog: FuelLog) => {
        const { error } = await supabase.from('fuel_logs').update(updatedFuelLog).eq('id', updatedFuelLog.id);
        if (error) { console.error(error); throw error; }
        await getFuelLogs(); // Re-busca a lista completa
    };
    const deleteFuelLog = async (fuelLogId: string) => {
        const { error } = await supabase.from('fuel_logs').delete().eq('id', fuelLogId);
        if (error) { console.error(error); throw error; }
        await getFuelLogs(); // Re-busca a lista completa
    };

    const contextValue = { passengers, trips, fuelLogs, addPassenger, updatePassenger, deletePassenger, addTrip, updateTrip, deleteTrip, markTripsAsPaid, addFuelLog, updateFuelLog, deleteFuelLog };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) { throw new Error('useAppContext must be used within an AppProvider'); }
    return context;
};