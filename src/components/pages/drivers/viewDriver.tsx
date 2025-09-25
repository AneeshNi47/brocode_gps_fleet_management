import { MOCK_DRIVERS, MOCK_VEHICLES } from "@/components/mockData/MockData";
import { Card, CardContent, CardHeader, Badge, } from "@/components/utility/utility_components";
import {  Truck, Mail } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PhoneIcon, IdIcon } from "@/components/utility/utility_components";

export function DriverDetail({
  id,
  onBack
}: {
  id: string;
  onBack: () => void;
}) {
  const driver = MOCK_DRIVERS.find(d => d.id === id) ?? MOCK_DRIVERS[0];
  const activeVehicle = driver.assignedVehicle ? MOCK_VEHICLES.find(v => v.regNo === driver.assignedVehicle) : undefined;
  const stats = {
    totalTrips: 128 + Math.floor(Math.random() * 40),
    activeTrips: Math.random() > 0.6 ? 1 : 0,
    totalDistance: 42000 + Math.floor(Math.random() * 8000),
    totalFuel: 5200 + Math.floor(Math.random() * 900)
  };
  const tripHistory = Array.from({
    length: 12
  }, (_, i) => {
    const start = new Date();
    start.setDate(start.getDate() - (i + 1));
    start.setHours(8 + Math.floor(Math.random() * 3));
    const end = new Date(start.getTime() + (2 + Math.floor(Math.random() * 6)) * 60 * 60 * 1000);
    const vehicle = activeVehicle?.regNo ?? MOCK_VEHICLES[(i + 3) % MOCK_VEHICLES.length].regNo;
    const distance = Math.floor(40 + Math.random() * 220);
    const fuel = Math.max(5, Math.floor(distance / (6 + Math.random() * 4)));
    return {
      id: `T-${i + 1}`,
      start: start.toLocaleString(),
      end: end.toLocaleString(),
      vehicle,
      route: `Hub ${i + 1} → Zone ${(i + 2) % 7 + 1}`,
      distance,
      fuel,
      duration: `${Math.round((end.getTime() - start.getTime()) / 3600000)}h`
    };
  });
  const tapHistory = Array.from({
    length: 10
  }, (_, i) => {
    const t = new Date();
    t.setHours(t.getHours() - i * 7);
    return {
      id: `R-${i}`,
      time: t.toLocaleString(),
      vehicle: MOCK_VEHICLES[(i + 2) % MOCK_VEHICLES.length].regNo,
      action: i % 2 === 0 ? 'Tap In' : 'Tap Out'
    };
  });
  return <div className="p-4 md:p-6 space-y-4">
      <nav className="flex items-center gap-3">
        <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted" onClick={onBack} aria-label="Back to drivers">
          ← Back
        </button>
        <h1 className="text-lg font-semibold">Driver Profile</h1>
      </nav>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="flex items-center gap-4 p-4">
            <img src={driver.photo} alt={`${driver.name} profile photo`} className="h-20 w-20 rounded-full object-cover" />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{driver.name}</h2>
              <div className="text-sm text-muted-foreground">{driver.status}</div>
              <div className="text-sm flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-2"><PhoneIcon />{driver.mobile}</span>
                <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{driver.email}</span>
                <span className="inline-flex items-center gap-2"><IdIcon />{driver.rfid}</span>
                {activeVehicle && <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4" />{activeVehicle.regNo}</span>}
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant={driver.status === 'Active' ? 'success' : driver.status === 'Suspended' ? 'warning' : 'outline'}>{driver.status}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">License</div>
              <div className="font-medium">{driver.licenseNo}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">RFID</div>
              <div className="font-medium">{driver.rfid}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Assigned Vehicle</div>
              <div className="font-medium">{driver.assignedVehicle ?? 'Unassigned'}</div>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardContent><div className="text-xs text-muted-foreground">Total Trips</div><div className="text-2xl font-semibold">{stats.totalTrips}</div></CardContent></Card>
        <Card><CardContent><div className="text-xs text-muted-foreground">Active Trips</div><div className="text-2xl font-semibold">{stats.activeTrips}</div></CardContent></Card>
        <Card><CardContent><div className="text-xs text-muted-foreground">Total Distance</div><div className="text-2xl font-semibold">{stats.totalDistance.toLocaleString()} km</div></CardContent></Card>
        <Card><CardContent><div className="text-xs text-muted-foreground">Total Fuel</div><div className="text-2xl font-semibold">{stats.totalFuel.toLocaleString()} L</div></CardContent></Card>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="font-medium">Trip History</div>
            <Badge variant="outline">Last {tripHistory.length} trips</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-4">Start</th>
                  <th className="py-2 pr-4">End</th>
                  <th className="py-2 pr-4">Vehicle</th>
                  <th className="py-2 pr-4">Route</th>
                  <th className="py-2 pr-4">Distance</th>
                  <th className="py-2 pr-4">Fuel</th>
                  <th className="py-2 pr-4">Duration</th>
                </tr>
              </thead>
              <tbody>
                {tripHistory.map(t => <tr key={t.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{t.start}</td>
                    <td className="py-3 pr-4">{t.end}</td>
                    <td className="py-3 pr-4">{t.vehicle}</td>
                    <td className="py-3 pr-4">{t.route}</td>
                    <td className="py-3 pr-4">{t.distance} km</td>
                    <td className="py-3 pr-4">{t.fuel} L</td>
                    <td className="py-3 pr-4">{t.duration}</td>
                  </tr>)}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="font-medium">RFID Tap History</div>
            <Badge variant="outline">Recent</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Vehicle</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {tapHistory.map(r => <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{r.time}</td>
                    <td className="py-3 pr-4">{r.vehicle}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={r.action === 'Tap In' ? 'success' : 'outline'}>{r.action}</Badge>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
      {stats.activeTrips > 0 && <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="font-medium">Active Trip</div>
              <Badge variant="success">Live</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm"><span>Vehicle</span><span>{activeVehicle?.regNo ?? 'V201'}</span></div>
              <div className="flex items-center justify-between text-sm"><span>Speed</span><span>{Math.floor(20 + Math.random() * 60)} km/h</span></div>
              <div className="flex items-center justify-between text-sm"><span>Location</span><span>12.{Math.floor(Math.random() * 90)}, 77.{Math.floor(Math.random() * 90)}</span></div>
              <div className="rounded-md border p-3 text-xs text-muted-foreground">Route map placeholder</div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="font-medium">Driving Behavior</div>
              <Badge variant="outline">Last 7 days</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Array.from({
                length: 7
              }, (_, i) => ({
                day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                speedings: Math.floor(Math.random() * 5),
                braking: Math.floor(Math.random() * 4),
                idle: Math.floor(Math.random() * 60)
              }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="speedings" fill="#ef4444" name="Speeding" />
                    <Bar dataKey="braking" fill="#f59e0b" name="Harsh braking" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>}
      <section>
        <Card>
          <CardHeader>
            <div className="font-medium">Documents</div>
            <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              Upload
            </button>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No documents uploaded. Use Upload to add license or training certificates.
          </CardContent>
        </Card>
      </section>
    </div>;
}
