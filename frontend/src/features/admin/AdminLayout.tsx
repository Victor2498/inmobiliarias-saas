import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    CreditCard,
    MessageSquare,
    LayoutDashboard,
    ShieldCheck,
    ChevronRight,
    LogOut,
    Bell,
    Lock
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import BillingPanel from './BillingPanel';
import WhatsAppPanel from './WhatsAppPanel';
import SecuritySettingsPanel from './SecuritySettingsPanel';
import SecurityCenter from './SecurityCenter';
import { Settings } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarItemProps {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'group-hover:text-blue-500'}`} />
        <span className="font-bold text-sm flex-1 text-left">{label}</span>
        {active && <ChevronRight className="w-4 h-4" />}
    </button>
);

const AdminLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tenants');
    // const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {

        // alert("Cerrando sesión..."); // Debug
        logout();
        window.location.href = '/login';
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
        { id: 'tenants', label: 'Gestión Inmobiliarias', icon: Building2 },
        { id: 'billing', label: 'Planes y Pagos', icon: CreditCard },
        { id: 'whatsapp', label: 'WhatsApp Manager', icon: MessageSquare },
        { id: 'security', label: 'Seguridad y Salud', icon: ShieldCheck },
        { id: 'settings', label: 'Ajustes', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard setActiveTab={setActiveTab} />;
            case 'tenants':
                return <AdminDashboard view="list" />;
            case 'billing':
                return <BillingPanel />;
            case 'whatsapp':
                return <WhatsAppPanel />;
            case 'security':
                return <SecurityCenter />;
            case 'settings':
                return <SecuritySettingsPanel />;
            default:
                return <AdminDashboard setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#0a0c10] text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 bg-white dark:bg-[#0d1117] z-20">
                <div className="flex items-center space-x-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                        <Lock className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">SuperAdmin <span className="text-blue-600">2.0</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}
                </nav>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2 relative z-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-2xl transition-all font-bold text-sm relative z-50 cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md z-10">
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                        <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                            <div className="text-right">
                                <p className="text-sm font-black">Super Admin</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black">
                                SA
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-transparent custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-8"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
