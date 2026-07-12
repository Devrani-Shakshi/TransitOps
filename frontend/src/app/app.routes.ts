import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'user-management',
        canActivate: [roleGuard(['ADMIN'])],
        loadChildren: () => import('./features/user-management/user-management.routes').then(m => m.USER_MANAGEMENT_ROUTES)
      },
      {
        path: 'vehicles',
        canActivate: [roleGuard(['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'])],
        loadChildren: () => import('./features/vehicles/vehicles.routes').then(m => m.VEHICLES_ROUTES)
      },
      {
        path: 'drivers',
        canActivate: [roleGuard(['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'])],
        loadChildren: () => import('./features/drivers/drivers.routes').then(m => m.DRIVERS_ROUTES)
      },
      {
        path: 'trips',
        canActivate: [roleGuard(['ADMIN', 'DISPATCHER', 'SAFETY_OFFICER'])],
        loadChildren: () => import('./features/trips/trips.routes').then(m => m.TRIPS_ROUTES)
      },
      {
        path: 'maintenance',
        canActivate: [roleGuard(['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'])],
        loadChildren: () => import('./features/maintenance/maintenance.routes').then(m => m.MAINTENANCE_ROUTES)
      },
      {
        path: 'fuel-expenses',
        canActivate: [roleGuard(['ADMIN', 'FINANCIAL_ANALYST'])],
        loadChildren: () => import('./features/fuel-expenses/fuel-expenses.routes').then(m => m.FUEL_EXPENSES_ROUTES)
      },
      {
        path: 'analytics',
        canActivate: [roleGuard(['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'])],
        loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
      },
      {
        path: 'settings',
        canActivate: [roleGuard(['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'])],
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
      },
      {
        path: 'copilot',
        loadChildren: () => import('./features/copilot/copilot.routes').then(m => m.COPILOT_ROUTES)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
