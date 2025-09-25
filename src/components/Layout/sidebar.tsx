import React from 'react';
import { ClipboardList, Home, LogOut, Menu, Settings, Shield, Truck, User, Users, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export type PageKey = 'dashboard' | 'drivers' | 'add-driver' | 'vehicles' | 'register-vehicle' | 'logs' | 'vehicle-detail' | 'driver-detail';
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

export function Sidebar({
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