import { Component, OnInit, signal, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    DataTableComponent, 
    StatusBadgeComponent, 
    PageHeaderComponent
  ],
  template: `
    <app-page-header title="User Management" description="Provision, manage and review user accounts and roles.">
      <button 
        (click)="openAddModal()" 
        actions 
        class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-lg hover:bg-primary/90 transition-all flex items-center gap-1.5 glow-blue"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Add User
      </button>
    </app-page-header>

    <!-- Users Data Table -->
    <app-data-table 
      [data]="users()" 
      [columns]="columns" 
      [loading]="loading()"
      [cellTemplate]="cellTpl"
      [actionsTemplate]="actionsTpl"
      [hasActions]="true"
      searchPlaceholder="Search name, email, role..."
    >
    </app-data-table>

    <!-- Custom Table Cells -->
    <ng-template #cellTpl let-row let-column="column">
      @if (column.key === 'role_name') {
        <span class="px-2 py-1 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {{ formatRole(row.role_name) }}
        </span>
      } @else if (column.key === 'email_status') {
        <div class="flex items-center gap-2">
          <span 
            class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            [ngClass]="{
              'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': row.email_status === 'SENT',
              'bg-rose-500/10 text-rose-500 border border-rose-500/20': row.email_status === 'FAILED',
              'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse': row.email_status === 'PENDING'
            }"
          >
            {{ row.email_status }}
          </span>
          @if (row.email_status === 'FAILED') {
            <button 
              (click)="resendCredentials(row)" 
              title="Resend Credentials"
              class="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" /></svg>
            </button>
          }
        </div>
      } @else if (column.key === 'is_active') {
        <app-status-badge [status]="row.is_active ? 'ACTIVE' : 'INACTIVE'"></app-status-badge>
      } @else {
        {{ row[column.key] }}
      }
    </ng-template>

    <!-- Table Actions -->
    <ng-template #actionsTpl let-row>
      <div class="flex items-center justify-end gap-2">
        <button 
          (click)="resendCredentials(row)"
          class="px-2.5 py-1 text-[10px] font-bold border border-border rounded-lg bg-card hover:bg-muted text-foreground transition-all flex items-center gap-1"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Resend Welcome
        </button>
        <button 
          (click)="toggleActive(row)"
          [disabled]="isCurrentUser(row)"
          class="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {{ row.is_active ? 'Deactivate' : 'Activate' }}
        </button>
      </div>
    </ng-template>

    <!-- Slide-over / Modal Form Overlay -->
    @if (showAddModal()) {
      <div class="fixed inset-0 z-50 overflow-hidden flex justify-end">
        <!-- Backdrop -->
        <div 
          (click)="closeAddModal()" 
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        ></div>

        <!-- Slide-over panel -->
        <div class="relative w-screen max-w-md bg-card border-l border-border h-full flex flex-col justify-between shadow-2xl animate-slide-in">
          <div class="px-6 py-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-foreground">Add New User</h3>
              <p class="text-[10px] text-muted-foreground mt-0.5">Create a user account. Credentials will be emailed instantly.</p>
            </div>
            <button 
              (click)="closeAddModal()" 
              class="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Form Body -->
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <!-- Full Name -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">Full Name</label>
              <input 
                type="text" 
                formControlName="full_name" 
                placeholder="John Doe"
                [ngClass]="{'border-destructive focus:ring-destructive': submitted && f['full_name'].errors}"
                class="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              @if (submitted && f['full_name'].errors) {
                <span class="text-[10px] text-destructive">Full name is required (min 2 characters)</span>
              }
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">Email Address</label>
              <input 
                type="email" 
                formControlName="email" 
                placeholder="john.doe&#64;transitops.io"
                (blur)="checkEmailUniqueness()"
                [ngClass]="{'border-destructive focus:ring-destructive': (submitted && f['email'].errors) || emailConflict()}"
                class="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              @if (submitted && f['email'].errors?.['required']) {
                <span class="text-[10px] text-destructive">Email address is required</span>
              } @else if (submitted && f['email'].errors?.['email']) {
                <span class="text-[10px] text-destructive">Please enter a valid email format</span>
              } @else if (emailConflict()) {
                <span class="text-[10px] text-destructive">This email is already in use by another user</span>
              }
            </div>

            <!-- Mobile Number -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">Mobile Number</label>
              <input 
                type="text" 
                formControlName="mobile_number" 
                placeholder="9876543210"
                [ngClass]="{'border-destructive focus:ring-destructive': submitted && f['mobile_number'].errors}"
                class="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              @if (submitted && f['mobile_number'].errors) {
                <span class="text-[10px] text-destructive">Mobile number is required (must be exactly 10 digits)</span>
              }
            </div>

            <!-- Gender -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">Gender</label>
              <select 
                formControlName="gender"
                [ngClass]="{'border-destructive focus:ring-destructive': submitted && f['gender'].errors}"
                class="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              @if (submitted && f['gender'].errors) {
                <span class="text-[10px] text-destructive">Gender selection is required</span>
              }
            </div>

            <!-- Role Selection -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">System Role</label>
              <select 
                formControlName="role"
                [ngClass]="{'border-destructive focus:ring-destructive': submitted && f['role'].errors}"
                class="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Select Role</option>
                <option value="admin">Administrator</option>
                <option value="fleet_manager">Fleet Manager</option>
                <option value="dispatcher">Trip Dispatcher</option>
                <option value="safety_officer">Safety Officer</option>
                <option value="financial_analyst">Financial Analyst</option>
              </select>
              @if (submitted && f['role'].errors) {
                <span class="text-[10px] text-destructive">Role assignment is required</span>
              }
            </div>
          </form>

          <!-- Footer Actions -->
          <div class="px-6 py-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
            <button 
              type="button" 
              (click)="closeAddModal()"
              class="px-4 py-2 border border-border rounded-lg bg-card hover:bg-muted text-foreground text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              (click)="onSubmit()"
              [disabled]="formSaving() || emailConflict()"
              class="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-lg shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              @if (formSaving()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              } @else {
                Create User
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class UserListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);
  private authService = inject(AuthService);

  @ViewChild('cellTpl', { static: true }) cellTpl!: TemplateRef<any>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  users = signal<any[]>([]);
  loading = signal<boolean>(false);
  showAddModal = signal<boolean>(false);
  formSaving = signal<boolean>(false);
  submitted = false;
  emailConflict = signal<boolean>(false);

  columns: TableColumn[] = [
    { key: 'full_name', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'mobile_number', label: 'Mobile', sortable: true },
    { key: 'gender', label: 'Gender' },
    { key: 'role_name', label: 'Role', type: 'custom', sortable: true },
    { key: 'email_status', label: 'Email Status', type: 'custom', sortable: true },
    { key: 'is_active', label: 'Status', type: 'custom', sortable: true }
  ];

  userForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadUsers();
  }

  initForm() {
    this.userForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gender: ['', [Validators.required]],
      role: ['', [Validators.required]]
    });
  }

  get f() { return this.userForm.controls; }

  loadUsers() {
    this.loading.set(true);
    this.apiService.get<any[]>('/users/').subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.users.set(res.data);
        }
      },
      error: () => {
        this.loading.set(false);
        this.notifService.error('Failed to load system users');
      }
    });
  }

  openAddModal() {
    this.submitted = false;
    this.emailConflict.set(false);
    this.initForm();
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  checkEmailUniqueness() {
    const emailVal = this.f['email']?.value?.trim()?.toLowerCase();
    if (!emailVal || this.f['email'].invalid) return;

    // Fast check locally against current list
    const exists = this.users().some(u => u.email.toLowerCase() === emailVal);
    this.emailConflict.set(exists);
  }

  onSubmit() {
    this.submitted = true;
    this.checkEmailUniqueness();

    if (this.userForm.invalid || this.emailConflict()) {
      return;
    }

    this.formSaving.set(true);
    const payload = this.userForm.value;

    this.apiService.post<any>('/users/', payload).subscribe({
      next: (res) => {
        this.formSaving.set(false);
        if (res.success) {
          this.notifService.success(`User created. Login credentials have been emailed to ${payload.email}.`);
          this.closeAddModal();
          this.loadUsers(); // Refresh list
        } else {
          this.notifService.error(res.message || 'Failed to create user');
        }
      },
      error: (err) => {
        this.formSaving.set(false);
        if (err.errors && err.errors.length > 0) {
          this.notifService.error(err.errors[0].message);
        } else {
          this.notifService.error(err.message || 'Failed to create user');
        }
      }
    });
  }

  resendCredentials(row: any) {
    this.notifService.info(`Queueing welcome credentials email for ${row.email}...`);
    this.apiService.post<any>(`/users/${row.id}/resend`, {}).subscribe({
      next: (res) => {
        if (res.success) {
          this.notifService.success(`Credentials welcome email queued for ${row.email}`);
          this.loadUsers(); // Refresh status indicator
        } else {
          this.notifService.error('Failed to resend credentials email');
        }
      },
      error: (err) => {
        this.notifService.error(err.message || 'Failed to resend credentials');
      }
    });
  }

  toggleActive(row: any) {
    this.apiService.post<any>(`/users/${row.id}/toggle-active`, {}).subscribe({
      next: (res) => {
        if (res.success) {
          const action = row.is_active ? 'deactivated' : 'activated';
          this.notifService.success(`User account successfully ${action}`);
          this.loadUsers();
        }
      },
      error: (err) => {
        this.notifService.error(err.message || 'Failed to change user status');
      }
    });
  }

  isCurrentUser(row: any): boolean {
    const current = this.authService.currentUser();
    return current ? current.id === row.id : false;
  }

  formatRole(roleName: string | null): string {
    if (!roleName) return 'User';
    return roleName.replace('_', ' ');
  }
}
