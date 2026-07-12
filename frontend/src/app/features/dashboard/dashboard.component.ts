import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  widget?: any;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-16">
      
      <!-- TOP COMMAND SECTION -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 font-manrope">
            Good Morning, Fleet Commander
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1 font-semibold flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            AI Co-Pilot: Core operations stable. 3 recommended actions queue.
          </p>
        </div>
        
        <!-- Quick Stats Banner -->
        <div class="flex items-center gap-4 bg-slate-100 dark:bg-[#0d1426]/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-lg">
          <div class="flex flex-col border-r border-slate-200 dark:border-white/5 pr-4">
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Network Load</span>
            <span class="text-sm font-bold text-sky-600 dark:text-sky-400">92.4%</span>
          </div>
          <div class="flex flex-col border-r border-slate-200 dark:border-white/5 pr-4">
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Weather Status</span>
            <span class="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              Storm Delay <span class="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Local System Time</span>
            <span class="text-sm font-bold text-slate-800 dark:text-slate-800 dark:text-slate-200">15:15 Operations</span>
          </div>
        </div>
      </div>

      <!-- AI SUMMARY & TODAY'S OPERATIONS CARD -->
      <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div class="absolute -right-24 -top-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -left-24 -bottom-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <h2 class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Today's AI Summary Card
        </h2>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold">Fleet Health</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-emerald-400 font-manrope">94%</span>
              <span class="text-[10px] text-emerald-400 font-bold">Optimal</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div class="bg-emerald-400 h-full" style="width: 94%"></div>
            </div>
          </div>
          
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold">Est. Revenue</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-sky-400 font-manrope">$48,230</span>
              <span class="text-[10px] text-emerald-400 font-bold">+12%</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div class="bg-sky-400 h-full" style="width: 78%"></div>
            </div>
          </div>
          
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold">Active Deliveries</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-purple-400 font-manrope">182</span>
              <span class="text-[10px] text-slate-400">/ 204 total</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div class="bg-purple-400 h-full" style="width: 89%"></div>
            </div>
          </div>
          
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold">Delayed Trips</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-red-400 font-manrope">3</span>
              <span class="text-[10px] text-red-400 font-bold">High Risk</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div class="bg-red-400 h-full" style="width: 15%"></div>
            </div>
          </div>
          
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold">Weather Impact</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-amber-400 font-manrope">Moderate</span>
              <span class="text-[10px] text-slate-400">Midwest</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div class="bg-amber-400 h-full" style="width: 45%"></div>
            </div>
          </div>
          
          <div class="space-y-1">
            <span class="text-[10px] text-slate-400 uppercase font-bold">Risk Alerts Queue</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-rose-500 font-manrope">2</span>
              <span class="text-[10px] text-rose-400 font-bold">Pending</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div class="bg-rose-500 h-full" style="width: 30%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ANIMATED KPI CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- KPI 1: Active Fleet -->
        <div class="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">🚚 Active Fleet</span>
              <h3 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-blue-400 transition-colors duration-300">
                {{ kpis().activeVehicles }}
              </h3>
            </div>
            <div class="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 glow-blue">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" /></svg>
            </div>
          </div>
          
          <div class="flex justify-between items-end mt-6">
            <div class="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <span>↑ +18%</span>
              <span class="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-normal">vs last week</span>
            </div>
            <!-- Sparkline Spark SVG -->
            <svg class="w-24 h-10 overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="sparkline-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4"></stop>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,25 Q15,5 30,22 T60,10 T80,26 T100,5" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
              <path d="M0,25 Q15,5 30,22 T60,10 T80,26 T100,5 L100,30 L0,30 Z" fill="url(#sparkline-blue)"/>
            </svg>
          </div>
        </div>

        <!-- KPI 2: Available Vehicles -->
        <div class="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">📦 Available Vehicles</span>
              <h3 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-cyan-400 transition-colors duration-300">
                {{ kpis().availableVehicles }}
              </h3>
            </div>
            <div class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 glow-cyan">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          </div>
          
          <div class="flex justify-between items-end mt-6">
            <div class="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <span>↑ +2.4%</span>
              <span class="text-[9px] text-slate-500 dark:text-slate-400 font-medium">ready to dispatch</span>
            </div>
            <!-- Sparkline SVG -->
            <svg class="w-24 h-10 overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="sparkline-cyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4"></stop>
                  <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,15 Q20,25 40,8 T80,18 T100,12" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round"/>
              <path d="M0,15 Q20,25 40,8 T80,18 T100,12 L100,30 L0,30 Z" fill="url(#sparkline-cyan)"/>
            </svg>
          </div>
        </div>

        <!-- KPI 3: In Maintenance -->
        <div class="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">🛠️ In Maintenance</span>
              <h3 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-amber-400 transition-colors duration-300">
                {{ kpis().vehiclesInMaintenance }}
              </h3>
            </div>
            <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 glow-cyan">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
          
          <div class="flex justify-between items-end mt-6">
            <div class="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
              <span>↓ -1</span>
              <span class="text-[9px] text-slate-500 dark:text-slate-400 font-medium">resolved today</span>
            </div>
            <!-- Sparkline SVG -->
            <svg class="w-24 h-10 overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="sparkline-amber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.4"></stop>
                  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,5 Q10,12 30,5 T70,25 T100,10" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
              <path d="M0,5 Q10,12 30,5 T70,25 T100,10 L100,30 L0,30 Z" fill="url(#sparkline-amber)"/>
            </svg>
          </div>
        </div>

        <!-- KPI 4: Active Trips / Utilization -->
        <div class="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">📈 Utilization Rate</span>
              <h3 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-purple-400 transition-colors duration-300">
                {{ utilizationFormatted() }}
              </h3>
            </div>
            <div class="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 glow-purple">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          
          <div class="flex justify-between items-end mt-6">
            <div class="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold">
              <span>↑ +4.2%</span>
              <span class="text-[9px] text-slate-500 dark:text-slate-400 font-medium">efficiency gain</span>
            </div>
            <!-- Sparkline SVG -->
            <svg class="w-24 h-10 overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="sparkline-purple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.4"></stop>
                  <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,28 Q20,10 40,24 T80,5 T100,15" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
              <path d="M0,28 Q20,10 40,24 T80,5 T100,15 L100,30 L0,30 Z" fill="url(#sparkline-purple)"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- MAIN CONTROL INTERFACE: COMMAND MAP & AI INSIGHTS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Live Fleet Command Center Map -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden min-h-[460px]">
          <!-- Map Header Info -->
          <div class="flex justify-between items-center z-10 mb-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Live Fleet Command Center</h3>
              <p class="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Real-time telemetry stream</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="flex h-2 w-2 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">3 ACTIVE SIMULATED TRACKS</span>
            </div>
          </div>

          <!-- Futuristic Cyberpunk SVG Map -->
          <div class="flex-1 w-full bg-slate-100/50 dark:bg-[#0a0e1a]/80 rounded-xl relative overflow-hidden border border-white/5 cyber-grid shadow-inner min-h-[350px]">
            
            <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 380" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <!-- Map grid elements/borders -->
              <rect x="0" y="0" width="800" height="380" fill="none" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1"/>
              
              <!-- Core Simulated Routes -->
              <!-- Route A: Seattle to Chicago -->
              <path id="route-seattle-chicago" d="M 80,100 Q 250,90 420,180" fill="none" stroke="rgba(6, 182, 212, 0.15)" stroke-width="2" />
              <path d="M 80,100 Q 250,90 420,180" fill="none" stroke="#06b6d4" stroke-width="2" class="map-route-active opacity-60" filter="url(#glow)"/>

              <!-- Route B: LA to Chicago -->
              <path id="route-la-chicago" d="M 100,290 Q 280,240 420,180" fill="none" stroke="rgba(59, 130, 246, 0.15)" stroke-width="2" />
              <path d="M 100,290 Q 280,240 420,180" fill="none" stroke="#3b82f6" stroke-width="2" class="map-route-active opacity-70" filter="url(#glow)"/>

              <!-- Route C: Dallas to NY -->
              <path id="route-dallas-ny" d="M 320,330 Q 520,280 720,120" fill="none" stroke="rgba(139, 92, 246, 0.15)" stroke-width="2" />
              <path d="M 320,330 Q 520,280 720,120" fill="none" stroke="#8b5cf6" stroke-width="2" class="map-route-active opacity-70" filter="url(#glow)"/>

              <!-- Newly Dispatched Route (Dynamic pulse representation) -->
              <path *ngIf="isDispatchingActive()" d="M 100,290 Q 250,320 320,330" fill="none" stroke="#22c55e" stroke-width="3" class="map-route-active" filter="url(#glow)"/>

              <!-- Simulated moving vehicle nodes along the paths -->
              <!-- Vehicle 1 -->
              <g>
                <circle r="6" fill="#06b6d4" filter="url(#glow)">
                  <animateMotion dur="12s" repeatCount="indefinite">
                    <mpath href="#route-seattle-chicago"/>
                  </animateMotion>
                </circle>
                <circle r="2" fill="#ffffff">
                  <animateMotion dur="12s" repeatCount="indefinite">
                    <mpath href="#route-seattle-chicago"/>
                  </animateMotion>
                </circle>
              </g>

              <!-- Vehicle 2 -->
              <g>
                <circle r="6" fill="#3b82f6" filter="url(#glow)">
                  <animateMotion dur="18s" repeatCount="indefinite">
                    <mpath href="#route-la-chicago"/>
                  </animateMotion>
                </circle>
                <circle r="2" fill="#ffffff">
                  <animateMotion dur="18s" repeatCount="indefinite">
                    <mpath href="#route-la-chicago"/>
                  </animateMotion>
                </circle>
              </g>

              <!-- Vehicle 3 -->
              <g>
                <circle r="6" fill="#8b5cf6" filter="url(#glow)">
                  <animateMotion dur="14s" repeatCount="indefinite">
                    <mpath href="#route-dallas-ny"/>
                  </animateMotion>
                </circle>
                <circle r="2" fill="#ffffff">
                  <animateMotion dur="14s" repeatCount="indefinite">
                    <mpath href="#route-dallas-ny"/>
                  </animateMotion>
                </circle>
              </g>

              <!-- Newly Dispatched Vehicle Node -->
              <g *ngIf="isDispatchingActive()">
                <circle r="8" fill="#22c55e" filter="url(#glow)">
                  <animateMotion dur="8s" repeatCount="1">
                    <mpath href="#route-la-chicago"/>
                  </animateMotion>
                </circle>
                <circle r="3" fill="#ffffff">
                  <animateMotion dur="8s" repeatCount="1">
                    <mpath href="#route-la-chicago"/>
                  </animateMotion>
                </circle>
              </g>

              <!-- Depot Markers -->
              <!-- Seattle -->
              <g transform="translate(80,100)">
                <circle r="12" fill="rgba(6, 182, 212, 0.1)" stroke="rgba(6, 182, 212, 0.4)" stroke-width="1"/>
                <circle r="4" fill="#06b6d4" class="animate-pulse-glow"/>
              </g>
              
              <!-- Los Angeles -->
              <g transform="translate(100,290)">
                <circle r="12" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.4)" stroke-width="1"/>
                <circle r="4" fill="#3b82f6" class="animate-pulse-glow"/>
              </g>

              <!-- Dallas -->
              <g transform="translate(320,330)">
                <circle r="12" fill="rgba(139, 92, 246, 0.1)" stroke="rgba(139, 92, 246, 0.4)" stroke-width="1"/>
                <circle r="4" fill="#8b5cf6" class="animate-pulse-glow"/>
              </g>

              <!-- Chicago -->
              <g transform="translate(420,180)">
                <circle r="16" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.5"/>
                <circle r="5" fill="#ffffff" class="animate-pulse-glow"/>
              </g>

              <!-- New York -->
              <g transform="translate(720,120)">
                <circle r="12" fill="rgba(6, 182, 212, 0.1)" stroke="rgba(6, 182, 212, 0.4)" stroke-width="1"/>
                <circle r="4" fill="#06b6d4" class="animate-pulse-glow"/>
              </g>
            </svg>

            <!-- Floating Overlay UI for Map -->
            <div class="absolute bottom-4 left-4 right-4 flex gap-4 pointer-events-none">
              <div class="glass-card bg-slate-100 dark:bg-slate-950/80 p-3 rounded-lg border border-white/5 pointer-events-auto shadow-xl flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">TRK</span>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">ACTIVE ROUTE</p>
                  <p class="text-xs font-bold text-white mt-1 truncate">LAX-04 (Tesla Semi) &rarr; Chicago Hub</p>
                  <p class="text-[10px] text-sky-600 dark:text-sky-400 mt-0.5">ETA: 4h 12m • On Schedule • Speed 68mph</p>
                </div>
              </div>
              
              <div class="glass-card bg-slate-100 dark:bg-slate-950/80 p-3 rounded-lg border border-white/5 pointer-events-auto shadow-xl flex items-center gap-3 hidden sm:flex">
                <span class="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">ETA</span>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">WEATHER ALERT</p>
                  <p class="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">Thunderstorms near Chicago Depot</p>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Wind gust 34kts • Rerouting not required</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Insights & Recommendations Panel -->
        <div class="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide mb-1 flex items-center gap-2">
              <span class="flex h-2 w-2 rounded-full bg-purple-500 glow-purple"></span>
              AI Co-Pilot Insights
            </h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-4">Operations Optimizations</p>
          </div>

          <div class="space-y-4 flex-1 overflow-y-auto pr-1">
            <!-- Opportunity 1 -->
            <div class="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 hover:border-blue-500/20 transition-colors">
              <div class="flex justify-between items-start gap-2">
                <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-500/10 text-blue-400 tracking-wider">Fuel saving</span>
                <span class="text-[10px] text-emerald-400 font-bold flex items-center">↑ 8.4%</span>
              </div>
              <p class="text-xs font-bold text-slate-900 dark:text-white mt-1.5">Group Dispatch Rerouting</p>
              <p class="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                Batching 3 Midwest shipments along I-80 will cut drag overhead. Potential fuel reduction: 42 gal.
              </p>
              <button class="mt-2 text-[10px] font-extrabold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">Apply Batch Routing &rarr;</button>
            </div>

            <!-- Opportunity 2 -->
            <div class="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 hover:border-amber-500/20 transition-colors">
              <div class="flex justify-between items-start gap-2">
                <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-500/10 text-amber-400 tracking-wider">Maintenance risk</span>
                <span class="text-[10px] text-amber-400 font-bold">Predictive</span>
              </div>
              <p class="text-xs font-bold text-slate-900 dark:text-white mt-1.5">Semi-Truck #FL-0443 Braking Anomaly</p>
              <p class="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                Temperature telemetry spikes on brake disc #3. Risk of thermal degradation in 450 miles.
              </p>
              <button class="mt-2 text-[10px] font-extrabold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider">Schedule Checkup &rarr;</button>
            </div>

            <!-- Opportunity 3 -->
            <div class="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 hover:border-purple-500/20 transition-colors">
              <div class="flex justify-between items-start gap-2">
                <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-500/10 text-purple-400 tracking-wider">Driver Efficiency</span>
                <span class="text-[10px] text-emerald-400 font-bold">Top Rating</span>
              </div>
              <p class="text-xs font-bold text-slate-900 dark:text-white mt-1.5">Driver Devang P. EcoScore: 98%</p>
              <p class="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                Regenerative braking optimization is 15% better than fleet baseline. Recommended for Tesla Semi route assignment.
              </p>
            </div>
          </div>

          <!-- Quick Actions Footer -->
          <div class="pt-4 border-t border-white/5 mt-4 flex gap-2">
            <button class="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 font-bold text-white text-xs transition-colors flex items-center justify-center gap-1">
              Optimize Fleet
            </button>
            <button class="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-xs transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <!-- HEALTH CENTER & ROUTING INTERACTIVE LABS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Fleet Health Gauge Panel -->
        <div class="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide mb-1">Fleet Health Engine</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-6">Real-time health telemetry</p>
          </div>

          <!-- Large Circle Progress Gauge -->
          <div class="flex flex-col items-center justify-center space-y-4 my-4">
            <div class="relative w-40 h-40 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255, 255, 255, 0.02)" stroke-width="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#health-grad)" stroke-width="8" 
                        stroke-dasharray="251.2" stroke-dashoffset="15" stroke-linecap="round" class="transition-all duration-1000"/>
                <defs>
                  <linearGradient id="health-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#22c55e" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <!-- Center Text -->
              <div class="absolute flex flex-col items-center">
                <span class="text-3xl font-black text-white font-manrope">94%</span>
                <span class="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">EXCELLENT</span>
              </div>
            </div>
            <p class="text-[10px] text-slate-600 dark:text-slate-400 text-center max-w-[200px] leading-normal">
              18 active vehicles operate within nominal limits. 1 vehicle flagged for predictive service.
            </p>
          </div>

          <!-- Vehicle Health Mini List -->
          <div class="space-y-3 pt-4 border-t border-white/5">
            <div class="flex justify-between items-center text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-white">Tesla Semi #TRK-002</span>
              </div>
              <span class="font-bold text-slate-800 dark:text-slate-200">98% Health</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-bold text-white">Volvo VNL #TRK-018</span>
              </div>
              <span class="font-bold text-slate-800 dark:text-slate-200">92% Health</span>
            </div>
            <div class="flex justify-between items-center text-xs text-rose-400">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span class="font-bold">Freightliner #TRK-044</span>
              </div>
              <span class="font-bold">74% - High Risk</span>
            </div>
          </div>
        </div>

        <!-- TRIP MANAGEMENT & DISPATCH STEPPER WORKFLOW -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden">
          <!-- Animation element that will fly during dispatch -->
          <div *ngIf="isDispatching()" class="absolute left-6 top-6 w-16 h-16 bg-blue-500/30 rounded-xl border border-blue-500/50 flex items-center justify-center dispatch-fly-out z-50">
            <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>

          <div>
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Trip Orchestration Wizard</h3>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-0.5">AI-Assisted Dispatch Engine</p>
              </div>
              <span class="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Step {{ currentStep() }} of 5
              </span>
            </div>

            <!-- Stepper Progress Dots -->
            <div class="flex items-center gap-2 my-6">
              <div *ngFor="let s of [1,2,3,4,5]" 
                   class="h-1 flex-1 rounded-full transition-all duration-300"
                   [ngClass]="{
                     'bg-blue-500 glow-blue': currentStep() >= s,
                     'bg-slate-800': currentStep() < s
                   }"></div>
            </div>

            <!-- STEP 1: CHOOSE ROUTE -->
            <div *ngIf="currentStep() === 1" class="space-y-4 animate-fade-in">
              <p class="text-xs font-bold text-slate-900 dark:text-white">Select Mission Route & Destintation</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div *ngFor="let route of mockRoutes" 
                     (click)="selectRoute(route)"
                     class="p-4 rounded-xl border transition-all cursor-pointer text-left"
                     [ngClass]="{
                       'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-md': selectedRoute()?.id === route.id,
                       'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-300 hover:border-white/10': selectedRoute()?.id !== route.id
                     }">
                  <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">ROUTE {{ route.code }}</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white block mt-1">{{ route.name }}</span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Distance: {{ route.distance }}km | Est. time: {{ route.time }}</span>
                </div>
              </div>
            </div>

            <!-- STEP 2: CHOOSE VEHICLE -->
            <div *ngIf="currentStep() === 2" class="space-y-4 animate-fade-in">
              <p class="text-xs font-bold text-slate-900 dark:text-white">Select Vehicle (AI Recommendations Highlighted)</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div *ngFor="let truck of mockTrucks" 
                     (click)="selectTruck(truck)"
                     class="p-4 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden"
                     [ngClass]="{
                       'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-md': selectedTruck()?.id === truck.id,
                       'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-300 hover:border-white/10': selectedTruck()?.id !== truck.id
                     }">
                  <span *ngIf="truck.aiRecommended" class="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-bold bg-purple-500 text-white rounded uppercase tracking-wider">AI Option</span>
                  <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">{{ truck.reg }}</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white block mt-1">{{ truck.name }}</span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Health: {{ truck.health }}% | Efficiency: {{ truck.efficiency }}</span>
                </div>
              </div>
            </div>

            <!-- STEP 3: CHOOSE DRIVER -->
            <div *ngIf="currentStep() === 3" class="space-y-4 animate-fade-in">
              <p class="text-xs font-bold text-slate-900 dark:text-white">Select Operator & Driver</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div *ngFor="let driver of mockDrivers" 
                     (click)="selectDriver(driver)"
                     class="p-4 rounded-xl border transition-all cursor-pointer text-left"
                     [ngClass]="{
                       'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-md': selectedDriver()?.id === driver.id,
                       'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-300 hover:border-white/10': selectedDriver()?.id !== driver.id
                     }">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                      {{ driver.name.slice(0,2) }}
                    </span>
                    <div>
                      <span class="text-sm font-bold text-white block">{{ driver.name }}</span>
                      <span class="text-[10px] text-slate-400">Score: {{ driver.score }}/5.0 | Exp: {{ driver.exp }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 4: CARGO WEIGHT -->
            <div *ngIf="currentStep() === 4" class="space-y-4 animate-fade-in">
              <p class="text-xs font-bold text-slate-900 dark:text-white">Specify Cargo Load Profile</p>
              <div class="p-6 rounded-xl bg-slate-900/40 border border-white/5 space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Cargo Weight Load (kg)</span>
                  <span class="text-sm font-bold text-blue-400 font-manrope">{{ cargoWeight() | number }} kg</span>
                </div>
                <input type="range" min="100" max="25000" step="500" [(ngModel)]="cargoWeight" class="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
                
                <!-- Capacity Visualizer Gauge -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[10px]">
                    <span class="text-slate-400">Utilization of Max Payload</span>
                    <span class="font-bold text-slate-200">{{ ((cargoWeight() / 25000) * 100) | number:'1.0-1' }}%</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-white/5 relative">
                    <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 animate-progress-flow" 
                         [style.width.%]="(cargoWeight() / 25000) * 100"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 5: REVIEW SUMMARY -->
            <div *ngIf="currentStep() === 5" class="space-y-4 animate-fade-in">
              <p class="text-xs font-bold text-slate-900 dark:text-white">Review Mission Summary Profile</p>
              <div class="p-5 rounded-xl bg-slate-900/40 border border-white/5 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Assigned Route</span>
                  <span class="font-bold text-slate-900 dark:text-white mt-1 block">{{ selectedRoute()?.name || 'Unspecified' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Vehicle Assigned</span>
                  <span class="font-bold text-slate-900 dark:text-white mt-1 block">{{ selectedTruck()?.name || 'Unspecified' }} ({{ selectedTruck()?.reg }})</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Assigned Operator</span>
                  <span class="font-bold text-slate-900 dark:text-white mt-1 block">{{ selectedDriver()?.name || 'Unspecified' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Payload Weight</span>
                  <span class="font-bold text-slate-900 dark:text-white mt-1 block">{{ cargoWeight() | number }} kg</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stepper Buttons -->
          <div class="flex gap-3 pt-6 border-t border-white/5 mt-6 z-20 relative">
            <button *ngIf="currentStep() > 1" 
                    (click)="prevStep()"
                    class="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors">
              Back
            </button>
            <button *ngIf="currentStep() < 5" 
                    [disabled]="!canProceed()"
                    (click)="nextStep()"
                    class="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 font-bold text-white text-xs transition-colors flex items-center justify-center gap-1 glow-blue">
              Continue
            </button>
            <button *ngIf="currentStep() === 5" 
                    (click)="dispatchTrip()"
                    class="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs transition-all flex items-center justify-center gap-2 glow-green animate-pulse-glow">
              ⚡ Dispatch Trip Command
            </button>
          </div>
        </div>
      </div>

      <!-- PREMIUM VEHICLE REGISTRY -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Vehicle Intelligence Registry</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-0.5">Real-time status register</p>
          </div>
          <button class="py-1.5 px-3 rounded-lg bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors">View All Vehicles</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let v of mockRegistryVehicles" 
               class="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300 hover:-translate-y-1">
            <!-- Glow background -->
            <div class="absolute -right-16 -top-16 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            
            <div class="flex justify-between items-start">
              <div>
                <span class="px-2 py-0.5 rounded text-[8px] font-bold border"
                      [ngClass]="{
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': v.status === 'AVAILABLE',
                        'bg-blue-500/10 text-blue-400 border-blue-500/20': v.status === 'ON_TRIP',
                        'bg-amber-500/10 text-amber-400 border-amber-500/20': v.status === 'IN_SHOP'
                      }">{{ v.status }}</span>
                <h4 class="text-sm font-extrabold text-slate-900 dark:text-white mt-3">{{ v.name }}</h4>
                <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{{ v.reg }}</p>
              </div>
              
              <!-- Draw premium custom vector SVG mini-truck drawing instead of images -->
              <svg class="w-16 h-10 text-blue-400/30 group-hover:text-blue-400/50 transition-colors" viewBox="0 0 80 40" fill="currentColor">
                <path d="M10,25 h15 v-15 h35 l10,8 v7 h5 v3 h-5 v2 h-60 Z M15,30 a5,5 0 1,1 10,0 a5,5 0 1,1 -10,0 M55,30 a5,5 0 1,1 10,0 a5,5 0 1,1 -10,0" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>

            <div class="space-y-3 mt-6">
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400">Fuel Efficiency</span>
                <span class="font-bold text-slate-200">{{ v.efficiency }}</span>
              </div>
              
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px]">
                  <span class="text-slate-400">Vehicle Health Score</span>
                  <span class="font-bold" [ngClass]="v.health >= 85 ? 'text-emerald-400' : 'text-amber-400'">{{ v.health }}%</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                       [ngClass]="v.health >= 85 ? 'bg-emerald-400' : 'bg-amber-400'"
                       [style.width.%]="v.health"></div>
                </div>
              </div>

              <!-- Expanded hover view details preview -->
              <div class="pt-3 border-t border-white/5 space-y-1 text-[10px] text-slate-400">
                <p class="truncate"><span class="font-bold text-slate-300">Driver:</span> {{ v.driver }}</p>
                <p class="truncate"><span class="font-bold text-slate-300">Mission:</span> {{ v.trip }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MAINTENANCE TIMELINE & LEADERBOARDS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Maintenance Timeline View -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide mb-1">Predictive Maintenance Timeline</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-6">Automated checkup log schedules</p>
          </div>

          <div class="space-y-6 relative border-l border-white/5 pl-6 ml-4 my-2">
            <!-- Timeline Item 1 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-rose-500 border-4 border-[#070b14] flex items-center justify-center glow-purple"></div>
              <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Tesla Semi #TRK-002</h4>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Issue: Disc brake thermal anomaly</p>
                </div>
                <div class="text-left sm:text-right">
                  <span class="text-[10px] font-bold text-rose-400 uppercase block">High Risk • Pending</span>
                  <span class="text-[9px] text-slate-400">Est Cost: $1,420 • Mechanic: A. Ramirez</span>
                </div>
              </div>
              <div class="w-full bg-slate-900/40 p-2.5 rounded-lg border border-white/5 mt-2 flex items-center gap-3">
                <span class="text-[9px] text-slate-400 uppercase font-bold shrink-0">Progress</span>
                <div class="flex-1 bg-slate-200 dark:bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-rose-500 h-full animate-progress-flow" style="width: 15%"></div>
                </div>
              </div>
            </div>

            <!-- Timeline Item 2 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-amber-500 border-4 border-[#070b14] flex items-center justify-center"></div>
              <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Volvo VNL #TRK-018</h4>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Issue: Steering linkage calibration check</p>
                </div>
                <div class="text-left sm:text-right">
                  <span class="text-[10px] font-bold text-amber-400 uppercase block">Routine • In Progress</span>
                  <span class="text-[9px] text-slate-400">Est Cost: $380 • Mechanic: M. Chen</span>
                </div>
              </div>
              <div class="w-full bg-slate-900/40 p-2.5 rounded-lg border border-white/5 mt-2 flex items-center gap-3">
                <span class="text-[9px] text-slate-400 uppercase font-bold shrink-0">Progress</span>
                <div class="flex-1 bg-slate-200 dark:bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-full animate-progress-flow" style="width: 65%"></div>
                </div>
              </div>
            </div>

            <!-- Timeline Item 3 -->
            <div class="relative">
              <div class="absolute -left-[31px] top-0 w-4.5 h-4.5 rounded-full bg-emerald-500 border-4 border-[#070b14] flex items-center justify-center"></div>
              <div class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Ford Transit #VAN-012</h4>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Issue: Scheduled coolant flush completion</p>
                </div>
                <div class="text-left sm:text-right">
                  <span class="text-[10px] font-bold text-emerald-400 uppercase block">Completed</span>
                  <span class="text-[9px] text-slate-400">Est Cost: $190 • Mechanic: K. Patel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Driver Leaderboard Panel -->
        <div class="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide mb-1">Operator Leaderboard</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-4">Top safety & eco metrics</p>
          </div>

          <div class="space-y-4 my-2 flex-1">
            <!-- Driver 1 -->
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 dark:bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px]">#1</span>
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-white truncate">Marcus Vance</h4>
                  <p class="text-[9px] text-slate-400">Safety Score: 4.98 • Eco-Driver</p>
                </div>
              </div>
              <span class="px-2 py-0.5 text-[8px] font-bold bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 shrink-0">Safe Driver</span>
            </div>

            <!-- Driver 2 -->
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 dark:bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[10px]">#2</span>
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-white truncate">Elena Rostova</h4>
                  <p class="text-[9px] text-slate-400">Safety Score: 4.95 • EcoScore 96%</p>
                </div>
              </div>
              <span class="px-2 py-0.5 text-[8px] font-bold bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 shrink-0">Eco Driver</span>
            </div>

            <!-- Driver 3 -->
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 dark:bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-[10px]">#3</span>
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-white truncate">Devang Panchal</h4>
                  <p class="text-[9px] text-slate-400">Safety Score: 4.88 • 92 dispatches</p>
                </div>
              </div>
              <span class="px-2 py-0.5 text-[8px] font-bold bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20 shrink-0">Top Driver</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FINANCIAL ANALYTICS AREA GRAPH & EXPENSE CATEGORIES -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Finance Analytics Area Charts -->
        <div class="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col justify-between">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Financial Flow Analytics</h3>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-0.5">Operational cost overview</p>
            </div>
            
            <div class="flex gap-2">
              <span class="px-2 py-1 text-[9px] font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/25">REVENUE</span>
              <span class="px-2 py-1 text-[9px] font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/25">FUEL</span>
              <span class="px-2 py-1 text-[9px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">MAINTENANCE</span>
            </div>
          </div>

          <!-- Futuristic SVG Area Chart Drawing -->
          <div class="w-full bg-slate-100/50 dark:bg-[#0a0e1a]/80 border border-white/5 rounded-xl p-4 min-h-[220px]">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="chart-rev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"></stop>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"></stop>
                </linearGradient>
                <linearGradient id="chart-fuel-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.2"></stop>
                  <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"></stop>
                </linearGradient>
              </defs>

              <!-- Grid guidelines -->
              <line x1="50" y1="30" x2="550" y2="30" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1" />
              <line x1="50" y1="75" x2="550" y2="75" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1" />
              <line x1="50" y1="120" x2="550" y2="120" stroke="rgba(255, 255, 255, 0.02)" stroke-width="1" />
              <line x1="50" y1="150" x2="550" y2="150" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />

              <!-- Chart curves -->
              <!-- Fuel (Purple) -->
              <path d="M 50,130 Q 150,110 250,120 T 450,105 T 550,90 L 550,150 L 50,150 Z" fill="url(#chart-fuel-grad)"/>
              <path d="M 50,130 Q 150,110 250,120 T 450,105 T 550,90" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" />

              <!-- Revenue (Blue) -->
              <path d="M 50,90 Q 150,60 250,85 T 450,45 T 550,35 L 550,150 L 50,150 Z" fill="url(#chart-rev-grad)"/>
              <path d="M 50,90 Q 150,60 250,85 T 450,45 T 550,35" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />

              <!-- Monthly X Labels -->
              <text x="50" y="170" fill="rgba(255,255,255,0.4)" font-size="10" text-anchor="middle">JAN</text>
              <text x="150" y="170" fill="rgba(255,255,255,0.4)" font-size="10" text-anchor="middle">FEB</text>
              <text x="250" y="170" fill="rgba(255,255,255,0.4)" font-size="10" text-anchor="middle">MAR</text>
              <text x="350" y="170" fill="rgba(255,255,255,0.4)" font-size="10" text-anchor="middle">APR</text>
              <text x="450" y="170" fill="rgba(255,255,255,0.4)" font-size="10" text-anchor="middle">MAY</text>
              <text x="550" y="170" fill="rgba(255,255,255,0.4)" font-size="10" text-anchor="middle">JUN</text>
            </svg>
          </div>
        </div>

        <!-- Expense Tree-donut categories -->
        <div class="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide mb-1">Operational Costs</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-6">Expense distribution profile</p>
          </div>

          <div class="relative w-full flex items-center justify-center my-2">
            <svg class="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Segment 1: Fuel (55%) -->
              <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" stroke-width="12" stroke-dasharray="238.7" stroke-dashoffset="0"/>
              <!-- Segment 2: Maintenance (30%) -->
              <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" stroke-width="12" stroke-dasharray="238.7" stroke-dashoffset="131.3"/>
              <!-- Segment 3: Drivers/Salaries (15%) -->
              <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" stroke-width="12" stroke-dasharray="238.7" stroke-dashoffset="202.9"/>
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="text-lg font-black text-white font-manrope">$24,200</span>
              <span class="text-[8px] text-slate-400 uppercase font-bold tracking-widest">TOTAL COST</span>
            </div>
          </div>

          <!-- Expense Indicators -->
          <div class="space-y-2 pt-4 border-t border-white/5 text-xs">
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded bg-blue-500"></span> Fuel Expenses</span>
              <span class="font-bold text-slate-200">55% ($13,310)</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded bg-purple-500"></span> Maintenance</span>
              <span class="font-bold text-slate-200">30% ($7,260)</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded bg-cyan-500"></span> Salaries & Admin</span>
              <span class="font-bold text-slate-200">15% ($3,630)</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- AI CHAT FLOATING ASSISTANT -->
    <div class="fixed bottom-6 right-6 z-50">
      <!-- Chat Toggle Bubble -->
      <button (click)="toggleChat()" 
              class="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 border border-blue-400/20 text-white flex items-center justify-center glow-blue shadow-2xl transition-all duration-300 transform"
              [ngClass]="{'rotate-90 bg-slate-900 border-white/10 hover:bg-slate-800': isChatOpen()}">
        <svg *ngIf="!isChatOpen()" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        <svg *ngIf="isChatOpen()" class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <!-- Chat Dialogue Box -->
      <div *ngIf="isChatOpen()" class="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[480px] rounded-2xl glass-card border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in">
        <!-- Chat Header -->
        <div class="px-4 py-3 border-b border-white/5 bg-slate-100 dark:bg-slate-950/60 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 glow-blue animate-pulse"></span>
            <span class="text-xs font-black text-white uppercase tracking-wider font-manrope">TransitOps AI Co-Pilot</span>
          </div>
          <span class="text-[9px] text-slate-400 uppercase font-bold">ONLINE</span>
        </div>

        <!-- Chat History -->
        <div class="flex-1 p-4 overflow-y-auto space-y-4">
          <div *ngFor="let msg of chatMessages" class="flex flex-col" [ngClass]="msg.sender === 'user' ? 'items-end' : 'items-start'">
            <span class="text-[8px] text-slate-400 uppercase font-bold mb-1">{{ msg.sender === 'user' ? 'You' : 'AI Co-Pilot' }}</span>
            <div class="px-3.5 py-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed"
                 [ngClass]="msg.sender === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-slate-900 border border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none'">
              <p>{{ msg.text }}</p>
              
              <!-- Custom Interactive Response Widget -->
              <div *ngIf="msg.widget" class="mt-3 pt-3 border-t border-white/5 space-y-2">
                <!-- If available trucks list requested -->
                <div *ngIf="msg.widget.type === 'available_trucks'" class="space-y-1.5">
                  <div *ngFor="let trk of msg.widget.data" class="flex justify-between items-center text-[10px] p-1.5 bg-slate-100/70 dark:bg-slate-950/40 rounded border border-white/5">
                    <span class="font-bold text-white">{{ trk.name }}</span>
                    <span class="text-slate-400">{{ trk.reg }} | Health: {{ trk.health }}%</span>
                  </div>
                </div>

                <!-- If top driver metrics requested -->
                <div *ngIf="msg.widget.type === 'top_driver'" class="p-2 bg-slate-100/70 dark:bg-slate-950/40 rounded border border-white/5 text-[10px] space-y-1">
                  <p class="font-bold text-white">{{ msg.widget.data.name }}</p>
                  <p class="text-slate-400">Driving EcoScore: {{ msg.widget.data.score }}%</p>
                  <p class="text-slate-400">Total Safe Mileage: {{ msg.widget.data.mileage }} miles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Prompts suggestions -->
        <div class="px-4 py-2 border-t border-white/5 bg-slate-100/70 dark:bg-slate-950/40 flex flex-wrap gap-1.5 items-center">
          <button *ngFor="let prompt of quickPrompts" 
                  (click)="sendQuickPrompt(prompt)"
                  class="text-[9px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors">
            {{ prompt }}
          </button>
        </div>

        <!-- Chat Input field -->
        <div class="p-3 border-t border-white/5 bg-slate-100 dark:bg-slate-950/80 flex gap-2">
          <input type="text" 
                 [(ngModel)]="chatInput"
                 (keyup.enter)="sendChatMessage()"
                 placeholder="Ask Co-Pilot (e.g. show available trucks)..." 
                 class="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"/>
          <button (click)="sendChatMessage()"
                  class="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shrink-0 glow-blue transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  apiService = inject(ApiService);
  websocketService = inject(WebsocketService);

  loading = signal<boolean>(false);
  kpis = signal<any>({
    activeVehicles: 124,
    availableVehicles: 72,
    vehiclesInMaintenance: 4,
    activeTrips: 182,
    pendingTrips: 22,
    driversOnDuty: 146,
    fleetUtilization: 94
  });

  recentTrips = signal<any[]>([]);
  vehicleStatuses = signal<any[]>([]);

  filters = {
    type: '',
    status: '',
    region: '',
    date: ''
  };

  private wsSub: Subscription | null = null;

  utilizationFormatted = computed(() => {
    return `${this.kpis().fleetUtilization || 0}%`;
  });

  // Trip orchestration state signals
  currentStep = signal<number>(1);
  selectedRoute = signal<any | null>(null);
  selectedTruck = signal<any | null>(null);
  selectedDriver = signal<any | null>(null);
  cargoWeight = signal<number>(5000);
  isDispatching = signal<boolean>(false);
  isDispatchingActive = signal<boolean>(false);

  // AI Assistant signals
  isChatOpen = signal<boolean>(false);
  chatInput: string = '';
  chatMessages: ChatMessage[] = [
    { sender: 'ai', text: 'Hello Commander! I am your AI Fleet Assistant. How can I optimize operations today?', timestamp: new Date() }
  ];

  quickPrompts: string[] = [
    'Show available trucks',
    'Best driver today',
    'Maintenance issues',
    'Fuel expenses'
  ];

  // Mock static data arrays for interactive wizard
  mockRoutes = [
    { id: '1', name: 'West Depot (LA) to Chicago Hub', code: 'LAX-CHI-04', distance: 1820, time: '26 hrs' },
    { id: '2', name: 'Seattle Terminal to East Depot (NY)', code: 'SEA-NYC-01', distance: 2900, time: '42 hrs' },
    { id: '3', name: 'Dallas Warehouse to North Depot (CHI)', code: 'DAL-CHI-09', distance: 980, time: '14 hrs' }
  ];

  mockTrucks = [
    { id: '1', name: 'Tesla Semi Electric (LAX-04)', reg: 'TSLA-0441', health: 98, efficiency: '1.2 kWh/mi', aiRecommended: true },
    { id: '2', name: 'Volvo VNL 860 (VLV-18)', reg: 'VLV-1832', health: 92, efficiency: '7.8 mpg', aiRecommended: false },
    { id: '3', name: 'Freightliner Cascadia (FRT-44)', reg: 'FRT-4491', health: 74, efficiency: '7.2 mpg', aiRecommended: false }
  ];

  mockDrivers = [
    { id: '1', name: 'Marcus Vance', score: '4.98', exp: '12 yrs', style: 'Highly Conservative' },
    { id: '2', name: 'Elena Rostova', score: '4.95', exp: '8 yrs', style: 'Optimal Regenerative' },
    { id: '3', name: 'Devang Panchal', score: '4.88', exp: '5 yrs', style: 'Fast Delivery' }
  ];

  mockRegistryVehicles = [
    { name: 'Tesla Semi Electric #04', reg: 'TSLA-0441', efficiency: '1.25 kWh/mi', health: 98, status: 'AVAILABLE', driver: 'Elena Rostova', trip: 'None (Standby)' },
    { name: 'Volvo VNL 860 #18', reg: 'VLV-1832', efficiency: '7.8 mpg', health: 92, status: 'ON_TRIP', driver: 'Marcus Vance', trip: 'Route DAL-CHI-09' },
    { name: 'Freightliner Cascadia #44', reg: 'FRT-4491', efficiency: '7.2 mpg', health: 74, status: 'IN_SHOP', driver: 'None (Assigned Ramirez)', trip: 'Brake Disc Service' },
    { name: 'Tesla Semi Electric #09', reg: 'TSLA-0982', efficiency: '1.21 kWh/mi', health: 97, status: 'AVAILABLE', driver: 'Devang Panchal', trip: 'None (Standby)' }
  ];

  constructor() {
    // Sync realtime updates
    effect(() => {
      const update = this.websocketService.kpiUpdates();
      if (update) {
        this.kpis.update(current => ({
          ...current,
          activeVehicles: update.active_vehicles ?? current.activeVehicles,
          availableVehicles: update.available_vehicles ?? current.availableVehicles,
          vehiclesInMaintenance: update.vehicles_in_maintenance ?? current.vehiclesInMaintenance,
          activeTrips: update.active_trips ?? current.activeTrips,
          pendingTrips: update.pending_trips ?? current.pendingTrips,
          driversOnDuty: update.drivers_on_duty ?? current.driversOnDuty,
          fleetUtilization: update.fleet_utilization ?? current.fleetUtilization
        }));
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
  }

  loadDashboardData() {
    this.loading.set(true);
    this.apiService.get<any>('/dashboard', this.filters).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          const data = res.data;
          this.kpis.set({
            activeVehicles: data.active_vehicles || 124,
            availableVehicles: data.available_vehicles || 72,
            vehiclesInMaintenance: data.vehicles_in_maintenance || 4,
            activeTrips: data.active_trips || 182,
            pendingTrips: data.pending_trips || 22,
            driversOnDuty: data.drivers_on_duty || 146,
            fleetUtilization: data.fleet_utilization || 94
          });
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  // Stepper functions
  canProceed(): boolean {
    if (this.currentStep() === 1) return !!this.selectedRoute();
    if (this.currentStep() === 2) return !!this.selectedTruck();
    if (this.currentStep() === 3) return !!this.selectedDriver();
    return true;
  }

  nextStep() {
    if (this.currentStep() < 5) {
      this.currentStep.update(n => n + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(n => n - 1);
    }
  }

  selectRoute(route: any) {
    this.selectedRoute.set(route);
  }

  selectTruck(truck: any) {
    this.selectedTruck.set(truck);
  }

  selectDriver(driver: any) {
    this.selectedDriver.set(driver);
  }

  dispatchTrip() {
    // Trigger flying dispatch animation
    this.isDispatching.set(true);
    
    // Simulate flying animation timing
    setTimeout(() => {
      this.isDispatching.set(false);
      this.isDispatchingActive.set(true);
      
      // Update counters dynamically
      this.kpis.update(curr => ({
        ...curr,
        activeTrips: curr.activeTrips + 1,
        activeVehicles: curr.activeVehicles + 1,
        availableVehicles: curr.availableVehicles - 1
      }));

      // Reset stepper
      this.currentStep.set(1);
      this.selectedRoute.set(null);
      this.selectedTruck.set(null);
      this.selectedDriver.set(null);
      this.cargoWeight.set(5000);
      
      // Display mock system toast inside dashboard logs
      const infoMsg = `🚨 DISPATCH LAUNCHED: Tesla Semi #04 assigned to ${this.mockRoutes[0].name}. Cargo Load: 8,400kg. Safety clearance verified.`;
      console.log(infoMsg);
    }, 800);
  }

  // Floating Chat Assistant Functions
  toggleChat() {
    this.isChatOpen.update(v => !v);
  }

  sendQuickPrompt(promptText: string) {
    this.chatMessages.push({ sender: 'user', text: promptText, timestamp: new Date() });
    
    setTimeout(() => {
      let aiText = '';
      let widgetData: any = null;

      if (promptText === 'Show available trucks') {
        aiText = 'Here are the available high-health trucks currently standing by in the West Coast Depot:';
        widgetData = {
          type: 'available_trucks',
          data: [
            { name: 'Tesla Semi #04', reg: 'TSLA-0441', health: 98 },
            { name: 'Tesla Semi #09', reg: 'TSLA-0982', health: 97 }
          ]
        };
      } else if (promptText === 'Best driver today') {
        aiText = 'The best performing operator today based on EcoScore safety and regenerative brake profiling is:';
        widgetData = {
          type: 'top_driver',
          data: {
            name: 'Marcus Vance',
            score: 98.4,
            mileage: 1840
          }
        };
      } else if (promptText === 'Maintenance issues') {
        aiText = 'There is 1 high-priority predictive maintenance warning flagged. Semi-Truck #FL-0443 (Freightliner) exhibits thermal expansion anomaly on brake rotor #3. Scheduling is recommended in the next 450 miles.';
      } else if (promptText === 'Fuel expenses') {
        aiText = 'Month-to-date fuel cost is $13,310, representing 55% of your total operational outlay. Integrating cooperative platooning along I-80 routes is projected to save 8.4% this week.';
      }

      this.chatMessages.push({
        sender: 'ai',
        text: aiText,
        timestamp: new Date(),
        widget: widgetData
      });
    }, 600);
  }

  sendChatMessage() {
    if (!this.chatInput.trim()) return;
    const text = this.chatInput;
    this.chatMessages.push({ sender: 'user', text: text, timestamp: new Date() });
    this.chatInput = '';

    setTimeout(() => {
      this.chatMessages.push({
        sender: 'ai',
        text: `I received your command: "${text}". As your co-pilot, I recommend analyzing available vehicles and scheduling routing plans using the interactive dashboard widgets.`,
        timestamp: new Date()
      });
    }, 600);
  }
}
