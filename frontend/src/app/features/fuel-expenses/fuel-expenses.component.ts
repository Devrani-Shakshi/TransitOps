import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { FuelLog } from '../../models/fuel-log.model';
import { Expense, ExpenseCategory } from '../../models/expense.model';
import { Vehicle } from '../../models/vehicle.model';
import { FuelExpenseMapper } from '../../mappers/fuel-expense.mapper';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-fuel-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StatusBadgeComponent, PageHeaderComponent, ModalComponent],
  template: `
    <app-page-header title="Fuel & Expense Ledger" description="Log and audit fleet fuel ingestion and operational costs.">
      <div actions class="flex gap-2">
        <button (click)="openFuelModal()" class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          + Log Fuel
        </button>
        <button (click)="openExpenseModal()" class="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-lg shadow hover:bg-secondary/80 transition-colors border border-border flex items-center gap-1.5">
          + Add Expense
        </button>
      </div>
    </app-page-header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-xs">
      <div class="bg-card border border-border p-5 rounded-xl shadow-sm">
        <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Operational Cost</p>
        <h3 class="text-2xl font-bold text-foreground mt-2">{{ totalOperationalCost() | currency:'INR' }}</h3>
        <p class="text-[10px] text-muted-foreground mt-1">Aggregated fuel + maintenance + other costs</p>
      </div>
      <div class="bg-card border border-border p-5 rounded-xl shadow-sm">
        <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg Fuel Efficiency</p>
        <h3 class="text-2xl font-bold text-foreground mt-2">{{ avgEfficiency() | number:'1.1-2' }} km/L</h3>
        <p class="text-[10px] text-muted-foreground mt-1">Across all vehicles trailing logs</p>
      </div>
      <div class="bg-card border border-border p-5 rounded-xl shadow-sm">
        <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Anomalies</p>
        <h3 class="text-2xl font-bold text-destructive mt-2">{{ anomalies().length }} Alert(s)</h3>
        <p class="text-[10px] text-muted-foreground mt-1">Fuel consumption deviating &gt;30%</p>
      </div>
    </div>

    <div class="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[450px]">
      <div class="flex border-b border-border text-xs font-semibold px-6 bg-muted/5">
        <button (click)="activeTab.set('fuel')" [class.border-primary]="activeTab() === 'fuel'" [class.text-primary]="activeTab() === 'fuel'" class="py-4.5 px-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground">Fuel Logs</button>
        <button (click)="activeTab.set('expenses')" [class.border-primary]="activeTab() === 'expenses'" [class.text-primary]="activeTab() === 'expenses'" class="py-4.5 px-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground">Other Expenses</button>
        <button (click)="activeTab.set('anomalies')" [class.border-primary]="activeTab() === 'anomalies'" [class.text-primary]="activeTab() === 'anomalies'" class="py-4.5 px-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
          Anomalies
          @if (anomalies().length > 0) {
            <span class="ml-1 px-1.5 py-0.5 text-[9px] bg-destructive text-destructive-foreground rounded-full font-bold">{{ anomalies().length }}</span>
          }
        </button>
      </div>

      <div class="flex-1 p-6 text-xs">
        @if (activeTab() === 'fuel') {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-border bg-muted/20 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  <th class="px-6 py-3">Date</th>
                  <th class="px-6 py-3">Vehicle</th>
                  <th class="px-6 py-3">Odometer</th>
                  <th class="px-6 py-3">Liters</th>
                  <th class="px-6 py-3">Cost</th>
                  <th class="px-6 py-3">Efficiency</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (log of fuelLogs(); track log.id) {
                  <tr class="hover:bg-muted/5 transition-colors">
                    <td class="px-6 py-3.5">{{ log.date | date:'mediumDate' }}</td>
                    <td class="px-6 py-3.5 font-bold text-foreground">{{ log.vehicle?.registrationNumber || 'Unknown' }}</td>
                    <td class="px-6 py-3.5">{{ log.odometerKm | number }} km</td>
                    <td class="px-6 py-3.5">{{ log.liters | number }} L</td>
                    <td class="px-6 py-3.5 font-semibold text-foreground">{{ log.cost | currency:'INR' }}</td>
                    <td class="px-6 py-3.5">
                      <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold border border-blue-500/20">
                        {{ log.fuelEfficiency | number:'1.1-2' }} km/L
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-muted-foreground">No fuel logs found</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (activeTab() === 'expenses') {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-border bg-muted/20 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  <th class="px-6 py-3">Date</th>
                  <th class="px-6 py-3">Vehicle</th>
                  <th class="px-6 py-3">Category</th>
                  <th class="px-6 py-3">Description</th>
                  <th class="px-6 py-3">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (exp of expenses(); track exp.id) {
                  <tr class="hover:bg-muted/5 transition-colors">
                    <td class="px-6 py-3.5">{{ exp.date | date:'mediumDate' }}</td>
                    <td class="px-6 py-3.5 font-bold text-foreground">{{ exp.vehicle?.registrationNumber || 'Unknown' }}</td>
                    <td class="px-6 py-3.5">
                      <span class="px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 font-bold border border-zinc-500/20 uppercase text-[10px]">
                        {{ exp.category }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5 text-muted-foreground max-w-xs truncate">{{ exp.description || 'N/A' }}</td>
                    <td class="px-6 py-3.5 font-bold text-foreground">{{ exp.amount | currency:'INR' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-muted-foreground">No expense entries found</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (activeTab() === 'anomalies') {
          <div class="space-y-4">
            @for (a of anomalies(); track a.id) {
              <div class="p-4 border border-red-500/20 bg-red-500/5 rounded-xl flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-full bg-red-500/10 text-red-600">
                    ⚠️
                  </div>
                  <div>
                    <h4 class="font-bold text-foreground">{{ a.vehicle?.registrationNumber }} - Deviation Alert</h4>
                    <p class="text-muted-foreground text-[10px] mt-0.5">
                      Fuel efficiency: <strong class="text-red-600">{{ a.fuelEfficiency | number:'1.1-2' }} km/L</strong>. 
                      Deviates by more than 30% from the trailing average.
                    </p>
                  </div>
                </div>
                <span class="text-[10px] text-muted-foreground">{{ a.date | date:'mediumDate' }}</span>
              </div>
            } @empty {
              <div class="p-6 text-center text-muted-foreground py-12">
                ✅ No efficiency anomalies detected across the fleet
              </div>
            }
          </div>
        }
      </div>
    </div>

    <app-modal [isOpen]="fuelModalOpen()" title="Log Fuel Purchase" size="sm" (close)="closeFuelModal()">
      <form [formGroup]="fuelForm" class="space-y-4 text-xs">
        <div>
          <label class="font-semibold text-foreground">Select Vehicle *</label>
          <select formControlName="vehicleId" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Select a vehicle</option>
            @for (v of vehicles(); track v.id) {
              <option [value]="v.id">{{ v.registrationNumber }}</option>
            }
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-semibold text-foreground">Liters *</label>
            <input type="number" formControlName="liters" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="font-semibold text-foreground">Cost (INR) *</label>
            <input type="number" formControlName="cost" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-semibold text-foreground">Odometer (km) *</label>
            <input type="number" formControlName="odometerKm" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label class="font-semibold text-foreground">Date *</label>
            <input type="date" formControlName="date" class="w-full mt-1 px-3 py-1 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          </div>
        </div>
      </form>

      <div footer class="flex items-center gap-2">
        <button (click)="closeFuelModal()" class="px-4 py-2 border border-border text-xs rounded-lg hover:bg-muted text-foreground transition-colors">Cancel</button>
        <button (click)="submitFuel()" [disabled]="loading()" class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
          Log Fuel
        </button>
      </div>
    </app-modal>

    <app-modal [isOpen]="expenseModalOpen()" title="Add Expense Entry" size="sm" (close)="closeExpenseModal()">
      <form [formGroup]="expenseForm" class="space-y-4 text-xs">
        <div>
          <label class="font-semibold text-foreground">Select Vehicle *</label>
          <select formControlName="vehicleId" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Select a vehicle (Optional)</option>
            @for (v of vehicles(); track v.id) {
              <option [value]="v.id">{{ v.registrationNumber }}</option>
            }
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-semibold text-foreground">Category *</label>
            <select formControlName="category" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="TOLL">Toll</option>
              <option value="PARKING">Parking</option>
              <option value="INSURANCE">Insurance</option>
              <option value="TAX">Tax</option>
              <option value="ALLOWANCE">Allowance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label class="font-semibold text-foreground">Amount (INR) *</label>
            <input type="number" formControlName="amount" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-semibold text-foreground">Date *</label>
            <input type="date" formControlName="date" class="w-full mt-1 px-3 py-1 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
          </div>
          <div>
            <label class="font-semibold text-foreground">Description *</label>
            <input type="text" formControlName="description" placeholder="Mumbra Bypass Toll" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      </form>

      <div footer class="flex items-center gap-2">
        <button (click)="closeExpenseModal()" class="px-4 py-2 border border-border text-xs rounded-lg hover:bg-muted text-foreground transition-colors">Cancel</button>
        <button (click)="submitExpense()" [disabled]="loading()" class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
          Add Expense
        </button>
      </div>
    </app-modal>
  `
})
export class FuelExpensesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  loading = signal<boolean>(false);
  activeTab = signal<string>('fuel');
  
  fuelModalOpen = signal<boolean>(false);
  expenseModalOpen = signal<boolean>(false);

  fuelLogs = signal<FuelLog[]>([]);
  expenses = signal<Expense[]>([]);
  anomalies = signal<FuelLog[]>([]);
  vehicles = signal<Vehicle[]>([]);

  fuelForm: FormGroup = this.fb.group({
    vehicleId: ['', [Validators.required]],
    liters: [0, [Validators.required, Validators.min(1)]],
    cost: [0, [Validators.required, Validators.min(1)]],
    odometerKm: [0, [Validators.required, Validators.min(0)]],
    date: ['', [Validators.required]]
  });

  expenseForm: FormGroup = this.fb.group({
    vehicleId: [''],
    category: ['TOLL', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(1)]],
    date: ['', [Validators.required]],
    description: ['', [Validators.required]]
  });

  totalOperationalCost = computed(() => {
    const fuelSum = this.fuelLogs().reduce((sum, item) => sum + item.cost, 0);
    const expSum = this.expenses().reduce((sum, item) => sum + item.amount, 0);
    return fuelSum + expSum;
  });

  avgEfficiency = computed(() => {
    const logs = this.fuelLogs().filter(log => log.fuelEfficiency && log.fuelEfficiency > 0);
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, curr) => acc + (curr.fuelEfficiency || 0), 0);
    return sum / logs.length;
  });

  ngOnInit() {
    this.fetchFuelLogs();
    this.fetchExpenses();
    this.fetchAnomalies();
    this.fetchVehicles();
  }

  fetchFuelLogs() {
    this.apiService.get<any[]>('/fuel-logs').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.fuelLogs.set(res.data.map(f => FuelExpenseMapper.fuelLogFromJson(f)));
        }
      },
      error: () => {
        this.fuelLogs.set([
          { id: 'f1', vehicleId: '1', date: '2026-07-05T00:00:00', liters: 45, cost: 4200, odometerKm: 42100, fuelEfficiency: 4.0, vehicle: { registrationNumber: 'MH-12-QW-4567' } as Vehicle },
          { id: 'f2', vehicleId: '2', date: '2026-07-06T00:00:00', liters: 120, cost: 11200, odometerKm: 78500, fuelEfficiency: 6.2, vehicle: { registrationNumber: 'KA-51-MM-8901' } as Vehicle }
        ]);
      }
    });
  }

  fetchExpenses() {
    this.apiService.get<any[]>('/expenses').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.expenses.set(res.data.map(e => FuelExpenseMapper.expenseFromJson(e)));
        }
      },
      error: () => {
        this.expenses.set([
          { id: 'e1', vehicleId: '1', category: 'TOLL', amount: 850, date: '2026-07-05T00:00:00', description: 'NH-4 Toll Booth', vehicle: { registrationNumber: 'MH-12-QW-4567' } as Vehicle },
          { id: 'e2', vehicleId: '2', category: 'INSURANCE', amount: 24500, date: '2026-07-01T00:00:00', description: 'Yearly Comprehensive Insurance Renewal', vehicle: { registrationNumber: 'KA-51-MM-8901' } as Vehicle }
        ]);
      }
    });
  }

  fetchAnomalies() {
    this.apiService.get<any[]>('/fuel-logs/anomalies').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.anomalies.set(res.data.map(f => FuelExpenseMapper.fuelLogFromJson(f)));
        }
      },
      error: () => {
        this.anomalies.set([
          { id: 'f_a1', vehicleId: '1', date: '2026-07-05T00:00:00', liters: 45, cost: 4200, odometerKm: 42100, fuelEfficiency: 2.1, vehicle: { registrationNumber: 'MH-12-QW-4567' } as Vehicle }
        ]);
      }
    });
  }

  fetchVehicles() {
    this.apiService.get<any[]>('/vehicles').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vehicles.set(res.data.filter(v => v.status !== 'RETIRED').map(v => ({
            id: v.id,
            registrationNumber: v.registration_number
          } as Vehicle)));
        }
      },
      error: () => {
        this.vehicles.set([
          { id: '1', registrationNumber: 'MH-12-QW-4567' } as Vehicle,
          { id: '2', registrationNumber: 'KA-51-MM-8901' } as Vehicle
        ]);
      }
    });
  }

  openFuelModal() {
    this.fuelForm.reset({
      liters: 0,
      cost: 0,
      odometerKm: 0,
      date: new Date().toISOString().substring(0, 10)
    });
    this.fuelModalOpen.set(true);
  }

  closeFuelModal() {
    this.fuelModalOpen.set(false);
  }

  submitFuel() {
    if (this.fuelForm.invalid) return;

    this.loading.set(true);
    const mapped = FuelExpenseMapper.fuelLogToJson(this.fuelForm.value);

    this.apiService.post('/fuel-logs', mapped).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.notifService.success('Fuel log added');
          this.fuelModalOpen.set(false);
          this.fetchFuelLogs();
          this.fetchAnomalies();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.notifService.error(err.message || 'Error saving fuel log');
      }
    });
  }

  openExpenseModal() {
    this.expenseForm.reset({
      category: 'TOLL',
      amount: 0,
      date: new Date().toISOString().substring(0, 10)
    });
    this.expenseModalOpen.set(true);
  }

  closeExpenseModal() {
    this.expenseModalOpen.set(false);
  }

  submitExpense() {
    if (this.expenseForm.invalid) return;

    this.loading.set(true);
    const mapped = FuelExpenseMapper.expenseToJson(this.expenseForm.value);

    this.apiService.post('/expenses', mapped).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.notifService.success('Expense entry added');
          this.expenseModalOpen.set(false);
          this.fetchExpenses();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.notifService.error(err.message || 'Error saving expense');
      }
    });
  }
}
