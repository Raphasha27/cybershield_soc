import { Component, signal, effect, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CafeService, Session } from './security.service'; // Keeping filename for now to avoid breaking imports elsewhere if any

declare var Chart: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  @ViewChild('systemTerminal') terminalElement!: ElementRef;
  @ViewChild('aiChatBody') aiChatBody!: ElementRef;

  private cafeService = inject(CafeService);

  // Expose service signals to template
  sessions = this.cafeService.sessions;
  stations = this.cafeService.stations;
  bookings = this.cafeService.bookings;
  logs = this.cafeService.logs;
  loadLevel = this.cafeService.loadLevel;
  performanceMetrics = this.cafeService.performanceMetrics;

  // Local UI State
  currentView = signal('dashboard');
  isAlertPanelOpen = signal(false);
  isAIPanelOpen = signal(false);
  isModalOpen = signal(false);
  selectedSession = signal<Session | null>(null);

  isProfileModalOpen = signal(false);
  adminProfile = signal({
    name: 'Cafe Admin',
    role: 'Operations Manager',
    department: 'Front Desk'
  });

  notifications = signal([
    { id: 1, title: 'Maintenance Required', message: 'Station PC-05 needs a thermal paste update.', type: 'warning' },
    { id: 2, title: 'Session Ending', message: 'User Alex Gaming (PC-01) has 5 minutes left.', type: 'info' },
    { id: 3, title: 'High Load Alert', message: '90% of gaming stations are occupied.', type: 'critical' }
  ]);

  toasts = signal<any[]>([]);
  aiMessages = signal<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Welcome to Kivoc Denamic Technology. I am your operations assistant. How can I help with the hub today?' }
  ]);

  constructor() {
    effect(() => {
      if (this.currentView() === 'dashboard') {
        this.initCharts();
      }
    });

    effect(() => {
      this.logs();
      setTimeout(() => this.scrollTerminal(), 0);
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  setView(view: string) {
    this.currentView.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast('Switching to ' + view, 'info', '📁');
  }

  toggleAlertPanel() {
    this.isAlertPanelOpen.update((v: boolean) => !v);
    if (this.isAIPanelOpen()) this.isAIPanelOpen.set(false);
  }

  toggleAI() {
    this.isAIPanelOpen.update((v: boolean) => !v);
    if (this.isAlertPanelOpen()) this.isAlertPanelOpen.set(false);
    setTimeout(() => this.scrollAIChat(), 100);
  }

  openSession(session: Session) {
    this.selectedSession.set(session);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  updateSessionStatus(id: string, status: any) {
    this.cafeService.updateSessionStatus(id, status);
    this.showToast(`Session ${id} marked as ${status}`, 'info', '📋');
  }

  toggleProfileModal() {
    this.isProfileModalOpen.update((v: boolean) => !v);
  }

  saveProfile(name: string, role: string, dept: string) {
    this.adminProfile.set({ name, role, department: dept });
    this.showToast('Profile updated successfully', 'success', '👤');
    this.isProfileModalOpen.set(false);
  }

  clearNotifications() {
    this.notifications.set([]);
    this.showToast('All notifications cleared', 'success', '🧹');
  }

  search(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (query) {
      this.showToast(`Searching for "${query}"...`, 'info', '🔎');
    }
  }

  performStationAction(station: any) {
    this.showToast(`Running diagnostics on ${station.id}...`, 'warning', '🔧');
    setTimeout(() => {
      this.showToast(`Diagnostics for ${station.id} completed. System healthy.`, 'success', '✅');
    }, 2000);
  }

  generateReport() {
    this.showToast('Compiling daily revenue and occupancy report...', 'info', '📊');
    setTimeout(() => {
      this.showToast('Report generated successfully', 'success', '✅');
    }, 3000);
  }

  lockStation() {
    const id = this.selectedSession()?.stationId;
    this.showToast(`Locking station ${id}...`, 'critical', '🔒');
    setTimeout(() => {
      this.showToast(`Station ${id} locked. Session suspended.`, 'success', '🛡️');
      this.closeModal();
    }, 1500);
  }

  extendSession() {
    this.showToast('Adding 30 minutes to session...', 'warning', '⏳');
    setTimeout(() => {
      this.showToast('Session extended by 30m', 'info', '⌛');
      this.closeModal();
    }, 1000);
  }

  sendAIMessage(text: string) {
    if (!text.trim()) return;

    this.aiMessages.update((msgs: any[]) => [...msgs, { role: 'user', text }]);
    setTimeout(() => this.scrollAIChat(), 0);

    setTimeout(() => {
      let response = "I'm checking the current floor status for you.";
      const lowText = text.toLowerCase();
      if (lowText.includes('station') || lowText.includes('free')) {
        const free = this.stations().filter((s: any) => s.status === 'Available').length;
        response = `There are currently ${free} stations available. I recommend PC-02 for gaming as it has the best specs.`;
      } else if (lowText.includes('session') || lowText.includes('user')) {
        response = `We have ${this.sessions().length} active sessions. 2 sessions are nearing their end time.`;
      }

      this.aiMessages.update((msgs: any[]) => [...msgs, { role: 'bot', text: response }]);
      setTimeout(() => this.scrollAIChat(), 0);
    }, 1000);
  }

  private scrollTerminal() {
    if (this.terminalElement) {
      this.terminalElement.nativeElement.scrollTop = this.terminalElement.nativeElement.scrollHeight;
    }
  }

  private scrollAIChat() {
    if (this.aiChatBody) {
      this.aiChatBody.nativeElement.scrollTop = this.aiChatBody.nativeElement.scrollHeight;
    }
  }

  private showToast(message: string, type: string = 'info', icon: string = 'ℹ️') {
    const id = Date.now();
    this.toasts.update((t: any[]) => [...t, { id, message, type, icon }]);
    setTimeout(() => {
      this.toasts.update((t: any[]) => t.filter((toast: any) => toast.id !== id));
    }, 4000);
  }

  private initCharts() {
    setTimeout(() => {
      const timelineCtx = document.getElementById('occupancyTimelineChart') as any;
      if (timelineCtx) {
        new Chart(timelineCtx, {
          type: 'line',
          data: {
            labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            datasets: [
              {
                label: 'Occupancy %',
                data: [10, 35, 60, 85, 75, 95, 90, 40],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(75, 85, 99, 0.1)' }, ticks: { color: '#9ca3af' } },
              x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
            }
          }
        });
      }

      const trafficCtx = document.getElementById('revenueChart') as any;
      if (trafficCtx) {
        new Chart(trafficCtx, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Daily Revenue (R)',
              data: [1200, 1500, 1100, 1800, 2500, 3500, 2800],
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(75, 85, 99, 0.1)' }, ticks: { color: '#9ca3af' } },
              x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
            }
          }
        });
      }
    }, 100);
  }

  getSessionsByStatus(status: string) {
    return this.sessions().filter((i: Session) => i.status === status);
  }
}

