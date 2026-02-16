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
  time: string;
  duration: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
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
    { id: 'PC-07', type: 'Gaming PC', status: 'Occupied', currentUser: 'Sarah Connor', timeRemaining: '3h 12m', specs: 'RTX 3070, 16GB' },
    { id: 'PS5-01', type: 'Console', status: 'Reserved', specs: 'PlayStation 5' },
    { id: 'MAC-03', type: 'Mac', status: 'Maintenance', specs: 'M2 Pro, 16GB' }
  ]);

  private _bookings = signal<Booking[]>([
    { id: 'BK-101', user: 'David Smith', stationType: 'Gaming PC', time: '18:00', duration: '2h', status: 'Confirmed' },
    { id: 'BK-102', user: 'Emma Wilson', stationType: 'Console', time: '19:30', duration: '4h', status: 'Pending' },
    { id: 'BK-103', user: 'James Bond', stationType: 'Standard PC', time: '20:00', duration: '1h', status: 'Confirmed' }
  ]);

  private _performanceMetrics = signal<any[]>([
    { name: 'Peak Occupancy', score: 92, status: 'Historical high this week' },
    { name: 'Revenue Target', score: 78, status: 'R15,400 remaining for month' },
    { name: 'System Uptime', score: 99.9, status: 'All servers nominal' },
    { name: 'Customer Rating', score: 95, status: 'Based on 450 reviews' }
  ]);

  private _logs = signal<LogEntry[]>([]);
  private _loadLevel = signal<number>(65);

  // Read-only accessors
  sessions = this._sessions.asReadonly();
  stations = this._stations.asReadonly();
  bookings = this._bookings.asReadonly();
  performanceMetrics = this._performanceMetrics.asReadonly();
  logs = this._logs.asReadonly();
  loadLevel = this._loadLevel.asReadonly();

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    const logTemplates: Omit<LogEntry, 'timestamp'>[] = [
      { level: 'info', msg: 'New guest session started on PC-04' },
      { level: 'warn', msg: 'Station PC-09 reporting high temperature' },
      { level: 'error', msg: 'Printer connection lost in Zone B' },
      { level: 'info', msg: 'Payment processed for SES-008' },
      { level: 'warn', msg: 'Low storage warning on Game Server 1' }
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

