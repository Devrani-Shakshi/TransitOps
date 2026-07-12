import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ title() }}</h1>
        @if (description()) {
          <p class="text-sm text-muted-foreground mt-1">{{ description() }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  description = input<string | null>(null);
}
