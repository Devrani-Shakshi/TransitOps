import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Notification } from '../../../models/notification.model';
import { WebsocketService } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-card border-b border-border h-16 px-6 flex items-center justify-between">
      <div>
        <h2 class="text-sm font-semibold text-foreground tracking-tight uppercase">TransitOps Dashboard</h2>
      </div>

      <div class="flex items-center gap-4">
        <button 
          (click)="toggleTheme()" 
          class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Toggle Theme"
        >
          @if (isDark()) {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
          } @else {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          }
        </button>

        <div class="relative">
          <button 
            (click)="toggleNotifications()"
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            @if (unreadCount() > 0) {
              <span class="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center rounded-full animate-pulse">
                {{ unreadCount() }}
              </span>
            }
          </button>
          
          @if (showNotifDropdown()) {
            <div class="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <div class="px-4 py-2 border-b border-border flex items-center justify-between bg-muted/20">
                <span class="text-xs font-bold text-foreground">Notifications</span>
                @if (unreadCount() > 0) {
                  <button (click)="markAllAsRead()" class="text-[10px] text-primary hover:underline font-semibold">Mark all read</button>
                }
              </div>
              <div class="max-h-64 overflow-y-auto">
                @if (notifications().length === 0) {
                  <div class="px-4 py-6 text-center text-xs text-muted-foreground">No notifications</div>
                } @else {
                  @for (n of notifications(); track n.id) {
                    <div 
                      [ngClass]="{'bg-primary/5': !n.isRead}"
                      class="px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/10 transition-colors flex flex-col gap-1 text-xs"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <span class="font-medium text-foreground">{{ n.message }}</span>
                        @if (!n.isRead) {
                          <button (click)="markAsRead(n.id)" class="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1" title="Mark as read"></button>
                        }
                      </div>
                      <span class="text-[10px] text-muted-foreground">{{ n.createdAt | date:'shortTime' }}</span>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <div class="relative">
          <button 
            (click)="toggleProfile()"
            class="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-lg transition-colors"
          >
            <div class="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
              {{ initials() }}
            </div>
            <span class="text-xs font-semibold text-foreground hidden md:inline">{{ currentUser()?.fullName }}</span>
          </button>
          
          @if (showProfileDropdown()) {
            <div class="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <div class="px-4 py-2 border-b border-border">
                <p class="text-xs font-bold text-foreground truncate">{{ currentUser()?.fullName }}</p>
                <p class="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold">{{ currentUser()?.role }}</p>
              </div>
              <button 
                (click)="logout()"
                class="w-full text-left px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Log Out
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  websocketService = inject(WebsocketService);
  router = inject(Router);

  currentUser = this.authService.currentUser;
  isDark = signal<boolean>(document.documentElement.classList.contains('dark'));
  
  showNotifDropdown = signal<boolean>(false);
  showProfileDropdown = signal<boolean>(false);
  
  notifications = signal<Notification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  private kpiSub: Subscription | null = null;

  ngOnInit() {
    this.fetchNotifications();
    this.websocketService.connect();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      this.isDark.set(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.isDark.set(false);
    }
  }

  ngOnDestroy() {
    if (this.kpiSub) {
      this.kpiSub.unsubscribe();
    }
  }

  fetchNotifications() {
    this.apiService.get<any[]>('/notifications').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const list = res.data.map(item => ({
            id: item.id,
            type: item.type,
            message: item.message,
            isRead: item.is_read || item.isRead,
            createdAt: item.created_at || item.createdAt
          }));
          this.notifications.set(list);
        }
      },
      error: () => {
        this.notifications.set([
          { id: '1', type: 'MAINTENANCE_DUE', message: 'Vehicle MH-12-QW-4567 due for service in 120km', isRead: false, createdAt: new Date().toISOString() },
          { id: '2', type: 'LICENSE_EXPIRY', message: 'Driver Shakshi Devrani license expires in 5 days', isRead: false, createdAt: new Date().toISOString() },
          { id: '3', type: 'OVERLOAD_ATTEMPT', message: 'Overloading attempt blocked for trip TRP-00234', isRead: true, createdAt: new Date().toISOString() }
        ]);
      }
    });
  }

  toggleTheme() {
    if (this.isDark()) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      this.isDark.set(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      this.isDark.set(true);
    }
  }

  toggleNotifications() {
    this.showNotifDropdown.update(v => !v);
    this.showProfileDropdown.set(false);
  }

  toggleProfile() {
    this.showProfileDropdown.update(v => !v);
    this.showNotifDropdown.set(false);
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

  logout() {
    this.authService.logout().subscribe(() => {
      this.websocketService.disconnect();
      this.router.navigate(['/login']);
    });
  }

  initials(): string {
    const name = this.currentUser()?.fullName || 'User';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
