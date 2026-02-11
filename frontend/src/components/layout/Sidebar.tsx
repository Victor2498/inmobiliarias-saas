import React from 'react';
import { LayoutDashboard, Home, FileText, MessageSquare, Settings, LogOut, Users } from 'lucide-react';
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
        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'hover:bg-slate-800 hover:text-white'
            }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </Link>
);

const Sidebar: React.FC = () => {
    const { logout, user } = useAuthStore();
    const location = useLocation();

    return (
        <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col p-4 text-slate-300">
            <div className="text-2xl font-bold text-blue-500 mb-8 px-2">SAAS Inmobiliaria</div>

            <nav className="flex-1 space-y-2">
                <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/dashboard'} />
                <SidebarItem to="/properties" icon={<Home size={20} />} label="Propiedades" active={location.pathname === '/properties'} />
                <SidebarItem to="/people" icon={<Users size={20} />} label="Personas" active={location.pathname === '/people'} />
                <SidebarItem to="/contracts" icon={<FileText size={20} />} label="Contratos" active={location.pathname === '/contracts'} />
                <SidebarItem to="/whatsapp" icon={<MessageSquare size={20} />} label="WhatsApp" active={location.pathname === '/whatsapp'} />
            </nav>

            <div className="pt-4 border-t border-slate-800">
                <div className="px-2 mb-4">
                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <div className="mb-2">
                    <SidebarItem to="/settings" icon={<Settings size={20} />} label="Ajustes" active={location.pathname === '/settings'} />
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
