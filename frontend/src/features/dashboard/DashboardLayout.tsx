import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { Sun, Moon } from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuthStore();

    // Redirección inmediata si el usuario es SuperAdmin para evitar "flashear" el panel de inmobiliaria
    if (user?.role === 'SUPERADMIN') {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-500">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header / Top Bar */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-end px-8 bg-white dark:bg-slate-900/50 backdrop-blur-md z-10">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
                        title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
