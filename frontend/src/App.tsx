import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './features/dashboard/DashboardLayout';
import PropertyList from './features/properties/PropertyList';
import AuthGuard from './features/auth/AuthGuard';
import WhatsAppDashboard from './features/whatsapp/WhatsAppDashboard';
import PeopleList from './features/people/PeopleList';
import ContractList from './features/contracts/ContractList';
import ChargeList from './features/billing/ChargeList';
import LoginPage from './features/auth/LoginPage';
import AdminDashboard from './features/admin/AdminDashboard';
import { useTheme } from './context/ThemeContext';

const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
        <BrowserRouter>
          <Routes>
            {/* Ruta de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas Protegidas */}
            <Route element={<AuthGuard />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<div className="p-6 text-2xl font-bold">Bienvenido al Dashboard</div>} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/properties" element={<PropertyList />} />
                <Route path="/whatsapp" element={<WhatsAppDashboard />} />
                <Route path="/people" element={<PeopleList />} />
                <Route path="/contracts" element={<ContractList />} />
                <Route path="/billing" element={<ChargeList />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;
