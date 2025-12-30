import { Injectable, signal, computed } from '@angular/core';

export interface Incident {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  time: string;
  description: string;
  status: 'detected' | 'investigating' | 'containing' | 'resolved';
}

export interface Threat {
  id: string;
  type: string;
  severity: string;
  source: string;
  target: string;
  detected: string;
  status: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: string;
  score: number;
  systems: number;
  description: string;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  msg: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  // Signals for state
  private _incidents = signal<Incident[]>([
    { id: 'INC-2025-001', type: 'Brute Force Attack', severity: 'high', time: '14:23:45', description: 'Repetitive failed login attempts detected on SSH port 22.', status: 'investigating' },
    { id: 'INC-2025-002', type: 'Malware Detected', severity: 'critical', time: '13:45:12', description: 'Known ransomware signature detected on Workstation-42.', status: 'containing' },
    { id: 'INC-2025-003', type: 'Data Exfiltration', severity: 'critical', time: '12:10:05', description: 'Unusual outbound traffic spike to unknown IP in Russia.', status: 'detected' },
    { id: 'INC-2025-004', type: 'SQL Injection', severity: 'medium', time: '11:30:22', description: 'Potentially malicious SQL query detected on web server.', status: 'investigating' },
    { id: 'INC-2025-005', type: 'Phishing Alert', severity: 'low', time: '09:15:33', description: 'Multiple users reporting suspicious email with malicious link.', status: 'resolved' }
  ]);

  private _threats = signal<Threat[]>([
    { id: 'TH-882', type: 'DDoS Attempt', severity: 'high', source: '103.45.12.8', target: 'Load Balancer A', detected: '2025-12-30 14:05', status: 'Active' },
    { id: 'TH-883', type: 'Port Scan', severity: 'medium', source: '185.122.3.44', target: 'DMZ Gateway', detected: '2025-12-30 14:12', status: 'Investigating' },
    { id: 'TH-884', type: 'Account Takeover', severity: 'high', source: 'Internal', target: 'CEO Email', detected: '2025-12-30 14:30', status: 'Active' },
    { id: 'TH-885', type: 'Zero-day Exploit', severity: 'critical', source: '210.33.5.1', target: 'HR Database', detected: '2025-12-30 15:00', status: 'Active' },
    { id: 'TH-886', type: 'Policy Violation', severity: 'low', source: '192.168.1.15', target: 'Internal File Server', detected: '2025-12-30 15:15', status: 'Mitigated' }
  ]);

  private _vulnerabilities = signal<Vulnerability[]>([
    { id: 'CVE-2024-38063', title: 'Windows TCP/IP Remote Code Execution', severity: 'critical', score: 9.8, systems: 15, description: 'A critical vulnerability in Windows TCP/IP that allows for remote code execution.' },
    { id: 'CVE-2024-43451', title: 'NTLM Hash Disclosure Vulnerability', severity: 'high', score: 8.1, systems: 42, description: 'Information disclosure vulnerability that could lead to NTLM hash theft.' },
    { id: 'CVE-2023-4863', title: 'Heap Buffer Overflow in libwebp', severity: 'high', score: 8.8, systems: 120, description: 'Critical vulnerability in libwebp that affects browsers and many applications.' },
    { id: 'CVE-2024-21412', title: 'Internet Explorer Shortcut File Security Bypass', severity: 'medium', score: 6.5, systems: 8, description: 'Vulnerability that allows attackers to bypass security warnings.' }
  ]);

  private _complianceFrameworks = signal<any[]>([
    { name: 'ISO 27001', score: 87, status: '13 controls require attention' },
    { name: 'NIST CSF', score: 92, status: '8 controls require attention' },
    { name: 'PCI DSS', score: 78, status: '22 controls require attention' },
    { name: 'GDPR', score: 95, status: '5 controls require attention' }
  ]);

  private _logs = signal<LogEntry[]>([]);
  private _threatLevel = signal<number>(68);

  // Read-only accessors
  incidents = this._incidents.asReadonly();
  threats = this._threats.asReadonly();
  vulnerabilities = this._vulnerabilities.asReadonly();
  complianceFrameworks = this._complianceFrameworks.asReadonly();
  logs = this._logs.asReadonly();
  threatLevel = this._threatLevel.asReadonly();

  // Computed signals
  criticalIncidentCount = computed(() => this._incidents().filter((i: Incident) => i.severity === 'critical').length);

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    // Log simulation
    const logTemplates: Omit<LogEntry, 'timestamp'>[] = [
      { level: 'info', msg: 'System integrity check: [OK]' },
      { level: 'warn', msg: 'Brute force attempt detected on port 22' },
      { level: 'error', msg: 'Unauthorized subnet scan aborted' },
      { level: 'info', msg: 'Neural threat patterns updated' },
      { level: 'warn', msg: 'Suspicious DNS query: xf-99.bit' }
    ];

    setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      this.addLog(template.level, template.msg);
    }, 4000);

    // Threat level fluctuation
    setInterval(() => {
      this._threatLevel.update((v: number) => {
        const change = (Math.random() - 0.5) * 4;
        return Math.max(10, Math.min(100, v + change));
      });
    }, 3000);
  }

  addLog(level: LogEntry['level'], msg: string) {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    this._logs.update((current: LogEntry[]) => [...current.slice(-49), { level, msg, timestamp }]);
  }

  updateIncidentStatus(id: string, status: Incident['status']) {
    this._incidents.update((current: Incident[]) => 
      current.map((i: Incident) => i.id === id ? { ...i, status } : i)
    );
  }
}
