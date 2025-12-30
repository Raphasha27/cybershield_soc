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
  isModalOpen = signal(false);
  selectedIncident = signal<Incident | null>(null);

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
  }

  toggleAlertPanel() {
    this.isAlertPanelOpen.update((v: boolean) => !v);
  }

  openIncident(incident: Incident) {
    this.selectedIncident.set(incident);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  private scrollTerminal() {
    if (this.terminalElement) {
      this.terminalElement.nativeElement.scrollTop = this.terminalElement.nativeElement.scrollHeight;
    }
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
