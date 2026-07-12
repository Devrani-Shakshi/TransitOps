import { Vehicle } from './vehicle.model';
import { Driver } from './driver.model';

export interface Trip {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm?: number;
  startOdometer: number;
  finalOdometer?: number;
  vehicleId: string;
  driverId: string;
  fuelConsumedL?: number;
  revenue?: number;
  status: 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  dispatchedAt?: string;
  completedAt?: string;
  vehicle?: Vehicle;
  driver?: Driver;
}
