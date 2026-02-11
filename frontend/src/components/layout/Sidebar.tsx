import React from 'react';
import { LayoutDashboard, Home, FileText, MessageSquare, Settings, LogOut, Users, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active = false }) => (
    <Link
        to={to}
        className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-white'
            }`}
    >
        {icon}
        <span className="font-semibold">{label}</span>
    </Link>
);

const Sidebar: React.FC = () => {
    const { logout, user } = useAuthStore();
    const location = useLocation();

    return (
        <div className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 text-slate-300 transition-colors duration-500">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-10 px-4">Inmonea</div>

            <nav className="flex-1 space-y-2">
                <SidebarItem to="/dashboard" icon={<LayoutDashboard size={22} />} label="Dashboard" active={location.pathname === '/dashboard'} />

                {user?.role === 'SUPERADMIN' && (
                    <SidebarItem to="/admin" icon={<Shield size={22} />} label="Administración" active={location.pathname === '/admin'} />
                )}

                <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gestión</div>

                <SidebarItem to="/properties" icon={<Home size={22} />} label="Propiedades" active={location.pathname === '/properties'} />
                <SidebarItem to="/people" icon={<Users size={22} />} label="Personas" active={location.pathname === '/people'} />
                <SidebarItem to="/contracts" icon={<FileText size={22} />} label="Contratos" active={location.pathname === '/contracts'} />
                <SidebarItem to="/whatsapp" icon={<MessageSquare size={22} />} label="WhatsApp" active={location.pathname === '/whatsapp'} />
            </nav>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="px-4 mb-6">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || user?.email}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{user?.role?.replace('_', ' ')}</p>
                </div>

                <SidebarItem to="/settings" icon={<Settings size={22} />} label="Ajustes" active={location.pathname === '/settings'} />

                <button
                    onClick={logout}
                    className="w-full mt-2 flex items-center space-x-3 p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all group"
                >
                    <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-semibold">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
