import { FuelLog } from '../models/fuel-log.model';
import { Expense } from '../models/expense.model';
import { VehicleMapper } from './vehicle.mapper';

export class FuelExpenseMapper {
  static fuelLogFromJson(json: any): FuelLog {
    if (!json) return {} as FuelLog;
    return {
      id: json.id,
      vehicleId: json.vehicle_id,
      tripId: json.trip_id,
      date: json.date,
      liters: json.liters,
      cost: json.cost,
      odometerKm: json.odometer_km,
      fuelEfficiency: json.fuel_efficiency,
      rollingMonthlyAverage: json.rolling_monthly_average,
      vehicle: json.vehicle ? VehicleMapper.fromJson(json.vehicle) : undefined,
    };
  }

  static fuelLogToJson(model: Partial<FuelLog>): any {
    if (!model) return {};
    return {
      id: model.id,
      vehicle_id: model.vehicleId,
      trip_id: model.tripId,
      date: model.date,
      liters: model.liters,
      cost: model.cost,
      odometer_km: model.odometerKm,
    };
  }

  static expenseFromJson(json: any): Expense {
    if (!json) return {} as Expense;
    return {
      id: json.id,
      vehicleId: json.vehicle_id,
      tripId: json.trip_id,
      category: json.category,
      amount: json.amount,
      date: json.date,
      description: json.description,
      vehicle: json.vehicle ? VehicleMapper.fromJson(json.vehicle) : undefined,
    };
  }

  static expenseToJson(model: Partial<Expense>): any {
    if (!model) return {};
    return {
      id: model.id,
      vehicle_id: model.vehicleId,
      trip_id: model.tripId,
      category: model.category,
      amount: model.amount,
      date: model.date,
      description: model.description,
    };
  }
}
