import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell
} from 'recharts';
import {
  MOCK_VEHICLES, MOCK_DRIVERS,
  incidentPerMonth, last30DaysKm,
  vehicleStatusData, INCIDENT_COLORS
} from '@/components/mockData/MockData';
import {
  Card, CardContent, CardHeader, Badge
} from '../../utility/utility_components';
import {
  Activity, Fuel, Truck, Users
} from 'lucide-react';

export function Dashboard() {
  const totalVehicles = MOCK_VEHICLES.length;
  const totalActiveDrivers = MOCK_DRIVERS.filter(d => d.status === 'Active').length;
  const totalIncidents = incidentPerMonth.reduce((a, b) => a + b.incidents, 0);
  const totalKmRun = last30DaysKm.reduce((a, b) => a + b.km, 0);
  const fuelUsed = Math.floor(totalKmRun / 8.5); // Mocked value
  const avgMileage = (totalKmRun / fuelUsed).toFixed(1);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="rounded-md bg-blue-600/10 p-2 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Vehicles</div>
              <div className="text-2xl font-semibold">{totalVehicles}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="rounded-md bg-emerald-600/10 p-2 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active Drivers</div>
              <div className="text-2xl font-semibold">{totalActiveDrivers}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="rounded-md bg-sky-600/10 p-2 text-sky-600">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Fuel Used (L)</div>
              <div className="text-2xl font-semibold">{fuelUsed.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="rounded-md bg-amber-600/10 p-2 text-amber-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Avg Mileage (KM/L)</div>
              <div className="text-2xl font-semibold">{avgMileage}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vehicle Status */}
        <Card>
          <CardHeader>
            <div className="font-medium">Vehicle Status</div>
            <Badge variant="outline">Live</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleStatusData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={55} label>
                    {vehicleStatusData.map((_, idx) => (
                      <Cell key={idx} fill={['#10b981', '#94a3b8', '#f59e0b'][idx]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incident Reports */}
        <Card>
          <CardHeader>
            <div className="font-medium">Incident Reports per Month</div>
            <Badge variant="outline">{new Date().getFullYear()}</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" fill="#2563eb">
                    {incidentPerMonth.map((_, i) => (
                      <Cell key={i} fill={INCIDENT_COLORS[i % INCIDENT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* KM Run */}
        <Card>
          <CardHeader>
            <div className="font-medium">KM Run (Last 30 days)</div>
            <Badge variant="outline">{totalKmRun.toLocaleString()} km</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30DaysKm}>
                  <defs>
                    <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="km" stroke="#0ea5e9" fill="url(#kmGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Total KM Run</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-semibold">{totalKmRun.toLocaleString()}</div>
              <Badge variant="info">last 30d</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Total Incidents</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-semibold">{totalIncidents}</div>
              <Badge variant="warning">monitor</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Fuel Usage (L)</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-semibold">{fuelUsed.toLocaleString()}</div>
              <Badge>est.</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-xs text-muted-foreground">Avg Mileage (KM/L)</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-semibold">{avgMileage}</div>
              <Badge variant="success">healthy</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}