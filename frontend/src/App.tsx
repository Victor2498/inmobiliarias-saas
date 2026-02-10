import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './features/dashboard/DashboardLayout';
import PropertyList from './features/properties/PropertyList';
import AuthGuard from './features/auth/AuthGuard';
import WhatsAppDashboard from './features/whatsapp/WhatsAppDashboard';
import PeopleList from './features/people/PeopleList';
import ContractList from './features/contracts/ContractList';

import LoginPage from './features/auth/LoginPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<div className="p-6 text-white text-2xl font-bold">Bienvenido al Dashboard</div>} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/whatsapp" element={<WhatsAppDashboard />} />
            <Route path="/people" element={<PeopleList />} />
            <Route path="/contracts" element={<ContractList />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
