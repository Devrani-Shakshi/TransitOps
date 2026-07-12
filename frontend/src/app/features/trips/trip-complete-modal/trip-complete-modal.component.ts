import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-trip-complete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen()" title="Complete Trip" size="sm" (close)="close.emit()">
      <div class="space-y-4 text-xs">
        <div>
          <label class="font-semibold text-foreground">Actual Distance (km) *</label>
          <input type="number" [(ngModel)]="form.actualDistanceKm" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
        </div>
        <div>
          <label class="font-semibold text-foreground">Final Odometer *</label>
          <input type="number" [(ngModel)]="form.finalOdometer" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
        </div>
        <div>
          <label class="font-semibold text-foreground">Fuel Consumed (liters) *</label>
          <input type="number" [(ngModel)]="form.fuelConsumedL" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
        </div>
        <div>
          <label class="font-semibold text-foreground">Revenue Earned (INR) *</label>
          <input type="number" [(ngModel)]="form.revenue" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
        </div>
      </div>

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

  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  loading = signal<boolean>(false);
  form = {
    actualDistanceKm: 0,
    finalOdometer: 0,
    fuelConsumedL: 0,
    revenue: 0
  };

  submitComplete() {
    if (this.form.actualDistanceKm <= 0 || this.form.finalOdometer <= 0 || this.form.fuelConsumedL <= 0 || this.form.revenue <= 0) {
      this.notifService.warning('Please fill in all details with valid positive numbers');
      return;
    }

    this.loading.set(true);
    this.apiService.post(`/trips/${this.tripId()}/complete`, {
      actual_distance_km: this.form.actualDistanceKm,
      final_odometer: this.form.finalOdometer,
      fuel_consumed_l: this.form.fuelConsumedL,
      revenue: this.form.revenue
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
