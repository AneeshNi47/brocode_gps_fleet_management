import { useMemo } from 'react';
import { Container, Theme } from './settings/types';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FleetAppLayout } from './components/generated/FleetAppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './components/pages/LandingPage';
import { AuthCallback } from './components/auth/AuthCallback'; // Optional: ERPNext callback

const theme: Theme = 'light';
const container: Container = 'none';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  const renderedApp = useMemo(() => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <FleetAppLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    );
  }, []);

  if (container === 'centered') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {renderedApp}
      </div>
    );
  } else {
    return renderedApp;
  }
}

export default App;