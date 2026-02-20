import { Injectable, signal, computed } from '@angular/core';

export interface Incident {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  time: string;
  description: string;
  status: 'detected' | 'investigating' | 'containing' | 'resolved';
  assignee?: string;
}

export interface Threat {
  id: string;
  type: string;
  severity: string;
  source: string;
  target: string;
  detected: string;
  status: string;
  country?: string;
  attackVector?: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: string;
  score: number;
  systems: number;
  description: string;
  patch?: string;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'critical';
  msg: string;
  timestamp: string;
  source?: string;
}

export interface AttackSource {
  country: string;
  flag: string;
  count: number;
  percent: number;
}

export interface DarknetItem {
  id: string;
  type: string;
  description: string;
  risk: 'critical' | 'high' | 'medium';
  discovered: string;
  status: 'active' | 'monitoring' | 'neutralized';
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'server' | 'firewall' | 'endpoint' | 'cloud' | 'attacker';
  status: 'secure' | 'warning' | 'compromised';
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class SecurityService {

  private _incidents = signal<Incident[]>([
    { id: 'INC-2026-001', type: 'Brute Force Attack', severity: 'high', time: '14:23:45', description: 'Repetitive failed login attempts detected on SSH port 22 from 185.220.101.8. 2,400+ attempts in 3 minutes.', status: 'investigating', assignee: 'Analyst Dlamini' },
    { id: 'INC-2026-002', type: 'Ransomware Detected', severity: 'critical', time: '13:45:12', description: 'LockBit 3.0 ransomware signature detected on Workstation-42. File encryption activity halted by EDR.', status: 'containing', assignee: 'Analyst Nkosi' },
    { id: 'INC-2026-003', type: 'Data Exfiltration', severity: 'critical', time: '12:10:05', description: 'Unusual 4.2GB outbound traffic spike to unknown IP in Russia (109.234.36.77) over port 443.', status: 'detected', assignee: 'Unassigned' },
    { id: 'INC-2026-004', type: 'SQL Injection', severity: 'medium', time: '11:30:22', description: "Blind SQL injection attempt detected on /api/search endpoint. Payload: ' OR 1=1--. WAF triggered.", status: 'investigating', assignee: 'Analyst Mokoena' },
    { id: 'INC-2026-005', type: 'Phishing Campaign', severity: 'low', time: '09:15:33', description: '14 users received spear-phishing email impersonating IT department. Malicious macro blocked.', status: 'resolved', assignee: 'Analyst Peters' },
    { id: 'INC-2026-006', type: 'Privilege Escalation', severity: 'high', time: '08:44:10', description: 'User jhbadmin01 attempted to escalate privileges via PrintNightmare exploit. Blocked and quarantined.', status: 'containing', assignee: 'Analyst Dlamini' },
    { id: 'INC-2026-007', type: 'C2 Beacon Detected', severity: 'critical', time: '07:55:00', description: 'Cobalt Strike beacon detected on Finance-PC-07. Beaconing intervals of 60s to 91.219.212.34.', status: 'investigating', assignee: 'Analyst Nkosi' },
    { id: 'INC-2026-008', type: 'Insider Threat', severity: 'medium', time: '06:30:55', description: 'Employee accessed 3,400+ customer records outside working hours. Data loss prevention alert triggered.', status: 'detected', assignee: 'Unassigned' }
  ]);

  private _threats = signal<Threat[]>([
    { id: 'TH-1001', type: 'DDoS Volumetric', severity: 'critical', source: '103.45.12.8', target: 'Load Balancer A', detected: '2026-02-20 14:05', status: 'Active', country: '🇨🇳', attackVector: 'UDP Flood 94Gbps' },
    { id: 'TH-1002', type: 'Port Scan', severity: 'medium', source: '185.122.3.44', target: 'DMZ Gateway', detected: '2026-02-20 14:12', status: 'Investigating', country: '🇷🇺', attackVector: 'SYN Scan nmap' },
    { id: 'TH-1003', type: 'Account Takeover', severity: 'high', source: '192.168.1.99 (Internal)', target: 'CEO Email Account', detected: '2026-02-20 14:30', status: 'Active', country: '🏢', attackVector: 'Credential Stuffing' },
    { id: 'TH-1004', type: 'Zero-day Exploit', severity: 'critical', source: '210.33.5.1', target: 'HR Database Cluster', detected: '2026-02-20 15:00', status: 'Active', country: '🇰🇵', attackVector: 'CVE-2026-0001 RCE' },
    { id: 'TH-1005', type: 'Policy Violation', severity: 'low', source: '192.168.1.15', target: 'Internal File Server', detected: '2026-02-20 15:15', status: 'Mitigated', country: '🏢', attackVector: 'Unauthorized Access' },
    { id: 'TH-1006', type: 'Supply Chain Attack', severity: 'critical', source: '45.56.78.90', target: 'CI/CD Pipeline', detected: '2026-02-20 15:45', status: 'Active', country: '🇮🇷', attackVector: 'Malicious NPM Package' },
    { id: 'TH-1007', type: 'Man-in-the-Middle', severity: 'high', source: '10.0.0.55 (Internal)', target: 'API Gateway', detected: '2026-02-20 16:00', status: 'Investigating', country: '🏢', attackVector: 'ARP Poisoning' },
  ]);

  private _vulnerabilities = signal<Vulnerability[]>([
    { id: 'CVE-2024-38063', title: 'Windows TCP/IP Remote Code Execution', severity: 'critical', score: 9.8, systems: 15, description: 'Critical vulnerability in Windows TCP/IP stack allowing unauthenticated RCE. Affects all unpatched Windows Server 2016+ systems.', patch: 'KB5041773' },
    { id: 'CVE-2024-43451', title: 'NTLM Hash Disclosure Spoofing', severity: 'high', score: 8.1, systems: 42, description: 'Information disclosure vulnerability enabling NTLM hash theft via crafted .url files. Exploitable via email phishing.', patch: 'KB5043064' },
    { id: 'CVE-2023-4863', title: 'Heap Buffer Overflow in libwebp', severity: 'high', score: 8.8, systems: 120, description: 'Critical heap buffer overflow in the libwebp library affecting Chrome, Firefox, and Android. Allows attacker-controlled memory corruption.', patch: 'Chrome 117+' },
    { id: 'CVE-2024-21412', title: 'Internet Shortcut File Security Bypass', severity: 'medium', score: 6.5, systems: 8, description: 'Allows attackers to bypass Mark of the Web (MoTW) security warnings via specially crafted .url shortcut files.', patch: 'KB5034467' },
    { id: 'CVE-2024-30088', title: 'Windows Kernel Privilege Escalation', severity: 'high', score: 7.8, systems: 37, description: 'Race condition in Windows kernel allows local privilege escalation to SYSTEM level. Actively exploited in the wild.', patch: 'KB5039212' },
    { id: 'CVE-2024-1709', title: 'ConnectWise ScreenConnect Auth Bypass', severity: 'critical', score: 10.0, systems: 3, description: 'Authentication bypass in ConnectWise ScreenConnect 23.9.7 and earlier allows full system access without valid credentials.', patch: 'v23.9.8+' },
  ]);

  private _complianceFrameworks = signal<any[]>([
    { name: 'ISO 27001:2022', score: 87, status: '13 controls require attention', controls: 114, passed: 99 },
    { name: 'NIST CSF 2.0', score: 92, status: '8 controls require attention', controls: 108, passed: 99 },
    { name: 'PCI DSS v4.0', score: 78, status: '22 controls require attention', controls: 270, passed: 211 },
    { name: 'GDPR / POPIA', score: 95, status: '5 controls require attention', controls: 99, passed: 94 },
    { name: 'SOC 2 Type II', score: 83, status: '18 controls require attention', controls: 64, passed: 53 },
    { name: 'CIS Controls v8', score: 89, status: '11 controls require attention', controls: 153, passed: 136 },
  ]);

  private _darknetFeed = signal<DarknetItem[]>([
    { id: 'DN-001', type: 'Credential Dump', description: 'Database of 48,000 employee credentials for sale on RaidForums. Linked to internal HR portal.', risk: 'critical', discovered: '02:14 UTC', status: 'active' },
    { id: 'DN-002', type: 'Malware-as-a-Service', description: 'New ransomware-as-a-service targeting SA financial sector listed on dark web marketplace at $3,500.', risk: 'high', discovered: '06:40 UTC', status: 'monitoring' },
    { id: 'DN-003', type: 'Attack Blueprint', description: 'Threat actor group "PhantomClaw" soliciting information about company network topology.', risk: 'critical', discovered: '10:08 UTC', status: 'active' },
    { id: 'DN-004', type: 'Phishing Kit', description: 'Custom phishing kit mimicking company VPN login page sold for $200. 14 buyers confirmed.', risk: 'high', discovered: '11:52 UTC', status: 'monitoring' },
    { id: 'DN-005', type: 'Zero-Day Listing', description: 'Unpatched RCE for company-used ERP software listed. Asking price: $45,000 BTC.', risk: 'critical', discovered: '13:30 UTC', status: 'active' },
  ]);

  private _attackSources = signal<AttackSource[]>([
    { country: 'China', flag: '🇨🇳', count: 2847, percent: 78 },
    { country: 'Russia', flag: '🇷🇺', count: 2341, percent: 65 },
    { country: 'North Korea', flag: '🇰🇵', count: 1204, percent: 33 },
    { country: 'Iran', flag: '🇮🇷', count: 987, percent: 27 },
    { country: 'Brazil', flag: '🇧🇷', count: 654, percent: 18 },
    { country: 'India', flag: '🇮🇳', count: 411, percent: 11 },
  ]);

  private _logs = signal<LogEntry[]>([]);
  private _threatLevel = signal<number>(68);

  // Read-only accessors
  incidents = this._incidents.asReadonly();
  threats = this._threats.asReadonly();
  vulnerabilities = this._vulnerabilities.asReadonly();
  complianceFrameworks = this._complianceFrameworks.asReadonly();
  darknetFeed = this._darknetFeed.asReadonly();
  attackSources = this._attackSources.asReadonly();
  logs = this._logs.asReadonly();
  threatLevel = this._threatLevel.asReadonly();

  criticalIncidentCount = computed(() => this._incidents().filter((i: Incident) => i.severity === 'critical').length);
  resolvedCount = computed(() => this._incidents().filter((i: Incident) => i.status === 'resolved').length);
  activeThreats = computed(() => this._threats().filter((t: Threat) => t.status === 'Active').length);

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    const logTemplates: Omit<LogEntry, 'timestamp'>[] = [
      { level: 'info', msg: 'System integrity check passed — all sensors nominal', source: 'CORE-MONITOR' },
      { level: 'warn', msg: 'Brute force attempt detected on SSH port 22 — rate limiting applied', source: 'IDS-SENSOR-04' },
      { level: 'error', msg: 'Unauthorized subnet scan detected — connection terminated', source: 'FIREWALL-02' },
      { level: 'info', msg: 'Neural threat pattern database updated — 14,882 new signatures', source: 'AI-ENGINE' },
      { level: 'warn', msg: 'Suspicious DNS query: xf-99.bit — classified as C2 domain', source: 'DNS-FILTER' },
      { level: 'critical', msg: 'ALERT: Lateral movement detected on VLAN-10 segment', source: 'EDR-AGENT' },
      { level: 'info', msg: 'TLS certificate renewed — expiry extended 90 days', source: 'PKI-MANAGER' },
      { level: 'warn', msg: 'Memory anomaly on Finance-PC-07 — process injection suspected', source: 'EDR-AGENT' },
      { level: 'error', msg: 'SQL injection payload blocked by WAF — rule 941300 triggered', source: 'WAF-CLUSTER' },
      { level: 'info', msg: 'Threat level recalibrated by ML model — confidence 94.2%', source: 'AI-ENGINE' },
      { level: 'critical', msg: 'DARKNET ALERT: Company domain detected in credential dump', source: 'DARKNET-MONITOR' },
      { level: 'warn', msg: 'Unusual after-hours access by jhbadmin01 — SIEM correlated', source: 'UEBA-ENGINE' },
      { level: 'info', msg: 'Backup verification complete — all 1,247 systems backed up', source: 'BACKUP-MGR' },
      { level: 'error', msg: 'VPN tunnel disruption on edge-node-3 — failover activated', source: 'NETWORK-OPS' },
      { level: 'info', msg: 'Zero-trust policy evaluated — 3 devices quarantined for review', source: 'ZT-ENGINE' },
    ];

    setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      this.addLog(template.level, template.msg, template.source);
    }, 2500);

    setInterval(() => {
      this._threatLevel.update((v: number) => {
        const change = (Math.random() - 0.48) * 5;
        return Math.max(15, Math.min(98, v + change));
      });
    }, 3000);
  }

  addLog(level: LogEntry['level'], msg: string, source?: string) {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    this._logs.update((current: LogEntry[]) => [...current.slice(-74), { level, msg, timestamp, source }]);
  }

  updateIncidentStatus(id: string, status: Incident['status']) {
    this._incidents.update((current: Incident[]) =>
      current.map((i: Incident) => i.id === id ? { ...i, status } : i)
    );
  }
}
