import { FUEL_TYPES, MOCK_DRIVERS, Vehicle, VEHICLE_TYPES } from "@/components/mockData/MockData";
import { Card, CardContent, CardHeader, PillButton } from "@/components/utility/utility_components";
import { Badge, Car, Loader2, Plus, Upload } from "lucide-react";
import React, {useState, useMemo} from "react"

export function RegisterVehicleForm() {
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