import { Driver } from '../models/driver.model';

export class DriverMapper {
  static fromJson(json: any): Driver {
    if (!json) return {} as Driver;
    return {
      id: json.id,
      fullName: json.full_name,
      licenseNumber: json.license_number,
      licenseCategory: json.license_category,
      licenseExpiry: json.license_expiry,
      contactNumber: json.contact_number,
      emergencyContact: json.emergency_contact,
      safetyScore: json.safety_score,
      status: json.status,
    };
  }

  static toJson(model: Partial<Driver>): any {
    if (!model) return {};
    return {
      id: model.id,
      full_name: model.fullName,
      license_number: model.licenseNumber,
      license_category: model.licenseCategory,
      license_expiry: model.licenseExpiry,
      contact_number: model.contactNumber,
      emergency_contact: model.emergencyContact,
      safety_score: model.safetyScore,
      status: model.status,
    };
  }
}
