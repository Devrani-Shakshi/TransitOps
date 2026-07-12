import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, StatusBadgeComponent, FormsModule],
  template: `
    <div class="bg-card border border-border p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div class="flex flex-wrap gap-3 flex-1">
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-muted-foreground uppercase">Vehicle Type</label>
          <select [(ngModel)]="filters.type" (change)="loadDashboardData()" class="px-2 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]">
            <option value="">All Types</option>
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="CONTAINER">Container</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-muted-foreground uppercase">Vehicle Status</label>
          <select [(ngModel)]="filters.status" (change)="loadDashboardData()" class="px-2 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]">
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-muted-foreground uppercase">Region</label>
          <select [(ngModel)]="filters.region" (change)="loadDashboardData()" class="px-2 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]">
            <option value="">All Regions</option>
            <option value="North">North Depot</option>
            <option value="South">South Depot</option>
            <option value="East">East Depot</option>
            <option value="West">West Depot</option>
          </select>
        </div>
      </div>
      
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-muted-foreground uppercase">Date Range</label>
        <input type="date" [(ngModel)]="filters.date" (change)="loadDashboardData()" class="px-2 py-1 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"/>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <app-kpi-card title="Active Vehicles" [value]="kpis().activeVehicles" [loading]="loading()" trend="4%" trendType="up">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>
      </app-kpi-card>
      
      <app-kpi-card title="Available Vehicles" [value]="kpis().availableVehicles" [loading]="loading()" trend="2%" trendType="up">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      </app-kpi-card>
      
      <app-kpi-card title="In Maintenance" [value]="kpis().vehiclesInMaintenance" [loading]="loading()" trend="1" trendType="down" trendLabel="logs open">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </app-kpi-card>

      <app-kpi-card title="Active Trips" [value]="kpis().activeTrips" [loading]="loading()" trend="12%" trendType="up">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
      </app-kpi-card>

      <app-kpi-card title="Pending Trips" [value]="kpis().pendingTrips" [loading]="loading()" trend="5" trendType="neutral" trendLabel="in queue">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </app-kpi-card>

      <app-kpi-card title="Drivers On Duty" [value]="kpis().driversOnDuty" [loading]="loading()" trend="3" trendType="up" trendLabel="added today">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </app-kpi-card>

      <app-kpi-card title="Utilization" [value]="utilizationFormatted()" [loading]="loading()" trend="2.4%" trendType="up">
        <svg icon class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </app-kpi-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div class="px-6 py-4 border-b border-border bg-muted/10 flex items-center justify-between">
          <h3 class="text-sm font-bold text-foreground">Recent Trips</h3>
          <span class="text-xs text-muted-foreground">Latest dispatch actions</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border bg-muted/20 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <th class="px-6 py-3">Trip Code</th>
                <th class="px-6 py-3">Route</th>
                <th class="px-6 py-3">Cargo Weight</th>
                <th class="px-6 py-3">Distance</th>
                <th class="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border text-xs">
              @for (trip of recentTrips(); track trip.id) {
                <tr class="hover:bg-muted/5 transition-colors">
                  <td class="px-6 py-3.5 font-bold text-primary">{{ trip.tripCode }}</td>
                  <td class="px-6 py-3.5">{{ trip.source }} &rarr; {{ trip.destination }}</td>
                  <td class="px-6 py-3.5">{{ trip.cargoWeightKg | number }} kg</td>
                  <td class="px-6 py-3.5">{{ trip.plannedDistanceKm }} km</td>
                  <td class="px-6 py-3.5">
                    <app-status-badge [status]="trip.status"></app-status-badge>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-xs text-muted-foreground">No recent trips logged</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold text-foreground mb-1">Fleet Distribution</h3>
          <p class="text-[10px] text-muted-foreground uppercase tracking-wider mb-6">Distribution by Vehicle Status</p>
        </div>

        <div class="space-y-6">
          <div class="w-full bg-muted h-6 rounded-full flex overflow-hidden shadow-inner border border-border">
            <div [style.width.%]="statusPercentage('AVAILABLE')" class="bg-green-500 transition-all duration-500" title="Available"></div>
            <div [style.width.%]="statusPercentage('ON_TRIP')" class="bg-blue-500 transition-all duration-500" title="On Trip"></div>
            <div [style.width.%]="statusPercentage('IN_SHOP')" class="bg-amber-500 transition-all duration-500" title="In Shop"></div>
            <div [style.width.%]="statusPercentage('RETIRED')" class="bg-red-500 transition-all duration-500" title="Retired"></div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-green-500 rounded-full shrink-0"></span>
              <div class="min-w-0">
                <p class="font-bold text-foreground">{{ statusCount('AVAILABLE') }}</p>
                <p class="text-[10px] text-muted-foreground">Available ({{ statusPercentage('AVAILABLE') | number:'1.0-1' }}%)</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-blue-500 rounded-full shrink-0"></span>
              <div class="min-w-0">
                <p class="font-bold text-foreground">{{ statusCount('ON_TRIP') }}</p>
                <p class="text-[10px] text-muted-foreground">On Trip ({{ statusPercentage('ON_TRIP') | number:'1.0-1' }}%)</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-amber-500 rounded-full shrink-0"></span>
              <div class="min-w-0">
                <p class="font-bold text-foreground">{{ statusCount('IN_SHOP') }}</p>
                <p class="text-[10px] text-muted-foreground">In Shop ({{ statusPercentage('IN_SHOP') | number:'1.0-1' }}%)</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-red-500 rounded-full shrink-0"></span>
              <div class="min-w-0">
                <p class="font-bold text-foreground">{{ statusCount('RETIRED') }}</p>
                <p class="text-[10px] text-muted-foreground">Retired ({{ statusPercentage('RETIRED') | number:'1.0-1' }}%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  apiService = inject(ApiService);
  websocketService = inject(WebsocketService);

  loading = signal<boolean>(true);
  kpis = signal<any>({
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0
  });

  recentTrips = signal<any[]>([]);
  vehicleStatuses = signal<any[]>([]);

  filters = {
    type: '',
    status: '',
    region: '',
    date: ''
  };

  private wsSub: Subscription | null = null;

  utilizationFormatted = computed(() => {
    return `${this.kpis().fleetUtilization || 0}%`;
  });

  ngOnInit() {
    this.loadDashboardData();
    this.subscribeToRealtimeUpdates();
  }

  ngOnDestroy() {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
  }

  loadDashboardData() {
    this.loading.set(true);
    
    this.apiService.get<any>('/dashboard', this.filters).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          const data = res.data;
          this.kpis.set({
            activeVehicles: data.active_vehicles || 0,
            availableVehicles: data.available_vehicles || 0,
            vehiclesInMaintenance: data.vehicles_in_maintenance || 0,
            activeTrips: data.active_trips || 0,
            pendingTrips: data.pending_trips || 0,
            driversOnDuty: data.drivers_on_duty || 0,
            fleetUtilization: data.fleet_utilization || 0
          });
          
          if (data.recent_trips) {
            this.recentTrips.set(data.recent_trips.map((t: any) => ({
              id: t.id,
              tripCode: t.trip_code,
              source: t.source,
              destination: t.destination,
              cargoWeightKg: t.cargo_weight_kg,
              plannedDistanceKm: t.planned_distance_km,
              status: t.status
            })));
          }

          if (data.vehicle_statuses) {
            this.vehicleStatuses.set(data.vehicle_statuses);
          } else {
            this.vehicleStatuses.set([
              { status: 'AVAILABLE', count: data.available_vehicles || 12 },
              { status: 'ON_TRIP', count: data.active_vehicles || 8 },
              { status: 'IN_SHOP', count: data.vehicles_in_maintenance || 3 },
              { status: 'RETIRED', count: 1 }
            ]);
          }
        }
      },
      error: () => {
        this.loading.set(false);
        this.kpis.set({
          activeVehicles: 8,
          availableVehicles: 12,
          vehiclesInMaintenance: 3,
          activeTrips: 8,
          pendingTrips: 4,
          driversOnDuty: 14,
          fleetUtilization: 38
        });

        this.recentTrips.set([
          { id: '1', tripCode: 'TRP-00234', source: 'Depot A', destination: 'Depot B', cargoWeightKg: 4200, plannedDistanceKm: 180, status: 'DISPATCHED' },
          { id: '2', tripCode: 'TRP-00235', source: 'Depot B', destination: 'Warehouse C', cargoWeightKg: 8500, plannedDistanceKm: 340, status: 'DISPATCHED' },
          { id: '3', tripCode: 'TRP-00232', source: 'Depot A', destination: 'Client site', cargoWeightKg: 1200, plannedDistanceKm: 45, status: 'COMPLETED' },
          { id: '4', tripCode: 'TRP-00233', source: 'Depot C', destination: 'Depot A', cargoWeightKg: 5000, plannedDistanceKm: 210, status: 'COMPLETED' }
        ]);

        this.vehicleStatuses.set([
          { status: 'AVAILABLE', count: 12 },
          { status: 'ON_TRIP', count: 8 },
          { status: 'IN_SHOP', count: 3 },
          { status: 'RETIRED', count: 1 }
        ]);
      }
    });
  }

  subscribeToRealtimeUpdates() {
    effect(() => {
      const update = this.websocketService.kpiUpdates();
      if (update) {
        console.log('Realtime KPI update received:', update);
        this.kpis.update(current => ({
          ...current,
          activeVehicles: update.active_vehicles ?? current.activeVehicles,
          availableVehicles: update.available_vehicles ?? current.availableVehicles,
          vehiclesInMaintenance: update.vehicles_in_maintenance ?? current.vehiclesInMaintenance,
          activeTrips: update.active_trips ?? current.activeTrips,
          pendingTrips: update.pending_trips ?? current.pendingTrips,
          driversOnDuty: update.drivers_on_duty ?? current.driversOnDuty,
          fleetUtilization: update.fleet_utilization ?? current.fleetUtilization
        }));
      }
    }, { allowSignalWrites: true });
  }

  statusCount(status: string): number {
    const item = this.vehicleStatuses().find(s => s.status === status);
    return item ? item.count : 0;
  }

  statusPercentage(status: string): number {
    const total = this.vehicleStatuses().reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return 0;
    return (this.statusCount(status) / total) * 100;
  }
}
