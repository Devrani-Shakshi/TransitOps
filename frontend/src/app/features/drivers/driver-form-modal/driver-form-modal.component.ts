import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DriverMapper } from '../../../mappers/driver.mapper';
import { Driver } from '../../../models/driver.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-driver-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen()" [title]="driver() ? 'Edit Driver' : 'Add Driver'" size="md" (close)="close.emit()">
      <form [formGroup]="driverForm" class="space-y-4 text-xs">
        <div class="space-y-1">
          <label class="font-semibold text-foreground">Full Name *</label>
          <input type="text" formControlName="fullName" placeholder="Shakshi Devrani" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          @if (submitted() && f['fullName'].errors) {
            <span class="text-[10px] text-destructive">Required</span>
          }
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="font-semibold text-foreground">License Number *</label>
            <input type="text" formControlName="licenseNumber" placeholder="DL-1420110012345" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['licenseNumber'].errors) {
              <span class="text-[10px] text-destructive">Required</span>
            }
            @if (licenseError()) {
              <span class="text-[10px] text-destructive">{{ licenseError() }}</span>
            }
          </div>
          
          <div class="space-y-1">
            <label class="font-semibold text-foreground">License Category *</label>
            <select formControlName="licenseCategory" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="LMV">Light Motor Vehicle (LMV)</option>
              <option value="HMV">Heavy Motor Vehicle (HMV)</option>
              <option value="TRANS">Transport Vehicle (TRANS)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="font-semibold text-foreground">License Expiry Date *</label>
            <input type="date" formControlName="licenseExpiry" class="w-full px-3 py-1 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs" />
            @if (submitted() && f['licenseExpiry'].errors) {
              <span class="text-[10px] text-destructive">Required</span>
            }
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Safety Score (0-100) *</label>
            <input type="number" formControlName="safetyScore" placeholder="95" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['safetyScore'].errors) {
              <span class="text-[10px] text-destructive">Required (0 - 100)</span>
            }
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="font-semibold text-foreground">Contact Number *</label>
            <input type="text" formControlName="contactNumber" placeholder="+91 98765 43210" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['contactNumber'].errors) {
              <span class="text-[10px] text-destructive">Required</span>
            }
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-foreground">Emergency Contact *</label>
            <input type="text" formControlName="emergencyContact" placeholder="+91 98765 43211" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            @if (submitted() && f['emergencyContact'].errors) {
              <span class="text-[10px] text-destructive">Required</span>
            }
          </div>
        </div>

        <div class="space-y-1">
          <label class="font-semibold text-foreground">Status *</label>
          <select formControlName="status" class="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP" disabled>On Trip (System Managed)</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </form>

      <div footer class="flex items-center gap-2">
        <button (click)="close.emit()" class="px-4 py-2 border border-border text-xs rounded-lg hover:bg-muted text-foreground transition-colors">Cancel</button>
        <button (click)="onSave()" [disabled]="loading()" class="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
          @if (loading()) {
            <svg class="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          }
          Save
        </button>
      </div>
    </app-modal>
  `
})
export class DriverFormModalComponent {
  isOpen = input.required<boolean>();
  driver = input<Driver | null>(null);

  close = output<void>();
  save = output<void>();

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notifService = inject(NotificationService);

  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  licenseError = signal<string | null>(null);

  driverForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    licenseNumber: ['', [Validators.required]],
    licenseCategory: ['HMV', [Validators.required]],
    licenseExpiry: ['', [Validators.required]],
    contactNumber: ['', [Validators.required]],
    emergencyContact: ['', [Validators.required]],
    safetyScore: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
    status: ['AVAILABLE', [Validators.required]]
  });

  get f() { return this.driverForm.controls; }

  constructor() {
    effect(() => {
      const d = this.driver();
      if (d) {
        this.driverForm.patchValue({
          fullName: d.fullName,
          licenseNumber: d.licenseNumber,
          licenseCategory: d.licenseCategory,
          licenseExpiry: d.licenseExpiry ? d.licenseExpiry.substring(0, 10) : '',
          contactNumber: d.contactNumber,
          emergencyContact: d.emergencyContact,
          safetyScore: d.safetyScore,
          status: d.status
        });
      } else {
        this.driverForm.reset({
          licenseCategory: 'HMV',
          safetyScore: 100,
          status: 'AVAILABLE'
        });
      }
      this.submitted.set(false);
      this.licenseError.set(null);
    });
  }

  onSave() {
    this.submitted.set(true);
    this.licenseError.set(null);

    if (this.driverForm.invalid) {
      return;
    }

    this.loading.set(true);
    const formData = this.driverForm.value;
    const mapped = DriverMapper.toJson(formData);

    const d = this.driver();
    const request$ = d
      ? this.apiService.put(`/drivers/${d.id}`, mapped)
      : this.apiService.post('/drivers', mapped);

    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.notifService.success(d ? 'Driver updated successfully' : 'Driver added successfully');
          this.save.emit();
        } else {
          this.notifService.error(res.message || 'Error occurred');
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.licenseError.set('License number is already registered');
        } else if (err.errors && err.errors.length > 0) {
          this.notifService.error(err.errors[0].message);
        } else {
          this.notifService.error(err.message || 'Error saving driver');
        }
      }
    });
  }
}
