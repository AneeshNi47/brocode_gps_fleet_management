import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/use-mobile';
import { Sidebar, PageKey } from '../Layout/sidebar';
import { Topbar } from '../Layout/topbar';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { DriversPage } from '../pages/drivers/listDrivers';
import { AddDriverForm } from '../pages/drivers/addDriver';
import { VehiclesPage } from '../pages/vehicles/listVehicles';
import { RegisterVehicleForm } from '../pages/vehicles/addVehicle';
import { VehicleDetail } from '../pages/vehicles/viewVehicle';
import { DriverDetail } from '../pages/drivers/viewDriver';
import { ActivityLogs } from '../pages/activityLogs/activityLogs';

export const FleetAppLayout = () => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const goto = (p: PageKey) => navigate(`/${p}`);

  return (
    <div className="h-full w-full grid" style={{
      gridTemplateColumns: isMobile ? '1fr' : collapsed ? '4rem 1fr' : '16rem 1fr',
      gridTemplateRows: 'auto 1fr'
    }}>
      {!isMobile && (
        <div className="row-span-2">
          <Sidebar active={location.pathname.slice(1) as PageKey} setActive={goto} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        </div>
      )}
      <div className="col-span-1">
        <Topbar
          onSearch={setGlobalQuery}
          onQuick={(a) => {
            if (a === 'add-driver') goto('add-driver');
            if (a === 'register-vehicle') goto('register-vehicle');
          }}
        />
      </div>
      <main className="col-span-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Routes location={location} key={location.pathname}>
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/drivers" element={
                <DriversPage
                  query={globalQuery}
                  setQuery={setGlobalQuery}
                  gotoVehicle={(regNo) => navigate(`/vehicle-detail/${regNo}`)}
                  gotoDriver={(id) => navigate(`/driver-detail/${id}`)}
                />}
              />
              <Route path="/add-driver" element={<AddDriverForm />} />
              <Route path="/vehicles" element={
                <VehiclesPage
                  onOpenRegister={() => goto('register-vehicle')}
                  gotoVehicle={(regNo) => navigate(`/vehicle-detail/${regNo}`)}
                />}
              />
              <Route path="/register-vehicle" element={<RegisterVehicleForm />} />
              <Route path="/logs" element={<ActivityLogs />} />
              <Route path="/vehicle-detail/:regNo" element={<VehicleDetailWrapper />} />
              <Route path="/driver-detail/:id" element={<DriverDetailWrapper />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Wrapper components to extract params from the URL
import { useParams } from 'react-router-dom';

function VehicleDetailWrapper() {
  const { regNo = '' } = useParams();
  return <VehicleDetail regNo={regNo} />;
}

function DriverDetailWrapper() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  return <DriverDetail id={id} onBack={() => navigate('/drivers')} />;
}