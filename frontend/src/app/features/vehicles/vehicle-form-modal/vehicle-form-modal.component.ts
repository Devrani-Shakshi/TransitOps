import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleMapper } from '../../../mappers/vehicle.mapper';
import { Vehicle } from '../../../models/vehicle.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-vehicle-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen()" [title]="vehicle() ? 'Edit Vehicle' : 'Add Vehicle'" size="lg" (close)="close.emit()">
      <form [formGroup]="vehicleForm" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1">
            <label class="font-semibold text-foreground">Registration Number *</label>
            <input type="text" formControlName="registrationNumber" placeholder="MH-12-AB-1234" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['registrationNumber'].errors) {
              <span class="text-[10px] text-destructive">Required and must match format</span>
            }
            @if (registrationError()) {
              <span class="text-[10px] text-destructive">{{ registrationError() }}</span>
            }
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Model Name *</label>
            <input type="text" formControlName="modelName" placeholder="Tata Prima 3525" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['modelName'].errors) {
              <span class="text-[10px] text-destructive">Required</span>
            }
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Vehicle Type *</label>
            <select formControlName="type" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="TRUCK">Truck</option>
              <option value="VAN">Van</option>
              <option value="CONTAINER">Container</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Max Load Capacity (kg) *</label>
            <input type="number" formControlName="maxLoadCapacityKg" placeholder="15000" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['maxLoadCapacityKg'].errors) {
              <span class="text-[10px] text-destructive">Must be greater than 0</span>
            }
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Current Odometer (km) *</label>
            <input type="number" formControlName="odometerKm" placeholder="45000" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['odometerKm'].errors) {
              <span class="text-[10px] text-destructive">Required and positive</span>
            }
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Acquisition Cost (INR) *</label>
            <input type="number" formControlName="acquisitionCost" placeholder="3200000" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['acquisitionCost'].errors) {
              <span class="text-[10px] text-destructive">Required and positive</span>
            }
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Insurance Expiry Date *</label>
            <input type="date" formControlName="insuranceExpiry" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Fitness Certificate Expiry *</label>
            <input type="date" formControlName="fitnessCertExpiry" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Pollution Certificate Expiry *</label>
            <input type="date" formControlName="pollutionCertExpiry" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Status *</label>
            <select formControlName="status" class="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP" disabled>On Trip (System Managed)</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>
      </form>

      <div footer class="flex items-center gap-2">
        <button (click)="close.emit()" class="px-4 py-2 border border-border text-xs rounded-lg hover:bg-muted text-foreground transition-colors">Cancel</button>
        <button (click)="onSave()" [disabled]="loading()" class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
          @if (loading()) {
            <svg class="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          }
          Save
        </button>
      </div>
    </app-modal>
  `
})
export class VehicleFormModalComponent {
  isOpen = input.required<boolean>();
  vehicle = input<Vehicle | null>(null);
  
  close = output<void>();
  save = output<void>();

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  registrationError = signal<string | null>(null);

  vehicleForm: FormGroup = this.fb.group({
    registrationNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/)]],
    modelName: ['', [Validators.required]],
    type: ['TRUCK', [Validators.required]],
    maxLoadCapacityKg: [0, [Validators.required, Validators.min(1)]],
    odometerKm: [0, [Validators.required, Validators.min(0)]],
    acquisitionCost: [0, [Validators.required, Validators.min(0)]],
    insuranceExpiry: ['', [Validators.required]],
    fitnessCertExpiry: ['', [Validators.required]],
    pollutionCertExpiry: ['', [Validators.required]],
    status: ['AVAILABLE', [Validators.required]]
  });

  get f() { return this.vehicleForm.controls; }

  constructor() {
    effect(() => {
      const v = this.vehicle();
      if (v) {
        this.vehicleForm.patchValue({
          registrationNumber: v.registrationNumber,
          modelName: v.modelName,
          type: v.type,
          maxLoadCapacityKg: v.maxLoadCapacityKg,
          odometerKm: v.odometerKm,
          acquisitionCost: v.acquisitionCost,
          insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.substring(0, 10) : '',
          fitnessCertExpiry: v.fitnessCertExpiry ? v.fitnessCertExpiry.substring(0, 10) : '',
          pollutionCertExpiry: v.pollutionCertExpiry ? v.pollutionCertExpiry.substring(0, 10) : '',
          status: v.status
        });
      } else {
        this.vehicleForm.reset({
          type: 'TRUCK',
          status: 'AVAILABLE'
        });
      }
      this.submitted.set(false);
      this.registrationError.set(null);
    }, { allowSignalWrites: true });
  }

  onSave() {
    this.submitted.set(true);
    this.registrationError.set(null);

    if (this.vehicleForm.invalid) {
      return;
    }

    this.loading.set(true);
    const formData = this.vehicleForm.value;
    const mapped = VehicleMapper.toJson(formData);

    const v = this.vehicle();
    const request$ = v 
      ? this.apiService.put(`/vehicles/${v.id}`, mapped)
      : this.apiService.post('/vehicles', mapped);

    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.notifService.success(v ? 'Vehicle updated successfully' : 'Vehicle added successfully');
          this.save.emit();
        } else {
          this.notifService.error(res.message || 'Error occurred');
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.registrationError.set('Registration number is already registered');
        } else if (err.errors && err.errors.length > 0) {
          this.notifService.error(err.errors[0].message);
        } else {
          this.notifService.error(err.message || 'Error saving vehicle');
        }
      }
    });
  }
}
