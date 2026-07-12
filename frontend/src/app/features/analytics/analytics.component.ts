import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <app-page-header title="Fleet Analytics & Reports" description="Review financial summaries, vehicle ROI, efficiency metrics, and download audit sheets.">
      <div actions class="flex flex-wrap gap-2 text-xs font-semibold">
        <button (click)="exportCSV()" class="px-3 py-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg shadow-sm flex items-center gap-1.5 transition-colors">
          📊 Export Trips CSV
        </button>
        <button (click)="exportExcel()" class="px-3 py-1.5 border border-border bg-card hover:bg-muted text-foreground rounded-lg shadow-sm flex items-center gap-1.5 transition-colors">
          📈 Export Vehicles XLSX
        </button>
        <button (click)="exportPDF()" class="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors">
          📄 Executive Summary PDF
        </button>
      </div>
    </app-page-header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs text-foreground">
      <div class="bg-card border border-border p-5 rounded-xl shadow-sm">
        <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg Fuel Efficiency</p>
        <h3 class="text-2xl font-bold text-foreground mt-2">5.4 km/L</h3>
        <p class="text-[10px] text-green-600 font-semibold mt-1">↑ 4.2% vs last month</p>
      </div>
      <div class="bg-card border border-border p-5 rounded-xl shadow-sm">
        <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fleet Utilization</p>
        <h3 class="text-2xl font-bold text-foreground mt-2">78%</h3>
        <p class="text-[10px] text-green-600 font-semibold mt-1">↑ 2.4% vs last month</p>
      </div>
      <div class="bg-card border border-border p-5 rounded-xl shadow-sm">
        <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Operations Cost</p>
        <h3 class="text-2xl font-bold text-foreground mt-2">₹1,45,200</h3>
        <p class="text-[10px] text-red-600 font-semibold mt-1">↑ 8.6% cost growth</p>
      </div>
      <div class="bg-card border border-border p-5 rounded-xl shadow-sm">
        <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Vehicle ROI</p>
        <h3 class="text-2xl font-bold text-foreground mt-2">12.4%</h3>
        <p class="text-[10px] text-green-600 font-semibold mt-1">↑ 1.1% efficiency gains</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 text-xs text-foreground">
      <div class="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between min-h-[300px]">
        <div>
          <h4 class="text-sm font-bold text-foreground">Monthly Fleet Revenue</h4>
          <p class="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Revenue trends for the past 6 months</p>
        </div>
        
        <div class="relative w-full h-44 mt-6">
          <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
            <line x1="40" y1="20" x2="480" y2="20" stroke="hsl(var(--border))" stroke-dasharray="4" stroke-width="1"></line>
            <line x1="40" y1="70" x2="480" y2="70" stroke="hsl(var(--border))" stroke-dasharray="4" stroke-width="1"></line>
            <line x1="40" y1="120" x2="480" y2="120" stroke="hsl(var(--border))" stroke-dasharray="4" stroke-width="1"></line>
            <line x1="40" y1="170" x2="480" y2="170" stroke="hsl(var(--border))" stroke-width="1"></line>
            
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="hsl(var(--primary))"></stop>
                <stop offset="100%" stop-color="hsl(var(--primary)/30%)"></stop>
              </linearGradient>
            </defs>
            <rect x="70" y="80" width="30" height="90" fill="url(#barGrad)" rx="4"></rect>
            <rect x="140" y="60" width="30" height="110" fill="url(#barGrad)" rx="4"></rect>
            <rect x="210" y="50" width="30" height="120" fill="url(#barGrad)" rx="4"></rect>
            <rect x="280" y="75" width="30" height="95" fill="url(#barGrad)" rx="4"></rect>
            <rect x="350" y="40" width="30" height="130" fill="url(#barGrad)" rx="4"></rect>
            <rect x="420" y="30" width="30" height="140" fill="url(#barGrad)" rx="4"></rect>
            
            <text x="85" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Feb</text>
            <text x="155" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Mar</text>
            <text x="225" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Apr</text>
            <text x="295" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">May</text>
            <text x="365" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Jun</text>
            <text x="435" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Jul</text>
          </svg>
        </div>
      </div>

      <div class="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between min-h-[300px]">
        <div>
          <h4 class="text-sm font-bold text-foreground">Top Costliest Vehicles</h4>
          <p class="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Aggregated fuel + maintenance costs</p>
        </div>

        <div class="space-y-4 mt-6 flex-1 flex flex-col justify-center">
          @for (v of costliestVehicles; track v.reg) {
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-foreground">{{ v.reg }}</span>
                <span class="text-muted-foreground">{{ v.cost | currency:'INR':'symbol-narrow':'1.0' }}</span>
              </div>
              <div class="w-full bg-muted h-3 rounded-full overflow-hidden border border-border shadow-inner">
                <div [style.width.%]="v.percent" class="bg-primary h-full rounded-full transition-all duration-500"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between min-h-[300px]">
        <div>
          <h4 class="text-sm font-bold text-foreground">Expenses breakdown</h4>
          <p class="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Breakdown of operational spendings by category</p>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-around gap-6 mt-6">
          <div class="relative w-36 h-36">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path class="text-muted/15" stroke="currentColor" stroke-width="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
              <path class="text-primary" stroke="currentColor" stroke-width="3.5" stroke-dasharray="55 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
              <path class="text-amber-500" stroke="currentColor" stroke-width="3.5" stroke-dasharray="25 100" stroke-dashoffset="-55" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
              <path class="text-green-500" stroke="currentColor" stroke-width="3.5" stroke-dasharray="20 100" stroke-dashoffset="-80" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-xs font-bold text-foreground">100%</span>
              <span class="text-[9px] text-muted-foreground uppercase font-semibold">Spendings</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 bg-primary rounded-full shrink-0"></span>
              <span>Fuel (55%)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0"></span>
              <span>Maintenance (25%)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0"></span>
              <span>Tolls & Others (20%)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between min-h-[300px]">
        <div>
          <h4 class="text-sm font-bold text-foreground">Maintenance Cost Trend</h4>
          <p class="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Historical maintenance expenses by month</p>
        </div>

        <div class="relative w-full h-44 mt-6">
          <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
            <line x1="40" y1="20" x2="480" y2="20" stroke="hsl(var(--border))" stroke-dasharray="4" stroke-width="1"></line>
            <line x1="40" y1="70" x2="480" y2="70" stroke="hsl(var(--border))" stroke-dasharray="4" stroke-width="1"></line>
            <line x1="40" y1="120" x2="480" y2="120" stroke="hsl(var(--border))" stroke-dasharray="4" stroke-width="1"></line>
            <line x1="40" y1="170" x2="480" y2="170" stroke="hsl(var(--border))" stroke-width="1"></line>

            <path d="M70,140 Q140,110 210,80 T350,110 T420,50" fill="none" stroke="hsl(var(--primary))" stroke-width="3" stroke-linecap="round"></path>
            
            <circle cx="70" cy="140" r="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="2.5"></circle>
            <circle cx="140" cy="110" r="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="2.5"></circle>
            <circle cx="210" cy="80" r="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="2.5"></circle>
            <circle cx="280" cy="95" r="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="2.5"></circle>
            <circle cx="350" cy="110" r="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="2.5"></circle>
            <circle cx="420" cy="50" r="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="2.5"></circle>

            <text x="70" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Feb</text>
            <text x="140" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Mar</text>
            <text x="210" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Apr</text>
            <text x="280" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">May</text>
            <text x="350" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Jun</text>
            <text x="420" y="190" text-anchor="middle" fill="hsl(var(--muted-foreground))" class="text-[9px]">Jul</text>
          </svg>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  apiService = inject(ApiService);
  notifService = inject(NotificationService);

  costliestVehicles = [
    { reg: 'MH-12-QW-4567', cost: 45000, percent: 90 },
    { reg: 'DL-01-XX-9999', cost: 38400, percent: 76 },
    { reg: 'KA-51-MM-8901', cost: 24500, percent: 48 }
  ];

  ngOnInit() {
    this.fetchAnalyticsDetails();
  }

  fetchAnalyticsDetails() {
    this.apiService.get<any>('/analytics/fleet-health').subscribe({
      next: (res) => {}
    });
  }

  exportCSV() {
    this.notifService.info('Exporting Trips CSV...');
    const trips = [
      { trip_code: 'TRP-00234', source: 'Depot A', destination: 'Depot B', vehicle: 'TSLA-0441', driver: 'Elena Rostova', cargo_weight_kg: 4200, distance_km: 180, status: 'DISPATCHED' },
      { trip_code: 'TRP-00235', source: 'Depot B', destination: 'Warehouse C', vehicle: 'VLV-1832', driver: 'Marcus Vance', cargo_weight_kg: 8500, distance_km: 340, status: 'DISPATCHED' },
      { trip_code: 'TRP-00232', source: 'Depot A', destination: 'Client Site', vehicle: 'TSLA-0982', driver: 'Devang Panchal', cargo_weight_kg: 1200, distance_km: 45, status: 'COMPLETED' },
      { trip_code: 'TRP-00233', source: 'Depot C', destination: 'Depot A', vehicle: 'FRT-4491', driver: 'None', cargo_weight_kg: 5000, distance_km: 210, status: 'COMPLETED' }
    ];
    
    let csvContent = 'Trip Code,Source,Destination,Vehicle,Driver,Cargo Weight (kg),Distance (km),Status\n';
    trips.forEach(t => {
      csvContent += `${t.trip_code},${t.source},${t.destination},${t.vehicle},${t.driver},${t.cargo_weight_kg},${t.distance_km},${t.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transitops_trips_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notifService.success('Trips CSV exported successfully!');
  }

  exportExcel() {
    this.notifService.info('Exporting Vehicles XLSX...');
    const vehicles = [
      { name: 'Tesla Semi Electric #04', reg: 'TSLA-0441', efficiency: '1.25 kWh/mi', health: '98%', status: 'AVAILABLE', driver: 'Elena Rostova' },
      { name: 'Volvo VNL 860 #18', reg: 'VLV-1832', efficiency: '7.8 mpg', health: '92%', status: 'ON_TRIP', driver: 'Marcus Vance' },
      { name: 'Freightliner Cascadia #44', reg: 'FRT-4491', efficiency: '7.2 mpg', health: '74%', status: 'IN_SHOP', driver: 'None' },
      { name: 'Tesla Semi Electric #09', reg: 'TSLA-0982', efficiency: '1.21 kWh/mi', health: '97%', status: 'AVAILABLE', driver: 'Devang Panchal' }
    ];
    
    let csvContent = 'Vehicle Name,Registration,Fuel Efficiency,Health,Status,Current Driver\n';
    vehicles.forEach(v => {
      csvContent += `"${v.name}",${v.reg},${v.efficiency},${v.health},${v.status},${v.driver}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transitops_vehicles_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notifService.success('Vehicles CSV exported successfully!');
  }

  exportPDF() {
    this.notifService.info('Opening Print Manager for Executive Summary PDF...');
    window.print();
  }
}
