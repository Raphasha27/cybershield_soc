import { Component, signal, computed, effect, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CafeService, Session, Station } from './cafe.service';

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
  digitalServices = this.cafeService.digitalServices;
  trainingCourses = this.cafeService.trainingCourses;
  clientProjects = this.cafeService.clientProjects;
  loyaltyMembers = this.cafeService.loyaltyMembers;
  wallet = this.cafeService.wallet;
  membershipPlans = this.cafeService.membershipPlans;
  supportTickets = this.cafeService.supportTickets;
  tournaments = this.cafeService.tournaments;
  businessPlan = (this.cafeService as any)._businessPlanDetails;

  // Computed occupancy
  freeGamingPCs = computed(() => this.stations().filter((s: Station) => s.type.includes('Gaming') && s.status === 'Available').length);
  freeStandardPCs = computed(() => this.stations().filter((s: Station) => s.type.includes('Standard') && s.status === 'Available').length);





  // Local UI State
  isLoggedIn = signal(false);
  isLandingPage = signal(true);
  currentUser = signal({
    name: 'Sarah Connor',
    email: 'sarah@kdtcafe.co.za',
    points: 890,
    tier: 'Elite Hub Member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
  });


  currentView = signal('dashboard');
  isAlertPanelOpen = signal(false);
  isAIPanelOpen = signal(false);
  isModalOpen = signal(false);
  selectedSession = signal<Session | null>(null);

  isProfileModalOpen = signal(false);
  adminProfile = signal({
    name: 'Sarah Connor',
    role: 'Loyalty Member',
    department: 'Software Engineering Student'
  });

  notifications = signal([
    { id: 1, title: 'Booking Confirmed', message: 'Your gaming slot for 14:00 is ready!', type: 'success' },
    { id: 2, title: 'Low Points Alert', message: 'Earn 110 more points for a free hour.', type: 'info' }
  ]);

  toasts = signal<any[]>([]);
  aiMessages = signal<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Welcome back Sarah! How can I help you with your Hub experience today?' }
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

  // Auth Actions
  getStarted() {
    this.isLandingPage.set(false);
    this.showToast('Welcome to the Gateway', 'info', '🔓');
  }

  login() {
    this.isLoggedIn.set(true);
    this.showToast('Access Granted. Welcome back!', 'success', '🚀');
    this.setView('dashboard');
  }

  logout() {
    this.isLoggedIn.set(false);
    this.isLandingPage.set(true);
    this.showToast('Logged out safely', 'info', '🔒');
  }

  toggleProfileModal() {
    this.isProfileModalOpen.update((v: boolean) => !v);
  }

  addFunds(amount: number) {
    this.showToast(`Adding R${amount} to your wallet...`, 'success', '💳');
    // In a real app, this would call the service to update the signal
    this.showToast('Wallet balance updated', 'info', '✅');
  }

  subscribeMembership(tier: string) {
    this.showToast(`Activating ${tier} membership...`, 'success', '🎖️');
    this.showToast('Membership active! Enjoy your perks.', 'info', '✨');
  }

  submitSupportTicket(subject: string) {
    if (!subject) return;
    this.showToast('Submitting support ticket...', 'info', '💬');
    setTimeout(() => {
      this.showToast('Ticket #TIC-' + Math.floor(Math.random() * 1000) + ' created', 'success', '✅');
    }, 1500);
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
      let response = "I'm checking the current floor status and business metrics for you.";
      const lowText = text.toLowerCase();
      const plan = this.businessPlan();

      if (lowText.includes('station') || lowText.includes('free')) {
        const free = this.stations().filter((s: any) => s.status === 'Available').length;
        response = `There are currently ${free} stations available. I recommend PC-02 for gaming (R${plan.pricing.gaming_hour}/hr).`;
      } else if (lowText.includes('price') || lowText.includes('cost') || lowText.includes('rate')) {
        response = `Our current rates are: Internet R${plan.pricing.internet_hour}/hr, Gaming R${plan.pricing.gaming_hour}/hr, B&W Print R${plan.pricing.print_bw}/pg, CV Typing R${plan.pricing.cv_typing}.`;
      } else if (lowText.includes('revenue') || lowText.includes('target') || lowText.includes('money')) {
        response = `We are at 72% of our monthly R50,000 revenue target. We need approximately R14,000 more to hit the goal.`;
      } else if (lowText.includes('service') || lowText.includes('offer')) {
        response = "We offer High-Speed Internet, Printing, CV Typing, Online Job Applications, Gaming, and Passport Photos.";
      } else if (lowText.includes('plan') || lowText.includes('business')) {
        response = `Our plan focuses on students and job seekers in Atteridgeville. We operate 15 PCs on a 200Mbps fibre line with full power backup.`;
      } else if (lowText.includes('project') || lowText.includes('client') || lowText.includes('agency')) {
        const active = this.clientProjects().filter((p: any) => p.status !== 'Launched').length;
        response = `We have ${active} active agency projects. Our biggest current contract is a Web Design project for R4,500.`;
      } else if (lowText.includes('loyalty') || lowText.includes('point') || lowText.includes('member')) {
        const top = this.loyaltyMembers()[2]; // Sarah
        response = `${top.name} is our top loyalty member with ${top.points} points. Loyalty members get 1 hour free for every 10 hours purchased.`;
      } else if (lowText.includes('wallet') || lowText.includes('balance') || lowText.includes('money')) {
        response = `Your current Hub Wallet balance is R${this.wallet().balance}. You can top up at the front desk or via the Wallet tab.`;
      } else if (lowText.includes('print') || lowText.includes('upload')) {
        response = `You can upload documents in the Printing tab. We offer A4/A3, B&W (R2/pg) and Color (R10/pg).`;
      } else if (lowText.includes('gaming') || lowText.includes('game') || lowText.includes('tournament')) {
        response = `Join our upcoming FIFA 26 tournament on Feb 28! We have RTX 4080 rigs and 240Hz monitors for the best experience.`;
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
                data: [15, 45, 75, 90, 80, 100, 95, 50],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
              x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
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
              backgroundColor: '#10b981',
              borderRadius: 6,
              hoverBackgroundColor: '#059669'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
              x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
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

