import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Users, FileText, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';
import { ContractService, Contract } from '../contracts/ContractService';

const DashboardHome: React.FC = () => {
    const { user } = useAuthStore();
    const [tenantName, setTenantName] = useState('Inmobiliaria');
    const [adjustmentsThisMonth, setAdjustmentsThisMonth] = useState<Contract[]>([]);

    // Bloqueo de emergencia para SuperAdmin en esta vista
    if (user?.role === 'SUPERADMIN') return <Navigate to="/admin" replace />;
    const [stats, setStats] = useState({
        properties: 0,
        contracts: 0,
        clients: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const profileRes = await axiosInstance.get('/auth/me');
                if (profileRes.data.tenant && profileRes.data.tenant.name) {
                    setTenantName(profileRes.data.tenant.name);
                }

                const [propRes, peopleRes, contractsRes] = await Promise.all([
                    axiosInstance.get('/properties'),
                    axiosInstance.get('/people'),
                    axiosInstance.get('/contracts/')
                ]);
                setStats({
                    properties: propRes.data.length || 0,
                    contracts: contractsRes.data.length || 0,
                    clients: peopleRes.data.length || 0
                });

                const adjustments = await ContractService.getAdjustmentsThisMonth();
                setAdjustmentsThisMonth(adjustments);
            } catch (err) {
                console.error("Error al cargar datos del dashboard:", err);
            }
        };
        fetchDashboardData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Cabecera con Saludo Dinámico */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        ¡¡¡Bienvenida, <span className="text-blue-600 dark:text-blue-400">{tenantName}</span>!!!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Aquí tienes un resumen de tu actividad inmobiliaria hoy.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <Calendar size={20} />
                    </div>
                    <span className="pr-4 font-bold text-sm">
                        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* Grid de KPIs con Iconografía Renovada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Propiedades"
                    value={stats.properties}
                    icon={Home}
                    color="blue"
                    variants={itemVariants}
                />
                <StatCard
                    title="Contratos Vigentes"
                    value={stats.contracts}
                    icon={FileText}
                    color="green"
                    variants={itemVariants}
                />
                <StatCard
                    title="Clientes Totales"
                    value={stats.clients}
                    icon={Users}
                    color="purple"
                    variants={itemVariants}
                />
            </div>

            {/* Ajustes del mes */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm"
            >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <DollarSign className="text-emerald-600 dark:text-emerald-400" />
                    Ajustes del mes
                </h2>
                {adjustmentsThisMonth.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No hay contratos con ajuste en el mes actual.</p>
                ) : (
                    <ul className="space-y-3">
                        {adjustmentsThisMonth.map((c) => (
                            <li key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div>
                                    <span className="font-semibold text-slate-800 dark:text-white">Contrato #{c.id}</span>
                                    <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">
                                        {c.last_adjustment_date ? new Date(c.last_adjustment_date).toLocaleDateString('es-AR') : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                    {(c.current_rent ?? c.monthly_rent)?.toLocaleString()} {c.currency}
                                </div>
                                <Link to={`/contracts/${c.id}/edit`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Ver</Link>
                            </li>
                        ))}
                    </ul>
                )}
            </motion.div>

            {/* Sección de Accesos Rápidos o Actividad Reciente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" />
                        Accesos Rápidos
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAction icon={Building2} label="Nueva Propiedad" color="blue" />
                        <QuickAction icon={Users} label="Alta Cliente" color="purple" />
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-2">Soporte IA Activo</h2>
                        <p className="text-blue-100 mb-6 max-w-[200px]">Tu asistente inteligente está procesando mensajes de WhatsApp en tiempo real.</p>
                        <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-colors">
                            Ver Mensajes
                        </button>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] opacity-10">
                        <Building2 size={240} />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, variants }: any) => (
    <motion.div
        variants={variants}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className={`p-5 rounded-2xl bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`}>
            <Icon size={32} />
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black">{value}</p>
        </div>
    </motion.div>
);

const QuickAction = ({ icon: Icon, label, color }: any) => (
    <button className="flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-3 group">
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-600 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
    </button>
);

export default DashboardHome;
