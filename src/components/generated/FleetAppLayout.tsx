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
  return <kbd className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs text-muted-foreground bg-secondary" data-magicpath-id="0" data-magicpath-path="FleetAppLayout.tsx">
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
  return <span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium', color)} data-magicpath-id="1" data-magicpath-path="FleetAppLayout.tsx">{children}</span>;
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
  return <button type={type} onClick={onClick} className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition', style)} data-magicpath-id="2" data-magicpath-path="FleetAppLayout.tsx">
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
  return <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} data-magicpath-id="3" data-magicpath-path="FleetAppLayout.tsx">{children}</div>;
}
function CardHeader({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex items-center justify-between p-4 border-b', className)} data-magicpath-id="4" data-magicpath-path="FleetAppLayout.tsx">{children}</div>;
}
function CardContent({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('p-4', className)} data-magicpath-id="5" data-magicpath-path="FleetAppLayout.tsx">{children}</div>;
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
  icon: <Home className="h-4 w-4" data-magicpath-id="6" data-magicpath-path="FleetAppLayout.tsx" />
}, {
  key: 'drivers',
  label: 'Drivers',
  icon: <Users className="h-4 w-4" data-magicpath-id="7" data-magicpath-path="FleetAppLayout.tsx" />
}, {
  key: 'add-driver',
  label: 'Add Driver',
  icon: <User className="h-4 w-4" data-magicpath-id="8" data-magicpath-path="FleetAppLayout.tsx" />
}, {
  key: 'vehicles',
  label: 'Vehicles',
  icon: <Truck className="h-4 w-4" data-magicpath-id="9" data-magicpath-path="FleetAppLayout.tsx" />
}, {
  key: 'register-vehicle',
  label: 'Register Vehicle',
  icon: <Plus className="h-4 w-4" data-magicpath-id="10" data-magicpath-path="FleetAppLayout.tsx" />
}, {
  key: 'logs',
  label: 'Logs',
  icon: <ClipboardList className="h-4 w-4" data-magicpath-id="11" data-magicpath-path="FleetAppLayout.tsx" />
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
  return <aside className={cn('h-full border-r bg-sidebar flex flex-col', collapsed ? 'w-16' : 'w-64')} data-magicpath-id="12" data-magicpath-path="FleetAppLayout.tsx">
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b p-3" data-magicpath-id="13" data-magicpath-path="FleetAppLayout.tsx">
        <div className="h-8 w-8 rounded bg-primary text-primary-foreground grid place-items-center" data-magicpath-id="14" data-magicpath-path="FleetAppLayout.tsx">
          <Shield className="h-5 w-5" data-magicpath-id="15" data-magicpath-path="FleetAppLayout.tsx" />
        </div>
        {!collapsed && <div className="font-semibold" data-magicpath-id="16" data-magicpath-path="FleetAppLayout.tsx">FleetSight</div>}
        <button aria-label="Toggle sidebar" className="ml-auto rounded p-2 hover:bg-muted" onClick={onToggle} data-magicpath-id="17" data-magicpath-path="FleetAppLayout.tsx">
          <Menu className="h-4 w-4" data-magicpath-id="18" data-magicpath-path="FleetAppLayout.tsx" />
        </button>
      </div>
      <nav className="flex-1 p-2" data-magicpath-id="19" data-magicpath-path="FleetAppLayout.tsx">
        {NAV_ITEMS.map(item => {
        const isActive = active === item.key;
        return <button key={item.key} onClick={() => setActive(item.key)} className={cn('w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90')} data-magicpath-id="20" data-magicpath-path="FleetAppLayout.tsx">
              {item.icon}
              {!collapsed && <span data-magicpath-id="21" data-magicpath-path="FleetAppLayout.tsx">{item.label}</span>}
            </button>;
      })}
      </nav>
      <div className="border-t p-3" data-magicpath-id="22" data-magicpath-path="FleetAppLayout.tsx">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')} data-magicpath-id="23" data-magicpath-path="FleetAppLayout.tsx">
          <img src="https://i.pravatar.cc/48?img=12" alt="User" className="h-8 w-8 rounded-full" data-magicpath-id="24" data-magicpath-path="FleetAppLayout.tsx" />
          {!collapsed && <div className="text-sm" data-magicpath-id="25" data-magicpath-path="FleetAppLayout.tsx">
              <div className="font-medium" data-magicpath-id="26" data-magicpath-path="FleetAppLayout.tsx">Alex Morgan</div>
              <div className="text-muted-foreground" data-magicpath-id="27" data-magicpath-path="FleetAppLayout.tsx">Admin</div>
            </div>}
          <button className="ml-auto rounded p-2 hover:bg-muted" aria-label="Settings" data-magicpath-id="28" data-magicpath-path="FleetAppLayout.tsx">
            <Settings className="h-4 w-4" data-magicpath-id="29" data-magicpath-path="FleetAppLayout.tsx" />
          </button>
          <button className="rounded p-2 hover:bg-muted" aria-label="Logout" data-magicpath-id="30" data-magicpath-path="FleetAppLayout.tsx">
            <LogOut className="h-4 w-4" data-magicpath-id="31" data-magicpath-path="FleetAppLayout.tsx" />
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
  return <div className="sticky top-0 z-20 border-b bg-background" data-magicpath-id="32" data-magicpath-path="FleetAppLayout.tsx">
      <div className="flex items-center gap-3 p-3" data-magicpath-id="33" data-magicpath-path="FleetAppLayout.tsx">
        <div className="relative flex-1" data-magicpath-id="34" data-magicpath-path="FleetAppLayout.tsx">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" data-magicpath-id="35" data-magicpath-path="FleetAppLayout.tsx" />
          <input aria-label="Global search" className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm" placeholder="Search vehicles, drivers, GPS ID..." value={q} onChange={e => {
          setQ(e.target.value);
          onSearch(e.target.value);
        }} data-magicpath-id="36" data-magicpath-path="FleetAppLayout.tsx" />
        </div>
        <PillButton variant="secondary" icon={<Plus className="h-4 w-4" data-magicpath-id="38" data-magicpath-path="FleetAppLayout.tsx" />} onClick={() => onQuick('add-driver')} data-magicpath-id="37" data-magicpath-path="FleetAppLayout.tsx">
          Add Driver
        </PillButton>
        <PillButton variant="primary" icon={<Truck className="h-4 w-4" data-magicpath-id="40" data-magicpath-path="FleetAppLayout.tsx" />} onClick={() => onQuick('register-vehicle')} data-magicpath-id="39" data-magicpath-path="FleetAppLayout.tsx">
          Register Vehicle
        </PillButton>
        <button className="relative rounded p-2 hover:bg-muted" aria-label="Notifications" data-magicpath-id="41" data-magicpath-path="FleetAppLayout.tsx">
          <Bell className="h-5 w-5" data-magicpath-id="42" data-magicpath-path="FleetAppLayout.tsx" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" data-magicpath-id="43" data-magicpath-path="FleetAppLayout.tsx" />
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
  return <div className="p-4 md:p-6 space-y-6" data-magicpath-id="44" data-magicpath-path="FleetAppLayout.tsx">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-magicpath-id="45" data-magicpath-path="FleetAppLayout.tsx">
        <Card data-magicpath-id="46" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent className="flex items-center gap-3" data-magicpath-id="47" data-magicpath-path="FleetAppLayout.tsx">
            <div className="rounded-md bg-blue-600/10 p-2 text-blue-600" data-magicpath-id="48" data-magicpath-path="FleetAppLayout.tsx">
              <Truck className="h-5 w-5" data-magicpath-id="49" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="50" data-magicpath-path="FleetAppLayout.tsx">
              <div className="text-xs text-muted-foreground" data-magicpath-id="51" data-magicpath-path="FleetAppLayout.tsx">Total Vehicles</div>
              <div className="text-2xl font-semibold" data-magicpath-id="52" data-magicpath-path="FleetAppLayout.tsx">{totalVehicles}</div>
            </div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="53" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent className="flex items-center gap-3" data-magicpath-id="54" data-magicpath-path="FleetAppLayout.tsx">
            <div className="rounded-md bg-emerald-600/10 p-2 text-emerald-600" data-magicpath-id="55" data-magicpath-path="FleetAppLayout.tsx">
              <Users className="h-5 w-5" data-magicpath-id="56" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="57" data-magicpath-path="FleetAppLayout.tsx">
              <div className="text-xs text-muted-foreground" data-magicpath-id="58" data-magicpath-path="FleetAppLayout.tsx">Active Drivers</div>
              <div className="text-2xl font-semibold" data-magicpath-id="59" data-magicpath-path="FleetAppLayout.tsx">{totalActiveDrivers}</div>
            </div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="60" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent className="flex items-center gap-3" data-magicpath-id="61" data-magicpath-path="FleetAppLayout.tsx">
            <div className="rounded-md bg-sky-600/10 p-2 text-sky-600" data-magicpath-id="62" data-magicpath-path="FleetAppLayout.tsx">
              <Fuel className="h-5 w-5" data-magicpath-id="63" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="64" data-magicpath-path="FleetAppLayout.tsx">
              <div className="text-xs text-muted-foreground" data-magicpath-id="65" data-magicpath-path="FleetAppLayout.tsx">Fuel Used (L)</div>
              <div className="text-2xl font-semibold" data-magicpath-id="66" data-magicpath-path="FleetAppLayout.tsx">{fuelUsed.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="67" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent className="flex items-center gap-3" data-magicpath-id="68" data-magicpath-path="FleetAppLayout.tsx">
            <div className="rounded-md bg-amber-600/10 p-2 text-amber-600" data-magicpath-id="69" data-magicpath-path="FleetAppLayout.tsx">
              <Activity className="h-5 w-5" data-magicpath-id="70" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="71" data-magicpath-path="FleetAppLayout.tsx">
              <div className="text-xs text-muted-foreground" data-magicpath-id="72" data-magicpath-path="FleetAppLayout.tsx">Avg Mileage (KM/L)</div>
              <div className="text-2xl font-semibold" data-magicpath-id="73" data-magicpath-path="FleetAppLayout.tsx">{avgMileage}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-magicpath-id="74" data-magicpath-path="FleetAppLayout.tsx">
        <Card className="lg:col-span-1" data-magicpath-id="75" data-magicpath-path="FleetAppLayout.tsx">
          <CardHeader data-magicpath-id="76" data-magicpath-path="FleetAppLayout.tsx">
            <div className="font-medium" data-magicpath-id="77" data-magicpath-path="FleetAppLayout.tsx">Vehicle Status</div>
            <Badge variant="outline" data-magicpath-id="78" data-magicpath-path="FleetAppLayout.tsx">Live</Badge>
          </CardHeader>
          <CardContent data-magicpath-id="79" data-magicpath-path="FleetAppLayout.tsx">
            <div className="h-64" data-magicpath-id="80" data-magicpath-path="FleetAppLayout.tsx">
              <ResponsiveContainer width="100%" height="100%" data-magicpath-id="81" data-magicpath-path="FleetAppLayout.tsx">
                <PieChart data-magicpath-id="82" data-magicpath-path="FleetAppLayout.tsx">
                  <Pie data={vehicleStatusData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={55} label data-magicpath-id="83" data-magicpath-path="FleetAppLayout.tsx">
                    {vehicleStatusData.map((_, idx) => <Cell key={idx} fill={['#10b981', '#94a3b8', '#f59e0b'][idx]} data-magicpath-id="84" data-magicpath-path="FleetAppLayout.tsx" />)}
                  </Pie>
                  <Tooltip data-magicpath-id="85" data-magicpath-path="FleetAppLayout.tsx" />
                  <Legend data-magicpath-id="86" data-magicpath-path="FleetAppLayout.tsx" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1" data-magicpath-id="87" data-magicpath-path="FleetAppLayout.tsx">
          <CardHeader data-magicpath-id="88" data-magicpath-path="FleetAppLayout.tsx">
            <div className="font-medium" data-magicpath-id="89" data-magicpath-path="FleetAppLayout.tsx">Incident Reports per Month</div>
            <Badge variant="outline" data-magicpath-id="90" data-magicpath-path="FleetAppLayout.tsx">{new Date().getFullYear()}</Badge>
          </CardHeader>
          <CardContent data-magicpath-id="91" data-magicpath-path="FleetAppLayout.tsx">
            <div className="h-64" data-magicpath-id="92" data-magicpath-path="FleetAppLayout.tsx">
              <ResponsiveContainer width="100%" height="100%" data-magicpath-id="93" data-magicpath-path="FleetAppLayout.tsx">
                <BarChart data={incidentPerMonth} data-magicpath-id="94" data-magicpath-path="FleetAppLayout.tsx">
                  <CartesianGrid strokeDasharray="3 3" data-magicpath-id="95" data-magicpath-path="FleetAppLayout.tsx" />
                  <XAxis dataKey="month" data-magicpath-id="96" data-magicpath-path="FleetAppLayout.tsx" />
                  <YAxis data-magicpath-id="97" data-magicpath-path="FleetAppLayout.tsx" />
                  <Tooltip data-magicpath-id="98" data-magicpath-path="FleetAppLayout.tsx" />
                  <Legend data-magicpath-id="99" data-magicpath-path="FleetAppLayout.tsx" />
                  <Bar dataKey="incidents" fill="#2563eb" data-magicpath-id="100" data-magicpath-path="FleetAppLayout.tsx">
                    {incidentPerMonth.map((_, i) => <Cell key={i} fill={INCIDENT_COLORS[i % INCIDENT_COLORS.length]} data-magicpath-id="101" data-magicpath-path="FleetAppLayout.tsx" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1" data-magicpath-id="102" data-magicpath-path="FleetAppLayout.tsx">
          <CardHeader data-magicpath-id="103" data-magicpath-path="FleetAppLayout.tsx">
            <div className="font-medium" data-magicpath-id="104" data-magicpath-path="FleetAppLayout.tsx">KM Run (Last 30 days)</div>
            <Badge variant="outline" data-magicpath-id="105" data-magicpath-path="FleetAppLayout.tsx">{totalKmRun.toLocaleString()} km</Badge>
          </CardHeader>
          <CardContent data-magicpath-id="106" data-magicpath-path="FleetAppLayout.tsx">
            <div className="h-64" data-magicpath-id="107" data-magicpath-path="FleetAppLayout.tsx">
              <ResponsiveContainer width="100%" height="100%" data-magicpath-id="108" data-magicpath-path="FleetAppLayout.tsx">
                <AreaChart data={last30DaysKm} data-magicpath-id="109" data-magicpath-path="FleetAppLayout.tsx">
                  <defs data-magicpath-id="110" data-magicpath-path="FleetAppLayout.tsx">
                    <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1" data-magicpath-id="111" data-magicpath-path="FleetAppLayout.tsx">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" data-magicpath-id="112" data-magicpath-path="FleetAppLayout.tsx" />
                  <XAxis dataKey="date" tick={{
                  fontSize: 10
                }} data-magicpath-id="113" data-magicpath-path="FleetAppLayout.tsx" />
                  <YAxis data-magicpath-id="114" data-magicpath-path="FleetAppLayout.tsx" />
                  <Tooltip data-magicpath-id="115" data-magicpath-path="FleetAppLayout.tsx" />
                  <Area type="monotone" dataKey="km" stroke="#0ea5e9" fill="url(#kmGradient)" data-magicpath-id="116" data-magicpath-path="FleetAppLayout.tsx" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-magicpath-id="117" data-magicpath-path="FleetAppLayout.tsx">
        <Card data-magicpath-id="118" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="119" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="120" data-magicpath-path="FleetAppLayout.tsx">Total KM Run</div>
            <div className="mt-2 flex items-end justify-between" data-magicpath-id="121" data-magicpath-path="FleetAppLayout.tsx">
              <div className="text-2xl font-semibold" data-magicpath-id="122" data-magicpath-path="FleetAppLayout.tsx">{totalKmRun.toLocaleString()}</div>
              <Badge variant="info" data-magicpath-id="123" data-magicpath-path="FleetAppLayout.tsx">last 30d</Badge>
            </div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="124" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="125" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="126" data-magicpath-path="FleetAppLayout.tsx">Total Incidents</div>
            <div className="mt-2 flex items-end justify-between" data-magicpath-id="127" data-magicpath-path="FleetAppLayout.tsx">
              <div className="text-2xl font-semibold" data-magicpath-id="128" data-magicpath-path="FleetAppLayout.tsx">{totalIncidents}</div>
              <Badge variant="warning" data-magicpath-id="129" data-magicpath-path="FleetAppLayout.tsx">monitor</Badge>
            </div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="130" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="131" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="132" data-magicpath-path="FleetAppLayout.tsx">Fuel Usage (L)</div>
            <div className="mt-2 flex items-end justify-between" data-magicpath-id="133" data-magicpath-path="FleetAppLayout.tsx">
              <div className="text-2xl font-semibold" data-magicpath-id="134" data-magicpath-path="FleetAppLayout.tsx">{fuelUsed.toLocaleString()}</div>
              <Badge data-magicpath-id="135" data-magicpath-path="FleetAppLayout.tsx">est.</Badge>
            </div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="136" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="137" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="138" data-magicpath-path="FleetAppLayout.tsx">Avg Mileage (KM/L)</div>
            <div className="mt-2 flex items-end justify-between" data-magicpath-id="139" data-magicpath-path="FleetAppLayout.tsx">
              <div className="text-2xl font-semibold" data-magicpath-id="140" data-magicpath-path="FleetAppLayout.tsx">{avgMileage}</div>
              <Badge variant="success" data-magicpath-id="141" data-magicpath-path="FleetAppLayout.tsx">healthy</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3" data-magicpath-id="142" data-magicpath-path="FleetAppLayout.tsx">
        <PillButton icon={<Plus className="h-4 w-4" data-magicpath-id="144" data-magicpath-path="FleetAppLayout.tsx" />} onClick={() => goto('register-vehicle')} variant="primary" data-magicpath-id="143" data-magicpath-path="FleetAppLayout.tsx">
          Register Vehicle
        </PillButton>
        <PillButton icon={<User className="h-4 w-4" data-magicpath-id="146" data-magicpath-path="FleetAppLayout.tsx" />} onClick={() => goto('add-driver')} variant="secondary" data-magicpath-id="145" data-magicpath-path="FleetAppLayout.tsx">
          Add Driver
        </PillButton>
        <PillButton icon={<ClipboardList className="h-4 w-4" data-magicpath-id="148" data-magicpath-path="FleetAppLayout.tsx" />} onClick={() => goto('logs')} variant="ghost" data-magicpath-id="147" data-magicpath-path="FleetAppLayout.tsx">
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
  return <div className="p-4 md:p-6 space-y-4" data-magicpath-id="149" data-magicpath-path="FleetAppLayout.tsx">
      <Card data-magicpath-id="150" data-magicpath-path="FleetAppLayout.tsx">
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" data-magicpath-id="151" data-magicpath-path="FleetAppLayout.tsx">
          <div className="flex gap-2 items-center" data-magicpath-id="152" data-magicpath-path="FleetAppLayout.tsx">
            <label className="text-sm" data-magicpath-id="153" data-magicpath-path="FleetAppLayout.tsx">Status</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} data-magicpath-id="154" data-magicpath-path="FleetAppLayout.tsx">
              {['All', 'Active', 'Inactive', 'Suspended'].map(s => <option key={s} data-magicpath-id="155" data-magicpath-path="FleetAppLayout.tsx">{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 items-center" data-magicpath-id="156" data-magicpath-path="FleetAppLayout.tsx">
            <label className="text-sm whitespace-nowrap" data-magicpath-id="157" data-magicpath-path="FleetAppLayout.tsx">Assigned Vehicle</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} data-magicpath-id="158" data-magicpath-path="FleetAppLayout.tsx">
              {vehicles.map(v => <option key={v} data-magicpath-id="159" data-magicpath-path="FleetAppLayout.tsx">{v}</option>)}
            </select>
          </div>
          <div className="flex-1" data-magicpath-id="160" data-magicpath-path="FleetAppLayout.tsx" />
          <div className="text-xs text-muted-foreground" data-magicpath-id="161" data-magicpath-path="FleetAppLayout.tsx">{filtered.length} results</div>
        </CardContent>
      </Card>

      <Card data-magicpath-id="162" data-magicpath-path="FleetAppLayout.tsx">
        <CardHeader data-magicpath-id="163" data-magicpath-path="FleetAppLayout.tsx">
          <div className="font-medium" data-magicpath-id="164" data-magicpath-path="FleetAppLayout.tsx">Drivers</div>
          <div className="text-xs text-muted-foreground" data-magicpath-id="165" data-magicpath-path="FleetAppLayout.tsx">Search is synced with top search</div>
        </CardHeader>
        <CardContent className="overflow-x-auto" data-magicpath-id="166" data-magicpath-path="FleetAppLayout.tsx">
          <table className="min-w-full text-sm" data-magicpath-id="167" data-magicpath-path="FleetAppLayout.tsx">
            <thead data-magicpath-id="168" data-magicpath-path="FleetAppLayout.tsx">
              <tr className="text-left text-xs text-muted-foreground border-b" data-magicpath-id="169" data-magicpath-path="FleetAppLayout.tsx">
                <th className="py-2 pr-4" data-magicpath-id="170" data-magicpath-path="FleetAppLayout.tsx">Name</th>
                <th className="py-2 pr-4" data-magicpath-id="171" data-magicpath-path="FleetAppLayout.tsx">Photo</th>
                <th className="py-2 pr-4" data-magicpath-id="172" data-magicpath-path="FleetAppLayout.tsx">Mobile</th>
                <th className="py-2 pr-4" data-magicpath-id="173" data-magicpath-path="FleetAppLayout.tsx">License No</th>
                <th className="py-2 pr-4" data-magicpath-id="174" data-magicpath-path="FleetAppLayout.tsx">Email</th>
                <th className="py-2 pr-4" data-magicpath-id="175" data-magicpath-path="FleetAppLayout.tsx">RFID Card ID</th>
                <th className="py-2 pr-4" data-magicpath-id="176" data-magicpath-path="FleetAppLayout.tsx">Assigned Vehicle</th>
                <th className="py-2 pr-4" data-magicpath-id="177" data-magicpath-path="FleetAppLayout.tsx">Status</th>
                <th className="py-2 pr-4 text-right" data-magicpath-id="178" data-magicpath-path="FleetAppLayout.tsx">Actions</th>
              </tr>
            </thead>
            <tbody data-magicpath-id="179" data-magicpath-path="FleetAppLayout.tsx">
              {pageData.map(d => <tr key={d.id} className="border-b last:border-0" data-magicpath-id="180" data-magicpath-path="FleetAppLayout.tsx">
                  <td className="py-3 pr-4 font-medium" data-magicpath-id="181" data-magicpath-path="FleetAppLayout.tsx">{d.name}</td>
                  <td className="py-3 pr-4" data-magicpath-id="182" data-magicpath-path="FleetAppLayout.tsx">
                    <img src={d.photo} alt={d.name} className="h-10 w-10 rounded-full object-cover" data-magicpath-id="183" data-magicpath-path="FleetAppLayout.tsx" />
                  </td>
                  <td className="py-3 pr-4" data-magicpath-id="184" data-magicpath-path="FleetAppLayout.tsx">{d.mobile}</td>
                  <td className="py-3 pr-4" data-magicpath-id="185" data-magicpath-path="FleetAppLayout.tsx">{d.licenseNo}</td>
                  <td className="py-3 pr-4" data-magicpath-id="186" data-magicpath-path="FleetAppLayout.tsx">{d.email}</td>
                  <td className="py-3 pr-4" data-magicpath-id="187" data-magicpath-path="FleetAppLayout.tsx">{d.rfid}</td>
                  <td className="py-3 pr-4" data-magicpath-id="188" data-magicpath-path="FleetAppLayout.tsx">
                    {d.assignedVehicle ? <button className="underline decoration-dotted underline-offset-4" onClick={() => gotoVehicle(d.assignedVehicle!)} data-magicpath-id="189" data-magicpath-path="FleetAppLayout.tsx">
                        {d.assignedVehicle}
                      </button> : <span className="text-muted-foreground" data-magicpath-id="190" data-magicpath-path="FleetAppLayout.tsx">-</span>}
                  </td>
                  <td className="py-3 pr-4" data-magicpath-id="191" data-magicpath-path="FleetAppLayout.tsx">
                    <Badge variant={d.status === 'Active' ? 'success' : d.status === 'Inactive' ? 'outline' : 'warning'} data-magicpath-id="192" data-magicpath-path="FleetAppLayout.tsx">
                      {d.status}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4" data-magicpath-id="193" data-magicpath-path="FleetAppLayout.tsx">
                    <div className="flex justify-end gap-2" data-magicpath-id="194" data-magicpath-path="FleetAppLayout.tsx">
                      <button className="rounded-md border px-2 py-1 hover:bg-muted text-xs" data-magicpath-id="195" data-magicpath-path="FleetAppLayout.tsx">View</button>
                      <button className="rounded-md border px-2 py-1 hover:bg-muted text-xs" data-magicpath-id="196" data-magicpath-path="FleetAppLayout.tsx">Edit</button>
                      <button className="rounded-md border px-2 py-1 hover:bg-rose-50 text-rose-600 text-xs" data-magicpath-id="197" data-magicpath-path="FleetAppLayout.tsx">Deactivate</button>
                    </div>
                  </td>
                </tr>)}
              {pageData.length === 0 && <tr data-magicpath-id="198" data-magicpath-path="FleetAppLayout.tsx">
                  <td colSpan={9} className="text-center py-10 text-muted-foreground" data-magicpath-id="199" data-magicpath-path="FleetAppLayout.tsx">
                    No drivers found for current filters.
                  </td>
                </tr>}
            </tbody>
          </table>
          <div className="flex items-center justify-between pt-4" data-magicpath-id="200" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="201" data-magicpath-path="FleetAppLayout.tsx">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2" data-magicpath-id="202" data-magicpath-path="FleetAppLayout.tsx">
              <button className="rounded-md border px-3 py-1 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => p - 1)} data-magicpath-id="203" data-magicpath-path="FleetAppLayout.tsx">
                Prev
              </button>
              <button className="rounded-md border px-3 py-1 text-sm disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} data-magicpath-id="204" data-magicpath-path="FleetAppLayout.tsx">
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
  return <div className="p-4 md:p-6" data-magicpath-id="205" data-magicpath-path="FleetAppLayout.tsx">
      <Card className="max-w-3xl mx-auto" data-magicpath-id="206" data-magicpath-path="FleetAppLayout.tsx">
        <CardHeader data-magicpath-id="207" data-magicpath-path="FleetAppLayout.tsx">
          <div className="font-medium" data-magicpath-id="208" data-magicpath-path="FleetAppLayout.tsx">Add Driver</div>
          <div className="text-xs text-muted-foreground" data-magicpath-id="209" data-magicpath-path="FleetAppLayout.tsx">Upload driver details. Photos are optional.</div>
        </CardHeader>
        <CardContent data-magicpath-id="210" data-magicpath-path="FleetAppLayout.tsx">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4" data-magicpath-id="211" data-magicpath-path="FleetAppLayout.tsx">
            <div className="md:col-span-2" data-magicpath-id="212" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="213" data-magicpath-path="FleetAppLayout.tsx">Name</label>
              <input required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="Full name" value={form.name} onChange={e => setForm(s => ({
              ...s,
              name: e.target.value
            }))} data-magicpath-id="214" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="215" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="216" data-magicpath-path="FleetAppLayout.tsx">Mobile</label>
              <input type="tel" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="+1 555-..." value={form.mobile} onChange={e => setForm(s => ({
              ...s,
              mobile: e.target.value
            }))} data-magicpath-id="217" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="218" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="219" data-magicpath-path="FleetAppLayout.tsx">Email</label>
              <input type="email" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="name@company.com" value={form.email} onChange={e => setForm(s => ({
              ...s,
              email: e.target.value
            }))} data-magicpath-id="220" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="221" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="222" data-magicpath-path="FleetAppLayout.tsx">License No</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="LIC-XXXXXX" value={form.licenseNo} onChange={e => setForm(s => ({
              ...s,
              licenseNo: e.target.value
            }))} data-magicpath-id="223" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="224" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="225" data-magicpath-path="FleetAppLayout.tsx">RFID Card ID</label>
              <div className="mt-1 flex gap-2" data-magicpath-id="226" data-magicpath-path="FleetAppLayout.tsx">
                <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Scan or enter manually" value={form.rfid} onChange={e => setForm(s => ({
                ...s,
                rfid: e.target.value
              }))} data-magicpath-id="227" data-magicpath-path="FleetAppLayout.tsx" />
                <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                ...s,
                rfid: `RFID-${Math.floor(100000 + Math.random() * 900000)}`
              }))} data-magicpath-id="228" data-magicpath-path="FleetAppLayout.tsx">
                  Scan
                </button>
              </div>
              <div className="mt-1 text-xs text-muted-foreground" data-magicpath-id="229" data-magicpath-path="FleetAppLayout.tsx">Use a handheld scanner or manual input.</div>
            </div>
            <div data-magicpath-id="230" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="231" data-magicpath-path="FleetAppLayout.tsx">Assign Vehicle</label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.assignedVehicle} onChange={e => setForm(s => ({
              ...s,
              assignedVehicle: e.target.value
            }))} data-magicpath-id="232" data-magicpath-path="FleetAppLayout.tsx">
                {vehicles.map(v => <option key={v} value={v === 'None' ? '' : v} data-magicpath-id="233" data-magicpath-path="FleetAppLayout.tsx">
                    {v}
                  </option>)}
              </select>
            </div>
            <div className="md:col-span-2" data-magicpath-id="234" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="235" data-magicpath-path="FleetAppLayout.tsx">Photo Upload</label>
              <div className="mt-1 flex items-center gap-3" data-magicpath-id="236" data-magicpath-path="FleetAppLayout.tsx">
                {form.photo ? <img src={form.photo} className="h-16 w-16 rounded object-cover" alt="Driver preview" data-magicpath-id="237" data-magicpath-path="FleetAppLayout.tsx" /> : <div className="h-16 w-16 rounded bg-muted grid place-items-center text-muted-foreground" data-magicpath-id="238" data-magicpath-path="FleetAppLayout.tsx">
                    <User className="h-6 w-6" data-magicpath-id="239" data-magicpath-path="FleetAppLayout.tsx" />
                  </div>}
                <div className="flex gap-2" data-magicpath-id="240" data-magicpath-path="FleetAppLayout.tsx">
                  <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                  ...s,
                  photo: `https://i.pravatar.cc/128?u=${encodeURIComponent(form.email || form.name || 'driver')}`
                }))} data-magicpath-id="241" data-magicpath-path="FleetAppLayout.tsx">
                    <Upload className="h-4 w-4" data-magicpath-id="242" data-magicpath-path="FleetAppLayout.tsx" />
                    Upload
                  </button>
                  <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                  ...s,
                  photo: ''
                }))} data-magicpath-id="243" data-magicpath-path="FleetAppLayout.tsx">
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:col-span-2" data-magicpath-id="244" data-magicpath-path="FleetAppLayout.tsx">
              <input id="status" type="checkbox" checked={form.status} onChange={e => setForm(s => ({
              ...s,
              status: e.target.checked
            }))} data-magicpath-id="245" data-magicpath-path="FleetAppLayout.tsx" />
              <label htmlFor="status" className="text-sm" data-magicpath-id="246" data-magicpath-path="FleetAppLayout.tsx">
                Status Active
              </label>
            </div>
            <div className="md:col-span-2 flex items-center gap-3" data-magicpath-id="247" data-magicpath-path="FleetAppLayout.tsx">
              <PillButton type="submit" variant="primary" icon={loading ? <Loader2 className="h-4 w-4 animate-spin" data-magicpath-id="249" data-magicpath-path="FleetAppLayout.tsx" /> : <Plus className="h-4 w-4" data-magicpath-id="250" data-magicpath-path="FleetAppLayout.tsx" />} data-magicpath-id="248" data-magicpath-path="FleetAppLayout.tsx">
                {loading ? 'Saving...' : 'Create Driver'}
              </PillButton>
              {success && <Badge variant="success" data-magicpath-id="251" data-magicpath-path="FleetAppLayout.tsx">{success}</Badge>}
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
  return <div className="p-4 md:p-6 space-y-4" data-magicpath-id="252" data-magicpath-path="FleetAppLayout.tsx">
      <Card data-magicpath-id="253" data-magicpath-path="FleetAppLayout.tsx">
        <CardContent className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between" data-magicpath-id="254" data-magicpath-path="FleetAppLayout.tsx">
          <div className="flex items-center gap-2" data-magicpath-id="255" data-magicpath-path="FleetAppLayout.tsx">
            <Search className="h-4 w-4 text-muted-foreground" data-magicpath-id="256" data-magicpath-path="FleetAppLayout.tsx" />
            <input className="rounded-md border px-3 py-1.5 text-sm" placeholder="Search reg no, model, GPS..." value={q} onChange={e => setQ(e.target.value)} data-magicpath-id="257" data-magicpath-path="FleetAppLayout.tsx" />
          </div>
          <div className="flex items-center gap-2" data-magicpath-id="258" data-magicpath-path="FleetAppLayout.tsx">
            <label className="text-sm" data-magicpath-id="259" data-magicpath-path="FleetAppLayout.tsx">Status</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={status} onChange={e => setStatus(e.target.value as any)} data-magicpath-id="260" data-magicpath-path="FleetAppLayout.tsx">
              {['All', 'Active', 'Inactive', 'Maintenance'].map(s => <option key={s} data-magicpath-id="261" data-magicpath-path="FleetAppLayout.tsx">{s}</option>)}
            </select>
            <label className="text-sm" data-magicpath-id="262" data-magicpath-path="FleetAppLayout.tsx">Type</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={type} onChange={e => setType(e.target.value as any)} data-magicpath-id="263" data-magicpath-path="FleetAppLayout.tsx">
              {['All', ...VEHICLE_TYPES].map(s => <option key={s} data-magicpath-id="264" data-magicpath-path="FleetAppLayout.tsx">{s}</option>)}
            </select>
          </div>
          <div className="flex-1" data-magicpath-id="265" data-magicpath-path="FleetAppLayout.tsx" />
          <PillButton variant="primary" icon={<Plus className="h-4 w-4" data-magicpath-id="267" data-magicpath-path="FleetAppLayout.tsx" />} onClick={onOpenRegister} data-magicpath-id="266" data-magicpath-path="FleetAppLayout.tsx">
            Register Vehicle
          </PillButton>
        </CardContent>
      </Card>

      <Card data-magicpath-id="268" data-magicpath-path="FleetAppLayout.tsx">
        <CardHeader data-magicpath-id="269" data-magicpath-path="FleetAppLayout.tsx">
          <div className="font-medium" data-magicpath-id="270" data-magicpath-path="FleetAppLayout.tsx">Vehicles</div>
          <div className="text-xs text-muted-foreground" data-magicpath-id="271" data-magicpath-path="FleetAppLayout.tsx">Showing {filtered.length} results</div>
        </CardHeader>
        <CardContent className="overflow-x-auto" data-magicpath-id="272" data-magicpath-path="FleetAppLayout.tsx">
          <table className="min-w-full text-sm" data-magicpath-id="273" data-magicpath-path="FleetAppLayout.tsx">
            <thead data-magicpath-id="274" data-magicpath-path="FleetAppLayout.tsx">
              <tr className="text-left text-xs text-muted-foreground border-b" data-magicpath-id="275" data-magicpath-path="FleetAppLayout.tsx">
                <th className="py-2 pr-4" data-magicpath-id="276" data-magicpath-path="FleetAppLayout.tsx">Reg No</th>
                <th className="py-2 pr-4" data-magicpath-id="277" data-magicpath-path="FleetAppLayout.tsx">Model</th>
                <th className="py-2 pr-4" data-magicpath-id="278" data-magicpath-path="FleetAppLayout.tsx">Type</th>
                <th className="py-2 pr-4" data-magicpath-id="279" data-magicpath-path="FleetAppLayout.tsx">Assigned Driver</th>
                <th className="py-2 pr-4" data-magicpath-id="280" data-magicpath-path="FleetAppLayout.tsx">GPS ID</th>
                <th className="py-2 pr-4" data-magicpath-id="281" data-magicpath-path="FleetAppLayout.tsx">Status</th>
                <th className="py-2 pr-4" data-magicpath-id="282" data-magicpath-path="FleetAppLayout.tsx">Fuel Type</th>
                <th className="py-2 pr-4" data-magicpath-id="283" data-magicpath-path="FleetAppLayout.tsx">Last Reported</th>
                <th className="py-2 pr-4 text-right" data-magicpath-id="284" data-magicpath-path="FleetAppLayout.tsx">Actions</th>
              </tr>
            </thead>
            <tbody data-magicpath-id="285" data-magicpath-path="FleetAppLayout.tsx">
              {pageData.map(v => {
              const last = new Date(v.lastReported);
              const mins = Math.round((Date.now() - last.getTime()) / 60000);
              return <tr key={v.id} className="border-b last:border-0" data-magicpath-id="286" data-magicpath-path="FleetAppLayout.tsx">
                    <td className="py-3 pr-4 font-medium" data-magicpath-id="287" data-magicpath-path="FleetAppLayout.tsx">
                      <button className="underline decoration-dotted underline-offset-4" onClick={() => gotoVehicle(v.regNo)} data-magicpath-id="288" data-magicpath-path="FleetAppLayout.tsx">
                        {v.regNo}
                      </button>
                    </td>
                    <td className="py-3 pr-4" data-magicpath-id="289" data-magicpath-path="FleetAppLayout.tsx">{v.model}</td>
                    <td className="py-3 pr-4" data-magicpath-id="290" data-magicpath-path="FleetAppLayout.tsx">{v.type}</td>
                    <td className="py-3 pr-4" data-magicpath-id="291" data-magicpath-path="FleetAppLayout.tsx">{v.assignedDriver ?? <span className="text-muted-foreground" data-magicpath-id="292" data-magicpath-path="FleetAppLayout.tsx">Unassigned</span>}</td>
                    <td className="py-3 pr-4" data-magicpath-id="293" data-magicpath-path="FleetAppLayout.tsx">{v.gpsId}</td>
                    <td className="py-3 pr-4" data-magicpath-id="294" data-magicpath-path="FleetAppLayout.tsx">
                      <Badge variant={v.status === 'Active' ? 'success' : v.status === 'Maintenance' ? 'warning' : 'outline'} data-magicpath-id="295" data-magicpath-path="FleetAppLayout.tsx">{v.status}</Badge>
                    </td>
                    <td className="py-3 pr-4" data-magicpath-id="296" data-magicpath-path="FleetAppLayout.tsx">{v.fuelType}</td>
                    <td className="py-3 pr-4" data-magicpath-id="297" data-magicpath-path="FleetAppLayout.tsx">{mins} min ago</td>
                    <td className="py-3 pr-4" data-magicpath-id="298" data-magicpath-path="FleetAppLayout.tsx">
                      <div className="flex justify-end" data-magicpath-id="299" data-magicpath-path="FleetAppLayout.tsx">
                        <button className="rounded-md border px-2 py-1 hover:bg-muted text-xs" data-magicpath-id="300" data-magicpath-path="FleetAppLayout.tsx">View</button>
                      </div>
                    </td>
                  </tr>;
            })}
            </tbody>
          </table>
          <div className="flex items-center justify-between pt-4" data-magicpath-id="301" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="302" data-magicpath-path="FleetAppLayout.tsx">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2" data-magicpath-id="303" data-magicpath-path="FleetAppLayout.tsx">
              <button className="rounded-md border px-3 py-1 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(p => p - 1)} data-magicpath-id="304" data-magicpath-path="FleetAppLayout.tsx">
                Prev
              </button>
              <button className="rounded-md border px-3 py-1 text-sm disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} data-magicpath-id="305" data-magicpath-path="FleetAppLayout.tsx">
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
  return <div className="p-4 md:p-6" data-magicpath-id="306" data-magicpath-path="FleetAppLayout.tsx">
      <Card className="max-w-3xl mx-auto" data-magicpath-id="307" data-magicpath-path="FleetAppLayout.tsx">
        <CardHeader data-magicpath-id="308" data-magicpath-path="FleetAppLayout.tsx">
          <div className="font-medium" data-magicpath-id="309" data-magicpath-path="FleetAppLayout.tsx">New Vehicle Registration</div>
          <div className="text-xs text-muted-foreground" data-magicpath-id="310" data-magicpath-path="FleetAppLayout.tsx">This will configure the GPS tracker via SMS.</div>
        </CardHeader>
        <CardContent data-magicpath-id="311" data-magicpath-path="FleetAppLayout.tsx">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4" data-magicpath-id="312" data-magicpath-path="FleetAppLayout.tsx">
            <div data-magicpath-id="313" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="314" data-magicpath-path="FleetAppLayout.tsx">Reg Number</label>
              <input required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., V200" value={form.regNo} onChange={e => setForm(s => ({
              ...s,
              regNo: e.target.value
            }))} data-magicpath-id="315" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="316" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="317" data-magicpath-path="FleetAppLayout.tsx">Vehicle Type</label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.type} onChange={e => setForm(s => ({
              ...s,
              type: e.target.value as Vehicle['type']
            }))} data-magicpath-id="318" data-magicpath-path="FleetAppLayout.tsx">
                {VEHICLE_TYPES.map(t => <option key={t} data-magicpath-id="319" data-magicpath-path="FleetAppLayout.tsx">{t}</option>)}
              </select>
            </div>
            <div data-magicpath-id="320" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="321" data-magicpath-path="FleetAppLayout.tsx">Model</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="Model name" value={form.model} onChange={e => setForm(s => ({
              ...s,
              model: e.target.value
            }))} data-magicpath-id="322" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="323" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="324" data-magicpath-path="FleetAppLayout.tsx">Fuel Type</label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.fuelType} onChange={e => setForm(s => ({
              ...s,
              fuelType: e.target.value as Vehicle['fuelType']
            }))} data-magicpath-id="325" data-magicpath-path="FleetAppLayout.tsx">
                {FUEL_TYPES.map(t => <option key={t} data-magicpath-id="326" data-magicpath-path="FleetAppLayout.tsx">{t}</option>)}
              </select>
            </div>
            <div data-magicpath-id="327" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="328" data-magicpath-path="FleetAppLayout.tsx">Odometer Start</label>
              <input type="number" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., 12000" value={form.odo} onChange={e => setForm(s => ({
              ...s,
              odo: e.target.value
            }))} data-magicpath-id="329" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="330" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="331" data-magicpath-path="FleetAppLayout.tsx">Assigned Driver</label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.driver} onChange={e => setForm(s => ({
              ...s,
              driver: e.target.value
            }))} data-magicpath-id="332" data-magicpath-path="FleetAppLayout.tsx">
                <option value="" data-magicpath-id="333" data-magicpath-path="FleetAppLayout.tsx">None</option>
                {MOCK_DRIVERS.map(d => <option key={d.id} value={d.name} data-magicpath-id="334" data-magicpath-path="FleetAppLayout.tsx">
                    {d.name}
                  </option>)}
              </select>
            </div>
            <div data-magicpath-id="335" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="336" data-magicpath-path="FleetAppLayout.tsx">GPS Device ID / IMEI</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., 86457800321..." value={form.gps} onChange={e => setForm(s => ({
              ...s,
              gps: e.target.value
            }))} data-magicpath-id="337" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div data-magicpath-id="338" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="339" data-magicpath-path="FleetAppLayout.tsx">SIM Number</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2 text-sm" placeholder="e.g., +15550123456" value={form.sim} onChange={e => setForm(s => ({
              ...s,
              sim: e.target.value
            }))} data-magicpath-id="340" data-magicpath-path="FleetAppLayout.tsx" />
            </div>
            <div className="md:col-span-2" data-magicpath-id="341" data-magicpath-path="FleetAppLayout.tsx">
              <label className="text-sm" data-magicpath-id="342" data-magicpath-path="FleetAppLayout.tsx">Vehicle Image</label>
              <div className="mt-1 flex items-center gap-3" data-magicpath-id="343" data-magicpath-path="FleetAppLayout.tsx">
                {form.image ? <img src={form.image} alt="Vehicle" className="h-20 w-32 rounded object-cover" data-magicpath-id="344" data-magicpath-path="FleetAppLayout.tsx" /> : <div className="h-20 w-32 rounded bg-muted grid place-items-center text-muted-foreground" data-magicpath-id="345" data-magicpath-path="FleetAppLayout.tsx">
                    <Car className="h-6 w-6" data-magicpath-id="346" data-magicpath-path="FleetAppLayout.tsx" />
                  </div>}
                <div className="flex gap-2" data-magicpath-id="347" data-magicpath-path="FleetAppLayout.tsx">
                  <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                  ...s,
                  image: `https://picsum.photos/seed/${Date.now()}/320/200`
                }))} data-magicpath-id="348" data-magicpath-path="FleetAppLayout.tsx">
                    <Upload className="h-4 w-4" data-magicpath-id="349" data-magicpath-path="FleetAppLayout.tsx" />
                    Upload
                  </button>
                  <button type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setForm(s => ({
                  ...s,
                  image: ''
                }))} data-magicpath-id="350" data-magicpath-path="FleetAppLayout.tsx">
                    Remove
                  </button>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-2" data-magicpath-id="351" data-magicpath-path="FleetAppLayout.tsx">
              <input id="gps-en" type="checkbox" checked={form.gpsEnabled} onChange={e => setForm(s => ({
              ...s,
              gpsEnabled: e.target.checked
            }))} data-magicpath-id="352" data-magicpath-path="FleetAppLayout.tsx" />
              <label htmlFor="gps-en" className="text-sm" data-magicpath-id="353" data-magicpath-path="FleetAppLayout.tsx">
                Enable GPS
              </label>
            </div>
            <div className="md:col-span-2 flex items-center gap-3" data-magicpath-id="354" data-magicpath-path="FleetAppLayout.tsx">
              <PillButton type="submit" variant="primary" icon={loading ? <Loader2 className="h-4 w-4 animate-spin" data-magicpath-id="356" data-magicpath-path="FleetAppLayout.tsx" /> : <Plus className="h-4 w-4" data-magicpath-id="357" data-magicpath-path="FleetAppLayout.tsx" />} data-magicpath-id="355" data-magicpath-path="FleetAppLayout.tsx">
                {loading ? 'Registering...' : 'Register Vehicle'}
              </PillButton>
              {smsSent && <Badge variant="info" data-magicpath-id="358" data-magicpath-path="FleetAppLayout.tsx">{smsSent}</Badge>}
            </div>
          </form>
          <div className="mt-4 text-xs text-muted-foreground" data-magicpath-id="359" data-magicpath-path="FleetAppLayout.tsx">
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
  return <div className="p-4 md:p-6 space-y-4" data-magicpath-id="360" data-magicpath-path="FleetAppLayout.tsx">
      <div className="flex flex-wrap items-center gap-3" data-magicpath-id="361" data-magicpath-path="FleetAppLayout.tsx">
        <div className="flex items-center gap-2" data-magicpath-id="362" data-magicpath-path="FleetAppLayout.tsx">
          <div className="rounded-md bg-primary text-primary-foreground h-9 w-9 grid place-items-center" data-magicpath-id="363" data-magicpath-path="FleetAppLayout.tsx">
            <Truck className="h-5 w-5" data-magicpath-id="364" data-magicpath-path="FleetAppLayout.tsx" />
          </div>
          <div data-magicpath-id="365" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-lg font-semibold" data-magicpath-id="366" data-magicpath-path="FleetAppLayout.tsx">{vehicle.regNo}</div>
            <div className="text-xs text-muted-foreground" data-magicpath-id="367" data-magicpath-path="FleetAppLayout.tsx">{vehicle.model} • {vehicle.type}</div>
          </div>
        </div>
        <div className="flex-1" data-magicpath-id="368" data-magicpath-path="FleetAppLayout.tsx" />
        <Badge variant={vehicle.status === 'Active' ? 'success' : vehicle.status === 'Maintenance' ? 'warning' : 'outline'} data-magicpath-id="369" data-magicpath-path="FleetAppLayout.tsx">{vehicle.status}</Badge>
        <div className="flex items-center gap-2" data-magicpath-id="370" data-magicpath-path="FleetAppLayout.tsx">
          <PingIcon className={cn('h-5 w-5', pingColor)} data-magicpath-id="371" data-magicpath-path="FleetAppLayout.tsx" />
          <span className="text-sm" data-magicpath-id="372" data-magicpath-path="FleetAppLayout.tsx">Tracker Ping</span>
        </div>
        <Badge variant={!gpsDisabled ? 'success' : 'destructive'} data-magicpath-id="373" data-magicpath-path="FleetAppLayout.tsx">{!gpsDisabled ? 'GPS Online' : 'GPS Offline'}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-magicpath-id="374" data-magicpath-path="FleetAppLayout.tsx">
        <Card data-magicpath-id="375" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="376" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="377" data-magicpath-path="FleetAppLayout.tsx">Total KM</div>
            <div className="text-2xl font-semibold" data-magicpath-id="378" data-magicpath-path="FleetAppLayout.tsx">{(12000 + Math.floor(Math.random() * 8000)).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="379" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="380" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="381" data-magicpath-path="FleetAppLayout.tsx">Avg Mileage</div>
            <div className="text-2xl font-semibold" data-magicpath-id="382" data-magicpath-path="FleetAppLayout.tsx">{(8 + Math.random() * 7).toFixed(1)} KM/L</div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="383" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="384" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="385" data-magicpath-path="FleetAppLayout.tsx">Fuel Consumed</div>
            <div className="text-2xl font-semibold" data-magicpath-id="386" data-magicpath-path="FleetAppLayout.tsx">{(600 + Math.floor(Math.random() * 400)).toLocaleString()} L</div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="387" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="388" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="389" data-magicpath-path="FleetAppLayout.tsx">Incidents</div>
            <div className="text-2xl font-semibold" data-magicpath-id="390" data-magicpath-path="FleetAppLayout.tsx">{Math.floor(Math.random() * 12)}</div>
          </CardContent>
        </Card>
        <Card data-magicpath-id="391" data-magicpath-path="FleetAppLayout.tsx">
          <CardContent data-magicpath-id="392" data-magicpath-path="FleetAppLayout.tsx">
            <div className="text-xs text-muted-foreground" data-magicpath-id="393" data-magicpath-path="FleetAppLayout.tsx">Last Report</div>
            <div className="text-2xl font-semibold" data-magicpath-id="394" data-magicpath-path="FleetAppLayout.tsx">{Math.floor(2 + Math.random() * 50)} min</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-magicpath-id="395" data-magicpath-path="FleetAppLayout.tsx">
        <Card className="lg:col-span-1" data-magicpath-id="396" data-magicpath-path="FleetAppLayout.tsx">
          <CardHeader data-magicpath-id="397" data-magicpath-path="FleetAppLayout.tsx">
            <div className="font-medium" data-magicpath-id="398" data-magicpath-path="FleetAppLayout.tsx">Status</div>
            <button className="rounded p-1 hover:bg-muted" aria-label="more" data-magicpath-id="399" data-magicpath-path="FleetAppLayout.tsx">
              <MoreHorizontal className="h-4 w-4" data-magicpath-id="400" data-magicpath-path="FleetAppLayout.tsx" />
            </button>
          </CardHeader>
          <CardContent className="space-y-3" data-magicpath-id="401" data-magicpath-path="FleetAppLayout.tsx">
            <div className="flex items-center justify-between" data-magicpath-id="402" data-magicpath-path="FleetAppLayout.tsx">
              <span className="text-sm text-muted-foreground" data-magicpath-id="403" data-magicpath-path="FleetAppLayout.tsx">Assigned Driver</span>
              <span className="text-sm" data-magicpath-id="404" data-magicpath-path="FleetAppLayout.tsx">{vehicle.assignedDriver ?? 'Unassigned'}</span>
            </div>
            <div className="flex items-center justify-between" data-magicpath-id="405" data-magicpath-path="FleetAppLayout.tsx">
              <span className="text-sm text-muted-foreground" data-magicpath-id="406" data-magicpath-path="FleetAppLayout.tsx">GPS ID</span>
              <span className="text-sm" data-magicpath-id="407" data-magicpath-path="FleetAppLayout.tsx">{vehicle.gpsId}</span>
            </div>
            <div className="flex items-center justify-between" data-magicpath-id="408" data-magicpath-path="FleetAppLayout.tsx">
              <span className="text-sm text-muted-foreground" data-magicpath-id="409" data-magicpath-path="FleetAppLayout.tsx">Fuel Type</span>
              <span className="text-sm" data-magicpath-id="410" data-magicpath-path="FleetAppLayout.tsx">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center justify-between" data-magicpath-id="411" data-magicpath-path="FleetAppLayout.tsx">
              <span className="text-sm text-muted-foreground" data-magicpath-id="412" data-magicpath-path="FleetAppLayout.tsx">Location</span>
              <span className="inline-flex items-center gap-1 text-sm" data-magicpath-id="413" data-magicpath-path="FleetAppLayout.tsx">
                <MapPin className="h-4 w-4 text-rose-500" data-magicpath-id="414" data-magicpath-path="FleetAppLayout.tsx" /> 12.9, 77.5
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" data-magicpath-id="415" data-magicpath-path="FleetAppLayout.tsx">
          <CardHeader data-magicpath-id="416" data-magicpath-path="FleetAppLayout.tsx">
            <div className="font-medium" data-magicpath-id="417" data-magicpath-path="FleetAppLayout.tsx">KM per day</div>
            <Badge variant="outline" data-magicpath-id="418" data-magicpath-path="FleetAppLayout.tsx">Last 14 days</Badge>
          </CardHeader>
          <CardContent data-magicpath-id="419" data-magicpath-path="FleetAppLayout.tsx">
            <div className="h-56" data-magicpath-id="420" data-magicpath-path="FleetAppLayout.tsx">
              <ResponsiveContainer width="100%" height="100%" data-magicpath-id="421" data-magicpath-path="FleetAppLayout.tsx">
                <LineChart data={miniKm} data-magicpath-id="422" data-magicpath-path="FleetAppLayout.tsx">
                  <CartesianGrid strokeDasharray="3 3" data-magicpath-id="423" data-magicpath-path="FleetAppLayout.tsx" />
                  <XAxis dataKey="date" data-magicpath-id="424" data-magicpath-path="FleetAppLayout.tsx" />
                  <YAxis data-magicpath-id="425" data-magicpath-path="FleetAppLayout.tsx" />
                  <Tooltip data-magicpath-id="426" data-magicpath-path="FleetAppLayout.tsx" />
                  <Line dataKey="km" type="monotone" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-magicpath-id="427" data-magicpath-path="FleetAppLayout.tsx">
        <Card className="lg:col-span-2" data-magicpath-id="428" data-magicpath-path="FleetAppLayout.tsx">
          <CardHeader data-magicpath-id="429" data-magicpath-path="FleetAppLayout.tsx">
            <div className="font-medium" data-magicpath-id="430" data-magicpath-path="FleetAppLayout.tsx">Event Log</div>
            <div className="flex items-center gap-2" data-magicpath-id="431" data-magicpath-path="FleetAppLayout.tsx">
              <Kbd data-magicpath-id="432" data-magicpath-path="FleetAppLayout.tsx">J</Kbd>
              <Kbd data-magicpath-id="433" data-magicpath-path="FleetAppLayout.tsx">K</Kbd>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto" data-magicpath-id="434" data-magicpath-path="FleetAppLayout.tsx">
            <table className="min-w-full text-sm" data-magicpath-id="435" data-magicpath-path="FleetAppLayout.tsx">
              <thead data-magicpath-id="436" data-magicpath-path="FleetAppLayout.tsx">
                <tr className="text-left text-xs text-muted-foreground border-b" data-magicpath-id="437" data-magicpath-path="FleetAppLayout.tsx">
                  <th className="py-2 pr-4" data-magicpath-id="438" data-magicpath-path="FleetAppLayout.tsx">Timestamp</th>
                  <th className="py-2 pr-4" data-magicpath-id="439" data-magicpath-path="FleetAppLayout.tsx">Type</th>
                  <th className="py-2 pr-4" data-magicpath-id="440" data-magicpath-path="FleetAppLayout.tsx">Notes</th>
                </tr>
              </thead>
              <tbody data-magicpath-id="441" data-magicpath-path="FleetAppLayout.tsx">
                {events.map((e, i) => <tr key={i} className="border-b last:border-0" data-magicpath-id="442" data-magicpath-path="FleetAppLayout.tsx">
                    <td className="py-3 pr-4" data-magicpath-id="443" data-magicpath-path="FleetAppLayout.tsx">{e.time}</td>
                    <td className="py-3 pr-4" data-magicpath-id="444" data-magicpath-path="FleetAppLayout.tsx">
                      <Badge variant={e.type === 'alert' ? 'warning' : e.type.includes('disable') ? 'destructive' : e.type.includes('gps') ? 'info' : 'success'} data-magicpath-id="445" data-magicpath-path="FleetAppLayout.tsx">
                        {e.type}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4" data-magicpath-id="446" data-magicpath-path="FleetAppLayout.tsx">{e.note}</td>
                  </tr>)}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1" data-magicpath-id="447" data-magicpath-path="FleetAppLayout.tsx">
          <CardHeader data-magicpath-id="448" data-magicpath-path="FleetAppLayout.tsx">
            <div className="font-medium" data-magicpath-id="449" data-magicpath-path="FleetAppLayout.tsx">Admin Controls</div>
            <EllipsisVertical className="h-4 w-4" data-magicpath-id="450" data-magicpath-path="FleetAppLayout.tsx" />
          </CardHeader>
          <CardContent className="space-y-3" data-magicpath-id="451" data-magicpath-path="FleetAppLayout.tsx">
            <div className="flex items-center justify-between" data-magicpath-id="452" data-magicpath-path="FleetAppLayout.tsx">
              <div data-magicpath-id="453" data-magicpath-path="FleetAppLayout.tsx">
                <div className="text-sm" data-magicpath-id="454" data-magicpath-path="FleetAppLayout.tsx">Disable Vehicle</div>
                <div className="text-xs text-muted-foreground" data-magicpath-id="455" data-magicpath-path="FleetAppLayout.tsx">Immobilize engine remotely</div>
              </div>
              <button className={cn('rounded-md px-3 py-1.5 text-sm border', disabled ? 'bg-rose-50 text-rose-600 border-rose-200' : 'hover:bg-muted')} onClick={() => setConfirm({
              type: 'vehicle',
              message: disabled ? 'Enable vehicle?' : 'Disable vehicle now?'
            })} data-magicpath-id="456" data-magicpath-path="FleetAppLayout.tsx">
                {disabled ? 'Enable' : 'Disable'}
              </button>
            </div>
            <div className="flex items-center justify-between" data-magicpath-id="457" data-magicpath-path="FleetAppLayout.tsx">
              <div data-magicpath-id="458" data-magicpath-path="FleetAppLayout.tsx">
                <div className="text-sm" data-magicpath-id="459" data-magicpath-path="FleetAppLayout.tsx">Disable GPS</div>
                <div className="text-xs text-muted-foreground" data-magicpath-id="460" data-magicpath-path="FleetAppLayout.tsx">Stops sending location</div>
              </div>
              <button className={cn('rounded-md px-3 py-1.5 text-sm border', gpsDisabled ? 'bg-rose-50 text-rose-600 border-rose-200' : 'hover:bg-muted')} onClick={() => setConfirm({
              type: 'gps',
              message: gpsDisabled ? 'Enable GPS?' : 'Disable GPS now?'
            })} data-magicpath-id="461" data-magicpath-path="FleetAppLayout.tsx">
                {gpsDisabled ? 'Enable' : 'Disable'}
              </button>
            </div>
            <AnimatePresence data-magicpath-id="462" data-magicpath-path="FleetAppLayout.tsx">
              {confirm && <motion.div initial={{
              opacity: 0,
              y: -6
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -6
            }} className="rounded-md border p-3" data-magicpath-id="463" data-magicpath-path="FleetAppLayout.tsx">
                  <div className="text-sm font-medium mb-2" data-magicpath-id="464" data-magicpath-path="FleetAppLayout.tsx">Confirm Action</div>
                  <div className="text-sm text-muted-foreground mb-3" data-magicpath-id="465" data-magicpath-path="FleetAppLayout.tsx">{confirm.message}</div>
                  <div className="flex gap-2" data-magicpath-id="466" data-magicpath-path="FleetAppLayout.tsx">
                    <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted" onClick={() => {
                  if (confirm.type === 'vehicle') setDisabled(v => !v);
                  if (confirm.type === 'gps') setGpsDisabled(v => !v);
                  setConfirm(null);
                }} data-magicpath-id="467" data-magicpath-path="FleetAppLayout.tsx">
                      Confirm
                    </button>
                    <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted" onClick={() => setConfirm(null)} data-magicpath-id="468" data-magicpath-path="FleetAppLayout.tsx">
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
  return <div className="p-4 md:p-6 space-y-4" data-magicpath-id="469" data-magicpath-path="FleetAppLayout.tsx">
      <Card data-magicpath-id="470" data-magicpath-path="FleetAppLayout.tsx">
        <CardContent className="grid md:grid-cols-4 gap-3" data-magicpath-id="471" data-magicpath-path="FleetAppLayout.tsx">
          <div className="flex items-center gap-2" data-magicpath-id="472" data-magicpath-path="FleetAppLayout.tsx">
            <Search className="h-4 w-4 text-muted-foreground" data-magicpath-id="473" data-magicpath-path="FleetAppLayout.tsx" />
            <input className="w-full rounded-md border px-3 py-1.5 text-sm" placeholder="Search notes or action..." value={q} onChange={e => setQ(e.target.value)} data-magicpath-id="474" data-magicpath-path="FleetAppLayout.tsx" />
          </div>
          <div className="flex items-center gap-2" data-magicpath-id="475" data-magicpath-path="FleetAppLayout.tsx">
            <label className="text-sm" data-magicpath-id="476" data-magicpath-path="FleetAppLayout.tsx">Action</label>
            <select className="w-full rounded-md border px-2 py-1 text-sm" value={actionFilter} onChange={e => setActionFilter(e.target.value)} data-magicpath-id="477" data-magicpath-path="FleetAppLayout.tsx">
              {actions.map(a => <option key={a} data-magicpath-id="478" data-magicpath-path="FleetAppLayout.tsx">{a}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2" data-magicpath-id="479" data-magicpath-path="FleetAppLayout.tsx">
            <label className="text-sm" data-magicpath-id="480" data-magicpath-path="FleetAppLayout.tsx">User</label>
            <select className="w-full rounded-md border px-2 py-1 text-sm" value={userFilter} onChange={e => setUserFilter(e.target.value)} data-magicpath-id="481" data-magicpath-path="FleetAppLayout.tsx">
              {users.map(u => <option key={u} data-magicpath-id="482" data-magicpath-path="FleetAppLayout.tsx">{u}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2" data-magicpath-id="483" data-magicpath-path="FleetAppLayout.tsx">
            <label className="text-sm" data-magicpath-id="484" data-magicpath-path="FleetAppLayout.tsx">From</label>
            <input type="date" className="rounded-md border px-2 py-1 text-sm" value={from} onChange={e => setFrom(e.target.value)} data-magicpath-id="485" data-magicpath-path="FleetAppLayout.tsx" />
            <label className="text-sm" data-magicpath-id="486" data-magicpath-path="FleetAppLayout.tsx">To</label>
            <input type="date" className="rounded-md border px-2 py-1 text-sm" value={to} onChange={e => setTo(e.target.value)} data-magicpath-id="487" data-magicpath-path="FleetAppLayout.tsx" />
          </div>
        </CardContent>
      </Card>

      <Card data-magicpath-id="488" data-magicpath-path="FleetAppLayout.tsx">
        <CardHeader data-magicpath-id="489" data-magicpath-path="FleetAppLayout.tsx">
          <div className="font-medium" data-magicpath-id="490" data-magicpath-path="FleetAppLayout.tsx">Activity Log</div>
          <div className="flex items-center gap-2" data-magicpath-id="491" data-magicpath-path="FleetAppLayout.tsx">
            <button className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted" data-magicpath-id="492" data-magicpath-path="FleetAppLayout.tsx">
              <Download className="h-4 w-4" data-magicpath-id="493" data-magicpath-path="FleetAppLayout.tsx" />
              Export
            </button>
            <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted" data-magicpath-id="494" data-magicpath-path="FleetAppLayout.tsx">
              <CircleGauge className="h-4 w-4" data-magicpath-id="495" data-magicpath-path="FleetAppLayout.tsx" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto" data-magicpath-id="496" data-magicpath-path="FleetAppLayout.tsx">
          <table className="min-w-full text-sm" data-magicpath-id="497" data-magicpath-path="FleetAppLayout.tsx">
            <thead data-magicpath-id="498" data-magicpath-path="FleetAppLayout.tsx">
              <tr className="text-left text-xs text-muted-foreground border-b" data-magicpath-id="499" data-magicpath-path="FleetAppLayout.tsx">
                <th className="py-2 pr-4" data-magicpath-id="500" data-magicpath-path="FleetAppLayout.tsx">Timestamp</th>
                <th className="py-2 pr-4" data-magicpath-id="501" data-magicpath-path="FleetAppLayout.tsx">Action</th>
                <th className="py-2 pr-4" data-magicpath-id="502" data-magicpath-path="FleetAppLayout.tsx">Module</th>
                <th className="py-2 pr-4" data-magicpath-id="503" data-magicpath-path="FleetAppLayout.tsx">Performed By</th>
                <th className="py-2 pr-4" data-magicpath-id="504" data-magicpath-path="FleetAppLayout.tsx">Notes</th>
              </tr>
            </thead>
            <tbody data-magicpath-id="505" data-magicpath-path="FleetAppLayout.tsx">
              {filtered.map(l => <tr key={l.id} className="border-b last:border-0" data-magicpath-id="506" data-magicpath-path="FleetAppLayout.tsx">
                  <td className="py-3 pr-4" data-magicpath-id="507" data-magicpath-path="FleetAppLayout.tsx">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="py-3 pr-4" data-magicpath-id="508" data-magicpath-path="FleetAppLayout.tsx">{l.action}</td>
                  <td className="py-3 pr-4" data-magicpath-id="509" data-magicpath-path="FleetAppLayout.tsx">{l.module}</td>
                  <td className="py-3 pr-4" data-magicpath-id="510" data-magicpath-path="FleetAppLayout.tsx">{l.performedBy}</td>
                  <td className="py-3 pr-4" data-magicpath-id="511" data-magicpath-path="FleetAppLayout.tsx">{l.notes ?? <span className="text-muted-foreground" data-magicpath-id="512" data-magicpath-path="FleetAppLayout.tsx">-</span>}</td>
                </tr>)}
              {filtered.length === 0 && <tr data-magicpath-id="513" data-magicpath-path="FleetAppLayout.tsx">
                  <td colSpan={5} className="text-center py-10 text-muted-foreground" data-magicpath-id="514" data-magicpath-path="FleetAppLayout.tsx">
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
  }} data-magicpath-id="515" data-magicpath-path="FleetAppLayout.tsx">
      {!isMobile && <div className="row-span-2" data-magicpath-id="516" data-magicpath-path="FleetAppLayout.tsx">
          <Sidebar active={route.page as PageKey} setActive={goto} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} data-magicpath-id="517" data-magicpath-path="FleetAppLayout.tsx" />
        </div>}
      <div className="col-span-1" data-magicpath-id="518" data-magicpath-path="FleetAppLayout.tsx">
        <Topbar onSearch={q => setGlobalQuery(q)} onQuick={a => {
        if (a === 'add-driver') goto('add-driver');
        if (a === 'register-vehicle') goto('register-vehicle');
      }} data-magicpath-id="519" data-magicpath-path="FleetAppLayout.tsx" />
      </div>
      <main className="col-span-1 overflow-auto" data-magicpath-id="520" data-magicpath-path="FleetAppLayout.tsx">
        <AnimatePresence mode="wait" data-magicpath-id="521" data-magicpath-path="FleetAppLayout.tsx">
          <motion.div key={JSON.stringify(route)} initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -8
        }} data-magicpath-id="522" data-magicpath-path="FleetAppLayout.tsx">
            {route.page === 'dashboard' && <Dashboard goto={goto} data-magicpath-id="523" data-magicpath-path="FleetAppLayout.tsx" />}
            {route.page === 'drivers' && <DriversPage query={globalQuery} setQuery={q => setGlobalQuery(q)} gotoVehicle={regNo => setRoute({
            page: 'vehicle-detail',
            regNo
          })} data-magicpath-id="524" data-magicpath-path="FleetAppLayout.tsx" />}
            {route.page === 'add-driver' && <AddDriverForm data-magicpath-id="525" data-magicpath-path="FleetAppLayout.tsx" />}
            {route.page === 'vehicles' && <VehiclesPage onOpenRegister={() => goto('register-vehicle')} gotoVehicle={regNo => setRoute({
            page: 'vehicle-detail',
            regNo
          })} data-magicpath-id="526" data-magicpath-path="FleetAppLayout.tsx" />}
            {route.page === 'register-vehicle' && <RegisterVehicleForm data-magicpath-id="527" data-magicpath-path="FleetAppLayout.tsx" />}
            {route.page === 'logs' && <ActivityLogs data-magicpath-id="528" data-magicpath-path="FleetAppLayout.tsx" />}
            {route.page === 'vehicle-detail' && <VehicleDetail regNo={route.regNo} data-magicpath-id="529" data-magicpath-path="FleetAppLayout.tsx" />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>;
};