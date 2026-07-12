import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { Trip } from '../../../models/trip.model';
import { TripMapper } from '../../../mappers/trip.mapper';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TripCompleteModalComponent } from '../trip-complete-modal/trip-complete-modal.component';

@Component({
  selector: 'app-trip-live-board',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, PageHeaderComponent, TripCompleteModalComponent],
  template: `
    <app-page-header title="Trip Live Board" description="Real-time trip dispatch tracking and execution management."></app-page-header>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-foreground">
      <div class="bg-card/50 border border-border p-4 rounded-xl flex flex-col gap-4 min-h-[500px]">
        <div class="flex items-center justify-between border-b border-border pb-2 bg-muted/10 px-2 rounded">
          <span class="font-bold uppercase tracking-wider text-muted-foreground">Drafts</span>
          <span class="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-600 font-bold">{{ drafts().length }}</span>
        </div>
        <div class="flex-1 flex flex-col gap-3 overflow-y-auto">
          @for (t of drafts(); track t.id) {
            <div class="bg-card border border-border p-4 rounded-lg shadow-sm flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-primary">{{ t.tripCode }}</span>
                <span class="text-muted-foreground">{{ t.plannedDistanceKm }} km</span>
              </div>
              <p class="font-medium text-foreground">{{ t.source }} &rarr; {{ t.destination }}</p>
              <p class="text-[10px] text-muted-foreground">Cargo: {{ t.cargoWeightKg | number }} kg</p>
            </div>
          } @empty {
            <p class="text-center text-muted-foreground py-12">No drafts</p>
          }
        </div>
      </div>

      <div class="bg-card/50 border border-border p-4 rounded-xl flex flex-col gap-4 min-h-[500px]">
        <div class="flex items-center justify-between border-b border-border pb-2 bg-blue-500/5 px-2 rounded">
          <span class="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Transit</span>
          <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-bold">{{ dispatched().length }}</span>
        </div>
        <div class="flex-1 flex flex-col gap-3 overflow-y-auto">
          @for (t of dispatched(); track t.id) {
            <div class="bg-card border border-border p-4 rounded-lg shadow-sm flex flex-col gap-3">
              <div>
                <div class="flex items-center justify-between">
                  <span class="font-bold text-primary">{{ t.tripCode }}</span>
                  <span class="text-muted-foreground">{{ t.plannedDistanceKm }} km</span>
                </div>
                <p class="font-medium text-foreground mt-1">{{ t.source }} &rarr; {{ t.destination }}</p>
                <p class="text-[10px] text-muted-foreground mt-0.5">Cargo: {{ t.cargoWeightKg | number }} kg</p>
              </div>
              
              <div class="flex items-center gap-1.5 border-t border-border pt-3">
                <button (click)="openCompleteModal(t.id)" class="flex-1 py-1.5 bg-primary text-primary-foreground font-semibold rounded text-[10px] hover:bg-primary/90 transition-colors">Complete</button>
                <button (click)="cancelTrip(t.id)" class="py-1.5 px-2 border border-border text-destructive font-semibold rounded text-[10px] hover:bg-destructive/5 transition-colors">Cancel</button>
              </div>
            </div>
          } @empty {
            <p class="text-center text-muted-foreground py-12">No active transits</p>
          }
        </div>
      </div>

      <div class="bg-card/50 border border-border p-4 rounded-xl flex flex-col gap-4 min-h-[500px]">
        <div class="flex items-center justify-between border-b border-border pb-2 bg-green-500/5 px-2 rounded">
          <span class="font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Completed</span>
          <span class="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-bold">{{ completed().length }}</span>
        </div>
        <div class="flex-1 flex flex-col gap-3 overflow-y-auto">
          @for (t of completed(); track t.id) {
            <div class="bg-card border border-border p-4 rounded-lg shadow-sm flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-primary">{{ t.tripCode }}</span>
                <span class="text-muted-foreground">{{ t.plannedDistanceKm }} km</span>
              </div>
              <p class="font-medium text-foreground">{{ t.source }} &rarr; {{ t.destination }}</p>
              <div class="text-[10px] text-muted-foreground space-y-0.5 border-t border-border pt-2 mt-1">
                <p>Odometer: {{ t.finalOdometer | number }} km</p>
                <p>Revenue: {{ t.revenue | currency:'INR' }}</p>
              </div>
            </div>
          } @empty {
            <p class="text-center text-muted-foreground py-12">No completed trips</p>
          }
        </div>
      </div>

      <div class="bg-card/50 border border-border p-4 rounded-xl flex flex-col gap-4 min-h-[500px]">
        <div class="flex items-center justify-between border-b border-border pb-2 bg-red-500/5 px-2 rounded">
          <span class="font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Cancelled</span>
          <span class="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-bold">{{ cancelled().length }}</span>
        </div>
        <div class="flex-1 flex flex-col gap-3 overflow-y-auto">
          @for (t of cancelled(); track t.id) {
            <div class="bg-card border border-border p-4 rounded-lg shadow-sm flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-primary">{{ t.tripCode }}</span>
                <span class="text-muted-foreground">{{ t.plannedDistanceKm }} km</span>
              </div>
              <p class="font-medium text-foreground">{{ t.source }} &rarr; {{ t.destination }}</p>
            </div>
          } @empty {
            <p class="text-center text-muted-foreground py-12">No cancelled trips</p>
          }
        </div>
      </div>
    </div>

    <app-trip-complete-modal
      [isOpen]="completeModalOpen()"
      [tripId]="selectedTripId()"
      (close)="closeCompleteModal()"
      (save)="onTripCompleted()"
    ></app-trip-complete-modal>
  `
})
export class TripLiveBoardComponent implements OnInit {
  apiService = inject(ApiService);
  notifService = inject(NotificationService);
  websocketService = inject(WebsocketService);

  trips = signal<Trip[]>([]);

  completeModalOpen = signal<boolean>(false);
  selectedTripId = signal<string>('');

  drafts = computed(() => this.trips().filter(t => t.status === 'DRAFT'));
  dispatched = computed(() => this.trips().filter(t => t.status === 'DISPATCHED'));
  completed = computed(() => this.trips().filter(t => t.status === 'COMPLETED'));
  cancelled = computed(() => this.trips().filter(t => t.status === 'CANCELLED'));

  ngOnInit() {
    this.fetchTrips();
    this.websocketService.connect();
    this.subscribeToRealtimeUpdates();
  }

  fetchTrips() {
    this.apiService.get<any[]>('/trips').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.trips.set(res.data.map(t => TripMapper.fromJson(t)));
        }
      },
      error: () => {
        this.trips.set([
          { id: 't1', tripCode: 'TRP-00234', source: 'Depot A', destination: 'Depot B', cargoWeightKg: 4200, plannedDistanceKm: 180, status: 'DISPATCHED' },
          { id: 't2', tripCode: 'TRP-00235', source: 'Depot B', destination: 'Warehouse C', cargoWeightKg: 8500, plannedDistanceKm: 340, status: 'DISPATCHED' },
          { id: 't3', tripCode: 'TRP-00232', source: 'Depot A', destination: 'Client site', cargoWeightKg: 1200, plannedDistanceKm: 45, finalOdometer: 42145, revenue: 15000, status: 'COMPLETED' },
          { id: 't4', tripCode: 'TRP-00233', source: 'Depot C', destination: 'Depot A', cargoWeightKg: 5000, plannedDistanceKm: 210, status: 'DRAFT' }
        ] as Trip[]);
      }
    });
  }

  subscribeToRealtimeUpdates() {
    effect(() => {
      const update = this.websocketService.tripUpdates();
      if (update) {
        console.log('Realtime Trip status change received:', update);
        this.fetchTrips();
      }
    }, { allowSignalWrites: true });
  }

  openCompleteModal(id: string) {
    this.selectedTripId.set(id);
    this.completeModalOpen.set(true);
  }

  closeCompleteModal() {
    this.completeModalOpen.set(false);
  }

  onTripCompleted() {
    this.completeModalOpen.set(false);
    this.fetchTrips();
  }

  cancelTrip(id: string) {
    if (confirm('Are you sure you want to cancel this dispatched trip? Vehicle and driver will be restored to available.')) {
      this.apiService.post(`/trips/${id}/cancel`, {}).subscribe({
        next: (res) => {
          if (res.success) {
            this.notifService.success('Trip cancelled successfully');
            this.fetchTrips();
          }
        },
        error: (err) => {
          this.notifService.error(err.message || 'Failed to cancel trip');
        }
      });
    }
  }
}
