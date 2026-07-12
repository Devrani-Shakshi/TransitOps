import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen w-screen flex bg-background">
      <!-- Left Panel: Branding & Tagline (Hidden on mobile) -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <!-- Abstract graphics / blur blobs -->
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div class="flex items-center gap-3 relative z-10">
          <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-xl text-primary-foreground shadow-lg">
            T
          </div>
          <span class="text-xl font-bold tracking-tight">TransitOps</span>
        </div>

        <div class="space-y-6 relative z-10 max-w-lg">
          <h1 class="text-4xl font-extrabold tracking-tight leading-tight">
            Smart Fleet Operations, <br/>
            Real-Time Logistics.
          </h1>
          <p class="text-slate-400 text-sm leading-relaxed">
            Monitor, dispatch, and optimize your entire transit infrastructure. Real-time maps, automated dispatch, predictive maintenance, and AI analytics in a single unified dashboard.
          </p>
        </div>

        <div class="relative z-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
          &copy; 2026 TransitOps Inc. All rights reserved.
        </div>
      </div>

      <!-- Right Panel: Login Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-card">
        <div class="w-full max-w-md space-y-8 animate-fade-in">
          <div>
            <h2 class="text-2xl font-bold text-foreground">Sign In</h2>
            <p class="text-xs text-muted-foreground mt-2">Enter your credentials to access the platform</p>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div class="space-y-1.5">
              <label for="email" class="text-xs font-semibold text-foreground">Email Address</label>
              <input 
                id="email" 
                type="email" 
                formControlName="email"
                placeholder="admin@transitops.io"
                [ngClass]="{'border-destructive focus:ring-destructive': submitted() && f['email'].errors}"
                class="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              @if (submitted() && f['email'].errors) {
                <span class="text-[10px] text-destructive">Valid email is required</span>
              }
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label for="password" class="text-xs font-semibold text-foreground">Password</label>
              <input 
                id="password" 
                type="password" 
                formControlName="password"
                placeholder="••••••••"
                [ngClass]="{'border-destructive focus:ring-destructive': submitted() && f['password'].errors}"
                class="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              @if (submitted() && f['password'].errors) {
                <span class="text-[10px] text-destructive">Password is required</span>
              }
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-md hover:bg-primary/90 transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              } @else {
                Sign In
              }
            </button>
          </form>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.notifService.success('Logged in successfully');
          const user = this.authService.currentUser();
          if (user) {
            const role = user.role.toUpperCase();
            if (role === 'ADMIN') {
              this.router.navigate(['/user-management']);
            } else if (role === 'FLEET_MANAGER') {
              this.router.navigate(['/dashboard']);
            } else if (role === 'DISPATCHER') {
              this.router.navigate(['/trips']);
            } else if (role === 'SAFETY_OFFICER') {
              this.router.navigate(['/drivers']);
            } else if (role === 'FINANCIAL_ANALYST') {
              this.router.navigate(['/analytics']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.errorMessage.set(res.message || 'Invalid credentials');
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.errors && err.errors.length > 0) {
          this.errorMessage.set(err.errors[0].message);
        } else {
          this.errorMessage.set(err.message || 'Failed to authenticate');
        }
      }
    });
  }
}
