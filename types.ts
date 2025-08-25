// ARQUIVO: types.ts

export interface Passenger {
  id: string;
  created_at?: string;
  user_id: string;
  name: string;
  address: string;
  valuePerTrip: number;
}

export enum TripType {
  IDA = 'ida',
  VOLTA = 'volta',
  AMBOS = 'ambos',
}

export interface Trip {
  id: string;
  created_at?: string;
  user_id: string;
  passenger_id: string; // Garantindo que está com underscore
  date: string; 
  type: TripType;
  paid: boolean;
  tripValue: number;
}

export interface FuelLog {
  id: string;
  created_at?: string;
  user_id: string;
  date: string;
  odometer: number;
  liters: number;
  cost: number;
  kmPerLiter?: number | null;
}

export interface AppContextType {
  passengers: Passenger[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  addPassenger: (passenger: Omit<Passenger, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updatePassenger: (passenger: Passenger) => Promise<void>;
  deletePassenger: (passenger_id: string) => Promise<void>;
  addTrip: (trip: Omit<Trip, 'id' | 'created_at' | 'user_id' | 'paid' | 'tripValue'>) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  markTripsAsPaid: (tripIds: string[]) => Promise<void>;
  addFuelLog: (fuelLog: Omit<FuelLog, 'id' | 'created_at' | 'user_id' | 'kmPerLiter'>) => Promise<void>;
  updateFuelLog: (fuelLog: FuelLog) => Promise<void>;
  deleteFuelLog: (fuelLogId: string) => Promise<void>;
}

export enum Tab {
  PASSENGERS = 'PASSENGERS',
  TRIPS = 'TRIPS',
  FUEL_LOGS = 'FUEL_LOGS',
  BILLING = 'BILLING',
  REPORTS = 'REPORTS',
}