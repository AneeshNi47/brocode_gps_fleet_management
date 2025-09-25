import React, {useState, useMemo} from "react"
import { MOCK_VEHICLES, VEHICLE_TYPES } from "@/components/mockData/MockData";
import { Vehicle } from "@/components/mockData/MockData";
import { Card, CardContent,CardHeader, Badge,PillButton } from '../../utility/utility_components';
import { Plus, Search } from "lucide-react";

// VEHICLE LIST
export function VehiclesPage({
  onOpenRegister,
  gotoVehicle
}: {
  onOpenRegister: () => void;
  gotoVehicle: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'All' | Vehicle['status']>('All');
  const [type, setType] = useState<'All' | Vehicle['type']>('All');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = useMemo(() => {
    return MOCK_VEHICLES.filter(v => {
      const matchesQ = !q || v.regNo.toLowerCase().includes(q.toLowerCase()) || v.model.toLowerCase().includes(q.toLowerCase()) || v.gpsId.toLowerCase().includes(q.toLowerCase());
      const matchesStatus = status === 'All' || v.status === status;
      const matchesType = type === 'All' || v.type === type;
      return matchesQ && matchesStatus && matchesType;
    });
  }, [q, status, type]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  return <div className="p-4 md:p-6 space-y-4">
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="rounded-md border px-3 py-1.5 text-sm" placeholder="Search reg no, model, GPS..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Status</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={status} onChange={e => setStatus(e.target.value as any)}>
              {['All', 'Active', 'Inactive', 'Maintenance'].map(s => <option key={s}>{s}</option>)}
            </select>
            <label className="text-sm">Type</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={type} onChange={e => setType(e.target.value as any)}>
              {['All', ...VEHICLE_TYPES].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1" />
          <PillButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onOpenRegister}>
            Register Vehicle
          </PillButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="font-medium">Vehicles</div>
          <div className="text-xs text-muted-foreground">Showing {filtered.length} results</div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b">
                <th className="py-2 pr-4">Reg No</th>
                <th className="py-2 pr-4">Model</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Assigned Driver</th>
                <th className="py-2 pr-4">GPS ID</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Fuel Type</th>
                <th className="py-2 pr-4">Last Reported</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(v => {
              const last = new Date(v.lastReported);
              const mins = Math.round((Date.now() - last.getTime()) / 60000);
              return <tr key={v.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      <button className="underline decoration-dotted underline-offset-4" onClick={() => gotoVehicle(v.regNo)}>
                        {v.regNo}
                      </button>
                    </td>
                    <td className="py-3 pr-4">{v.model}</td>
                    <td className="py-3 pr-4">{v.type}</td>
                    <td className="py-3 pr-4">{v.assignedDriver ?? <span className="text-muted-foreground">Unassigned</span>}</td>
                    <td className="py-3 pr-4">{v.gpsId}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={v.status === 'Active' ? 'success' : v.status === 'Inactive' ? 'outline' : 'warning'}>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">{v.fuelType}</td>
                    <td className="py-3 pr-4">{mins} min ago</td>
                    <td className="py-3 pr-4">
                      <div className="flex justify-end">
                        <button className="rounded-md border px-2 py-1 hover:bg-muted text-xs">View</button>
                      </div>
                    </td>
                  </tr>;
            })}
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