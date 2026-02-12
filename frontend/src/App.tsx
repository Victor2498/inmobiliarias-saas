import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './features/dashboard/DashboardLayout';
import PropertyList from './features/properties/PropertyList';
import AuthGuard from './features/auth/AuthGuard';
import WhatsAppDashboard from './features/whatsapp/WhatsAppDashboard';
import PeopleList from './features/people/PeopleList';
import TenantManagement from './features/billing/TenantManagement';
import LiquidationWizard from './features/billing/LiquidationWizard';
import SaaSPlans from './features/subscription/SaaSPlans';
import SettingsPage from './features/settings/SettingsPage';
import LoginPage from './features/auth/LoginPage';
import VerifyEmail from './features/auth/VerifyEmail';
import AdminLayout from './features/admin/AdminLayout';
import { useTheme } from './context/ThemeContext';

const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<VerifyEmail />} />

            {/* Rutas Protegidas */}
            <Route element={<AuthGuard />}>
              <Route path="/admin" element={<AdminLayout />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<div className="p-6 text-2xl font-bold">Bienvenido al Dashboard</div>} />
                <Route path="/properties" element={<PropertyList />} />
                <Route path="/whatsapp" element={<WhatsAppDashboard />} />
                <Route path="/people" element={<PeopleList />} />

                {/* Gestión Unificada de Inquilinos (Contratos + Liquidaciones) */}
                <Route path="/multitenant" element={<TenantManagement />} />

                <Route path="/billing/new" element={<LiquidationWizard />} />
                <Route path="/subscription" element={<SaaSPlans />} />
                <Route path="/settings" element={<SettingsPage />} />
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
