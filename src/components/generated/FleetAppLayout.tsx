import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/use-mobile';
import { Sidebar,PageKey } from '../Layout/sidebar';
import { Topbar } from '../Layout/topbar';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { DriversPage } from '../pages/drivers/listDrivers';
import { AddDriverForm } from '../pages/drivers/addDriver';
import { VehiclesPage } from '../pages/vehicles/listVehicles';
import { RegisterVehicleForm } from '../pages/vehicles/addVehicle';
import { VehicleDetail } from '../pages/vehicles/viewVehicle';
import { DriverDetail } from '../pages/drivers/viewDriver';
import { ActivityLogs } from '../pages/activityLogs/activityLogs';




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
} | {
  page: 'driver-detail';
  id: string;
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
          })} gotoDriver={id => setRoute({
            page: 'driver-detail',
            id
          })} />}
            {route.page === 'add-driver' && <AddDriverForm />}
            {route.page === 'vehicles' && <VehiclesPage onOpenRegister={() => goto('register-vehicle')} gotoVehicle={regNo => setRoute({
            page: 'vehicle-detail',
            regNo
          })} />}
            {route.page === 'register-vehicle' && <RegisterVehicleForm />}
            {route.page === 'logs' && <ActivityLogs />}
            {route.page === 'vehicle-detail' && <VehicleDetail regNo={route.regNo} />}
            {route.page === 'driver-detail' && <DriverDetail id={route.id} onBack={() => setRoute({
            page: 'drivers'
          })} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>;
};