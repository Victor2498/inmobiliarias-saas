import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './features/dashboard/DashboardLayout';
import PropertyList from './features/properties/PropertyList';
import AuthGuard from './features/auth/AuthGuard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login provisional */}
        <Route path="/login" element={<div className="text-white p-10">Login Page (Placeholder)</div>} />

        {/* Rutas Protegidas */}
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<div className="p-6 text-white text-2xl font-bold">Bienvenido al Dashboard</div>} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
