import { Vehicle } from './vehicle.model';

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string;
  date: string;
  liters: number;
  cost: number;
  odometerKm: number;
  fuelEfficiency?: number;
  rollingMonthlyAverage?: number;
  vehicle?: Vehicle;
}
