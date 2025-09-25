import React, { useState } from 'react';
import { Card, CardContent,CardHeader, Badge,PillButton } from '../../utility/utility_components';
import {MOCK_VEHICLES } from '@/components/mockData/MockData';
import { Loader2, Plus, Upload, User } from 'lucide-react';


// ADD DRIVER FORM
export function AddDriverForm() {
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