import { Component, input, output, signal, computed, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'currency' | 'number' | 'badge' | 'custom';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <div class="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <!-- Search and Filters Slot -->
      <div class="px-6 py-4 border-b border-border bg-muted/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-72">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            [placeholder]="searchPlaceholder()"
            (input)="onSearchChange($event)"
            class="pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          />
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto justify-end">
          <ng-content select="[filters]"></ng-content>
        </div>
      </div>

      <!-- Main Table -->
      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              @for (col of columns(); track col.key) {
                <th 
                  (click)="col.sortable ? onSort(col.key) : null"
                  [ngClass]="{'cursor-pointer hover:bg-muted/30 hover:text-foreground transition-colors': col.sortable}"
                  class="px-6 py-3 select-none"
                >
                  <div class="flex items-center gap-1.5">
                    <span>{{ col.label }}</span>
                    @if (col.sortable) {
                      <span class="text-[10px] text-muted-foreground">
                        @if (sortField() === col.key) {
                          {{ sortOrder() === 'asc' ? '▲' : '▼' }}
                        } @else {
                          ⇅
                        }
                      </span>
                    }
                  </div>
                </th>
              }
              @if (hasActions()) {
                <th class="px-6 py-3 text-right">Actions</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-xs">
            @if (loading()) {
              @for (row of [1, 2, 3, 4, 5]; track row) {
                <tr class="animate-pulse">
                  @for (col of columns(); track col.key) {
                    <td class="px-6 py-4"><div class="h-4 bg-muted rounded w-3/4"></div></td>
                  }
                  @if (hasActions()) {
                    <td class="px-6 py-4 text-right"><div class="h-4 bg-muted rounded w-12 ml-auto"></div></td>
                  }
                </tr>
              }
            } @else if (sortedData().length === 0) {
              <tr>
                <td [attr.colspan]="columns().length + (hasActions() ? 1 : 0)" class="py-12 px-6">
                  <app-empty-state></app-empty-state>
                </td>
              </tr>
            } @else {
              @for (row of sortedData(); track row.id || row) {
                <tr class="hover:bg-muted/5 transition-colors">
                  @for (col of columns(); track col.key) {
                    <td class="px-6 py-4 text-foreground font-medium">
                      @if (col.type === 'custom' && cellTemplate()) {
                        <ng-container *ngTemplateOutlet="cellTemplate()!; context: { $implicit: row, column: col }"></ng-container>
                      } @else if (col.type === 'date') {
                        {{ row[col.key] | date:'mediumDate' }}
                      } @else if (col.type === 'currency') {
                        {{ row[col.key] | currency:'INR':'symbol-narrow':'1.2-2' }}
                      } @else if (col.type === 'number') {
                        {{ row[col.key] | number }}
                      } @else {
                        {{ row[col.key] }}
                      }
                    </td>
                  }
                  @if (hasActions() && actionsTemplate()) {
                    <td class="px-6 py-4 text-right">
                      <ng-container *ngTemplateOutlet="actionsTemplate()!; context: { $implicit: row }"></ng-container>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      @if (totalItems() > 0 && showPagination()) {
        <div class="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Showing {{ (page() - 1) * pageSize() + 1 }} to {{ Math.min(page() * pageSize(), totalItems()) }} of {{ totalItems() }} records
          </div>
          <div class="flex items-center gap-2">
            <button 
              [disabled]="page() === 1"
              (click)="onPageChange(page() - 1)"
              class="px-2.5 py-1.5 rounded border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              [disabled]="page() * pageSize() >= totalItems()"
              (click)="onPageChange(page() + 1)"
              class="px-2.5 py-1.5 rounded border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class DataTableComponent {
  data = input.required<any[]>();
  columns = input.required<TableColumn[]>();
  loading = input<boolean>(false);
  
  searchPlaceholder = input<string>('Search records...');
  
  cellTemplate = input<TemplateRef<any> | null>(null);
  actionsTemplate = input<TemplateRef<any> | null>(null);
  hasActions = input<boolean>(false);

  showPagination = input<boolean>(true);
  totalItems = input<number>(0);
  pageSize = input<number>(10);
  page = input<number>(1);
  
  searchChange = output<string>();
  sortChange = output<{ field: string; order: 'asc' | 'desc' }>();
  pageChange = output<number>();

  sortField = signal<string | null>(null);
  sortOrder = signal<'asc' | 'desc'>('asc');
  searchQuery = signal<string>('');

  Math = Math;

  sortedData = computed(() => {
    let list = [...this.data()];
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(row => {
        return this.columns().some(col => {
          const val = row[col.key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    const field = this.sortField();
    const order = this.sortOrder();

    if (field) {
      list.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  });

  onSearchChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.searchChange.emit(val);
  }

  onSort(field: string) {
    const currentField = this.sortField();
    const currentOrder = this.sortOrder();

    let newOrder: 'asc' | 'desc' = 'asc';
    if (currentField === field) {
      newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    }

    this.sortField.set(field);
    this.sortOrder.set(newOrder);
    this.sortChange.emit({ field, order: newOrder });
  }

  onPageChange(newPage: number) {
    this.pageChange.emit(newPage);
  }
}
