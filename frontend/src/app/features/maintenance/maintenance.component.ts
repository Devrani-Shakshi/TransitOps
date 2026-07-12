import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { MaintenanceLog, MaintenancePrediction } from '../../models/maintenance.model';
import { Vehicle } from '../../models/vehicle.model';
import { MaintenanceMapper } from '../../mappers/maintenance.mapper';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, PageHeaderComponent, ModalComponent],
  template: `
    <app-page-header title="Maintenance Control" description="Track fleet service records, schedule workshops, and review health predictions.">
      <button 
        (click)="openFormModal()" 
        actions 
        class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow hover:bg-primary/90 transition-colors flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Log Service Record
      </button>
    </app-page-header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-foreground">
      <div class="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div class="px-6 py-4 border-b border-border bg-muted/10 flex items-center justify-between">
          <h3 class="text-sm font-bold text-foreground">Service Logs</h3>
          <span class="text-xs text-muted-foreground">Recent and active maintenance log sheets</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border bg-muted/20 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <th class="px-6 py-3">Vehicle</th>
                <th class="px-6 py-3">Service Type</th>
                <th class="px-6 py-3">Date</th>
                <th class="px-6 py-3">Cost</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border text-xs">
              @for (log of serviceLogs(); track log.id) {
                <tr class="hover:bg-muted/5 transition-colors">
                  <td class="px-6 py-3.5 font-bold text-foreground">{{ log.vehicle?.registrationNumber || 'Unknown' }}</td>
                  <td class="px-6 py-3.5">{{ log.serviceType }}</td>
                  <td class="px-6 py-3.5">{{ log.date | date:'mediumDate' }}</td>
                  <td class="px-6 py-3.5">{{ log.cost | currency:'INR' }}</td>
                  <td class="px-6 py-3.5">
                    <app-status-badge [status]="log.status"></app-status-badge>
                  </td>
                  <td class="px-6 py-3.5 text-right">
                    @if (log.status !== 'COMPLETED') {
                      <button 
                        (click)="completeLog(log.id)"
                        class="px-2 py-1 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition-colors text-[9px]"
                      >
                        Complete
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-xs text-muted-foreground">No maintenance records logged</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between">
        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-bold text-foreground mb-1">Predictive Fleet Health</h3>
            <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Vehicles nearing service deadlines</p>
          </div>

          <div class="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            @for (p of predictions(); track p.vehicleId) {
              <div class="p-3.5 border border-border bg-muted/10 rounded-xl space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-foreground">{{ p.registrationNumber }}</span>
                  <span 
                    [ngClass]="{
                      'text-green-600 dark:text-green-400': p.vehicleHealthPercentage >= 85,
                      'text-amber-600 dark:text-amber-400': p.vehicleHealthPercentage >= 70 && p.vehicleHealthPercentage < 85,
                      'text-red-600 dark:text-red-400': p.vehicleHealthPercentage < 70
                    }"
                    class="font-bold text-xs"
                  >
                    {{ p.vehicleHealthPercentage }}% Health
                  </span>
                </div>
                
                <div class="space-y-1 text-[10px] text-muted-foreground">
                  <div class="flex justify-between">
                    <span>Odometer:</span>
                    <span class="text-foreground font-medium">{{ p.currentOdometerKm | number }} km</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Next Due:</span>
                    <span class="text-foreground font-medium">{{ p.nextServiceDueKm | number }} km</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Overdue in:</span>
                    <span [ngClass]="p.nextServiceDueKm - p.currentOdometerKm < 1000 ? 'text-destructive font-bold' : 'text-foreground font-medium'">
                      {{ p.nextServiceDueKm - p.currentOdometerKm | number }} km
                    </span>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="text-muted-foreground text-center py-6">All vehicles at healthy levels</p>
            }
          </div>
        </div>
      </div>
    </div>

    <app-modal [isOpen]="formModalOpen()" title="Log Service Record" size="md" (close)="closeFormModal()">
      <form [formGroup]="logForm" class="space-y-4">
        <div class="space-y-1">
          <label class="font-semibold">Select Vehicle *</label>
          <select formControlName="vehicleId" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs">
            <option value="">Choose a vehicle</option>
            @for (v of vehicles(); track v.id) {
              <option [value]="v.id">{{ v.registrationNumber }} ({{ v.modelName }})</option>
            }
          </select>
          <p class="text-[9px] text-muted-foreground">⚠️ Logging service auto-transitions vehicle status to <strong>IN_SHOP</strong>, removing it from trip dispatch pool.</p>
        </div>

        <div class="space-y-1">
          <label class="font-semibold">Service Type *</label>
          <input type="text" formControlName="serviceType" placeholder="Engine Oil Replacement, Brake Pad Inspection" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="font-semibold">Estimated Cost (INR) *</label>
            <input type="number" formControlName="cost" placeholder="12000" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          </div>
          <div class="space-y-1">
            <label class="font-semibold">Service Date *</label>
            <input type="date" formControlName="date" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="font-semibold">Diagnostic Notes</label>
          <textarea formControlName="notes" placeholder="Any symptoms or diagnostic findings..." class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs h-20"></textarea>
        </div>
      </form>

      <div footer class="flex items-center gap-2">
        <button (click)="closeFormModal()" class="px-4 py-2 border border-border text-xs rounded-lg hover:bg-muted text-foreground transition-colors">Cancel</button>
        <button (click)="submitLog()" [disabled]="loading()" class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
          @if (loading()) {
            <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          }
          Log Record
        </button>
      </div>
    </app-modal>
  `
})
export class MaintenanceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  loading = signal<boolean>(false);
  formModalOpen = signal<boolean>(false);
  
  serviceLogs = signal<MaintenanceLog[]>([]);
  predictions = signal<MaintenancePrediction[]>([]);
  vehicles = signal<Vehicle[]>([]);

  logForm: FormGroup = this.fb.group({
    vehicleId: ['', [Validators.required]],
    serviceType: ['', [Validators.required]],
    cost: [0, [Validators.required, Validators.min(1)]],
    date: ['', [Validators.required]],
    notes: ['']
  });

  ngOnInit() {
    this.fetchServiceLogs();
    this.fetchPredictions();
    this.fetchVehicles();
  }

  fetchServiceLogs() {
    this.apiService.get<any[]>('/maintenance').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.serviceLogs.set(res.data.map(m => MaintenanceMapper.logFromJson(m)));
        }
      },
      error: () => {
        this.serviceLogs.set([
          { id: 'm1', vehicleId: '1', serviceType: 'Engine Oil Replacement', cost: 14500, date: '2026-07-02T00:00:00', status: 'ACTIVE', vehicle: { registrationNumber: 'MH-12-QW-4567' } as Vehicle },
          { id: 'm2', vehicleId: '3', serviceType: 'Brake Pad Servicing', cost: 8400, date: '2026-06-25T00:00:00', status: 'COMPLETED', vehicle: { registrationNumber: 'DL-01-XX-9999' } as Vehicle }
        ]);
      }
    });
  }

  fetchPredictions() {
    this.apiService.get<any[]>('/maintenance/predictions').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.predictions.set(res.data.map(p => MaintenanceMapper.predictionFromJson(p)));
        }
      },
      error: () => {
        this.predictions.set([
          { vehicleId: '1', registrationNumber: 'MH-12-QW-4567', modelName: 'Tata Prima 3525', currentOdometerKm: 42100, lastServiceOdometerKm: 32000, nextServiceDueKm: 43000, daysSinceLastService: 45, vehicleHealthPercentage: 74, status: 'NEARING_SERVICE' },
          { vehicleId: '2', registrationNumber: 'KA-51-MM-8901', modelName: 'Mahindra Bolero', currentOdometerKm: 78500, lastServiceOdometerKm: 75000, nextServiceDueKm: 85000, daysSinceLastService: 28, vehicleHealthPercentage: 92, status: 'HEALTHY' }
        ]);
      }
    });
  }

  fetchVehicles() {
    this.apiService.get<any[]>('/vehicles').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vehicles.set(res.data.filter(v => v.status !== 'RETIRED').map(v => ({
            id: v.id,
            registrationNumber: v.registration_number,
            modelName: v.model_name
          } as Vehicle)));
        }
      },
      error: () => {
        this.vehicles.set([
          { id: '1', registrationNumber: 'MH-12-QW-4567', modelName: 'Tata Prima 3525' } as Vehicle,
          { id: '2', registrationNumber: 'KA-51-MM-8901', modelName: 'Mahindra Bolero' } as Vehicle,
          { id: '3', registrationNumber: 'DL-01-XX-9999', modelName: 'Ashok Leyland 4019' } as Vehicle
        ]);
      }
    });
  }

  openFormModal() {
    this.logForm.reset({
      cost: 0,
      date: new Date().toISOString().substring(0, 10)
    });
    this.formModalOpen.set(true);
  }

  closeFormModal() {
    this.formModalOpen.set(false);
  }

  submitLog() {
    if (this.logForm.invalid) return;

    this.loading.set(true);
    const formData = this.logForm.value;
    const mapped = MaintenanceMapper.logToJson(formData);

    this.apiService.post('/maintenance', mapped).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.notifService.success('Maintenance record logged. Vehicle status moved to IN_SHOP.');
          this.formModalOpen.set(false);
          this.fetchServiceLogs();
          this.fetchPredictions();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.notifService.error(err.message || 'Error logging record');
      }
    });
  }

  completeLog(id: string) {
    if (confirm('Are you sure you want to complete this maintenance task? Vehicle status will be restored to AVAILABLE.')) {
      this.apiService.post(`/maintenance/${id}/complete`, {}).subscribe({
        next: (res) => {
          if (res.success) {
            this.notifService.success('Maintenance task completed successfully.');
            this.fetchServiceLogs();
            this.fetchPredictions();
          }
        },
        error: (err) => {
          this.notifService.error(err.message || 'Error completing maintenance');
        }
      });
    }
  }
}
