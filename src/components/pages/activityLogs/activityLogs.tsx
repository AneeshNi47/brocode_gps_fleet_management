
import React, { useMemo, useState } from 'react';
import { MOCK_LOGS } from '@/components/mockData/MockData';
import { Search, Download,CircleGauge } from 'lucide-react';
import { Card, CardContent,CardHeader, Badge, Kbd } from '../../utility/utility_components';

export function ActivityLogs() {
  const [q, setQ] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const users = ['All', ...new Set(MOCK_LOGS.map(l => l.performedBy))];
  const actions = ['All', ...new Set(MOCK_LOGS.map(l => l.action))];
  const filtered = MOCK_LOGS.filter(l => {
    const matchesQ = !q || l.notes?.toLowerCase().includes(q.toLowerCase()) || l.action.toLowerCase().includes(q.toLowerCase());
    const matchesUser = userFilter === 'All' || l.performedBy === userFilter;
    const matchesAction = actionFilter === 'All' || l.action === actionFilter;
    const time = new Date(l.timestamp).getTime();
    const after = from ? new Date(from).getTime() : -Infinity;
    const before = to ? new Date(to).getTime() : Infinity;
    const matchesRange = time >= after && time <= before;
    return matchesQ && matchesUser && matchesAction && matchesRange;
  });
  return <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardContent className="grid md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="w-full rounded-md border px-3 py-1.5 text-sm" placeholder="Search notes or action..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Action</label>
            <select className="w-full rounded-md border px-2 py-1 text-sm" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
              {actions.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">User</label>
            <select className="w-full rounded-md border px-2 py-1 text-sm" value={userFilter} onChange={e => setUserFilter(e.target.value)}>
              {users.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">From</label>
            <input type="date" className="rounded-md border px-2 py-1 text-sm" value={from} onChange={e => setFrom(e.target.value)} />
            <label className="text-sm">To</label>
            <input type="date" className="rounded-md border px-2 py-1 text-sm" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="font-medium">Activity Log</div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <CircleGauge className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b">
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Module</th>
                <th className="py-2 pr-4">Performed By</th>
                <th className="py-2 pr-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => <tr key={l.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="py-3 pr-4">{l.action}</td>
                  <td className="py-3 pr-4">{l.module}</td>
                  <td className="py-3 pr-4">{l.performedBy}</td>
                  <td className="py-3 pr-4">{l.notes ?? <span className="text-muted-foreground">-</span>}</td>
                </tr>)}
              {filtered.length === 0 && <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground">
                    No logs match your filters.
                  </td>
                </tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>;
}