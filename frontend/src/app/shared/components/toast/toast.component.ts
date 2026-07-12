import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto flex items-center justify-between gap-4 px-4 py-3 rounded-lg shadow-lg border text-sm transition-all duration-300 transform translate-y-0 scale-100"
          [ngClass]="{
            'bg-green-500/15 border-green-500 text-green-700 dark:text-green-400': toast.type === 'success',
            'bg-red-500/15 border-red-500 text-red-700 dark:text-red-400': toast.type === 'error',
            'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400': toast.type === 'warning',
            'bg-card border-border text-foreground': toast.type === 'info'
          }"
          role="alert"
        >
          <div class="flex items-center gap-2">
            @if (toast.type === 'success') {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            } @else if (toast.type === 'error') {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            } @else {
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
            <span>{{ toast.message }}</span>
          </div>
          <button (click)="notificationService.dismiss(toast.id)" class="text-muted-foreground hover:text-foreground">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
