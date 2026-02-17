import { useEffect, useMemo, useState } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../services/api'

const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/logs/stream'

const demoIncidents = [
  {
    id: 1,
    title: 'Suspicious PowerShell command sequence',
    description: 'Encoded command execution observed on FIN-WS-12',
    severity: 'high',
  },
  {
    id: 2,
    title: 'Multiple failed privileged logins',
    description: 'Admin account lockout threshold nearly reached',
    severity: 'medium',
  },
  {
    id: 3,
    title: 'Potential data exfiltration pattern',
    description: 'Large outbound transfer spike to unknown ASN',
    severity: 'critical',
  },
]

const demoLogMessages = [
  'Demo mode: endpoint agent heartbeat received',
  'Demo mode: firewall denied inbound request from 203.0.113.55',
  'Demo mode: malware signature update completed',
  'Demo mode: unusual authentication sequence detected',
]

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([])
  const [logs, setLogs] = useState([])
  const [loadingIncidents, setLoadingIncidents] = useState(true)
  const [incidentError, setIncidentError] = useState('')
  const [socketState, setSocketState] = useState('connecting')
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    let active = true
    setLoadingIncidents(true)
    setIncidentError('')

    api
      .get('/incidents')
      .then((res) => {
        if (active) {
          setIncidents(res.data)
        }
      })
      .catch(() => {
        if (active) {
          setIsDemoMode(true)
          setIncidentError('Backend not available. Showing demo data.')
          setIncidents(demoIncidents)
        }
      })
      .finally(() => {
        if (active) {
          setLoadingIncidents(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let socket
    let reconnectTimer
    let demoTimer
    let closedByComponent = false

    const startDemoLogs = () => {
      setSocketState('demo')
      demoTimer = setInterval(() => {
        const message = demoLogMessages[Math.floor(Math.random() * demoLogMessages.length)]
        setLogs((prev) => [
          { timestamp: new Date().toISOString(), message },
          ...prev,
        ].slice(0, 8))
      }, 2000)
    }

    const connect = () => {
      socket = new WebSocket(wsUrl)
      setSocketState('connecting')

      socket.onopen = () => setSocketState('connected')
      socket.onmessage = (evt) => {
        const data = JSON.parse(evt.data)
        setLogs((prev) => [data, ...prev].slice(0, 8))
      }
      socket.onerror = () => {
        setIsDemoMode(true)
        setSocketState('demo')
        if (!demoTimer) {
          startDemoLogs()
        }
      }
      socket.onclose = () => {
        if (!closedByComponent && !demoTimer) {
          reconnectTimer = setTimeout(connect, 1500)
        }
      }
    }

    connect()

    return () => {
      closedByComponent = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (demoTimer) {
        clearInterval(demoTimer)
      }
      if (socket) {
        socket.close()
      }
    }
  }, [])

  const chartData = useMemo(
    () =>
      incidents
        .slice(0, 6)
        .reverse()
        .map((incident, idx) => ({
          name: `I-${idx + 1}`,
          score:
            incident.severity === 'critical' ? 95 : incident.severity === 'high' ? 75 : 55,
        })),
    [incidents],
  )

  return (
    <main className="min-h-screen bg-cyberBg p-6 text-slate-100">
      <h1 className="mb-2 text-3xl font-bold text-neon">CyberShield Enterprise SOC</h1>
      <p className="mb-1 text-sm text-slate-400">Live socket status: {socketState}</p>
      {isDemoMode ? <p className="mb-6 text-xs text-amber-300">Demo mode enabled for frontend-only deployment.</p> : <div className="mb-6" />}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active Incidents" value={incidents.length} />
        <MetricCard
          label="Critical Incidents"
          value={incidents.filter((incident) => incident.severity === 'critical').length}
        />
        <MetricCard label="Live Log Events" value={logs.length} />
      </section>

      {loadingIncidents ? <p className="mt-4 text-slate-400">Loading incidents...</p> : null}
      {incidentError ? <p className="mt-4 text-rose-400">{incidentError}</p> : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-cyberPanel p-4 shadow-xl">
          <h2 className="mb-3 text-lg font-semibold">Threat Severity Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl bg-cyberPanel p-4 shadow-xl">
          <h2 className="mb-3 text-lg font-semibold">Live SOC Feed</h2>
          <ul className="space-y-2 text-sm">
            {logs.map((log, index) => (
              <li key={`${log.timestamp}-${index}`} className="rounded bg-slate-900 p-2">
                <p className="text-xs text-slate-400">{log.timestamp}</p>
                <p>{log.message}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-xl bg-cyberPanel p-4 shadow-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-neon">{value}</p>
    </article>
  )
}
