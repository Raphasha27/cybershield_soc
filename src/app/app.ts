import { Component, signal, effect, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityService, Incident } from './security.service';

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

  private securityService = inject(SecurityService);

  // Expose service signals to template
  incidents = this.securityService.incidents;
  threats = this.securityService.threats;
  vulnerabilities = this.securityService.vulnerabilities;
  logs = this.securityService.logs;
  threatLevel = this.securityService.threatLevel;
  complianceFrameworks = this.securityService.complianceFrameworks;

  // Local UI State
  currentView = signal('dashboard');
  isAlertPanelOpen = signal(false);
  isAIPanelOpen = signal(false);
  isModalOpen = signal(false);
  selectedIncident = signal<Incident | null>(null);
  
  isProfileModalOpen = signal(false);
  adminProfile = signal({
    name: 'Admin',
    role: 'Security Analyst',
    department: 'Cyber Operations'
  });

  notifications = signal([
    { id: 1, title: 'Critical Threat Detected', message: 'Zero-day exploit attempt on HR Database.', type: 'critical' },
    { id: 2, title: 'Unusual Traffic Pattern', message: 'Spike in outbound traffic from workstation-7.', type: 'warning' },
    { id: 3, title: 'Compliance Alert', message: 'NIST framework audit nearing deadline.', type: 'info' }
  ]);

  toasts = signal<any[]>([]);
  aiMessages = signal<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Hello Analyst. I am CyberSentinel AI. How can I help you secure the perimeter today?' }
  ]);

  constructor() {
    effect(() => {
      if (this.currentView() === 'dashboard') {
        this.initCharts();
      }
    });

    // Handle terminal auto-scroll when logs change
    effect(() => {
      this.logs(); // Dependency
      setTimeout(() => this.scrollTerminal(), 0);
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  // Actions
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

  openIncident(incident: Incident) {
    this.selectedIncident.set(incident);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  updateIncidentStatus(id: string, status: any) {
    this.securityService.updateIncidentStatus(id, status);
    this.showToast(`Incident ${id} moved to ${status}`, 'info', '📋');
  }

  toggleProfileModal() {
    this.isProfileModalOpen.update(v => !v);
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

  search(event: any) {
    const query = (event.target as HTMLInputElement).value;
    if (query) {
      this.showToast(`Searching for "${query}"...`, 'info', '🔎');
    }
  }

  performThreatAction(threat: any) {
    this.showToast(`Analyzing threat ${threat.id}...`, 'warning', '🧪');
    setTimeout(() => {
      this.showToast(`Threat ${threat.id} has been isolated`, 'success', '🛡️');
    }, 2000);
  }

  generateReport() {
    this.showToast('Compiling security metrics...', 'info', '📊');
    setTimeout(() => {
      this.showToast('Report generated successfully', 'success', '✅');
    }, 3000);
  }

  isolateSystem() {
    const id = this.selectedIncident()?.id;
    this.showToast(`Initiating isolation for ${id}...`, 'critical', '🔒');
    setTimeout(() => {
      this.showToast(`System ${id} successfully isolated from network`, 'success', '🛡️');
      this.closeModal();
    }, 2500);
  }

  escalateIncident() {
    this.showToast('Escalating to Level 2 security response team...', 'warning', '📢');
    setTimeout(() => {
      this.showToast('Escalation confirmed', 'info', '📤');
      this.closeModal();
    }, 1500);
  }

  sendAIMessage(text: string) {
    if (!text.trim()) return;
    
    this.aiMessages.update(msgs => [...msgs, { role: 'user', text }]);
    setTimeout(() => this.scrollAIChat(), 0);

    // Simple bot logic
    setTimeout(() => {
      let response = "I'm analyzing the data patterns for you.";
      if (text.toLowerCase().includes('threat')) {
        response = `Current threat level is ${this.threatLevel().toFixed(1)}%. I recommend reviewing the latest DDoS attempts from ${this.threats()[0].source}.`;
      } else if (text.toLowerCase().includes('incident')) {
        response = `There are ${this.incidents().length} active incidents. The most critical is ${this.incidents()[1].type}.`;
      }
      
      this.aiMessages.update(msgs => [...msgs, { role: 'bot', text: response }]);
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
    this.toasts.update(t => [...t, { id, message, type, icon }]);
    setTimeout(() => {
      this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, 4000);
  }

  private initCharts() {
    setTimeout(() => {
      const timelineCtx = document.getElementById('threatTimelineChart') as any;
      if (timelineCtx) {
        new Chart(timelineCtx, {
          type: 'line',
          data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [
              {
                label: 'Critical Threats',
                data: [12, 19, 3, 5, 2, 3, 10],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
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

      const trafficCtx = document.getElementById('networkTrafficChart') as any;
      if (trafficCtx) {
        new Chart(trafficCtx, {
          type: 'bar',
          data: {
            labels: ['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5'],
            datasets: [{
              label: 'Traffic Vol (GB)',
              data: [65, 59, 80, 81, 56],
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

  getIncidentsByStatus(status: string) {
    return this.incidents().filter((i: Incident) => i.status === status);
  }
}
