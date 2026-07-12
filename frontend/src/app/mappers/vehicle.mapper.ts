import { Vehicle } from '../models/vehicle.model';

export class VehicleMapper {
  static fromJson(json: any): Vehicle {
    if (!json) return {} as Vehicle;
    return {
      id: json.id,
      registrationNumber: json.registration_number,
      modelName: json.model_name,
      type: json.type,
      maxLoadCapacityKg: json.max_load_capacity_kg,
      odometerKm: json.odometer_km,
      acquisitionCost: json.acquisition_cost,
      insuranceExpiry: json.insurance_expiry,
      fitnessCertExpiry: json.fitness_cert_expiry,
      pollutionCertExpiry: json.pollution_cert_expiry,
      status: json.status,
      imageUrl: json.image_url,
    };
  }

  static toJson(model: Partial<Vehicle>): any {
    if (!model) return {};
    return {
      id: model.id,
      registration_number: model.registrationNumber,
      model_name: model.modelName,
      type: model.type,
      max_load_capacity_kg: model.maxLoadCapacityKg,
      odometer_km: model.odometerKm,
      acquisition_cost: model.acquisitionCost,
      insurance_expiry: model.insuranceExpiry,
      fitness_cert_expiry: model.fitnessCertExpiry,
      pollution_cert_expiry: model.pollutionCertExpiry,
      status: model.status,
      image_url: model.imageUrl,
    };
  }
}
