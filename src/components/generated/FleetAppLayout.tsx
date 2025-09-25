import React, { useMemo, useState } from 'react';
import { Activity, Bell, Car, CircleDot, CircleGauge, ClipboardList, Download, EllipsisVertical, Fuel, Home, Loader2, LogOut, Mail, MapPin, Menu, MoreHorizontal, Plus, Search, Settings, Shield, SignalHigh, SignalLow, SignalMedium, SignalZero, Truck, Upload, User, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useIsMobile } from '../../hooks/use-mobile';

// Mock Data Generators
const vehicleStatusData = [{
  name: 'Active',
  value: 48
}, {
  name: 'Inactive',
  value: 9
}, {
  name: 'Maintenance',
  value: 7
}];
const INCIDENT_COLORS = ['#2563eb', '#f97316', '#22c55e', '#ef4444', '#06b6d4', '#a855f7', '#f59e0b', '#14b8a6', '#84cc16', '#e11d48', '#0ea5e9', '#10b981'];
const incidentPerMonth = Array.from({
  length: 12
}, (_, i) => {
  const month = new Date(2025, i, 1).toLocaleString('default', {
    month: 'short'
  });
  return {
    month,
    incidents: Math.floor(Math.random() * 12)
  };
});
const last30DaysKm = Array.from({
  length: 30
}, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    }),
    km: Math.floor(50 + Math.random() * 220)
  };
});

// Drivers mock
type Driver = {
  id: string;
  name: string;
  photo: string;
  mobile: string;
  licenseNo: string;
  email: string;
  rfid: string;
  assignedVehicle?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
};
const MOCK_DRIVERS: Driver[] = Array.from({
  length: 42
}, (_, i) => ({
  id: `DRV${1000 + i}`,
  name: `Driver ${i + 1}`,
  photo: `https://i.pravatar.cc/100?img=${i % 70 + 1}`,
  mobile: `+1 555-01${String(i).padStart(2, '0')}`,
  licenseNo: `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
  email: `driver${i + 1}@fleet.com`,
  rfid: `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
  assignedVehicle: Math.random() > 0.3 ? `V${120 + i % 18}` : undefined,
  status: (['Active', 'Inactive', 'Suspended'] as const)[Math.floor(Math.random() * 3)]
}));

// Vehicles mock
type Vehicle = {
  id: string;
  regNo: string;
  model: string;
  type: 'Truck' | 'Car' | 'Van' | 'SUV';
  assignedDriver?: string;
  gpsId: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'EV';
  lastReported: string;
};
const VEHICLE_TYPES: Vehicle['type'][] = ['Truck', 'Car', 'Van', 'SUV'];
const FUEL_TYPES: Vehicle['fuelType'][] = ['Petrol', 'Diesel', 'CNG', 'EV'];
const MOCK_VEHICLES: Vehicle[] = Array.from({
  length: 34
}, (_, i) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - Math.floor(Math.random() * 6000));
  return {
    id: `VID${100 + i}`,
    regNo: `V${120 + i}`,
    model: ['Ford F-150', 'Toyota Hilux', 'Mercedes Sprinter', 'Nissan Navara', 'Isuzu D-Max'][i % 5],
    type: VEHICLE_TYPES[i % VEHICLE_TYPES.length],
    assignedDriver: Math.random() > 0.25 ? MOCK_DRIVERS[i % MOCK_DRIVERS.length].name : undefined,
    gpsId: `GPS-${Math.floor(1000000 + Math.random() * 9000000)}`,
    status: (['Active', 'Inactive', 'Maintenance'] as const)[i % 3],
    fuelType: FUEL_TYPES[i % FUEL_TYPES.length],
    lastReported: d.toISOString()
  };
});

// Platform activity logs
type LogItem = {
  id: string;
  timestamp: string;
  action: string;
  module: 'Vehicle' | 'Driver' | 'Admin';
  performedBy: string;
  notes?: string;
};
const MOCK_LOGS: LogItem[] = Array.from({
  length: 80
}, (_, i) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - i * 13);
  const actions = ['Vehicle disabled', 'Driver assigned RFID', 'SMS sent to GPS tracker', 'Vehicle enabled', 'GPS toggled', 'Incident reported'];
  const modules: LogItem['module'][] = ['Vehicle', 'Driver', 'Admin'];
  const action = actions[i % actions.length];
  return {
    id: `LOG-${i + 1}`,
    timestamp: d.toISOString(),
    action,
    module: modules[i % modules.length],
    performedBy: ['System', 'Admin', 'OpsUser1', 'OpsUser2'][i % 4],
    notes: action === 'Vehicle disabled' ? `Vehicle V${120 + i % 30} disabled due to maintenance` : action === 'Driver assigned RFID' ? `Driver ${MOCK_DRIVERS[i % MOCK_DRIVERS.length].name} assigned RFID` : action === 'SMS sent to GPS tracker' ? `Config SMS sent to GPS ${MOCK_VEHICLES[i % MOCK_VEHICLES.length].gpsId}` : undefined
  };
});

// Utility small components
function Kbd({
  children
}: {
  children: React.ReactNode;
}) {
  return <kbd className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs text-muted-foreground bg-secondary">
      {children}
    </kbd>;
}
function Badge({
  children,
  variant = 'default'
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'info';
}) {
  const color = variant === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : variant === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' : variant === 'destructive' ? 'bg-rose-100 text-rose-700 border-rose-200' : variant === 'outline' ? 'bg-transparent text-foreground border-border' : variant === 'info' ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-gray-100 text-gray-700 border-gray-200';
  return <span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium', color)}>{children}</span>;
}
function PillButton({
  children,
  icon,
  onClick,
  variant = 'primary',
  type = 'button'
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
}) {
  const style = variant === 'primary' ? 'bg-primary text-primary-foreground hover:opacity-90' : variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'hover:bg-muted text-foreground';
  return <button type={type} onClick={onClick} className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition', style)}>
      {icon}
      {children}
    </button>;
}
function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>{children}</div>;
}
function CardHeader({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex items-center justify-between p-4 border-b', className)}>{children}</div>;
}
function CardContent({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
type PageKey = 'dashboard' | 'drivers' | 'add-driver' | 'vehicles' | 'register-vehicle' | 'logs' | 'vehicle-detail';
type NavItem = {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
};
const NAV_ITEMS: NavItem[] = [{
  key: 'dashboard',
  label: 'Dashboard',
  icon: <Home className="h-4 w-4" />
}, {
  key: 'drivers',
  label: 'Drivers',
  icon: <Users className="h-4 w-4" />
}, {
  key: 'add-driver',
  label: 'Add Driver',
  icon: <User className="h-4 w-4" />
}, {
  key: 'vehicles',
  label: 'Vehicles',
  icon: <Truck className="h-4 w-4" />
}, {
  key: 'register-vehicle',
  label: 'Register Vehicle',
  icon: <Plus className="h-4 w-4" />
}, {
  key: 'logs',
  label: 'Logs',
  icon: <ClipboardList className="h-4 w-4" />
}];

// Layout Components
function Sidebar({
  active,
  setActive,
  collapsed,
  onToggle
}: {
  active: PageKey;
  setActive: (key: PageKey) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return <aside className={cn('h-full border-r bg-sidebar flex flex-col', collapsed ? 'w-16' : 'w-64')}>
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b p-3">
        <div className="h-8 w-8 rounded bg-primary text-primary-foreground grid place-items-center">
          <Shield className="h-5 w-5" />
        </div>
        {!collapsed && <div className="font-semibold">FleetSight</div>}
        <button aria-label="Toggle sidebar" className="ml-auto rounded p-2 hover:bg-muted" onClick={onToggle}>
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 p-2">
        {NAV_ITEMS.map(item => {
        const isActive = active === item.key;
        return <button key={item.key} onClick={() => setActive(item.key)} className={cn('w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90')}>
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>;
      })}
      </nav>
      <div className="border-t p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <img src="https://i.pravatar.cc/48?img=12" alt="User" className="h-8 w-8 rounded-full" />
          {!collapsed && <div className="text-sm">
              <div className="font-medium">Alex Morgan</div>
              <div className="text-muted-foreground">Admin</div>
            </div>}
          <button className="ml-auto rounded p-2 hover:bg-muted" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <button className="rounded p-2 hover:bg-muted" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>;
}
function Topbar({
  onSearch,
  onQuick
}: {
  onSearch: (q: string) => void;
  onQuick: (action: string) => void;
}) {
  const [q, setQ] = useState('');
  return <div className="sticky top-0 z-20 border-b bg-background">
      <div className="flex items-center gap-3 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input aria-label="Global search" className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm" placeholder="Search vehicles, drivers, GPS ID..." value={q} onChange={e => {
          setQ(e.target.value);
          onSearch(e.target.value);
        }} />
        </div>
        <PillButton variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => onQuick('add-driver')}>
          Add Driver
        </PillButton>
        <PillButton variant="primary" icon={<Truck className="h-4 w-4" />} onClick={() => onQuick('register-vehicle')}>
          Register Vehicle
        </PillButton>
        <button className="relative rounded p-2 hover:bg-muted" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
        </button>
      </div>
    </div>;
}

// DASHBOARD
function Dashboard({
  goto
}: {
  goto: (page: PageKey) => void;
}) {
  const totalVehicles = MOCK_VEHICLES.length;
  const totalActiveDrivers = MOCK_DRIVERS.filter(d => d.status === 'Active').length;
  const totalIncidents = incidentPerMonth.reduce((a, b) => a + b.incidents, 0);
  const totalKmRun = last30DaysKm.reduce((a, b) => a + b.km, 0);
  const fuelUsed = Math.floor(totalKmRun / 8.5); // mock
  const avgMileage = (totalKmRun / fuelUsed).toFixed(1);
  return <div className="p-4 md:p-6 space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="font-medium">Vehicle Status</div>
            <Badge variant="outline">Live</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleStatusData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={55} label>
                    {vehicleStatusData.map((_, idx) => <Cell key={idx} fill={['#10b981', '#94a3b8', '#f59e0b'][idx]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
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
                    {incidentPerMonth.map((_, i) => <Cell key={i} fill={INCIDENT_COLORS[i % INCIDENT_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
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
                  <XAxis dataKey="date" tick={{
                  fontSize: 10
                }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="km" stroke="#0ea5e9" fill="url(#kmGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

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

      <div className="flex flex-wrap gap-3">
        <PillButton icon={<Plus className="h-4 w-4" />} onClick={() => goto('register-vehicle')} variant="primary">
          Register Vehicle
        </PillButton>
        <PillButton icon={<User className="h-4 w-4" />} onClick={() => goto('add-driver')} variant="secondary">
          Add Driver
        </PillButton>
        <PillButton icon={<ClipboardList className="h-4 w-4" />} onClick={() => goto('logs')} variant="ghost">
          View Logs
        </PillButton>
      </div>
    </div>;
}

// DRIVERS LIST
function DriversPage({
  query,
  setQuery,
  gotoVehicle
}: {
  query: string;
  setQuery: (q: string) => void;
  gotoVehicle: (id: string) => void;
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
              {pageData.map(d => <tr key={d.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{d.name}</td>
                  <td className="py-3 pr-4">
                    <img src={d.photo} alt={d.name} className="h-10 w-10 rounded-full object-cover" />
                  </td>
                  <td className="py-3 pr-4">{d.mobile}</td>
                  <td className="py-3 pr-4">{d.licenseNo}</td>
                  <td className="py-3 pr-4">{d.email}</td>
                  <td className="py-3 pr-4">{d.rfid}</td>
                  <td className="py-3 pr-4">
                    {d.assignedVehicle ? <button className="underline decoration-dotted underline-offset-4" onClick={() => gotoVehicle(d.assignedVehicle!)}>
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
                      <button className="rounded-md border px-2 py-1 hover:bg-muted text-xs">View</button>
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

// ADD DRIVER FORM
function AddDriverForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    photo: '',
    mobile: '',
    email: '',
    licenseNo: '',
    rfid: '',
    assignedVehicle: '',
    status: true
  });
  const vehicles = ['None', ...MOCK_VEHICLES.map(v => v.regNo)];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setTimeout(() => {
      setLoading(false);
      setSuccess(`Driver ${form.name || 'Unnamed'} created successfully`);
    }, 1200);
  };
  return <div className="p-4 md:p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="font-medium">Add Driver</div>
          <div className="text-xs text-muted-foreground">Upload driver details. Photos are optional.</div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm">Name</label>
              <input required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="Full name" value={form.name} onChange={e => setForm(s => ({
              ...s,
              name: e.target.value
            }))} />
            </div>
            <div>
              <label className="text-sm">Mobile</label>
              <input type="tel" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="+1 555-..." value={form.mobile} onChange={e => setForm(s => ({
              ...s,
              mobile: e.target.value
            }))} />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input type="email" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="name@company.com" value={form.email} onChange={e => setForm(s => ({
              ...s,
              email: e.target.value
            }))} />
            </div>
            <div>
              <label className="text-sm">License No</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="LIC-XXXXXX" value={form.licenseNo} onChange={e => setForm(s => ({
              ...s,
              licenseNo: e.target.value
            }))} />
            </div>
            <div>
              <label className="text-sm">RFID Card ID</label>
              <div className="mt-1 flex gap-2">
                <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Scan or enter manually" value={form.rfid} onChange={e => setForm(s => ({
                ...s,
                rfid: e.target.value
              }))} />
                <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                ...s,
                rfid: `RFID-${Math.floor(100000 + Math.random() * 900000)}`
              }))}>
                  Scan
                </button>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Use a handheld scanner or manual input.</div>
            </div>
            <div>
              <label className="text-sm">Assign Vehicle</label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.assignedVehicle} onChange={e => setForm(s => ({
              ...s,
              assignedVehicle: e.target.value
            }))}>
                {vehicles.map(v => <option key={v} value={v === 'None' ? '' : v}>
                    {v}
                  </option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Photo Upload</label>
              <div className="mt-1 flex items-center gap-3">
                {form.photo ? <img src={form.photo} className="h-16 w-16 rounded object-cover" alt="Driver preview" /> : <div className="h-16 w-16 rounded bg-muted grid place-items-center text-muted-foreground">
                    <User className="h-6 w-6" />
                  </div>}
                <div className="flex gap-2">
                  <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                  ...s,
                  photo: `https://i.pravatar.cc/128?u=${encodeURIComponent(form.email || form.name || 'driver')}`
                }))}>
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                  <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                  ...s,
                  photo: ''
                }))}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input id="status" type="checkbox" checked={form.status} onChange={e => setForm(s => ({
              ...s,
              status: e.target.checked
            }))} />
              <label htmlFor="status" className="text-sm">
                Status Active
              </label>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <PillButton type="submit" variant="primary" icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}>
                {loading ? 'Saving...' : 'Create Driver'}
              </PillButton>
              {success && <Badge variant="success">{success}</Badge>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>;
}

// VEHICLE LIST
function VehiclesPage({
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
                      <Badge variant={v.status === 'Active' ? 'success' : v.status === 'Maintenance' ? 'warning' : 'outline'}>{v.status}</Badge>
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

// REGISTER VEHICLE FORM
function RegisterVehicleForm() {
  const [loading, setLoading] = useState(false);
  const [smsSent, setSmsSent] = useState<string | null>(null);
  const [form, setForm] = useState({
    regNo: '',
    type: 'Truck' as Vehicle['type'],
    model: '',
    fuelType: 'Diesel' as Vehicle['fuelType'],
    odo: '',
    driver: '',
    gps: '',
    sim: '',
    image: '',
    gpsEnabled: true
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSmsSent(null);
    setTimeout(() => {
      setLoading(false);
      setSmsSent(`Config SMS sent to GPS ${form.gps || 'N/A'} to register with server.`);
    }, 1400);
  };
  return <div className="p-4 md:p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="font-medium">New Vehicle Registration</div>
          <div className="text-xs text-muted-foreground">This will configure the GPS tracker via SMS.</div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Reg Number</label>
              <input required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., V200" value={form.regNo} onChange={e => setForm(s => ({
              ...s,
              regNo: e.target.value
            }))} />
            </div>
            <div>
              <label className="text-sm">Vehicle Type</label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.type} onChange={e => setForm(s => ({
              ...s,
              type: e.target.value as Vehicle['type']
            }))}>
                {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm">Model</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="Model name" value={form.model} onChange={e => setForm(s => ({
              ...s,
              model: e.target.value
            }))} />
            </div>
            <div>
              <label className="text-sm">Fuel Type</label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.fuelType} onChange={e => setForm(s => ({
              ...s,
              fuelType: e.target.value as Vehicle['fuelType']
            }))}>
                {FUEL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm">Odometer Start</label>
              <input type="number" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., 12000" value={form.odo} onChange={e => setForm(s => ({
              ...s,
              odo: e.target.value
            }))} />
            </div>
            <div>
              <label className="text-sm">Assigned Driver</label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.driver} onChange={e => setForm(s => ({
              ...s,
              driver: e.target.value
            }))}>
                <option value="">None</option>
                {MOCK_DRIVERS.map(d => <option key={d.id} value={d.name}>
                    {d.name}
                  </option>)}
              </select>
            </div>
            <div>
              <label className="text-sm">GPS Device ID / IMEI</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., 86457800321..." value={form.gps} onChange={e => setForm(s => ({
              ...s,
              gps: e.target.value
            }))} />
            </div>
            <div>
              <label className="text-sm">SIM Number</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., +15550123456" value={form.sim} onChange={e => setForm(s => ({
              ...s,
              sim: e.target.value
            }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Vehicle Image</label>
              <div className="mt-1 flex items-center gap-3">
                {form.image ? <img src={form.image} alt="Vehicle" className="h-20 w-32 rounded object-cover" /> : <div className="h-20 w-32 rounded bg-muted grid place-items-center text-muted-foreground">
                    <Car className="h-6 w-6" />
                  </div>}
                <div className="flex gap-2">
                  <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                  ...s,
                  image: `https://picsum.photos/seed/${Date.now()}/320/200`
                }))}>
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                  <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                  ...s,
                  image: ''
                }))}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input id="gps-en" type="checkbox" checked={form.gpsEnabled} onChange={e => setForm(s => ({
              ...s,
              gpsEnabled: e.target.checked
            }))} />
              <label htmlFor="gps-en" className="text-sm">
                Enable GPS
              </label>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <PillButton type="submit" variant="primary" icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}>
                {loading ? 'Registering...' : 'Register Vehicle'}
              </PillButton>
              {smsSent && <Badge variant="info">{smsSent}</Badge>}
            </div>
          </form>
          <div className="mt-4 text-xs text-muted-foreground">
            On submit, the system simulates sending SMS commands to set APN and server IP on the GPS tracker.
          </div>
        </CardContent>
      </Card>
    </div>;
}

// VEHICLE DETAIL
function VehicleDetail({
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

// ACTIVITY LOGS
function ActivityLogs() {
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

// Router-like state in layout
type RouteState = {
  page: 'dashboard';
} | {
  page: 'drivers';
} | {
  page: 'add-driver';
} | {
  page: 'vehicles';
} | {
  page: 'register-vehicle';
} | {
  page: 'logs';
} | {
  page: 'vehicle-detail';
  regNo: string;
};

// @component: FleetAppLayout
export const FleetAppLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [route, setRoute] = useState<RouteState>({
    page: 'dashboard'
  });
  const goto = (p: PageKey) => {
    if (p === 'dashboard') setRoute({
      page: 'dashboard'
    });
    if (p === 'drivers') setRoute({
      page: 'drivers'
    });
    if (p === 'add-driver') setRoute({
      page: 'add-driver'
    });
    if (p === 'vehicles') setRoute({
      page: 'vehicles'
    });
    if (p === 'register-vehicle') setRoute({
      page: 'register-vehicle'
    });
    if (p === 'logs') setRoute({
      page: 'logs'
    });
  };

  // @return
  return <div className="h-full w-full grid" style={{
    gridTemplateColumns: isMobile ? '1fr' : collapsed ? '4rem 1fr' : '16rem 1fr',
    gridTemplateRows: 'auto 1fr'
  }}>
      {!isMobile && <div className="row-span-2">
          <Sidebar active={route.page as PageKey} setActive={goto} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        </div>}
      <div className="col-span-1">
        <Topbar onSearch={q => setGlobalQuery(q)} onQuick={a => {
        if (a === 'add-driver') goto('add-driver');
        if (a === 'register-vehicle') goto('register-vehicle');
      }} />
      </div>
      <main className="col-span-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div key={JSON.stringify(route)} initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -8
        }}>
            {route.page === 'dashboard' && <Dashboard goto={goto} />}
            {route.page === 'drivers' && <DriversPage query={globalQuery} setQuery={q => setGlobalQuery(q)} gotoVehicle={regNo => setRoute({
            page: 'vehicle-detail',
            regNo
          })} />}
            {route.page === 'add-driver' && <AddDriverForm />}
            {route.page === 'vehicles' && <VehiclesPage onOpenRegister={() => goto('register-vehicle')} gotoVehicle={regNo => setRoute({
            page: 'vehicle-detail',
            regNo
          })} />}
            {route.page === 'register-vehicle' && <RegisterVehicleForm />}
            {route.page === 'logs' && <ActivityLogs />}
            {route.page === 'vehicle-detail' && <VehicleDetail regNo={route.regNo} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>;
};