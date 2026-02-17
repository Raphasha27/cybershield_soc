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

const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/logs/stream')

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([])
  const [logs, setLogs] = useState([])

  useEffect(() => {
    api.get('/incidents').then((res) => setIncidents(res.data)).catch(() => setIncidents([]))
  }, [])

  useEffect(() => {
    const socket = new WebSocket(wsUrl)
    socket.onmessage = (evt) => {
      const data = JSON.parse(evt.data)
      setLogs((prev) => [data, ...prev].slice(0, 8))
    }
    return () => socket.close()
  }, [])

  const chartData = useMemo(
    () => incidents.slice(0, 6).reverse().map((i, idx) => ({
      name: `I-${idx + 1}`,
      score: i.severity === 'critical' ? 95 : i.severity === 'high' ? 75 : 55,
    })),
    [incidents],
  )

  return (
    <main className="min-h-screen bg-cyberBg p-6 text-slate-100">
      <h1 className="mb-6 text-3xl font-bold text-neon">CyberShield Enterprise SOC</h1>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active Incidents" value={incidents.length} />
        <MetricCard label="Critical Incidents" value={incidents.filter((i) => i.severity === 'critical').length} />
        <MetricCard label="Live Log Events" value={logs.length} />
      </section>

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
