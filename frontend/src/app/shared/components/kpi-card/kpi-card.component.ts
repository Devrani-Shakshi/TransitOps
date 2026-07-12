import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between h-32 transition-all duration-300 hover:shadow-md hover:border-muted-foreground/30">
      @if (loading()) {
        <div class="animate-pulse flex flex-col justify-between h-full w-full">
          <div class="flex justify-between items-start">
            <div class="h-4 bg-muted rounded w-2/3"></div>
            <div class="h-8 w-8 bg-muted rounded-lg"></div>
          </div>
          <div class="h-8 bg-muted rounded w-1/2"></div>
        </div>
      } @else {
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{{ title() }}</p>
            <h3 class="text-2xl font-bold text-foreground mt-1">{{ value() }}</h3>
          </div>
          <div class="p-2 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ng-content select="[icon]"></ng-content>
          </div>
        </div>
        
        @if (trend()) {
          <div class="flex items-center gap-1 text-xs mt-2">
            <span [ngClass]="{
              'text-green-600 dark:text-green-400 font-semibold': trendType() === 'up',
              'text-red-600 dark:text-red-400 font-semibold': trendType() === 'down',
              'text-muted-foreground': trendType() === 'neutral'
            }">
              @if (trendType() === 'up') {
                ↑ {{ trend() }}
              } @else if (trendType() === 'down') {
                ↓ {{ trend() }}
              } @else {
                {{ trend() }}
              }
            </span>
            <span class="text-muted-foreground">{{ trendLabel() }}</span>
          </div>
        }
      }
    </div>
  `
})
export class KpiCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  loading = input<boolean>(false);
  trend = input<string | null>(null);
  trendType = input<'up' | 'down' | 'neutral'>('neutral');
  trendLabel = input<string>('vs last month');
}
