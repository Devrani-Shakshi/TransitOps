import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="close.emit()"></div>
        
        <div 
          [ngClass]="{
            'max-w-md': size() === 'sm',
            'max-w-lg': size() === 'md',
            'max-w-2xl': size() === 'lg',
            'max-w-4xl': size() === 'xl'
          }"
          class="relative bg-card border border-border w-full rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in pointer-events-auto"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/25">
            <h3 class="text-base font-bold text-foreground">{{ title() }}</h3>
            <button (click)="close.emit()" class="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-4 overflow-y-auto flex-1">
            <ng-content></ng-content>
          </div>

          @if (hasFooter()) {
            <div class="px-6 py-4 border-t border-border bg-muted/25 flex items-center justify-end gap-3">
              <ng-content select="[footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input.required<string>();
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  hasFooter = input<boolean>(true);
  
  close = output<void>();
}
