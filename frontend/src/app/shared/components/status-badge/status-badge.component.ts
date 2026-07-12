import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClass()" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase border">
      {{ status() }}
    </span>
  `
})
export class StatusBadgeComponent {
  status = input.required<string>();

  badgeClass = computed(() => {
    const s = this.status().toUpperCase();
    switch (s) {
      case 'AVAILABLE':
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      
      case 'ON_TRIP':
      case 'DISPATCHED':
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';

      case 'IN_SHOP':
      case 'ACTIVE':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';

      case 'RETIRED':
      case 'CANCELLED':
      case 'SUSPENDED':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';

      case 'DRAFT':
      case 'OFF_DUTY':
      default:
        return 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20';
    }
  });
}
