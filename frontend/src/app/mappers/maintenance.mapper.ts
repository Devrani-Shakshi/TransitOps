import { MaintenanceLog, MaintenancePrediction } from '../models/maintenance.model';
import { VehicleMapper } from './vehicle.mapper';

export class MaintenanceMapper {
  static logFromJson(json: any): MaintenanceLog {
    if (!json) return {} as MaintenanceLog;
    return {
      id: json.id,
      vehicleId: json.vehicle_id,
      serviceType: json.service_type,
      cost: json.cost,
      date: json.service_date || json.date,
      status: json.status,
      notes: json.description || json.notes,
      vehicle: json.vehicle ? VehicleMapper.fromJson(json.vehicle) : undefined,
    };
  }

  static logToJson(model: Partial<MaintenanceLog>): any {
    if (!model) return {};
    return {
      id: model.id,
      vehicle_id: model.vehicleId,
      service_type: model.serviceType,
      cost: model.cost,
      service_date: model.date,
      status: model.status || 'SCHEDULED',
      description: model.notes || 'Routine Maintenance',
    };
  }

  static predictionFromJson(json: any): MaintenancePrediction {
    if (!json) return {} as MaintenancePrediction;
    return {
      vehicleId: json.vehicle_id,
      registrationNumber: json.registration_number,
      modelName: json.model_name,
      currentOdometerKm: json.current_odometer_km,
      lastServiceOdometerKm: json.last_service_odometer_km,
      nextServiceDueKm: json.next_service_due_km,
      daysSinceLastService: json.days_since_last_service,
      vehicleHealthPercentage: json.vehicle_health_percentage,
      status: json.status,
    };
  }
}
