// Mock Data Generators
export const vehicleStatusData = [{
  name: 'Active',
  value: 48
}, {
  name: 'Inactive',
  value: 9
}, {
  name: 'Maintenance',
  value: 7
}];
export const INCIDENT_COLORS = ['#2563eb', '#f97316', '#22c55e', '#ef4444', '#06b6d4', '#a855f7', '#f59e0b', '#14b8a6', '#84cc16', '#e11d48', '#0ea5e9', '#10b981'];
export const incidentPerMonth = Array.from({
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
export const last30DaysKm = Array.from({
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
export const MOCK_DRIVERS: Driver[] = Array.from({
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
export type Vehicle = {
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
export const VEHICLE_TYPES: Vehicle['type'][] = ['Truck', 'Car', 'Van', 'SUV'];
export const FUEL_TYPES: Vehicle['fuelType'][] = ['Petrol', 'Diesel', 'CNG', 'EV'];
export const MOCK_VEHICLES: Vehicle[] = Array.from({
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
export const MOCK_LOGS: LogItem[] = Array.from({
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
