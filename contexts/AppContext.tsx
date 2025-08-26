import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppContextType, Passenger, Trip, FuelLog, TripType, Profile } from '../types';
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
    const [profile, setProfile] = useState<Profile | null>(null);

    const fetchData = async () => {
        if (!user) return;
        
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData || null);

        const { data: pData } = await supabase.from('passengers').select('*');
        setPassengers(pData || []);
        
        const { data: tData } = await supabase.from('trips').select('*');
        setTrips(tData || []);

        const { data: rawFuelLogs } = await supabase.from('fuel_logs').select('*').order('odometer', { ascending: true });
        
        const calculatedFuelLogs = (rawFuelLogs || []).map((log, index, allLogs) => {
            if (index === 0) return { ...log, km_per_liter: null };
            const prevLog = allLogs[index - 1];
            const kmTraveled = log.odometer - prevLog.odometer;
            const kmPerLiter = (kmTraveled > 0 && prevLog.liters > 0) ? parseFloat((kmTraveled / prevLog.liters).toFixed(2)) : null;
            return { ...log, km_per_liter: kmPerLiter };
        });

        setFuelLogs(calculatedFuelLogs.sort((a, b) => b.odometer - a.odometer));
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const updateProfile = async (updatedProfile: Omit<Profile, 'id'|'updated_at'>) => {
        if (!user) throw new Error("Usuário não logado");
        const { error } = await supabase.from('profiles').update(updatedProfile).eq('id', user.id);
        if (error) { console.error(error); throw error; }
        await fetchData();
    };

    const addPassenger = async (passengerData: Omit<Passenger, 'id'|'created_at'|'user_id'>) => {
        if (!user) throw new Error("Usuário não logado");
        await supabase.from('passengers').insert([{ ...passengerData, user_id: user.id }]);
        await fetchData();
    };
    const updatePassenger = async (updatedPassenger: Omit<Passenger, 'created_at'|'user_id'>) => {
        await supabase.from('passengers').update(updatedPassenger).eq('id', updatedPassenger.id);
        await fetchData();
    };
    const deletePassenger = async (passengerId: string) => {
        await supabase.from('trips').delete().eq('passenger_id', passengerId);
        await supabase.from('passengers').delete().eq('id', passengerId);
        await fetchData();
    };
    const addTrip = async (tripData: Omit<Trip, 'id'|'created_at'|'user_id'|'paid'|'tripValue'>) => {
        if (!user) throw new Error("Usuário não logado");
        const passenger = passengers.find(p => p.id === tripData.passenger_id);
        if (!passenger) throw new Error("Passageiro não encontrado");
        const calculatedTripValue = tripData.type === TripType.AMBOS ? passenger.valuePerTrip * 2 : passenger.valuePerTrip;
        const newTripData = { ...tripData, paid: false, tripValue: calculatedTripValue, user_id: user.id };
        await supabase.from('trips').insert([newTripData]);
        await fetchData();
    };
    const updateTrip = async (updatedTrip: Trip) => {
        await supabase.from('trips').update(updatedTrip).eq('id', updatedTrip.id);
        await fetchData();
    };
    const deleteTrip = async (tripId: string) => {
        await supabase.from('trips').delete().eq('id', tripId);
        await fetchData();
    };
    const markTripsAsPaid = async (tripIds: string[]) => {
        await supabase.from('trips').update({ paid: true }).in('id', tripIds);
        await fetchData();
    };
    const addFuelLog = async (fuelLogData: Omit<FuelLog, 'id'|'created_at'|'user_id'|'km_per_liter'>) => {
        if (!user) throw new Error("Usuário não logado");
        const newLogData = { ...fuelLogData, user_id: user.id };
        await supabase.from('fuel_logs').insert([newLogData]);
        await fetchData();
    };
    const updateFuelLog = async (updatedFuelLog: Omit<FuelLog, 'created_at'|'user_id'>) => {
        await supabase.from('fuel_logs').update(updatedFuelLog).eq('id', updatedFuelLog.id);
        await fetchData();
    };
    const deleteFuelLog = async (fuelLogId: string) => {
        await supabase.from('fuel_logs').delete().eq('id', fuelLogId);
        await fetchData();
    };

    const contextValue = { profile, updateProfile, passengers, trips, fuelLogs, addPassenger, updatePassenger, deletePassenger, addTrip, updateTrip, deleteTrip, markTripsAsPaid, addFuelLog, updateFuelLog, deleteFuelLog };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) { throw new Error('useAppContext must be used within an AppProvider'); }
    return context;
};
