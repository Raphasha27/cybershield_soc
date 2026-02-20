import { Component, signal, effect, ElementRef, ViewChild, AfterViewInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityService, Incident, EnterpriseDevice } from './security.service';

declare var Chart: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('systemTerminal') terminalElement!: ElementRef;
  @ViewChild('aiChatBody') aiChatBody!: ElementRef;

  private securityService = inject(SecurityService);
  private chartInstances: any[] = [];
  private intervals: any[] = [];

  // Service signals
  incidents = this.securityService.incidents;
  threats = this.securityService.threats;
  vulnerabilities = this.securityService.vulnerabilities;
  logs = this.securityService.logs;
  threatLevel = this.securityService.threatLevel;
  complianceFrameworks = this.securityService.complianceFrameworks;
  darknetFeed = this.securityService.darknetFeed;
  attackSources = this.securityService.attackSources;

  // ML & Checkup Service Signals
  mlStatus = this.securityService.mlStatus;
  checkupResults = this.securityService.checkupResults;
  isSystemScanning = this.securityService.isSystemScanning;
  enterpriseDevices = this.securityService.enterpriseDevices;
  commShieldAlerts = this.securityService.commShieldAlerts;
  fleetStatus = this.securityService.fleetStatus;

  // UI State
  // Auth State
  isLoggedIn = signal(false);
  currentView = signal('landing');
  loginError = signal('');
  isLoginLoading = signal(false);
  isAlertPanelOpen = signal(false);
  isAIPanelOpen = signal(false);
  isModalOpen = signal(false);
  selectedIncident = signal<Incident | null>(null);
  isProfileModalOpen = signal(false);
  isScannerActive = signal(false);
  scanProgress = signal(0);
  chartTimeRange = signal<'24H' | '7D' | '30D'>('24H');
  searchQuery = signal('');
  isSearchFocused = signal(false);

  // Checkup Form State
  checkupForm = signal({
    email: '',
    idNumber: '',
    phone: ''
  });

  adminProfile = signal({
    name: 'SOC Admin',
    role: 'Senior Security Analyst',
    department: 'Cyber Operations — JHB'
  });

  notifications = signal([
    { id: 1, title: 'Critical Threat Detected', message: 'Zero-day exploit attempt on HR Database cluster.', type: 'critical', time: '14:05' },
    { id: 2, title: 'Unusual Traffic Pattern', message: 'Spike in outbound traffic from Finance-PC-07. Possible C2 beacon.', type: 'warning', time: '13:51' },
    { id: 3, title: 'Darknet Alert', message: 'Company domain found in credential dump on dark web forum.', type: 'critical', time: '13:30' },
    { id: 4, title: 'Compliance Deadline', message: 'NIST CSF quarterly review due in 3 days. 8 controls pending.', type: 'info', time: '09:00' },
  ]);

  toasts = signal<any[]>([]);
  aiMessages = signal<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: '👋 Hello, Analyst. I am CyberSentinel AI v3.0 — your intelligent threat response partner.\n\nI can analyze active threats, summarize incidents, assess compliance posture, or scan the darknet feed. How can I help secure the perimeter?' }
  ]);
  isAITyping = signal(false);

  // Live stat counters (animated)
  displayedCriticalAlerts = signal(0);
  displayedActiveIncidents = signal(0);
  displayedVulnerabilities = signal(0);
  displayedSystemsProtected = signal(0);

  // Derived counts used in template
  criticalDarknetCount = () => this.darknetFeed().filter((d: { risk: string }) => d.risk === 'critical').length;
  readonly navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
    { id: 'threats', label: 'Threats', icon: '⚡' },
    { id: 'incidents', label: 'Incidents', icon: '🔥' },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: '🔓' },
    { id: 'enterprise', label: 'Enterprise Hub', icon: '🏢' },
    { id: 'comm-shield', label: 'Neural Shield', icon: '🛡' },
    { id: 'compliance', label: 'Compliance', icon: '✓' },
    { id: 'checkup', label: 'System Checkup', icon: '🔍' },
  ];

  constructor() {
    // Re-init charts when switching to dashboard
    effect(() => {
      if (this.currentView() === 'dashboard') {
        setTimeout(() => this.initCharts(), 150);
      }
    });

    // Auto-scroll terminal
    effect(() => {
      this.logs();
      setTimeout(() => this.scrollTerminal(), 0);
    });

    // Animate counters on init
    this.animateCounters();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initCharts(), 200);
  }

  ngOnDestroy() {
    this.intervals.forEach(id => clearInterval(id));
    this.chartInstances.forEach(c => { try { c.destroy(); } catch (_) { } });
  }

  // === NAVIGATION ===
  // === NAVIGATION & AUTH ===
  setView(view: string) {
    if (!this.isLoggedIn() && view !== 'landing' && view !== 'login') {
      this.currentView.set('login');
      return;
    }
    this.currentView.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStarted() {
    this.currentView.set('get-started');
  }

  login(email: string, pass: string) {
    if (!email || !pass) {
      this.showToast('Please enter both email and password', 'error', '✕');
      return;
    }

    this.isLoginLoading.set(true);
    this.loginError.set('');

    // Mock authentication delay
    setTimeout(() => {
      this.isLoginLoading.set(false);
      this.isLoggedIn.set(true);
      this.currentView.set('dashboard');
      this.showToast('Authentication successful — Welcome, ' + this.adminProfile().name, 'success', '✓');
      this.animateCounters(); // Re-animate counters for the logged-in user
      this.initDeviceSimulations();
    }, 1500);
  }

  initDeviceSimulations() {
    const id = setInterval(() => {
      // Simulate location drift for fleet
      this.enterpriseDevices().forEach((dev: EnterpriseDevice) => {
        if (dev.location) {
          dev.location.lat += (Math.random() - 0.5) * 0.001;
          dev.location.lng += (Math.random() - 0.5) * 0.001;
        }
      });
    }, 5000);
    this.intervals.push(id);
  }

  logout() {
    this.isLoggedIn.set(false);
    this.currentView.set('landing');
    this.showToast('Successfully logged out from SOC network', 'info', '🔓');
  }

  // === PANELS ===
  toggleAlertPanel() {
    this.isAlertPanelOpen.update((v: boolean) => !v);
    if (this.isAIPanelOpen()) this.isAIPanelOpen.set(false);
  }

  toggleAI() {
    this.isAIPanelOpen.update((v: boolean) => !v);
    if (this.isAlertPanelOpen()) this.isAlertPanelOpen.set(false);
    setTimeout(() => this.scrollAIChat(), 100);
  }

  // === INCIDENTS ===
  openIncident(incident: Incident) {
    this.selectedIncident.set(incident);
    this.isModalOpen.set(true);
  }

  closeModal() { this.isModalOpen.set(false); }

  updateIncidentStatus(id: string, status: any) {
    this.securityService.updateIncidentStatus(id, status);
    const labels: Record<string, string> = {
      investigating: 'Under Investigation',
      containing: 'Being Contained',
      resolved: 'Resolved ✓',
      detected: 'Reopened'
    };
    this.showToast(`INC ${id} → ${labels[status] ?? status}`, 'info', '🔄');
  }

  getIncidentsByStatus(status: string) {
    return this.incidents().filter((i: Incident) => i.status === status);
  }

  isolateSystem() {
    const id = this.selectedIncident()?.id;
    this.showToast(`Initiating network isolation for ${id}...`, 'critical', '🔒');
    setTimeout(() => {
      this.showToast(`✓ System isolated. Incident ${id} queued for forensics.`, 'success', '🛡️');
      this.closeModal();
    }, 2500);
  }

  escalateIncident() {
    this.showToast('Escalating to Level-2 CSIRT team...', 'warning', '📢');
    setTimeout(() => {
      this.showToast('Escalation acknowledged by CSIRT', 'success', '📤');
      this.closeModal();
    }, 1500);
  }

  // === THREATS ===
  performThreatAction(threat: any) {
    this.showToast(`Running deep analysis on ${threat.id}...`, 'warning', '🔬');
    setTimeout(() => {
      this.showToast(`Threat ${threat.id} blocked & source IP blacklisted`, 'success', '🛡️');
    }, 2200);
  }

  // === SCANNER ===
  runScan() {
    if (this.isScannerActive()) return;
    this.isScannerActive.set(true);
    this.scanProgress.set(0);
    this.showToast('Full network vulnerability scan initiated...', 'info', '📡');

    const step = setInterval(() => {
      this.scanProgress.update((v: number) => {
        const next = v + Math.random() * 8;
        if (next >= 100) {
          clearInterval(step);
          setTimeout(() => {
            this.isScannerActive.set(false);
            this.scanProgress.set(0);
            this.showToast('Scan complete — 6 new vulnerabilities discovered', 'warning', '✅');
          }, 500);
          return 100;
        }
        return next;
      });
    }, 250);
  }

  // === CHART TIME RANGE ===
  setChartRange(range: string) {
    this.chartTimeRange.set(range as '24H' | '7D' | '30D');
    this.destroyCharts();
    setTimeout(() => this.initCharts(), 100);
  }

  // === PROFILE ===
  toggleProfileModal() { this.isProfileModalOpen.update((v: boolean) => !v); }

  saveProfile(name: string, role: string, dept: string) {
    this.adminProfile.set({ name, role, department: dept });
    this.showToast('Profile updated successfully', 'success', '👤');
    this.isProfileModalOpen.set(false);
  }

  // === SYSTEM CHECKUP & ML ===
  updateCheckupForm(field: string, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.checkupForm.update((f: any) => ({ ...f, [field]: val }));
  }

  runPersonalCheckup() {
    const data = this.checkupForm();
    if (!data.email && !data.idNumber && !data.phone) {
      this.showToast('Please provide at least one identifier for the ML scan', 'error', '⚠️');
      return;
    }
    this.showToast('Initiating ML-driven identity integrity scan...', 'info', '🧠');
    this.securityService.performSystemCheckup(data);
  }

  trainModel() {
    this.showToast('Neural network training initialized with new entropy data...', 'info', '⚙️');
    this.securityService.trainMLModel();
  }

  // === NOTIFICATIONS ===
  clearNotifications() {
    this.notifications.set([]);
    this.showToast('All alerts cleared', 'success', '🧹');
  }

  // === SEARCH ===
  search(event: any) {
    const q = (event.target as HTMLInputElement).value.trim();
    this.searchQuery.set(q);
    if (q) this.showToast(`Searching across all modules for "${q}"...`, 'info', '🔎');
  }

  // === COMPLIANCE ===
  generateReport() {
    this.showToast('Compiling compliance metrics across 6 frameworks...', 'info', '📊');
    setTimeout(() => this.showToast('Executive Security Report generated (PDF)', 'success', '✅'), 3200);
  }

  // === AI ASSISTANT ===
  sendAIMessage(text: string) {
    if (!text.trim()) return;

    this.aiMessages.update((msgs: { role: 'user' | 'bot'; text: string }[]) => [...msgs, { role: 'user' as const, text }]);
    this.isAITyping.set(true);
    setTimeout(() => this.scrollAIChat(), 0);

    const lower = text.toLowerCase();
    let response = "I'm cross-referencing threat intelligence databases. Can you provide more context about the specific system or event?";

    if (lower.includes('threat') || lower.includes('level')) {
      const level = this.threatLevel().toFixed(1);
      const label = +level > 80 ? 'CRITICAL' : +level > 60 ? 'ELEVATED' : 'MODERATE';
      response = `📊 Current threat level: **${level}%** (${label})\n\nTop active vector: ${this.threats()[0]?.type} from ${this.threats()[0]?.source}.\n\nRecommendation: Review TH-1004 Zero-day exploit targeting HR Database — patching is urgent (CVSS 9.8).`;
    } else if (lower.includes('incident')) {
      const total = this.incidents().length;
      const crit = this.incidents().filter((i: Incident) => i.severity === 'critical').length;
      response = `🔥 **${total} active incidents** tracked:\n• ${crit} critical severity\n• ${this.getIncidentsByStatus('detected').length} newly detected\n• ${this.getIncidentsByStatus('resolved').length} resolved\n\nHighest priority: INC-2026-002 (LockBit 3.0 ransomware on Workstation-42).`;
    } else if (lower.includes('darknet') || lower.includes('dark web')) {
      const critical = this.darknetFeed().filter((d: { risk: string }) => d.risk === 'critical').length;
      response = `👁 **Darknet Monitor Active**\n\n${this.darknetFeed().length} items detected on dark web:\n• ${critical} critical-risk entries\n• Company credentials found in active dump (DN-001)\n• Zero-day listing for internal ERP (DN-005) asking $45,000\n\nImmediate action: Force password reset for all employees and rotate API keys.`;
    } else if (lower.includes('vulnerab') || lower.includes('cve')) {
      const top = this.vulnerabilities()[0];
      response = `🔓 **${this.vulnerabilities().length} vulnerabilities** tracked:\n\nHighest risk: ${top.id} — "${top.title}"\nCVSS Score: ${top.score}/10 | Affecting ${top.systems} systems\n\nApply patch ${top.patch} immediately. Prioritize internet-facing systems first.`;
    } else if (lower.includes('compliance') || lower.includes('gdpr') || lower.includes('nist') || lower.includes('iso')) {
      const avg = (this.complianceFrameworks().reduce((sum: number, f: { score: number }) => sum + f.score, 0) / this.complianceFrameworks().length).toFixed(1);
      response = `✅ **Compliance Overview** (Avg: ${avg}%)\n\n• GDPR/POPIA: 95% ✓ Healthy\n• NIST CSF 2.0: 92% ✓ Healthy\n• ISO 27001: 87% ⚠️ Review needed\n• PCI DSS v4.0: 78% ⚠️ 22 controls failing\n\nRecommend: Schedule PCI DSS gap assessment within 7 days.`;
    } else if (lower.includes('scan') || lower.includes('network')) {
      response = `📡 **Network Scan Capabilities**\n\nI can initiate:\n• Full vulnerability scan (all 1,247 endpoints)\n• Port scan on DMZ segments\n• EDR health check across managed devices\n\nClick **"Run Full Scan"** in the Vulnerabilities view, or I can trigger a targeted scan. Which subnet should I prioritize?`;
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('help')) {
      response = `👋 I'm CyberSentinel AI v3.0. Here's what I can help with:\n\n• **Threat Analysis** — "Analyze current threats"\n• **Incident Summary** — "Summarize incidents"\n• **Darknet Intel** — "Check darknet activity"\n• **Compliance** — "Compliance status"\n• **Vulnerabilities** — "Show top vulnerabilities"\n\nWhat would you like to investigate?`;
    }

    setTimeout(() => {
      this.isAITyping.set(false);
      this.aiMessages.update((msgs: { role: 'user' | 'bot'; text: string }[]) => [...msgs, { role: 'bot' as const, text: response }]);
      setTimeout(() => this.scrollAIChat(), 0);
    }, 1400);
  }

  // === TOAST ===
  showToast(message: string, type: string = 'info', icon: string = 'ℹ️') {
    const id = Date.now();
    this.toasts.update((t: any[]) => [...t, { id, message, type, icon }]);
    setTimeout(() => this.toasts.update((t: any[]) => t.filter((toast: any) => toast.id !== id)), 4500);
  }

  // === PRIVATE HELPERS ===
  private animateCounters() {
    const targets = { critical: 23, incidents: 47, vulns: 156, systems: 1247 };
    const duration = 1600;
    const fps = 60;
    const frames = duration / (1000 / fps);

    let frame = 0;
    const ticker = setInterval(() => {
      frame++;
      const progress = Math.min(frame / frames, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.displayedCriticalAlerts.set(Math.round(ease * targets.critical));
      this.displayedActiveIncidents.set(Math.round(ease * targets.incidents));
      this.displayedVulnerabilities.set(Math.round(ease * targets.vulns));
      this.displayedSystemsProtected.set(Math.round(ease * targets.systems));

      if (progress >= 1) clearInterval(ticker);
    }, 1000 / fps);
  }

  private scrollTerminal() {
    if (this.terminalElement?.nativeElement) {
      this.terminalElement.nativeElement.scrollTop = this.terminalElement.nativeElement.scrollHeight;
    }
  }

  private scrollAIChat() {
    if (this.aiChatBody?.nativeElement) {
      this.aiChatBody.nativeElement.scrollTop = this.aiChatBody.nativeElement.scrollHeight;
    }
  }

  private destroyCharts() {
    this.chartInstances.forEach(c => { try { c.destroy(); } catch (_) { } });
    this.chartInstances = [];
  }

  private initCharts() {
    this.destroyCharts();

    const range = this.chartTimeRange() as '24H' | '7D' | '30D';
    const timelineData: Record<'24H' | '7D' | '30D', { labels: string[]; critical: number[]; high: number[] }> = {
      '24H': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'], critical: [4, 12, 7, 19, 15, 8, 23], high: [8, 15, 10, 22, 18, 12, 31] },
      '7D': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], critical: [34, 29, 51, 44, 60, 28, 23], high: [50, 43, 70, 62, 80, 42, 47] },
      '30D': { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], critical: [180, 210, 195, 165], high: [240, 275, 260, 210] },
    };
    const td = timelineData[range];

    const timelineCtx = document.getElementById('threatTimelineChart') as HTMLCanvasElement;
    if (timelineCtx) {
      const instance = new Chart(timelineCtx, {
        type: 'line',
        data: {
          labels: td.labels,
          datasets: [
            {
              label: 'Critical',
              data: td.critical,
              borderColor: '#ff0033',
              backgroundColor: 'rgba(255,0,51,0.08)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#ff0033',
              pointRadius: 4,
              borderWidth: 2,
            },
            {
              label: 'High',
              data: td.high,
              borderColor: '#00d4ff',
              backgroundColor: 'rgba(0,212,255,0.06)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#00d4ff',
              pointRadius: 4,
              borderWidth: 2,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { labels: { color: '#7b8db0', font: { family: 'JetBrains Mono', size: 11 }, boxWidth: 12 } },
            tooltip: { backgroundColor: 'rgba(8,13,26,0.95)', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1, titleColor: '#e8f0fe', bodyColor: '#7b8db0' }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,212,255,0.05)' }, ticks: { color: '#7b8db0', font: { family: 'JetBrains Mono', size: 10 } } },
            x: { grid: { display: false }, ticks: { color: '#7b8db0', font: { family: 'JetBrains Mono', size: 10 } } }
          }
        }
      });
      this.chartInstances.push(instance);
    }

    const trafficCtx = document.getElementById('networkTrafficChart') as HTMLCanvasElement;
    if (trafficCtx) {
      const instance = new Chart(trafficCtx, {
        type: 'bar',
        data: {
          labels: ['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5', 'Node 6'],
          datasets: [
            {
              label: 'Inbound (GB)',
              data: [65, 59, 80, 81, 56, 72],
              backgroundColor: 'rgba(0,212,255,0.5)',
              borderColor: '#00d4ff',
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: 'Blocked (GB)',
              data: [12, 8, 22, 15, 9, 18],
              backgroundColor: 'rgba(255,0,51,0.4)',
              borderColor: '#ff0033',
              borderWidth: 1,
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#7b8db0', font: { family: 'JetBrains Mono', size: 11 }, boxWidth: 12 } },
            tooltip: { backgroundColor: 'rgba(8,13,26,0.95)', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1 }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,212,255,0.05)' }, ticks: { color: '#7b8db0', font: { family: 'JetBrains Mono', size: 10 } } },
            x: { grid: { display: false }, ticks: { color: '#7b8db0', font: { family: 'JetBrains Mono', size: 10 } } }
          }
        }
      });
      this.chartInstances.push(instance);
    }

    const threatDistCtx = document.getElementById('threatDistChart') as HTMLCanvasElement;
    if (threatDistCtx) {
      const instance = new Chart(threatDistCtx, {
        type: 'doughnut',
        data: {
          labels: ['Critical', 'High', 'Medium', 'Low'],
          datasets: [{
            data: [23, 41, 55, 37],
            backgroundColor: ['rgba(255,0,51,0.8)', 'rgba(255,68,68,0.7)', 'rgba(255,184,0,0.7)', 'rgba(0,255,136,0.6)'],
            borderColor: ['#ff0033', '#ff4444', '#ffb800', '#00ff88'],
            borderWidth: 2,
            hoverOffset: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#7b8db0', font: { size: 11 }, boxWidth: 10, padding: 12 } },
            tooltip: { backgroundColor: 'rgba(8,13,26,0.95)', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1 }
          }
        }
      });
      this.chartInstances.push(instance);
    }
  }
}
