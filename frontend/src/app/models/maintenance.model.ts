import { Vehicle } from './vehicle.model';

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: number;
  date: string;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  vehicle?: Vehicle;
}

export interface MaintenancePrediction {
  vehicleId: string;
  registrationNumber: string;
  modelName: string;
  currentOdometerKm: number;
  lastServiceOdometerKm: number;
  nextServiceDueKm: number;
  daysSinceLastService: number;
  vehicleHealthPercentage: number;
  status: string;
}
