import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Vehicle } from '../../../models/vehicle.model';
import { Driver } from '../../../models/driver.model';
import { Trip } from '../../../models/trip.model';
import { TripMapper } from '../../../mappers/trip.mapper';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-trip-dispatcher',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Trip Dispatcher" description="Plan, dispatch, and track active cargo trips."></app-page-header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-foreground">
      <div class="lg:col-span-2 bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
        <div>
          <h3 class="text-sm font-bold text-foreground mb-1">Create Cargo Trip</h3>
          <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Initialize a new trip in DRAFT status</p>
        </div>

        <form [formGroup]="tripForm" (ngSubmit)="onCreateTrip()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="font-semibold">Source Depot *</label>
              <input type="text" formControlName="source" placeholder="Depot A - North" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
              @if (submitted() && f['source'].errors) {
                <span class="text-[10px] text-destructive">Required</span>
              }
            </div>

            <div class="space-y-1">
              <label class="font-semibold">Destination *</label>
              <input type="text" formControlName="destination" placeholder="Warehouse B - South" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
              @if (submitted() && f['destination'].errors) {
                <span class="text-[10px] text-destructive">Required</span>
              }
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="font-semibold">Vehicle (Available Pool) *</label>
              <select formControlName="vehicleId" (change)="onVehicleSelect()" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs">
                <option value="">Select a vehicle</option>
                @for (v of vehiclesPool(); track v.id) {
                  <option [value]="v.id">{{ v.registrationNumber }} (Cap: {{ v.maxLoadCapacityKg }}kg)</option>
                }
              </select>
              @if (submitted() && f['vehicleId'].errors) {
                <span class="text-[10px] text-destructive">Required</span>
              }
            </div>

            <div class="space-y-1">
              <label class="font-semibold">Driver (Available Pool) *</label>
              <select formControlName="driverId" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs">
                <option value="">Select a driver</option>
                @for (d of driversPool(); track d.id) {
                  <option [value]="d.id">{{ d.fullName }} (Score: {{ d.safetyScore }})</option>
                }
              </select>
              @if (submitted() && f['driverId'].errors) {
                <span class="text-[10px] text-destructive">Required</span>
              }
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-1">
              <label class="font-semibold">Cargo Weight (kg) *</label>
              <input type="number" formControlName="cargoWeightKg" (input)="validateCapacity()" placeholder="5000" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
              @if (submitted() && f['cargoWeightKg'].errors) {
                <span class="text-[10px] text-destructive">Required (>0)</span>
              }
            </div>

            <div class="space-y-1">
              <label class="font-semibold">Planned Distance (km) *</label>
              <input type="number" formControlName="plannedDistanceKm" placeholder="320" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
              @if (submitted() && f['plannedDistanceKm'].errors) {
                <span class="text-[10px] text-destructive">Required (>0)</span>
              }
            </div>

            <div class="space-y-1">
              <label class="font-semibold">Start Odometer (km) *</label>
              <input type="number" formControlName="startOdometer" placeholder="42000" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
              @if (submitted() && f['startOdometer'].errors) {
                <span class="text-[10px] text-destructive">Required</span>
              }
            </div>
          </div>

          @if (capacityWarning()) {
            <div class="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] rounded-lg">
              ⚠️ {{ capacityWarning() }}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="loading() || !!capacityWarning()" 
            class="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Create Draft Trip
          </button>
        </form>
      </div>

      <div class="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between min-h-[350px]">
        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-bold text-foreground mb-1">Pending Drafts</h3>
            <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Select a draft trip to dispatch</p>
          </div>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            @for (trip of draftTrips(); track trip.id) {
              <div 
                (click)="selectedDraft.set(trip)"
                [ngClass]="{
                  'border-primary bg-primary/5': selectedDraft()?.id === trip.id
                }"
                class="p-3 border border-border bg-muted/10 rounded-lg cursor-pointer hover:bg-muted/30 transition-all flex flex-col gap-1"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-foreground">Draft {{ trip.tripCode }}</span>
                  <span class="text-[10px] text-muted-foreground">{{ trip.plannedDistanceKm }} km</span>
                </div>
                <p class="text-[10px] text-muted-foreground truncate">{{ trip.source }} &rarr; {{ trip.destination }}</p>
                <p class="text-[9px] text-zinc-500 font-medium">Weight: {{ trip.cargoWeightKg | number }} kg</p>
              </div>
            } @empty {
              <p class="text-muted-foreground text-center py-6">No draft trips in queue</p>
            }
          </div>
        </div>

        <div class="mt-6 border-t border-border pt-4 space-y-4">
          @if (selectedDraft()) {
            <div class="space-y-2 text-[10px]">
              <p class="font-bold text-foreground">Selected Trip details:</p>
              <div class="grid grid-cols-2 gap-2 text-muted-foreground">
                <p>Route: <span class="text-foreground font-medium">{{ selectedDraft()!.source }} to {{ selectedDraft()!.destination }}</span></p>
                <p>Cargo: <span class="text-foreground font-medium">{{ selectedDraft()!.cargoWeightKg }} kg</span></p>
              </div>
            </div>
            
            @if (dispatchError()) {
              <div class="p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg">
                ❌ Dispatch Blocked: {{ dispatchError() }}
              </div>
            }

            <button 
              (click)="dispatchTrip()"
              [disabled]="dispatching()"
              class="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
            >
              @if (dispatching()) {
                <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              }
              Dispatch Vehicle & Driver
            </button>
          } @else {
            <p class="text-center text-muted-foreground text-[10px]">Select a draft to enable dispatch controls</p>
          }
        </div>
      </div>
    </div>
  `
})
export class TripDispatcherComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  loading = signal<boolean>(false);
  dispatching = signal<boolean>(false);
  submitted = signal<boolean>(false);

  vehiclesPool = signal<Vehicle[]>([]);
  driversPool = signal<Driver[]>([]);
  draftTrips = signal<Trip[]>([]);
  selectedDraft = signal<Trip | null>(null);

  capacityWarning = signal<string | null>(null);
  dispatchError = signal<string | null>(null);

  tripForm: FormGroup = this.fb.group({
    source: ['', [Validators.required]],
    destination: ['', [Validators.required]],
    vehicleId: ['', [Validators.required]],
    driverId: ['', [Validators.required]],
    cargoWeightKg: [0, [Validators.required, Validators.min(1)]],
    plannedDistanceKm: [0, [Validators.required, Validators.min(1)]],
    startOdometer: [0, [Validators.required, Validators.min(0)]]
  });

  get f() { return this.tripForm.controls; }

  ngOnInit() {
    this.fetchPools();
    this.fetchDraftTrips();
  }

  fetchPools() {
    this.apiService.get<any[]>('/vehicles/dispatch-pool').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vehiclesPool.set(res.data.map(v => ({
            id: v.id,
            registrationNumber: v.registration_number,
            maxLoadCapacityKg: v.max_load_capacity_kg
          } as Vehicle)));
        }
      },
      error: () => {
        this.vehiclesPool.set([
          { id: 'v1', registrationNumber: 'MH-12-QW-4567', maxLoadCapacityKg: 15000 } as Vehicle,
          { id: 'v2', registrationNumber: 'DL-01-XX-9999', maxLoadCapacityKg: 22000 } as Vehicle
        ]);
      }
    });

    this.apiService.get<any[]>('/drivers/dispatch-pool').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.driversPool.set(res.data.map(d => ({
            id: d.id,
            fullName: d.full_name,
            safetyScore: d.safety_score
          } as Driver)));
        }
      },
      error: () => {
        this.driversPool.set([
          { id: 'd1', fullName: 'Shakshi Devrani', safetyScore: 92 } as Driver,
          { id: 'd3', fullName: 'Amit Patel', safetyScore: 84 } as Driver
        ]);
      }
    });
  }

  fetchDraftTrips() {
    this.apiService.get<any[]>('/trips', { status: 'DRAFT' }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.draftTrips.set(res.data.map(t => TripMapper.fromJson(t)));
        }
      },
      error: () => {
        this.draftTrips.set([
          { id: 't1', tripCode: 'TRP-00100', source: 'Depot A', destination: 'Depot B', cargoWeightKg: 8000, plannedDistanceKm: 180, status: 'DRAFT', vehicleId: 'v1', driverId: 'd1', startOdometer: 42100 } as Trip
        ]);
      }
    });
  }

  onVehicleSelect() {
    this.validateCapacity();
    const vId = this.tripForm.value.vehicleId;
    if (!vId) return;

    this.apiService.get<any>(`/vehicles/${vId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tripForm.patchValue({ startOdometer: res.data.odometer_km || res.data.odometerKm });
        }
      },
      error: () => {
        this.tripForm.patchValue({ startOdometer: 42100 });
      }
    });
  }

  validateCapacity() {
    this.capacityWarning.set(null);
    const vehicleId = this.tripForm.value.vehicleId;
    const cargoWeight = this.tripForm.value.cargoWeightKg;

    if (!vehicleId || !cargoWeight) return;

    const selectedVehicle = this.vehiclesPool().find(v => v.id === vehicleId);
    if (selectedVehicle && cargoWeight > selectedVehicle.maxLoadCapacityKg) {
      const diff = cargoWeight - selectedVehicle.maxLoadCapacityKg;
      this.capacityWarning.set(`Cargo weight exceeds selected vehicle's capacity by ${diff} kg! Dispatch will be blocked.`);
    }
  }

  onCreateTrip() {
    this.submitted.set(true);
    if (this.tripForm.invalid || this.capacityWarning()) {
      return;
    }

    this.loading.set(true);
    const formData = this.tripForm.value;
    const mapped = TripMapper.toJson(formData);

    this.apiService.post('/trips', mapped).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.notifService.success('Draft trip created');
          this.tripForm.reset();
          this.submitted.set(false);
          this.fetchDraftTrips();
          this.fetchPools();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.notifService.error(err.message || 'Error creating trip');
      }
    });
  }

  dispatchTrip() {
    const draft = this.selectedDraft();
    if (!draft) return;

    this.dispatching.set(true);
    this.dispatchError.set(null);

    this.apiService.post(`/trips/${draft.id}/dispatch`, {}).subscribe({
      next: (res) => {
        this.dispatching.set(false);
        if (res.success) {
          this.notifService.success(`Trip ${draft.tripCode} dispatched successfully!`);
          this.selectedDraft.set(null);
          this.fetchDraftTrips();
          this.fetchPools();
        } else {
          this.dispatchError.set(res.message || 'Dispatch was rejected');
        }
      },
      error: (err) => {
        this.dispatching.set(false);
        if (err.errors && err.errors.length > 0) {
          this.dispatchError.set(err.errors[0].message);
        } else {
          this.dispatchError.set(err.message || 'Dispatch rejected by server constraints');
        }
      }
    });
  }
}
