import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  template: `
    <div class="flex h-screen w-screen overflow-hidden bg-background">
      <app-sidebar class="h-full shrink-0 hidden md:block"></app-sidebar>
      
      <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <app-topbar class="w-full shrink-0"></app-topbar>
        
        <main class="flex-1 overflow-y-auto p-6 bg-background">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-toast></app-toast>
    </div>
  `
})
export class ShellComponent {}
