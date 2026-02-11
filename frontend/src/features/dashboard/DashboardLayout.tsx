import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';

const DashboardLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-900">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
