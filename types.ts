export interface Passenger {
  id: string; created_at?: string; user_id: string; name: string;
  address: string; valuePerTrip: number;
}
export enum TripType { IDA = 'ida', VOLTA = 'volta', AMBOS = 'ambos' }
export interface Trip {
  id: string; created_at?: string; user_id: string; passenger_id: string;
  date: string; type: TripType; paid: boolean; tripValue: number;
}
export interface FuelLog {
  id: string; created_at?: string; user_id: string; date: string;
  odometer: number; liters: number; cost: number; km_per_liter?: number | null;
}
export interface Profile {
  id: string; updated_at?: string; username: string | null; full_name: string | null;
  phone?: string | null; address?: string | null;
}
export interface AppContextType {
  profile: Profile | null;
  fetchData: () => Promise<void>; // Adicionado
  updateProfile: (profile: Omit<Profile, 'id'|'updated_at'>) => Promise<void>;
  passengers: Passenger[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  addPassenger: (passenger: Omit<Passenger, 'id'|'created_at'|'user_id'>) => Promise<void>;
  updatePassenger: (passenger: Omit<Passenger, 'created_at'|'user_id'>) => Promise<void>;
  deletePassenger: (passengerId: string) => Promise<void>;
  addTrip: (trip: Omit<Trip, 'id'|'created_at'|'user_id'|'paid'|'tripValue'>) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  markTripsAsPaid: (tripIds: string[]) => Promise<void>;
  addFuelLog: (fuelLog: Omit<FuelLog, 'id'|'created_at'|'user_id'|'km_per_liter'>) => Promise<void>;
  updateFuelLog: (fuelLog: Omit<FuelLog, 'created_at'|'user_id'>) => Promise<void>;
  deleteFuelLog: (fuelLogId: string) => Promise<void>;
}
export enum Tab {
  PASSENGERS = 'PASSENGERS', TRIPS = 'TRIPS', FUEL_LOGS = 'FUEL_LOGS',
  BILLING = 'BILLING', REPORTS = 'REPORTS', PROFILE = 'PROFILE'
}
