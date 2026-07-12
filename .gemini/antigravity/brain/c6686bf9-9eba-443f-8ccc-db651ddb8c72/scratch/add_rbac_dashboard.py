import re

file_path = "frontend/src/app/features/dashboard/dashboard.component.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports to include AuthService
old_imports = """import { ApiService } from '../../core/services/api.service';
import { WebsocketService } from '../../core/services/websocket.service';"""

new_imports = """import { ApiService } from '../../core/services/api.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';"""

content = content.replace(old_imports, new_imports)

# 2. Inject AuthService inside DashboardComponent
old_injection = """export class DashboardComponent implements OnInit, OnDestroy {
  apiService = inject(ApiService);
  websocketService = inject(WebsocketService);"""

new_injection = """export class DashboardComponent implements OnInit, OnDestroy {
  apiService = inject(ApiService);
  websocketService = inject(WebsocketService);
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;"""

content = content.replace(old_injection, new_injection)

# 3. Update top section greetings
old_greeting = """          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 font-manrope font-semibold">
            Good Morning, Fleet Commander
          </h1>"""

new_greeting = """          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 font-manrope font-semibold">
            Good Morning, {{ currentUser()?.fullName || 'Fleet Commander' }}
          </h1>"""

content = content.replace(old_greeting, new_greeting)

# Update sub-greeting message
old_sub = """AI Co-Pilot: Core operations stable. 3 recommended actions queue."""
new_sub = """AI Co-Pilot active for {{ currentUser()?.role || 'SYSTEM' }} | Operations stable."""
content = content.replace(old_sub, new_sub)

# 4. Wrap financial widgets based on role
# Financial Flow Analytics area and cost segments (bottom panel)
old_financial_section = """      <!-- FINANCIAL ANALYTICS AREA GRAPH & EXPENSE CATEGORIES -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Finance Analytics Area Charts -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col justify-between">"""

new_financial_section = """      <!-- FINANCIAL ANALYTICS AREA GRAPH & EXPENSE CATEGORIES -->
      <div *ngIf="currentUser()?.role === 'ADMIN' || currentUser()?.role === 'FLEET_MANAGER' || currentUser()?.role === 'FINANCIAL_ANALYST'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Finance Analytics Area Charts -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col justify-between">"""

content = content.replace(old_financial_section, new_financial_section)

# 5. Wrap Dispatcher stepper based on role
old_dispatcher_section = """        <!-- TRIP MANAGEMENT & DISPATCH STEPPER WORKFLOW -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden">"""

new_dispatcher_section = """        <!-- TRIP MANAGEMENT & DISPATCH STEPPER WORKFLOW -->
        <div *ngIf="currentUser()?.role === 'ADMIN' || currentUser()?.role === 'FLEET_MANAGER' || currentUser()?.role === 'DRIVER'" class="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden">"""

content = content.replace(old_dispatcher_section, new_dispatcher_section)

# 6. Wrap Operator Leaderboard based on role
old_leaderboard_section = """        <!-- Driver Leaderboard Panel -->
        <div class="glass-card rounded-2xl p-6 relative flex flex-col justify-between">"""

new_leaderboard_section = """        <!-- Driver Leaderboard Panel -->
        <div *ngIf="currentUser()?.role === 'ADMIN' || currentUser()?.role === 'FLEET_MANAGER' || currentUser()?.role === 'SAFETY_OFFICER'" class="glass-card rounded-2xl p-6 relative flex flex-col justify-between">"""

content = content.replace(old_leaderboard_section, new_leaderboard_section)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Dashboard RBAC user-specific views applied successfully!")
