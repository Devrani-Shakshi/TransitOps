import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../models/notification.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Notification Center" description="Fleet audit trail, safety warnings, alerts, and system notifications.">
      <button 
        *ngIf="unreadCount() > 0"
        (click)="markAllAsRead()" 
        actions 
        class="px-3 py-1.5 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-lg shadow-sm transition-colors"
      >
        Mark All Read
      </button>
    </app-page-header>

    <div class="bg-card border border-border rounded-xl shadow-sm p-6 text-xs text-foreground max-w-3xl mx-auto">
      <div class="flow-root">
        <ul role="list" class="-mb-8">
          @for (n of notifications(); track n.id; let last = $last) {
            <li>
              <div class="relative pb-8">
                @if (!last) {
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true"></span>
                }
                
                <div class="relative flex space-x-3 items-start">
                  <div>
                    <span 
                      [ngClass]="{
                        'bg-blue-500/10 text-blue-600': n.type === 'SYSTEM',
                        'bg-red-500/10 text-red-600': n.type === 'OVERLOAD_ATTEMPT' || n.type === 'ANOMALOUS_FUEL' || n.type === 'ANOMALOUS_EXPENSE',
                        'bg-amber-500/10 text-amber-600': n.type === 'LICENSE_EXPIRY' || n.type === 'INSURANCE_EXPIRY' || n.type === 'MAINTENANCE_DUE' || n.type === 'IDLE_VEHICLE'
                      }"
                      class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-card"
                    >
                      @if (n.type === 'SYSTEM') {
                        ⚙️
                      } @else if (n.type === 'OVERLOAD_ATTEMPT') {
                        ⚖️
                      } @else if (n.type === 'ANOMALOUS_FUEL' || n.type === 'ANOMALOUS_EXPENSE') {
                        🔥
                      } @else {
                        ⚠️
                      }
                    </span>
                  </div>
                  
                  <div class="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p class="font-medium" [ngClass]="n.isRead ? 'text-muted-foreground' : 'text-foreground font-bold'">
                        {{ n.message }}
                      </p>
                      <span class="inline-block mt-1 font-mono uppercase text-[9px] text-muted-foreground">Type: {{ n.type }}</span>
                    </div>
                    <div class="text-right text-[10px] whitespace-nowrap text-muted-foreground flex flex-col items-end gap-1.5">
                      <time [dateTime]="n.createdAt">{{ n.createdAt | date:'medium' }}</time>
                      @if (!n.isRead) {
                        <button (click)="markAsRead(n.id)" class="px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary text-[9px] rounded font-semibold transition-colors">Mark read</button>
                      } @else {
                        <span class="text-[9px] text-zinc-400">Read</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </li>
          } @empty {
            <p class="text-muted-foreground text-center py-12">No activity timeline items found</p>
          }
        </ul>
      </div>
    </div>
  `
})
export class NotificationCenterComponent implements OnInit {
  apiService = inject(ApiService);
  notifService = inject(NotificationService);

  notifications = signal<Notification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  ngOnInit() {
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.apiService.get<any[]>('/notifications').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.notifications.set(res.data.map(item => ({
            id: item.id,
            type: item.type,
            message: item.message,
            isRead: item.is_read || item.isRead,
            createdAt: item.created_at || item.createdAt
          })));
        }
      },
      error: () => {
        this.notifications.set([
          { id: '1', type: 'MAINTENANCE_DUE', message: 'Vehicle MH-12-QW-4567 due for service in 120km', isRead: false, createdAt: new Date().toISOString() },
          { id: '2', type: 'LICENSE_EXPIRY', message: 'Driver Shakshi Devrani license expires in 5 days', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', type: 'OVERLOAD_ATTEMPT', message: 'Overloading attempt blocked for trip TRP-00234', isRead: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
          { id: '4', type: 'SYSTEM', message: 'Depot daily check-in logs completed successfully', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]);
      }
    });
  }

  markAsRead(id: string) {
    this.apiService.post(`/notifications/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(current => current.map(n => n.id === id ? { ...n, isRead: true } : n));
      },
      error: () => {
        this.notifications.update(current => current.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    });
  }

  markAllAsRead() {
    this.notifications().forEach(n => {
      if (!n.isRead) this.markAsRead(n.id);
    });
  }
}
