import { MOCK_VEHICLES } from "@/components/mockData/MockData";
import { Card, CardContent, CardHeader, Kbd, Badge, } from "@/components/utility/utility_components";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { SignalZero, SignalLow, SignalMedium, SignalHigh, Truck, MoreHorizontal, MapPin, EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Line,LineChart } from "recharts";

// VEHICLE DETAIL
export function VehicleDetail({
  regNo
}: {
  regNo: string;
}) {
  const vehicle = MOCK_VEHICLES.find(v => v.regNo === regNo) ?? MOCK_VEHICLES[0];
  const [disabled, setDisabled] = useState(false);
  const [gpsDisabled, setGpsDisabled] = useState(false);
  const [confirm, setConfirm] = useState<null | {
    type: 'vehicle' | 'gps';
    message: string;
  }>(null);
  const miniKm = Array.from({
    length: 14
  }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      }),
      km: Math.floor(40 + Math.random() * 180)
    };
  });
  const events = Array.from({
    length: 16
  }, (_, i) => {
    const d = new Date();
    d.setHours(d.getHours() - i * 3);
    const types = ['start', 'stop', 'disable', 'alert', 'gps-on', 'gps-off'];
    const t = types[i % types.length];
    return {
      time: d.toLocaleString(),
      type: t,
      note: t === 'start' ? 'Vehicle started' : t === 'stop' ? 'Vehicle stopped' : t === 'disable' ? 'Immobilizer engaged' : t === 'alert' ? 'Harsh braking detected' : t === 'gps-on' ? 'GPS enabled' : 'GPS disabled'
    };
  });
  const pingLevel = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
  const PingIcon = pingLevel === 0 ? SignalZero : pingLevel === 1 ? SignalLow : pingLevel === 2 ? SignalMedium : SignalHigh;
  const pingColor = pingLevel === 0 ? 'text-rose-500' : pingLevel === 1 ? 'text-amber-500' : pingLevel === 2 ? 'text-emerald-500' : 'text-emerald-600';
  return <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary text-primary-foreground h-9 w-9 grid place-items-center">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">{vehicle.regNo}</div>
            <div className="text-xs text-muted-foreground">{vehicle.model} • {vehicle.type}</div>
          </div>
        </div>
        <div className="flex-1" />
        <Badge variant={vehicle.status === 'Active' ? 'success' : vehicle.status === 'Maintenance' ? 'warning' : 'outline'}>{vehicle.status}</Badge>
        <div className="flex items-center gap-2">
          <PingIcon className={cn('h-5 w-5', pingColor)} />
          <span className="text-sm">Tracker Ping</span>
        </div>
        <Badge variant={!gpsDisabled ? 'success' : 'destructive'}>{!gpsDisabled ? 'GPS Online' : 'GPS Offline'}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Total KM</div>
            <div className="text-2xl font-semibold">{(12000 + Math.floor(Math.random() * 8000)).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Avg Mileage</div>
            <div className="text-2xl font-semibold">{(8 + Math.random() * 7).toFixed(1)} KM/L</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Fuel Consumed</div>
            <div className="text-2xl font-semibold">{(600 + Math.floor(Math.random() * 400)).toLocaleString()} L</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Incidents</div>
            <div className="text-2xl font-semibold">{Math.floor(Math.random() * 12)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Last Report</div>
            <div className="text-2xl font-semibold">{Math.floor(2 + Math.random() * 50)} min</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="font-medium">Status</div>
            <button className="rounded p-1 hover:bg-muted" aria-label="more">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Assigned Driver</span>
              <span className="text-sm">{vehicle.assignedDriver ?? 'Unassigned'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">GPS ID</span>
              <span className="text-sm">{vehicle.gpsId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fuel Type</span>
              <span className="text-sm">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Location</span>
              <span className="inline-flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4 text-rose-500" /> 12.9, 77.5
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="font-medium">KM per day</div>
            <Badge variant="outline">Last 14 days</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniKm}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="km" type="monotone" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="font-medium">Event Log</div>
            <div className="flex items-center gap-2">
              <Kbd>J</Kbd>
              <Kbd>K</Kbd>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => <tr key={i} className="border-b last:border-0">
                    <td className="py-3 pr-4">{e.time}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={e.type === 'alert' ? 'warning' : e.type.includes('disable') ? 'destructive' : e.type.includes('gps') ? 'info' : 'success'}>
                        {e.type}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">{e.note}</td>
                  </tr>)}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="font-medium">Admin Controls</div>
            <EllipsisVertical className="h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Disable Vehicle</div>
                <div className="text-xs text-muted-foreground">Immobilize engine remotely</div>
              </div>
              <button className={cn('rounded-md px-3 py-1.5 text-sm border', disabled ? 'bg-rose-50 text-rose-600 border-rose-200' : 'hover:bg-muted')} onClick={() => setConfirm({
              type: 'vehicle',
              message: disabled ? 'Enable vehicle?' : 'Disable vehicle now?'
            })}>
                {disabled ? 'Enable' : 'Disable'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Disable GPS</div>
                <div className="text-xs text-muted-foreground">Stops sending location</div>
              </div>
              <button className={cn('rounded-md px-3 py-1.5 text-sm border', gpsDisabled ? 'bg-rose-50 text-rose-600 border-rose-200' : 'hover:bg-muted')} onClick={() => setConfirm({
              type: 'gps',
              message: gpsDisabled ? 'Enable GPS?' : 'Disable GPS now?'
            })}>
                {gpsDisabled ? 'Enable' : 'Disable'}
              </button>
            </div>
            <AnimatePresence>
              {confirm && <motion.div initial={{
              opacity: 0,
              y: -6
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -6
            }} className="rounded-md border p-3">
                  <div className="text-sm font-medium mb-2">Confirm Action</div>
                  <div className="text-sm text-muted-foreground mb-3">{confirm.message}</div>
                  <div className="flex gap-2">
                    <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted" onClick={() => {
                  if (confirm.type === 'vehicle') setDisabled(v => !v);
                  if (confirm.type === 'gps') setGpsDisabled(v => !v);
                  setConfirm(null);
                }}>
                      Confirm
                    </button>
                    <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted" onClick={() => setConfirm(null)}>
                      Cancel
                    </button>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>;
}
