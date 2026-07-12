export interface Vehicle {
  id: string;
  registrationNumber: string;
  modelName: string;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  insuranceExpiry: string;
  fitnessCertExpiry: string;
  pollutionCertExpiry: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
  imageUrl?: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  name: string;
  documentType: string;
  fileUrl: string;
  expiryDate: string;
  createdAt: string;
}
