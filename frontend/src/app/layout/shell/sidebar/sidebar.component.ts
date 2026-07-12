import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-card border-r border-border h-full flex flex-col justify-between">
      <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div class="flex items-center px-6 gap-3 mb-8">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            T
          </div>
          <span class="text-lg font-bold tracking-tight text-foreground">TransitOps</span>
        </div>

        <nav class="flex-1 px-4 space-y-1">
          @for (item of navItems; track item.path) {
            @if (canAccess(item.roles)) {
              <a 
                [routerLink]="item.path"
                routerLinkActive="bg-primary/10 text-primary font-semibold"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="flex items-center px-4 py-2.5 text-xs font-medium rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 group"
              >
                <span class="mr-3" [innerHTML]="item.icon"></span>
                {{ item.label }}
              </a>
            }
          }
        </nav>
      </div>

      <div class="p-4 border-t border-border bg-muted/10">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
            {{ userInitials() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-foreground truncate">{{ currentUser()?.fullName }}</p>
            <p class="text-[10px] text-muted-foreground truncate uppercase font-medium">{{ currentUser()?.role }}</p>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  sanitizer = inject(DomSanitizer);

  navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      exact: true,
      roles: ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>`)
    },
    {
      label: 'Vehicles',
      path: '/vehicles',
      exact: false,
      roles: ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'FINANCIAL_ANALYST'],
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>`)
    },
    {
      label: 'Drivers',
      path: '/drivers',
      exact: false,
      roles: ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'],
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`)
    },
    {
      label: 'Trips',
      path: '/trips',
      exact: false,
      roles: ['ADMIN', 'DRIVER', 'SAFETY_OFFICER'],
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>`)
    },
    {
      label: 'Maintenance',
      path: '/maintenance',
      exact: false,
      roles: ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'],
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`)
    },
    {
      label: 'Fuel & Expenses',
      path: '/fuel-expenses',
      exact: false,
      roles: ['ADMIN', 'FINANCIAL_ANALYST'],
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`)
    },
    {
      label: 'Analytics',
      path: '/analytics',
      exact: false,
      roles: ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'],
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2" /></svg>`)
    },
    {
      label: 'Settings',
      path: '/settings',
      exact: false,
      roles: ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'],
      icon: this.sanitizer.bypassSecurityTrustHtml(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>`)
    }
  ];

  canAccess(allowedRoles: string[]): boolean {
    return this.authService.hasRole(allowedRoles);
  }

  userInitials(): string {
    const name = this.currentUser()?.fullName || 'User';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
