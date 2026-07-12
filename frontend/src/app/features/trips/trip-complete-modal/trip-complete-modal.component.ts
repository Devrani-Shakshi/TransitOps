import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-trip-complete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen()" title="Complete Trip" size="sm" (close)="close.emit()">
      <form [formGroup]="completeForm" (ngSubmit)="submitComplete()" class="space-y-4 text-xs">
        <div>
          <label class="font-semibold text-foreground">Actual Distance (km) *</label>
          <input type="number" formControlName="actualDistanceKm" 
                 [ngClass]="{'border-destructive focus:ring-destructive': submitted() && f['actualDistanceKm'].errors}"
                 class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          @if (submitted() && f['actualDistanceKm'].errors) {
            <span class="text-[10px] text-destructive block mt-1">Distance must be greater than 0</span>
          }
        </div>
        <div>
          <label class="font-semibold text-foreground">Final Odometer *</label>
          <input type="number" formControlName="finalOdometer" 
                 [ngClass]="{'border-destructive focus:ring-destructive': submitted() && f['finalOdometer'].errors}"
                 class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          @if (submitted() && f['finalOdometer'].errors) {
            <span class="text-[10px] text-destructive block mt-1">Final odometer is required and must be greater than 0</span>
          }
        </div>
        <div>
          <label class="font-semibold text-foreground">Fuel Consumed (liters) *</label>
          <input type="number" formControlName="fuelConsumedL" 
                 [ngClass]="{'border-destructive focus:ring-destructive': submitted() && f['fuelConsumedL'].errors}"
                 class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          @if (submitted() && f['fuelConsumedL'].errors) {
            <span class="text-[10px] text-destructive block mt-1">Liters must be greater than 0</span>
          }
        </div>
        <div>
          <label class="font-semibold text-foreground">Revenue Earned (INR) *</label>
          <input type="number" formControlName="revenue" 
                 [ngClass]="{'border-destructive focus:ring-destructive': submitted() && f['revenue'].errors}"
                 class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          @if (submitted() && f['revenue'].errors) {
            <span class="text-[10px] text-destructive block mt-1">Revenue must be greater than 0</span>
          }
        </div>
      </form>

      <div footer class="flex items-center gap-2">
        <button (click)="close.emit()" class="px-4 py-2 border border-border text-xs rounded-lg hover:bg-muted text-foreground transition-colors">Cancel</button>
        <button (click)="submitComplete()" [disabled]="loading()" class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
          @if (loading()) {
            <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          }
          Complete
        </button>
      </div>
    </app-modal>
  `
})
export class TripCompleteModalComponent {
  isOpen = input.required<boolean>();
  tripId = input.required<string>();

  close = output<void>();
  save = output<void>();

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  completeForm = this.fb.group({
    actualDistanceKm: [null as number | null, [Validators.required, Validators.min(1)]],
    finalOdometer: [null as number | null, [Validators.required, Validators.min(1)]],
    fuelConsumedL: [null as number | null, [Validators.required, Validators.min(1)]],
    revenue: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  get f() { return this.completeForm.controls; }

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.completeForm.reset();
        this.submitted.set(false);
      }
    });
  }

  submitComplete() {
    this.submitted.set(true);

    if (this.completeForm.invalid) {
      return;
    }

    this.loading.set(true);
    const formVal = this.completeForm.value;

    this.apiService.post(`/trips/${this.tripId()}/complete`, {
      actual_distance_km: formVal.actualDistanceKm,
      final_odometer: formVal.finalOdometer,
      fuel_consumed_l: formVal.fuelConsumedL,
      revenue: formVal.revenue
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.notifService.success('Trip completed successfully');
          this.save.emit();
        } else {
          this.notifService.error(res.message);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.notifService.error(err.message || 'Error completing trip');
      }
    });
  }
}
