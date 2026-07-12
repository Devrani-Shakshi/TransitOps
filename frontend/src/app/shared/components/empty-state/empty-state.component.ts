import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center bg-card border border-border border-dashed rounded-xl h-64">
      <div class="p-3 rounded-full bg-muted text-muted-foreground mb-3">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-base font-semibold text-foreground">{{ title() }}</h3>
      <p class="text-xs text-muted-foreground mt-1 max-w-sm">{{ message() }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  title = input<string>('No records found');
  message = input<string>('Try adjusting your filters or search query.');
}
