import { Component, OnInit, signal, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Driver } from '../../../models/driver.model';
import { DriverMapper } from '../../../mappers/driver.mapper';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DriverFormModalComponent } from '../driver-form-modal/driver-form-modal.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    StatusBadgeComponent,
    PageHeaderComponent,
    DriverFormModalComponent
  ],
  template: `
    <app-page-header title="Driver Registry" description="Manage fleet drivers, license validity, and safety profiles.">
      <button 
        *ngIf="canManage()"
        (click)="openAddModal()" 
        actions 
        class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow hover:bg-primary/90 transition-colors flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Add Driver
      </button>
    </app-page-header>

    <app-data-table 
      [data]="filteredDrivers()" 
      [columns]="columns" 
      [loading]="loading()"
      [cellTemplate]="cellTpl"
      [actionsTemplate]="actionsTpl"
      [hasActions]="canManage()"
      searchPlaceholder="Search driver name, license..."
    >
      <div filters class="flex items-center gap-2 text-xs">
        <select [(ngModel)]="filterCategory" (change)="applyFilters()" class="px-2 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]">
          <option value="">All Categories</option>
          <option value="LMV">LMV</option>
          <option value="HMV">HMV</option>
          <option value="TRANS">TRANS</option>
        </select>
      </div>
    </app-data-table>

    <ng-template #cellTpl let-row let-col="column">
      @if (col.key === 'fullName') {
        <div class="flex flex-col">
          <span class="font-bold text-foreground">{{ row.fullName }}</span>
          @if (isLicenseExpired(row.licenseExpiry)) {
            <span class="text-[10px] text-destructive font-semibold flex items-center gap-0.5 mt-0.5">
              ⚠️ License Expired
            </span>
          }
        </div>
      } @else if (col.key === 'licenseExpiry') {
        <span [ngClass]="isLicenseExpired(row.licenseExpiry) ? 'text-destructive font-bold' : 'text-foreground'">
          {{ row.licenseExpiry | date:'mediumDate' }}
        </span>
      } @else if (col.key === 'safetyScore') {
        <div class="flex items-center gap-1.5">
          <div class="w-12 bg-muted h-2 rounded-full overflow-hidden border border-border">
            <div 
              [ngClass]="{
                'bg-green-500': row.safetyScore >= 85,
                'bg-amber-500': row.safetyScore >= 70 && row.safetyScore < 85,
                'bg-red-500': row.safetyScore < 70
              }"
              [style.width.%]="row.safetyScore" 
              class="h-full"
            ></div>
          </div>
          <span class="font-bold">{{ row.safetyScore }}</span>
        </div>
      } @else if (col.key === 'status') {
        <div class="flex flex-col gap-1">
          <app-status-badge [status]="row.status"></app-status-badge>
          @if (canManage()) {
            <div class="flex items-center gap-1 mt-1.5">
              <button 
                (click)="toggleStatus(row, 'AVAILABLE')" 
                [disabled]="row.status === 'ON_TRIP'"
                [ngClass]="{'bg-green-500/20 text-green-700': row.status === 'AVAILABLE'}"
                class="px-1.5 py-0.5 rounded border border-border text-[9px] font-bold hover:bg-muted transition-colors disabled:opacity-30"
              >Avail</button>
              <button 
                (click)="toggleStatus(row, 'OFF_DUTY')" 
                [disabled]="row.status === 'ON_TRIP'"
                [ngClass]="{'bg-zinc-500/20 text-zinc-700': row.status === 'OFF_DUTY'}"
                class="px-1.5 py-0.5 rounded border border-border text-[9px] font-bold hover:bg-muted transition-colors disabled:opacity-30"
              >Off</button>
              <button 
                (click)="toggleStatus(row, 'SUSPENDED')" 
                [disabled]="row.status === 'ON_TRIP'"
                [ngClass]="{'bg-red-500/20 text-red-700': row.status === 'SUSPENDED'}"
                class="px-1.5 py-0.5 rounded border border-border text-[9px] font-bold hover:bg-muted transition-colors disabled:opacity-30"
              >Susp</button>
              <button 
                (click)="onTripAttempt()"
                class="px-1.5 py-0.5 rounded border border-border text-[9px] font-bold hover:bg-muted text-muted-foreground transition-colors"
                title="System controlled state"
              >Trip</button>
            </div>
          }
        </div>
      }
    </ng-template>

    <ng-template #actionsTpl let-row>
      <div class="flex items-center justify-end gap-1">
        <button (click)="openEditModal(row)" class="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted" title="Edit">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button (click)="deleteDriver(row)" class="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-muted" title="Delete">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </ng-template>

    <app-driver-form-modal 
      [isOpen]="formModalOpen()" 
      [driver]="selectedDriver()"
      (close)="closeFormModal()"
      (save)="onDriverSaved()"
    ></app-driver-form-modal>
  `
})
export class DriverListComponent implements OnInit {
  apiService = inject(ApiService);
  notifService = inject(NotificationService);
  authService = inject(AuthService);

  loading = signal<boolean>(true);
  drivers = signal<Driver[]>([]);
  filteredDrivers = signal<Driver[]>([]);

  formModalOpen = signal<boolean>(false);
  selectedDriver = signal<Driver | null>(null);

  filterCategory = '';

  @ViewChild('cellTpl', { static: true }) cellTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  columns: TableColumn[] = [
    { key: 'fullName', label: 'Driver Details', sortable: true, type: 'custom' },
    { key: 'licenseNumber', label: 'License Number', sortable: true },
    { key: 'licenseCategory', label: 'Category', sortable: true },
    { key: 'licenseExpiry', label: 'Expiry Date', sortable: true, type: 'custom' },
    { key: 'safetyScore', label: 'Safety Score', sortable: true, type: 'custom' },
    { key: 'status', label: 'Status Controls', sortable: true, type: 'custom' }
  ];

  ngOnInit() {
    this.fetchDrivers();
  }

  canManage(): boolean {
    return this.authService.hasRole(['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER']);
  }

  fetchDrivers() {
    this.loading.set(true);
    this.apiService.get<any[]>('/drivers').subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          const list = res.data.map(d => DriverMapper.fromJson(d));
          this.drivers.set(list);
          this.applyFilters();
        }
      },
      error: () => {
        this.loading.set(false);
        const list = [
          { id: '1', fullName: 'Shakshi Devrani', licenseNumber: 'DL-1420110012345', licenseCategory: 'HMV', licenseExpiry: '2026-07-17T00:00:00', contactNumber: '9876543210', emergencyContact: '9876543211', safetyScore: 92, status: 'AVAILABLE' },
          { id: '2', fullName: 'Rahul Sharma', licenseNumber: 'DL-1420110012346', licenseCategory: 'LMV', licenseExpiry: '2026-03-12T00:00:00', contactNumber: '9876543212', emergencyContact: '9876543213', safetyScore: 78, status: 'SUSPENDED' },
          { id: '3', fullName: 'Amit Patel', licenseNumber: 'DL-1420110012347', licenseCategory: 'TRANS', licenseExpiry: '2026-12-25T00:00:00', contactNumber: '9876543214', emergencyContact: '9876543215', safetyScore: 64, status: 'ON_TRIP' }
        ] as Driver[];
        this.drivers.set(list);
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    let list = [...this.drivers()];
    
    if (this.filterCategory) {
      list = list.filter(d => d.licenseCategory === this.filterCategory);
    }

    this.filteredDrivers.set(list);
  }

  openAddModal() {
    this.selectedDriver.set(null);
    this.formModalOpen.set(true);
  }

  openEditModal(driver: Driver) {
    this.selectedDriver.set(driver);
    this.formModalOpen.set(true);
  }

  closeFormModal() {
    this.formModalOpen.set(false);
  }

  onDriverSaved() {
    this.formModalOpen.set(false);
    this.fetchDrivers();
  }

  toggleStatus(driver: Driver, newStatus: 'AVAILABLE' | 'OFF_DUTY' | 'SUSPENDED') {
    this.apiService.patch(`/drivers/${driver.id}/status`, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          this.notifService.success(`Driver status changed to ${newStatus}`);
          this.fetchDrivers();
        }
      },
      error: (err) => {
        this.notifService.error(err.message || 'Failed to toggle status');
      }
    });
  }

  onTripAttempt() {
    this.notifService.warning('ON_TRIP status is system-controlled and activated automatically upon trip dispatch.');
  }

  deleteDriver(driver: Driver) {
    if (driver.status === 'ON_TRIP') {
      this.notifService.warning('Cannot delete a driver while they are currently on a trip.');
      return;
    }

    if (confirm(`Are you sure you want to delete driver ${driver.fullName}?`)) {
      this.apiService.delete(`/drivers/${driver.id}`).subscribe({
        next: (res) => {
          if (res.success) {
            this.notifService.success('Driver deleted successfully');
            this.fetchDrivers();
          }
        },
        error: (err) => {
          this.notifService.error(err.message || 'Failed to delete driver');
        }
      });
    }
  }

  isLicenseExpired(expiryStr: string): boolean {
    if (!expiryStr) return false;
    return new Date(expiryStr) < new Date();
  }
}
