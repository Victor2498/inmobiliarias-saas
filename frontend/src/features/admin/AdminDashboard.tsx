import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, MessageSquare, Search, Filter, MoreHorizontal, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

interface Tenant {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    plan: string;
    whatsapp_enabled: boolean;
    created_at: string;
    status: string; // active, suspended, pending
}

interface AdminDashboardProps {
    view?: 'dashboard' | 'list';
    setActiveTab?: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ view = 'dashboard', setActiveTab }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [stats, setStats] = useState({ totalContext: 0, active: 0, mrr: 0, errors: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    // Form state (Simplificado para el ejemplo, ampliar real)
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPlan, setNewPlan] = useState('lite');
    const [newWhatsApp, setNewWhatsApp] = useState(false);

    const fetchTenants = async () => {
        try {
            const res = await axiosInstance.get('/admin/');
            setTenants(res.data);
            // Calcular stats básicas
            const active = res.data.filter((t: Tenant) => t.is_active).length;
            const mrr = res.data.reduce((acc: number, t: Tenant) => {
                const price = t.plan === 'premium' ? 29900 : t.plan === 'basic' ? 14900 : 0; // Precios ejemplo
                return acc + price;
            }, 0);
            setStats({
                totalContext: res.data.length,
                active,
                mrr,
                errors: res.data.filter((t: Tenant) => !t.is_active).length // Dummies
            });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/admin/', {
                name: newName,
                email: newEmail,
                password: newPassword,
                plan: newPlan,
                whatsapp_enabled: newWhatsApp
            });
            setShowCreate(false);
            setNewName(''); setNewEmail(''); setNewPassword('');
            fetchTenants();
        } catch (err) {
            alert('Error al crear inmobiliaria');
        }
    };

    // Renderizado del Dashboard de KPIs
    if (view === 'dashboard') {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="MRR Estimado" value={`$${stats.mrr.toLocaleString()}`} icon={TrendingUp} color="blue" />
                    <MetricCard title="Inmobiliarias Activas" value={stats.active.toString()} icon={Users} color="green" />
                    <MetricCard title="Total Registradas" value={stats.totalContext.toString()} icon={Shield} color="purple" />
                    <MetricCard title="Alertas / Suspendidas" value={stats.errors.toString()} icon={AlertTriangle} color="red" />
                </div>

                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Últimas Inmobiliarias</h2>
                        <button onClick={() => setActiveTab && setActiveTab('tenants')} className="text-blue-600 font-bold text-sm hover:underline">Ver todas</button>
                    </div>
                    <TenantTable tenants={tenants.slice(0, 5)} compact />
                </div>
            </div>
        );
    }

    // Renderizado de la Lista de Gestión (view === 'list')
    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Gestión de Inmobiliarias</h1>
                    <p className="text-slate-500 text-sm">Control total de accesos y servicios.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/20 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    <span>Alta Inmobiliaria</span>
                </button>
            </div>

            <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-4 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center space-x-2 text-slate-500 font-bold hover:text-blue-600">
                    <Filter className="w-5 h-5" />
                    <span>Filtros</span>
                </button>
            </div>

            <TenantTable tenants={filteredTenants} />

            {/* Modal de Creación (Reutilizar lógica existente) */}
            {/* ... Modal code ... */}
            {showCreate && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-6">Nueva Inmobiliaria</h2>
                        <form onSubmit={handleCreateTenant} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold mb-2">Nombre Comercial</label>
                                    <input required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 ring-blue-500 outline-none transition-all" value={newName} onChange={e => setNewName(e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold mb-2">Email</label>
                                    <input type="email" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 ring-blue-500 outline-none transition-all" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold mb-2">Contraseña</label>
                                    <input type="password" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 ring-blue-500 outline-none transition-all" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Plan</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none" value={newPlan} onChange={e => setNewPlan(e.target.value)}>
                                        <option value="lite">Lite</option>
                                        <option value="basic">Básico</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-3">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" checked={newWhatsApp} onChange={e => setNewWhatsApp(e.target.checked)} />
                                        <span className="text-sm font-bold">Habilitar WhatsApp</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-500/20">Crear Acceso</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// Subcomponentes para limpieza
const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center space-x-4 shadow-sm">
        <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-slate-500 text-sm font-bold uppercase">{title}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    </div>
);

const TenantTable = ({ tenants, compact }: { tenants: Tenant[], compact?: boolean }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-4 pl-4">Inmobiliaria</th>
                    <th className="pb-4">Plan</th>
                    <th className="pb-4">Estado</th>
                    {!compact && <th className="pb-4">WhatsApp</th>}
                    <th className="pb-4 text-right pr-4">Acciones</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {tenants.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 pl-4 font-bold">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    {t.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-slate-900 dark:text-white">{t.name}</div>
                                    <div className="text-xs text-slate-400 font-normal">{t.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="py-4">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${t.plan === 'premium' ? 'bg-purple-100 text-purple-600' :
                                t.plan === 'basic' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {t.plan}
                            </span>
                        </td>
                        <td className="py-4">
                            <span className={`flex items-center space-x-1.5 text-xs font-bold ${t.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${t.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span>{t.is_active ? 'Activo' : 'Suspendido'}</span>
                            </span>
                        </td>
                        {!compact && (
                            <td className="py-4 text-slate-500">
                                {t.whatsapp_enabled ? <MessageSquare className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 bg-slate-200 rounded-full"></div>}
                            </td>
                        )}
                        <td className="py-4 text-right pr-4">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default AdminDashboard;
