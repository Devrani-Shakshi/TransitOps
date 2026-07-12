import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Vehicle, VehicleDocument } from '../../../models/vehicle.model';
import { Trip } from '../../../models/trip.model';
import { MaintenanceLog } from '../../../models/maintenance.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vehicle-detail-drawer',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, FormsModule],
  template: `
    @if (isOpen() && vehicle()) {
      <div class="fixed inset-0 z-40 flex justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="close.emit()"></div>
        
        <div class="relative w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col h-full z-10 animate-fade-in">
          <div class="p-6 border-b border-border bg-muted/15 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-foreground">{{ vehicle()!.registrationNumber }}</h3>
              <p class="text-xs text-muted-foreground mt-0.5">{{ vehicle()!.modelName }} ({{ vehicle()!.type }})</p>
            </div>
            <div class="flex items-center gap-2">
              <app-status-badge [status]="vehicle()!.status"></app-status-badge>
              <button (click)="close.emit()" class="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div class="flex border-b border-border text-xs font-semibold px-6">
            <button 
              (click)="activeTab.set('details')"
              [class.border-primary]="activeTab() === 'details'"
              [class.text-primary]="activeTab() === 'details'"
              class="py-3 px-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            >Details</button>
            <button 
              (click)="activeTab.set('documents')"
              [class.border-primary]="activeTab() === 'documents'"
              [class.text-primary]="activeTab() === 'documents'"
              class="py-3 px-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            >Documents</button>
            <button 
              (click)="activeTab.set('maintenance')"
              [class.border-primary]="activeTab() === 'maintenance'"
              [class.text-primary]="activeTab() === 'maintenance'"
              class="py-3 px-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            >Maintenance</button>
            <button 
              (click)="activeTab.set('trips')"
              [class.border-primary]="activeTab() === 'trips'"
              [class.text-primary]="activeTab() === 'trips'"
              class="py-3 px-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            >Trips</button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 text-xs text-foreground">
            @if (activeTab() === 'details') {
              <div class="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p class="text-[10px] text-muted-foreground uppercase font-bold">Max Load Capacity</p>
                  <p class="font-semibold text-foreground mt-1">{{ vehicle()!.maxLoadCapacityKg | number }} kg</p>
                </div>
                <div>
                  <p class="text-[10px] text-muted-foreground uppercase font-bold">Current Odometer</p>
                  <p class="font-semibold text-foreground mt-1">{{ vehicle()!.odometerKm | number }} km</p>
                </div>
                <div>
                  <p class="text-[10px] text-muted-foreground uppercase font-bold">Acquisition Cost</p>
                  <p class="font-semibold text-foreground mt-1">{{ vehicle()!.acquisitionCost | currency:'INR' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-muted-foreground uppercase font-bold">Insurance Expiry</p>
                  <p class="font-semibold mt-1" [ngClass]="isExpired(vehicle()!.insuranceExpiry) ? 'text-destructive' : 'text-foreground'">
                    {{ vehicle()!.insuranceExpiry | date:'mediumDate' }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] text-muted-foreground uppercase font-bold">Fitness Cert Expiry</p>
                  <p class="font-semibold mt-1" [ngClass]="isExpired(vehicle()!.fitnessCertExpiry) ? 'text-destructive' : 'text-foreground'">
                    {{ vehicle()!.fitnessCertExpiry | date:'mediumDate' }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] text-muted-foreground uppercase font-bold">Pollution Cert Expiry</p>
                  <p class="font-semibold mt-1" [ngClass]="isExpired(vehicle()!.pollutionCertExpiry) ? 'text-destructive' : 'text-foreground'">
                    {{ vehicle()!.pollutionCertExpiry | date:'mediumDate' }}
                  </p>
                </div>
              </div>
            }

            @if (activeTab() === 'documents') {
              <div class="space-y-6">
                <div class="p-4 border border-border bg-muted/10 rounded-xl space-y-3">
                  <h4 class="font-bold text-foreground">Upload Document</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-[10px] font-bold text-muted-foreground">Doc Name</label>
                      <input type="text" [(ngModel)]="docForm.name" placeholder="Pollution Pass" class="w-full mt-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
                    </div>
                    <div>
                      <label class="text-[10px] font-bold text-muted-foreground">Expiry Date</label>
                      <input type="date" [(ngModel)]="docForm.expiryDate" class="w-full mt-1 px-2.5 py-1 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
                    </div>
                  </div>
                  <div>
                    <label class="text-[10px] font-bold text-muted-foreground">File Upload</label>
                    <input type="file" (change)="onFileSelected($event)" class="w-full mt-1 px-2 py-1 bg-background border border-border rounded-lg text-foreground text-xs" />
                  </div>
                  <button (click)="uploadDoc()" [disabled]="uploading()" class="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors text-xs flex items-center justify-center gap-1">
                    @if (uploading()) {
                      <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    }
                    Upload Document
                  </button>
                </div>

                <div class="space-y-3">
                  <h4 class="font-bold text-foreground">Active Documents</h4>
                  @for (doc of documents(); track doc.id) {
                    <div class="p-3 border border-border bg-card rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <p class="font-bold text-foreground">{{ doc.name }}</p>
                        <p class="text-[10px] text-muted-foreground mt-0.5">Expires: {{ doc.expiryDate | date:'mediumDate' }}</p>
                      </div>
                      <div class="flex items-center gap-2">
                        @if (isExpired(doc.expiryDate)) {
                          <span class="px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400 font-semibold uppercase text-[10px] border border-red-500/20">Expired</span>
                        } @else {
                          <span class="px-2 py-0.5 rounded bg-green-500/10 text-green-700 dark:text-green-400 font-semibold uppercase text-[10px] border border-green-500/20">Valid</span>
                        }
                        <a [href]="doc.fileUrl" target="_blank" class="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                      </div>
                    </div>
                  } @empty {
                    <p class="text-muted-foreground text-center py-4">No documents uploaded yet</p>
                  }
                </div>
              </div>
            }

            @if (activeTab() === 'maintenance') {
              <div class="space-y-4">
                @for (log of maintenanceLogs(); track log.id) {
                  <div class="p-3 border border-border bg-card rounded-xl flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-bold text-foreground truncate">{{ log.serviceType }}</p>
                      <p class="text-[10px] text-muted-foreground mt-0.5">Date: {{ log.date | date:'mediumDate' }}</p>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="font-bold text-foreground">{{ log.cost | currency:'INR' }}</p>
                      <span class="inline-block mt-1"><app-status-badge [status]="log.status"></app-status-badge></span>
                    </div>
                  </div>
                } @empty {
                  <p class="text-muted-foreground text-center py-4">No service records found</p>
                }
              </div>
            }

            @if (activeTab() === 'trips') {
              <div class="space-y-4">
                @for (trip of tripHistory(); track trip.id) {
                  <div class="p-3 border border-border bg-card rounded-xl flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-bold text-primary truncate">{{ trip.tripCode }}</p>
                      <p class="text-[10px] text-muted-foreground mt-0.5">{{ trip.source }} &rarr; {{ trip.destination }}</p>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="font-semibold text-foreground">{{ trip.plannedDistanceKm }} km</p>
                      <span class="inline-block mt-1"><app-status-badge [status]="trip.status"></app-status-badge></span>
                    </div>
                  </div>
                } @empty {
                  <p class="text-muted-foreground text-center py-4">No dispatch history</p>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class VehicleDetailDrawerComponent {
  isOpen = input.required<boolean>();
  vehicle = input<Vehicle | null>(null);

  close = output<void>();

  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  activeTab = signal<string>('details');
  uploading = signal<boolean>(false);

  documents = signal<VehicleDocument[]>([]);
  maintenanceLogs = signal<MaintenanceLog[]>([]);
  tripHistory = signal<Trip[]>([]);

  selectedFile: File | null = null;
  docForm = {
    name: '',
    expiryDate: ''
  };

  constructor() {
    effect(() => {
      const v = this.vehicle();
      if (v && this.isOpen()) {
        this.activeTab.set('details');
        this.fetchDetailsData(v.id);
      }
    });
  }

  fetchDetailsData(vehicleId: string) {
    this.apiService.get<any[]>(`/vehicles/${vehicleId}/documents`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.documents.set(res.data.map(d => ({
            id: d.id,
            vehicleId: d.vehicle_id,
            name: d.name,
            documentType: d.document_type,
            fileUrl: d.file_url,
            expiryDate: d.expiry_date,
            createdAt: d.created_at
          })));
        }
      },
      error: () => this.documents.set([])
    });

    this.apiService.get<any[]>(`/vehicles/${vehicleId}/maintenance`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.maintenanceLogs.set(res.data.map(m => ({
            id: m.id,
            vehicleId: m.vehicle_id,
            serviceType: m.service_type,
            cost: m.cost,
            date: m.date,
            status: m.status,
            notes: m.notes
          })));
        }
      },
      error: () => this.maintenanceLogs.set([])
    });

    this.apiService.get<any[]>(`/vehicles/${vehicleId}/trips`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tripHistory.set(res.data.map(t => ({
            id: t.id,
            tripCode: t.trip_code,
            source: t.source,
            destination: t.destination,
            cargoWeightKg: t.cargo_weight_kg,
            plannedDistanceKm: t.planned_distance_km,
            startOdometer: t.start_odometer,
            vehicleId: t.vehicle_id,
            driverId: t.driver_id,
            status: t.status
          })));
        }
      },
      error: () => this.tripHistory.set([])
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadDoc() {
    const v = this.vehicle();
    if (!v || !this.selectedFile || !this.docForm.name || !this.docForm.expiryDate) {
      this.notifService.warning('Please fill in all document upload fields and select a file');
      return;
    }

    this.uploading.set(true);
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('name', this.docForm.name);
    formData.append('expiry_date', this.docForm.expiryDate);

    this.apiService.post<any>(`/vehicles/${v.id}/documents`, formData).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.success) {
          this.notifService.success('Document uploaded successfully');
          this.docForm = { name: '', expiryDate: '' };
          this.selectedFile = null;
          this.fetchDetailsData(v.id);
        }
      },
      error: (err) => {
        this.uploading.set(false);
        this.notifService.error(err.message || 'Error uploading document');
      }
    });
  }

  isExpired(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }
}
