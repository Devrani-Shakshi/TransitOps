import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="System Configuration & Access Policies" description="Configure global depot variables and review active role restrictions."></app-page-header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-foreground">
      <div class="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
        <div>
          <h3 class="text-sm font-bold text-foreground mb-1">Global Variables</h3>
          <p class="text-[10px] text-muted-foreground uppercase tracking-wider">Define operational depot configurations</p>
        </div>

        <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="space-y-4">
          <div class="space-y-1">
            <label class="font-semibold text-foreground">Depot Name *</label>
            <input type="text" formControlName="depotName" placeholder="North Central Depot" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="font-semibold text-foreground">Currency *</label>
              <select formControlName="currency" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            
            <div class="space-y-1">
              <label class="font-semibold text-foreground">Distance Unit *</label>
              <select formControlName="distanceUnit" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs">
                <option value="KM">Kilometers (km)</option>
                <option value="MILES">Miles (mi)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="saving()"
            class="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-colors disabled:opacity-50"
          >
            Save Configuration
          </button>
        </form>
      </div>

      <div class="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div class="px-6 py-4 border-b border-border bg-muted/10 flex items-center justify-between">
          <h3 class="text-sm font-bold text-foreground">Active Role Access Control Matrix (RBAC)</h3>
          <span class="text-xs text-muted-foreground">Dynamic access levels returned by the server</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border bg-muted/20 text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                <th class="px-6 py-3">Module Feature</th>
                <th class="px-4 py-3">Fleet Manager</th>
                <th class="px-4 py-3">Dispatcher / Driver</th>
                <th class="px-4 py-3">Safety Officer</th>
                <th class="px-4 py-3">Financial Analyst</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border font-medium">
              @for (row of rbacMatrix(); track row.module) {
                <tr class="hover:bg-muted/5 transition-colors">
                  <td class="px-6 py-3.5 font-bold text-foreground uppercase tracking-wider text-[10px]">{{ row.module }}</td>
                  <td class="px-4 py-3.5">
                    <span [ngClass]="row.fleetManager === 'full' ? 'text-green-600 font-extrabold' : row.fleetManager === 'view' ? 'text-blue-600' : 'text-zinc-400 font-light'">
                      {{ row.fleetManager }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span [ngClass]="row.driver === 'full' ? 'text-green-600 font-extrabold' : row.driver === 'view' ? 'text-blue-600' : 'text-zinc-400' ">
                      {{ row.driver }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span [ngClass]="row.safety === 'full' ? 'text-green-600 font-extrabold' : row.safety === 'view' ? 'text-blue-600' : 'text-zinc-400' ">
                      {{ row.safety }}
                    </span>
                  </td>
                  <td class="px-4 py-3.5">
                    <span [ngClass]="row.finance === 'full' ? 'text-green-600 font-extrabold' : row.finance === 'view' ? 'text-blue-600' : 'text-zinc-400' ">
                      {{ row.finance }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  saving = signal<boolean>(false);
  rbacMatrix = signal<any[]>([]);

  settingsForm: FormGroup = this.fb.group({
    depotName: ['North Central Depot', [Validators.required]],
    currency: ['INR', [Validators.required]],
    distanceUnit: ['KM', [Validators.required]]
  });

  ngOnInit() {
    this.fetchSettings();
    this.fetchRbacMatrix();
  }

  fetchSettings() {
    this.apiService.get<any>('/settings').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.settingsForm.patchValue({
            depotName: res.data.depot_name,
            currency: res.data.currency,
            distanceUnit: res.data.distance_unit
          });
        }
      }
    });
  }

  fetchRbacMatrix() {
    this.apiService.get<any[]>('/settings/rbac-matrix').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rbacMatrix.set(res.data);
        }
      },
      error: () => {
        this.rbacMatrix.set([
          { module: 'Fleet (Vehicles)', fleetManager: 'full', driver: 'view', safety: '—', finance: 'view' },
          { module: 'Drivers', fleetManager: 'full', driver: '—', safety: 'full', finance: '—' },
          { module: 'Trips', fleetManager: '—', driver: 'full', safety: 'view', finance: '—' },
          { module: 'Fuel & Expenses', fleetManager: '—', driver: '—', safety: '—', finance: 'full' },
          { module: 'Analytics', fleetManager: 'full', driver: '—', safety: '—', finance: 'full' }
        ]);
      }
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;

    this.saving.set(true);
    const data = {
      depot_name: this.settingsForm.value.depotName,
      currency: this.settingsForm.value.currency,
      distance_unit: this.settingsForm.value.distanceUnit
    };

    this.apiService.patch('/settings', data).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          this.notifService.success('System settings saved successfully');
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.notifService.error(err.message || 'Error updating settings');
      }
    });
  }
}
