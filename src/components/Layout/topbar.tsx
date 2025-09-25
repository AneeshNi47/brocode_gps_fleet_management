import React, { useState } from 'react';
import { Bell,Plus, Search, Truck} from 'lucide-react';
import { PillButton } from '@/components/utility/utility_components';

export function Topbar({
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
