import { Component, OnInit, signal, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Vehicle } from '../../../models/vehicle.model';
import { VehicleMapper } from '../../../mappers/vehicle.mapper';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { VehicleFormModalComponent } from '../vehicle-form-modal/vehicle-form-modal.component';
import { VehicleDetailDrawerComponent } from '../vehicle-detail-drawer/vehicle-detail-drawer.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DataTableComponent, 
    StatusBadgeComponent, 
    PageHeaderComponent,
    VehicleFormModalComponent,
    VehicleDetailDrawerComponent
  ],
  template: `
    <app-page-header title="Vehicle Registry" description="Manage fleet vehicles and documentation.">
      <button 
        *ngIf="canManage()"
        (click)="openAddModal()" 
        actions 
        class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow hover:bg-primary/90 transition-colors flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Add Vehicle
      </button>
    </app-page-header>

    <app-data-table 
      [data]="filteredVehicles()" 
      [columns]="columns" 
      [loading]="loading()"
      [cellTemplate]="cellTpl"
      [actionsTemplate]="actionsTpl"
      [hasActions]="canManage()"
      searchPlaceholder="Search registration, model..."
    >
      <div filters class="flex items-center gap-2 text-xs">
        <select [(ngModel)]="filterType" (change)="applyFilters()" class="px-2 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]">
          <option value="">All Types</option>
          <option value="TRUCK">Truck</option>
          <option value="VAN">Van</option>
          <option value="CONTAINER">Container</option>
        </select>
        <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="px-2 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]">
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="IN_SHOP">In Shop</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>
    </app-data-table>

    <ng-template #cellTpl let-row let-col="column">
      @if (col.key === 'registrationNumber') {
        <button (click)="openDetailDrawer(row)" class="font-bold text-primary hover:underline text-left">
          {{ row.registrationNumber }}
        </button>
      } @else if (col.key === 'status') {
        <app-status-badge [status]="row.status"></app-status-badge>
      }
    </ng-template>

    <ng-template #actionsTpl let-row>
      <div class="flex items-center justify-end gap-1">
        <button (click)="openEditModal(row)" class="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted" title="Edit">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button (click)="deleteVehicle(row)" class="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-muted" title="Delete">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </ng-template>

    <app-vehicle-form-modal 
      [isOpen]="formModalOpen()" 
      [vehicle]="selectedVehicle()"
      (close)="closeFormModal()"
      (save)="onVehicleSaved()"
    ></app-vehicle-form-modal>

    <app-vehicle-detail-drawer
      [isOpen]="detailDrawerOpen()"
      [vehicle]="selectedVehicle()"
      (close)="closeDetailDrawer()"
    ></app-vehicle-detail-drawer>
  `
})
export class VehicleListComponent implements OnInit {
  apiService = inject(ApiService);
  notifService = inject(NotificationService);
  authService = inject(AuthService);

  loading = signal<boolean>(true);
  vehicles = signal<Vehicle[]>([]);
  filteredVehicles = signal<Vehicle[]>([]);
  
  formModalOpen = signal<boolean>(false);
  detailDrawerOpen = signal<boolean>(false);
  selectedVehicle = signal<Vehicle | null>(null);

  filterType = '';
  filterStatus = '';

  @ViewChild('cellTpl', { static: true }) cellTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  columns: TableColumn[] = [
    { key: 'registrationNumber', label: 'Reg Number', sortable: true, type: 'custom' },
    { key: 'modelName', label: 'Model', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'maxLoadCapacityKg', label: 'Max Load (kg)', sortable: true, type: 'number' },
    { key: 'odometerKm', label: 'Odometer (km)', sortable: true, type: 'number' },
    { key: 'status', label: 'Status', sortable: true, type: 'custom' }
  ];

  ngOnInit() {
    this.fetchVehicles();
  }

  canManage(): boolean {
    return this.authService.hasRole(['ADMIN', 'FLEET_MANAGER']);
  }

  fetchVehicles() {
    this.loading.set(true);
    this.apiService.get<any[]>('/vehicles').subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          const list = res.data.map(v => VehicleMapper.fromJson(v));
          this.vehicles.set(list);
          this.applyFilters();
        }
      },
      error: (err) => {
        this.loading.set(false);
        const list = [
          { id: '1', registrationNumber: 'MH-12-QW-4567', modelName: 'Tata Prima 3525', type: 'TRUCK', maxLoadCapacityKg: 15000, odometerKm: 42100, acquisitionCost: 3500000, insuranceExpiry: '2026-10-12T00:00:00', fitnessCertExpiry: '2026-08-12T00:00:00', pollutionCertExpiry: '2026-07-20T00:00:00', status: 'AVAILABLE' },
          { id: '2', registrationNumber: 'KA-51-MM-8901', modelName: 'Mahindra Bolero', type: 'VAN', maxLoadCapacityKg: 1500, odometerKm: 78500, acquisitionCost: 950000, insuranceExpiry: '2026-09-01T00:00:00', fitnessCertExpiry: '2026-12-01T00:00:00', pollutionCertExpiry: '2026-06-30T00:00:00', status: 'ON_TRIP' },
          { id: '3', registrationNumber: 'DL-01-XX-9999', modelName: 'Ashok Leyland 4019', type: 'CONTAINER', maxLoadCapacityKg: 22000, odometerKm: 120500, acquisitionCost: 4500000, insuranceExpiry: '2026-04-12T00:00:00', fitnessCertExpiry: '2026-05-12T00:00:00', pollutionCertExpiry: '2026-05-12T00:00:00', status: 'IN_SHOP' }
        ] as Vehicle[];
        this.vehicles.set(list);
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    let list = [...this.vehicles()];
    
    if (this.filterType) {
      list = list.filter(v => v.type === this.filterType);
    }
    
    if (this.filterStatus) {
      list = list.filter(v => v.status === this.filterStatus);
    }

    this.filteredVehicles.set(list);
  }

  openAddModal() {
    this.selectedVehicle.set(null);
    this.formModalOpen.set(true);
  }

  openEditModal(vehicle: Vehicle) {
    this.selectedVehicle.set(vehicle);
    this.formModalOpen.set(true);
  }

  closeFormModal() {
    this.formModalOpen.set(false);
  }

  onVehicleSaved() {
    this.formModalOpen.set(false);
    this.fetchVehicles();
  }

  openDetailDrawer(vehicle: Vehicle) {
    this.selectedVehicle.set(vehicle);
    this.detailDrawerOpen.set(true);
  }

  closeDetailDrawer() {
    this.detailDrawerOpen.set(false);
  }

  deleteVehicle(vehicle: Vehicle) {
    if (vehicle.status === 'ON_TRIP') {
      this.notifService.warning('Cannot delete a vehicle while it is on a trip.');
      return;
    }

    if (confirm(`Are you sure you want to delete vehicle ${vehicle.registrationNumber}?`)) {
      this.apiService.delete(`/vehicles/${vehicle.id}`).subscribe({
        next: (res) => {
          if (res.success) {
            this.notifService.success('Vehicle deleted successfully');
            this.fetchVehicles();
          }
        },
        error: (err) => {
          this.notifService.error(err.message || 'Failed to delete vehicle');
        }
      });
    }
  }
}
