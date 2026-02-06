import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import PrivateRoute from '@/components/auth/PrivateRoute';
import MainLayout from '@/components/layout/MainLayout';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Showcase from '@/pages/Showcase';
import MapPage from '@/pages/Map';
import Vehicles from '@/pages/Vehicles';
import VehicleDetails from '@/pages/VehicleDetails';
import Drivers from '@/pages/Drivers';
import DriverDetails from '@/pages/DriverDetails';
import Trips from '@/pages/Trips';
import Refuelings from '@/pages/Refuelings';
import Maintenances from '@/pages/Maintenances';
import Reports from '@/pages/Reports';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/design-system" element={<Showcase />} />
                <Route path="/mapa" element={<MapPage />} />
                <Route path="/veiculos" element={<Vehicles />} />
                <Route path="/veiculos/:id" element={<VehicleDetails />} />
                <Route path="/motoristas" element={<Drivers />} />
                <Route path="/motoristas/:id" element={<DriverDetails />} />
                <Route path="/viagens" element={<Trips />} />
                <Route path="/abastecimentos" element={<Refuelings />} />
                <Route path="/manutencoes" element={<Maintenances />} />
                <Route path="/relatorios" element={<Reports />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
