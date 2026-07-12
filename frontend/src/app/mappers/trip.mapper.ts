import { Trip } from '../models/trip.model';
import { VehicleMapper } from './vehicle.mapper';
import { DriverMapper } from './driver.mapper';

export class TripMapper {
  static fromJson(json: any): Trip {
    if (!json) return {} as Trip;
    return {
      id: json.id,
      tripCode: json.trip_code,
      source: json.source,
      destination: json.destination,
      cargoWeightKg: json.cargo_weight_kg,
      plannedDistanceKm: json.planned_distance_km,
      actualDistanceKm: json.actual_distance_km,
      startOdometer: json.start_odometer,
      finalOdometer: json.final_odometer,
      vehicleId: json.vehicle_id,
      driverId: json.driver_id,
      fuelConsumedL: json.fuel_consumed_l,
      revenue: json.revenue,
      status: json.status,
      dispatchedAt: json.dispatched_at,
      completedAt: json.completed_at,
      vehicle: json.vehicle ? VehicleMapper.fromJson(json.vehicle) : undefined,
      driver: json.driver ? DriverMapper.fromJson(json.driver) : undefined,
    };
  }

  static toJson(model: Partial<Trip>): any {
    if (!model) return {};
    return {
      id: model.id,
      trip_code: model.tripCode,
      source: model.source,
      destination: model.destination,
      cargo_weight_kg: model.cargoWeightKg,
      planned_distance_km: model.plannedDistanceKm,
      actual_distance_km: model.actualDistanceKm,
      start_odometer: model.startOdometer,
      final_odometer: model.finalOdometer,
      vehicle_id: model.vehicleId,
      driver_id: model.driverId,
      fuel_consumed_l: model.fuelConsumedL,
      revenue: model.revenue,
      status: model.status,
      dispatched_at: model.dispatchedAt,
      completed_at: model.completedAt,
    };
  }
}
