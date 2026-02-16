import { Injectable, signal, computed } from '@angular/core';

export interface Station {
  id: string;
  type: 'Gaming PC' | 'Standard PC' | 'Mac' | 'Console';
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  currentUser?: string;
  timeRemaining?: string;
  specs: string;
}

export interface Session {
  id: string;
  stationId: string;
  user: string;
  plan: 'Hourly' | 'Daily' | 'Guest';
  startTime: string;
  status: 'active' | 'pending' | 'ending' | 'completed';
}

export interface Booking {
  id: string;
  user: string;
  stationType: string;
  serviceType: string;
  time: string;
  duration: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export interface DigitalService {
  name: string;
  price: number;
  category: 'Document' | 'Identity' | 'Government';
  icon: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  duration: string;
  price: number;
  nextStartDate: string;
  slots: number;
}

export interface ClientProject {
  id: string;
  client: string;
  type: 'Web Design' | 'Logo Design' | 'Digital Marketing';
  status: 'Briefing' | 'In Progress' | 'Review' | 'Launched';
  revenue: number;
}

export interface LoyaltyMember {
  id: string;
  name: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
}

export interface UserWallet {
  balance: number;
  transactions: { id: string; date: string; amount: number; desc: string; type: 'credit' | 'debit' }[];
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Technical' | 'Billing' | 'General';
  status: 'Open' | 'Resolved' | 'Pending';
  priority: 'Low' | 'Medium' | 'High';
  date: string;
}

export interface GamingTournament {
  id: string;
  game: string;
  date: string;
  prize: string;
  joinFee: number;
  players: number;
  maxPlayers: number;
}




export interface BusinessMetric {
  category: string;
  item: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
}


export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  msg: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CafeService {
  // Signals for state
  private _sessions = signal<Session[]>([
    { id: 'SES-001', stationId: 'PC-01', user: 'Alex Gaming', plan: 'Hourly', startTime: '14:23:45', status: 'active' },
    { id: 'SES-002', stationId: 'PC-07', user: 'Sarah Connor', plan: 'Daily', startTime: '13:45:12', status: 'active' },
    { id: 'SES-003', stationId: 'PS5-01', user: 'John Doe', plan: 'Guest', startTime: '12:10:05', status: 'pending' },
    { id: 'SES-004', stationId: 'PC-12', user: 'Mike Ross', plan: 'Hourly', startTime: '11:30:22', status: 'ending' },
    { id: 'SES-005', stationId: 'MAC-03', user: 'Rachel Zane', plan: 'Hourly', startTime: '09:15:33', status: 'completed' }
  ]);

  private _stations = signal<Station[]>([
    { id: 'PC-01', type: 'Gaming PC', status: 'Occupied', currentUser: 'Alex Gaming', timeRemaining: '45m', specs: 'RTX 4080, 32GB' },
    { id: 'PC-02', type: 'Gaming PC', status: 'Available', specs: 'RTX 4080, 32GB' },
    { id: 'PC-03', type: 'Gaming PC', status: 'Available', specs: 'RTX 3070, 16GB' },
    { id: 'PC-04', type: 'Standard PC', status: 'Available', specs: 'Core i5, 8GB' },
    { id: 'PC-05', type: 'Standard PC', status: 'Available', specs: 'Core i5, 8GB' },
    { id: 'PC-06', type: 'Standard PC', status: 'Maintenance', specs: 'Core i5, 8GB' },
    { id: 'PC-07', type: 'Gaming PC', status: 'Occupied', currentUser: 'Sarah Connor', timeRemaining: '3h 12m', specs: 'RTX 3070, 16GB' },
    { id: 'PC-08', type: 'Standard PC', status: 'Occupied', currentUser: 'James Miller', timeRemaining: '15m', specs: 'Core i5, 8GB' },
    { id: 'PC-09', type: 'Standard PC', status: 'Available', specs: 'Core i5, 8GB' },
    { id: 'PC-10', type: 'Standard PC', status: 'Available', specs: 'Core i5, 8GB' },
    { id: 'MAC-01', type: 'Mac', status: 'Available', specs: 'M2 Pro, 16GB' },
    { id: 'MAC-02', type: 'Mac', status: 'Available', specs: 'M2 Pro, 16GB' },
    { id: 'MAC-03', type: 'Mac', status: 'Occupied', currentUser: 'Rachel Zane', timeRemaining: '1h 05m', specs: 'M2 Pro, 16GB' },
    { id: 'PS5-01', type: 'Console', status: 'Reserved', specs: 'PlayStation 5' },
    { id: 'PS5-02', type: 'Console', status: 'Available', specs: 'PlayStation 5' }
  ]);


  private _bookings = signal<Booking[]>([
    { id: 'BK-101', user: 'Sarah Connor', stationType: 'Gaming PC', serviceType: 'High-End Gaming', time: '14:00', duration: '2h', status: 'Confirmed' },
    { id: 'BK-102', user: 'Sarah Connor', stationType: 'Standard PC', serviceType: 'CV Review Assistance', time: '16:30', duration: '30m', status: 'Pending' },
    { id: 'BK-103', user: 'David Smith', stationType: 'Console', serviceType: 'PlayStation', time: '18:00', duration: '2h', status: 'Confirmed' }
  ]);


  private _digitalServices = signal<DigitalService[]>([
    { name: 'CV Design & Typing', price: 75, category: 'Document', icon: '📄' },
    { name: 'NSFAS Registration', price: 50, category: 'Government', icon: '🎓' },
    { name: 'Passport Photos', price: 40, category: 'Identity', icon: '📸' },
    { name: 'SARS eFiling Assistance', price: 100, category: 'Government', icon: '🇿🇦' },
    { name: 'Lamination (A4)', price: 15, category: 'Document', icon: '🖨️' }
  ]);

  private _trainingCourses = signal<TrainingCourse[]>([
    { id: 'CR-01', title: 'Basic Computer Literacy', duration: '5 Days', price: 450, nextStartDate: 'March 1st', slots: 8 },
    { id: 'CR-02', title: 'Professional CV & LinkedIn', duration: '1 Day', price: 150, nextStartDate: 'Feb 20th', slots: 12 },
    { id: 'CR-03', title: 'Intro to Web Design', duration: '2 Weeks', price: 1200, nextStartDate: 'March 15th', slots: 5 }
  ]);

  private _clientProjects = signal<any[]>([
    { id: 'PRJ-01', name: 'Zandile\'s Fashion Hub', description: 'E-commerce website with local payment integration (SnapScan/Yoco).', status: 'Launched', value: 3500 },
    { id: 'PRJ-02', name: 'Atteridgeville Car Wash', description: 'Modern booking landing page with SEO optimization for local search.', status: 'In Progress', value: 4500 },
    { id: 'PRJ-03', name: 'Philly\'s Salon', description: 'Social media growth strategy and logo rebranding.', status: 'Review', value: 2200 }
  ]);


  private _wallet = signal<UserWallet>({
    balance: 250,
    transactions: [
      { id: 'TX-001', date: '2026-02-15 10:30', amount: -20, desc: '1hr Gaming Session', type: 'debit' },
      { id: 'TX-002', date: '2026-02-14 15:45', amount: 300, desc: 'Wallet Top-up', type: 'credit' },
      { id: 'TX-003', date: '2026-02-14 15:50', amount: -15, desc: 'Black & White Printing', type: 'debit' }
    ]
  });

  private _membershipPlans = signal<any[]>([
    { id: 'bronze', name: 'Bronze', price: 0, benefits: ['5% Snack Discount', '10% PC Rental Bonus'], color: '#cd7f32' },
    { id: 'silver', name: 'Silver', price: 199, benefits: ['10% Snack Discount', '20% PC Rental Bonus', 'Free Weekly Coffee'], color: '#c0c0c0' },
    { id: 'gold', name: 'Gold', price: 399, benefits: ['15% Snack Discount', 'Unlimited PC Rental (Off-peak)', 'Free Daily Coffee', 'Priority Support'], color: '#ffd700' }
  ]);

  private _supportTickets = signal<SupportTicket[]>([
    { id: 'TIC-001', subject: 'Printer Jammed Zone A', category: 'Technical', status: 'Resolved', priority: 'Medium', date: '2026-02-10' },
    { id: 'TIC-002', subject: 'Membership Points Missing', category: 'Billing', status: 'Pending', priority: 'High', date: '2026-02-16' }
  ]);

  private _loyaltyMembers = signal<LoyaltyMember[]>([
    { id: 'LOY-01', name: 'Alex Gaming', points: 450, tier: 'Gold' },
    { id: 'LOY-02', name: 'James Miller', points: 120, tier: 'Bronze' },
    { id: 'LOY-03', name: 'Sarah Connor', points: 890, tier: 'VIP' }
  ]);

  private _tournaments = signal<GamingTournament[]>([
    { id: 'TRN-01', game: 'FIFA 26 Pro League', date: 'Feb 28', prize: 'R2,500', joinFee: 50, players: 14, maxPlayers: 32 },
    { id: 'TRN-02', game: 'CS:GO Pretoria Hub', date: 'March 05', prize: 'R5,000', joinFee: 100, players: 8, maxPlayers: 16 }
  ]);






  private _performanceMetrics = signal<any[]>([
    { name: 'Daily Target', score: 85, status: 'R1,275 of R1,500 reached' },
    { name: 'Monthly Revenue', score: 72, status: 'R36,000 projected (Target: R50k)' },
    { name: 'Concession Sales', score: 64, status: 'Snacks & Drinks: R420 today' },
    { name: 'Agency Pipeline', score: 45, status: 'R7,550 in active projects' }
  ]);


  private _businessPlanDetails = signal<any>({
    location: 'Pretoria West Hub',

    pricing: {
      internet_hour: 20,
      print_bw: 2,
      print_color: 10,
      cv_typing: 75,
      gaming_hour: 25
    },
    targetMarket: 'Students, Job Seekers, Local Community',
    equipment: {
      pcs: 15,
      fibre: '200Mbps',
      backup: 'Fibre + LTE Failover'
    }
  });


  private _logs = signal<LogEntry[]>([]);
  private _loadLevel = signal<number>(65);

  // Read-only accessors
  sessions = this._sessions.asReadonly();
  stations = this._stations.asReadonly();
  bookings = this._bookings.asReadonly();
  digitalServices = this._digitalServices.asReadonly();
  trainingCourses = this._trainingCourses.asReadonly();
  clientProjects = this._clientProjects.asReadonly();
  loyaltyMembers = this._loyaltyMembers.asReadonly();
  performanceMetrics = this._performanceMetrics.asReadonly();


  wallet = this._wallet.asReadonly();
  membershipPlans = this._membershipPlans.asReadonly();
  supportTickets = this._supportTickets.asReadonly();
  tournaments = this._tournaments.asReadonly();
  logs = this._logs.asReadonly();
  loadLevel = this._loadLevel.asReadonly();


  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    const logTemplates: Omit<LogEntry, 'timestamp'>[] = [
      { level: 'info', msg: 'New guest session started on PC-04' },
      { level: 'info', msg: 'CV typing job completed for customer' },
      { level: 'info', msg: 'Payment of R20 received for 1hr Internet' },
      { level: 'warn', msg: 'Station PC-09 reporting high temperature' },
      { level: 'error', msg: 'Printer connection lost in Zone B' },
      { level: 'info', msg: 'Payment processed for SES-008' },
      { level: 'info', msg: 'Color printing (5 pages) completed on Admin PC' },
      { level: 'info', msg: 'New student enrolled for CR-01: Basic Literacy' },
      { level: 'info', msg: 'Project PRJ-01 (Jabu\'s Spaza) moved to LAUNCHED' },
      { level: 'info', msg: 'Member Sarah Connor earned 50 loyalty points' },
      { level: 'warn', msg: 'Backup LTE router engaged - primary fibre flickering' }
    ];




    setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      this.addLog(template.level, template.msg);
    }, 5000);

    setInterval(() => {
      this._loadLevel.update((v: number) => {
        const change = (Math.random() - 0.5) * 6;
        return Math.max(10, Math.min(100, v + change));
      });
    }, 4000);
  }

  addLog(level: LogEntry['level'], msg: string) {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    this._logs.update((current: LogEntry[]) => [...current.slice(-49), { level, msg, timestamp }]);
  }

  updateSessionStatus(id: string, status: Session['status']) {
    this._sessions.update((current: Session[]) =>
      current.map((i: Session) => i.id === id ? { ...i, status } : i)
    );
  }
}

