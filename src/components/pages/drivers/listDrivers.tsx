import React, { useState, useMemo } from 'react';
import { Card, CardContent,CardHeader, Badge } from '../../utility/utility_components';
import { MOCK_DRIVERS, MOCK_VEHICLES } from '@/components/mockData/MockData';

// DRIVERS LIST
export function DriversPage({
  query,
  setQuery,
  gotoVehicle,
  gotoDriver
}: {
  query: string;
  setQuery: (q: string) => void;
  gotoVehicle: (id: string) => void;
  gotoDriver: (id: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Suspended'>('All');
  const [vehicleFilter, setVehicleFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const vehicles = useMemo(() => ['All', ...new Set(MOCK_VEHICLES.map(v => v.regNo))], []);
  const filtered = useMemo(() => {
    return MOCK_DRIVERS.filter(d => {
      const matchesQuery = !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.mobile.includes(query) || d.email.toLowerCase().includes(query.toLowerCase()) || d.licenseNo.toLowerCase().includes(query.toLowerCase()) || d.rfid.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesVehicle = vehicleFilter === 'All' || d.assignedVehicle === vehicleFilter;
      return matchesQuery && matchesStatus && matchesVehicle;
    });
  }, [query, statusFilter, vehicleFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  return <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 items-center">
            <label className="text-sm">Status</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
              {['All', 'Active', 'Inactive', 'Suspended'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm whitespace-nowrap">Assigned Vehicle</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)}>
              {vehicles.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex-1" />
          <div className="text-xs text-muted-foreground">{filtered.length} results</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="font-medium">Drivers</div>
          <div className="text-xs text-muted-foreground">Search is synced with top search</div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Photo</th>
                <th className="py-2 pr-4">Mobile</th>
                <th className="py-2 pr-4">License No</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">RFID Card ID</th>
                <th className="py-2 pr-4">Assigned Vehicle</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(d => <tr key={d.id} className="border-b last:border-0 hover:bg-muted/40 cursor-pointer" onClick={() => gotoDriver(d.id)}>
                  <td className="py-3 pr-4 font-medium">
                    <span>{d.name}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <img src={d.photo} alt={d.name} className="h-10 w-10 rounded-full object-cover" />
                  </td>
                  <td className="py-3 pr-4">{d.mobile}</td>
                  <td className="py-3 pr-4">{d.licenseNo}</td>
                  <td className="py-3 pr-4">{d.email}</td>
                  <td className="py-3 pr-4">{d.rfid}</td>
                  <td className="py-3 pr-4">
                    {d.assignedVehicle ? <button className="underline decoration-dotted underline-offset-4" onClick={e => {
                  e.stopPropagation();
                  gotoVehicle(d.assignedVehicle!);
                }}>
                        {d.assignedVehicle}
                      </button> : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={d.status === 'Active' ? 'success' : d.status === 'Inactive' ? 'outline' : 'warning'}>
                      {d.status}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-md border px-2 py-1 hover:bg-muted text-xs" onClick={e => {
                    e.stopPropagation();
                    gotoDriver(d.id);
                  }}>View</button>
                      <button className="rounded-md border px-2 py-1 hover:bg-muted text-xs">Edit</button>
                      <button className="rounded-md border px-2 py-1 hover:bg-rose-50 text-rose-600 text-xs">Deactivate</button>
                    </div>
                  </td>
                </tr>)}
              {pageData.length === 0 && <tr>
                  <td colSpan={9} className="text-center py-10 text-muted-foreground">
                    No drivers found for current filters.
                  </td>
                </tr>}
            </tbody>
          </table>
          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border px-3 py-1 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Prev
              </button>
              <button className="rounded-md border px-3 py-1 text-sm disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}