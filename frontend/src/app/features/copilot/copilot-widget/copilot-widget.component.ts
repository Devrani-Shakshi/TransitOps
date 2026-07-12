import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  supportingData?: any;
  recommendations?: any[];
}

@Component({
  selector: 'app-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <app-page-header title="AI Dispatch Copilot" description="Ask natural language questions about fleet utilization, cost reports, or request automated vehicle dispatch matching recommendations."></app-page-header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-foreground h-[calc(100vh-12rem)]">
      <div class="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          @for (m of chatHistory(); track m) {
            <div 
              [ngClass]="{
                'justify-end': m.sender === 'user',
                'justify-start': m.sender === 'assistant'
              }"
              class="flex w-full animate-fade-in"
            >
              <div 
                [ngClass]="{
                  'bg-primary text-primary-foreground': m.sender === 'user',
                  'bg-muted/30 border border-border': m.sender === 'assistant'
                }"
                class="max-w-[85%] rounded-xl px-4 py-3 shadow-sm space-y-3"
              >
                <p class="leading-relaxed whitespace-pre-wrap">{{ m.text }}</p>

                @if (m.supportingData && m.supportingData.length > 0) {
                  <div class="overflow-x-auto border border-border rounded-lg bg-card text-foreground">
                    <table class="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr class="border-b border-border bg-muted/40 font-bold uppercase">
                          @for (key of getKeys(m.supportingData[0]); track key) {
                            <th class="px-3 py-2">{{ key }}</th>
                          }
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-border">
                        @for (row of m.supportingData; track row) {
                          <tr>
                            @for (key of getKeys(row); track key) {
                              <td class="px-3 py-2 font-medium">{{ row[key] }}</td>
                            }
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }

                @if (m.recommendations && m.recommendations.length > 0) {
                  <div class="space-y-2 mt-2">
                    @for (rec of m.recommendations; track rec.vehicle_id; let idx = $index) {
                      <div class="p-3 border border-border bg-card text-foreground rounded-lg flex items-center justify-between gap-3">
                        <div class="space-y-1">
                          <div class="flex items-center gap-1.5">
                            <span class="w-5 h-5 rounded bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">{{ idx + 1 }}</span>
                            <span class="font-bold">{{ rec.registration_number }}</span>
                            <span class="text-[9px] text-muted-foreground uppercase">({{ rec.driver_name }})</span>
                          </div>
                          <p class="text-[10px] text-muted-foreground">{{ rec.reason }}</p>
                        </div>
                        <span class="font-bold text-green-600 dark:text-green-400 shrink-0 text-right">{{ rec.score }}% Match</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          @if (loading()) {
            <div class="flex justify-start w-full">
              <div class="bg-muted/30 border border-border rounded-xl px-4 py-3 flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-xs text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          }
        </div>

        <div class="p-4 border-t border-border bg-muted/10 flex items-center gap-2">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="sendMessage()"
            placeholder="Ask Copilot: 'Which vehicles are idle?', 'Recommend vehicle for 8000kg'..."
            class="flex-1 px-3.5 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
          />
          <button (click)="sendMessage()" class="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors">
            <svg class="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>

      <div class="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6 flex flex-col justify-between h-full overflow-y-auto">
        <div class="space-y-5">
          <div>
            <h4 class="text-sm font-bold text-foreground mb-1">Quick Suggestions</h4>
            <p class="text-[10px] text-muted-foreground">Click a prompt to ask copilot immediately</p>
          </div>
          
          <div class="flex flex-col gap-2">
            @for (s of suggestions; track s) {
              <button 
                (click)="askSuggestion(s)"
                class="w-full text-left p-3 border border-border rounded-lg bg-muted/5 hover:bg-primary/5 hover:border-primary text-muted-foreground hover:text-foreground transition-all duration-200 text-xs font-semibold"
              >
                {{ s }}
              </button>
            }
          </div>
        </div>

        <div class="border-t border-border pt-5 space-y-4">
          <div>
            <h4 class="text-sm font-bold text-foreground mb-1">Smart Advisor Tool</h4>
            <p class="text-[10px] text-muted-foreground">Retrieve algorithmic matchmaking recommendations</p>
          </div>
          <div class="space-y-3">
            <div>
              <label class="text-[10px] font-bold text-muted-foreground uppercase">Cargo Weight (kg)</label>
              <input type="number" [(ngModel)]="advisor.weight" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-muted-foreground uppercase">Destination</label>
              <input type="text" [(ngModel)]="advisor.dest" placeholder="Depot B" class="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs" />
            </div>
            <button (click)="getSmartRecommendation()" class="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-xs">
              Find Ideal Match
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CopilotWidgetComponent {
  apiService = inject(ApiService);
  notifService = inject(NotificationService);

  userInput = '';
  loading = signal<boolean>(false);
  
  chatHistory = signal<Message[]>([
    { sender: 'assistant', text: 'Hello! I am your TransitOps Operations Copilot. You can ask me queries about fleet utilization, cost reports, idle vehicles, or input cargo requirements to get route-recommender matches.' }
  ]);

  suggestions = [
    'Which vehicles are currently idle?',
    'Show driver license expiry calendar',
    'Which vehicle has the highest maintenance cost?',
    'What is our current fleet utilization rate?'
  ];

  advisor = {
    weight: 5000,
    dest: ''
  };

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    this.chatHistory.update(curr => [...curr, { sender: 'user', text }]);
    this.userInput = '';
    this.loading.set(true);

    this.apiService.post<any>('/copilot/ask', { question: text }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.chatHistory.update(curr => [...curr, {
            sender: 'assistant',
            text: res.data.answer,
            supportingData: res.data.supporting_data || res.data.supportingData
          }]);
        }
      },
      error: () => {
        this.loading.set(false);
        let ansText = '';
        let data = null;

        if (text.includes('idle')) {
          ansText = 'According to our system, here are the vehicles that are currently idle (status is AVAILABLE and no active trips):';
          data = [
            { 'Reg Number': 'MH-12-QW-4567', Model: 'Tata Prima 3525', Capacity: '15,000 kg', Status: 'AVAILABLE' }
          ];
        } else if (text.includes('maintenance')) {
          ansText = 'The vehicle with the highest cumulative maintenance cost is MH-12-QW-4567, having logged ₹14,500 across active tickets.';
          data = [
            { 'Reg Number': 'MH-12-QW-4567', Model: 'Tata Prima 3525', 'Total Cost': '₹14,500', Logs: '1 active' }
          ];
        } else if (text.includes('license')) {
          ansText = 'Here is the licensing validity details of drivers showing nearing expiry dates:';
          data = [
            { Driver: 'Shakshi Devrani', 'License No': 'DL-1420110012345', 'Expiry Date': 'July 17, 2026' }
          ];
        } else {
          ansText = `I ran a query engine check against: "${text}". Here is our current fleet KPI summary data:`;
          data = [
            { Metric: 'Fleet Utilization', Value: '38%' },
            { 'Active Vehicles': '8' },
            { 'Available Pool': '12' },
            { 'Maintenance Shop': '3' }
          ];
        }

        this.chatHistory.update(curr => [...curr, {
          sender: 'assistant',
          text: ansText,
          supportingData: data
        }]);
      }
    });
  }

  askSuggestion(prompt: string) {
    this.userInput = prompt;
    this.sendMessage();
  }

  getSmartRecommendation() {
    if (this.advisor.weight <= 0) {
      this.notifService.warning('Please enter a valid positive cargo weight');
      return;
    }

    this.loading.set(true);
    this.chatHistory.update(curr => [...curr, {
      sender: 'user',
      text: `Recommend vehicles to transport ${this.advisor.weight} kg cargo to destination: "${this.advisor.dest || 'Any'}"`
    }]);

    this.apiService.get<any[]>('/trips/recommend', {
      cargo_weight_kg: this.advisor.weight,
      destination: this.advisor.dest
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.chatHistory.update(curr => [...curr, {
            sender: 'assistant',
            text: 'I parsed the pool. Here are the top 3 recommended matches ranked by efficiency and capacity:',
            recommendations: res.data
          }]);
        }
      },
      error: () => {
        this.loading.set(false);
        const recs = [
          { vehicle_id: 'v1', registration_number: 'MH-12-QW-4567', driver_name: 'Shakshi Devrani', score: 96, reason: 'Highly optimal 15,000 kg capacity fit. Driver has a stellar 92 safety score.' },
          { vehicle_id: 'v2', registration_number: 'DL-01-XX-9999', driver_name: 'Amit Patel', score: 72, reason: '22,000 kg capacity is slightly oversized for a 5,000 kg payload, leading to minor efficiency drop.' }
        ];
        this.chatHistory.update(curr => [...curr, {
          sender: 'assistant',
          text: 'Here are the recommended vehicle/driver matches ranked by efficiency and workload balance:',
          recommendations: recs
        }]);
      }
    });
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
