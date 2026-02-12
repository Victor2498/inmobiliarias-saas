import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Shield, MessageSquare, Search, Filter, MoreHorizontal, TrendingUp, Users, AlertTriangle, Edit, Power, Trash2, X, Save } from 'lucide-react';
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
    const [showEdit, setShowEdit] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    // Form state for Create
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPlan, setNewPlan] = useState('lite');
    const [newWhatsApp, setNewWhatsApp] = useState(false);

    // Form state for Edit
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPlan, setEditPlan] = useState('');
    const [editWhatsApp, setEditWhatsApp] = useState(false);

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

    const openEditModal = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setEditName(tenant.name);
        setEditEmail(tenant.email);
        setEditPlan(tenant.plan);
        setEditWhatsApp(tenant.whatsapp_enabled);
        setShowEdit(true);
    };

    const handleUpdateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;
        try {
            await axiosInstance.put(`/tenants/${selectedTenant.id}`, {
                name: editName,
                email: editEmail,
                plan: editPlan,
                whatsapp_enabled: editWhatsApp
            });
            setShowEdit(false);
            fetchTenants();
        } catch (err) {
            alert('Error al actualizar inmobiliaria');
        }
    };

    const handleToggleStatus = async (tenant: Tenant) => {
        const action = tenant.is_active ? 'suspender' : 'activar';
        if (!confirm(`¿Estás seguro de que deseas ${action} a ${tenant.name}?`)) return;
        try {
            await axiosInstance.post(`/tenants/${tenant.id}/toggle-status`);
            fetchTenants();
        } catch (err) {
            alert(`Error al ${action} inmobiliaria`);
        }
    };

    const handleDeleteTenant = async (tenant: Tenant) => {
        if (!confirm(`⚠️ ¿ESTÁS SEGURO? Eliminar a ${tenant.name} borrará acceso y datos. Esta acción no se puede deshacer.`)) return;
        try {
            await axiosInstance.delete(`/tenants/${tenant.id}`);
            fetchTenants();
        } catch (err) {
            alert('Error al eliminar inmobiliaria');
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
                    <TenantTable
                        tenants={tenants.slice(0, 5)}
                        compact
                        onEdit={openEditModal}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDeleteTenant}
                    />
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

            <TenantTable
                tenants={filteredTenants}
                onEdit={openEditModal}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTenant}
            />

            {/* Modal de Creación */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Nueva Inmobiliaria</h2>
                                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTenant} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold mb-2">Nombre Comercial</label>
                                        <input required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 ring-blue-500 outline-none transition-all" value={newName} onChange={e => setNewName(e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold mb-2">Email Admin</label>
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
            </AnimatePresence>

            {/* Modal de Edición */}
            <AnimatePresence>
                {showEdit && selectedTenant && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Editar Inmobiliaria</h2>
                                <button onClick={() => setShowEdit(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateTenant} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold mb-2">Nombre Comercial</label>
                                        <input required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 ring-blue-500 outline-none transition-all" value={editName} onChange={e => setEditName(e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold mb-2">Email de Contacto</label>
                                        <input type="email" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 focus:ring-2 ring-blue-500 outline-none transition-all" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Plan</label>
                                        <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none" value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                                            <option value="lite">Lite</option>
                                            <option value="basic">Básico</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end pb-3">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" checked={editWhatsApp} onChange={e => setEditWhatsApp(e.target.checked)} />
                                            <span className="text-sm font-bold">Habilitar WhatsApp</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowEdit(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold">Cancelar</button>
                                    <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                        <Save size={20} /> Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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

interface TenantTableProps {
    tenants: Tenant[];
    compact?: boolean;
    onEdit?: (tenant: Tenant) => void;
    onToggleStatus?: (tenant: Tenant) => void;
    onDelete?: (tenant: Tenant) => void;
}

const TenantTable = ({ tenants, compact, onEdit, onToggleStatus, onDelete }: TenantTableProps) => {
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    return (
        <div className="overflow-x-auto pb-20">
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
                            <td className="py-4 text-right pr-4 relative">
                                <button
                                    onClick={() => setActionMenuOpen(actionMenuOpen === t.id ? null : t.id)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                </button>

                                {actionMenuOpen === t.id && !compact && onEdit && (
                                    <div className="absolute right-10 top-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-10 w-48 text-left">
                                        <button
                                            onClick={() => { onEdit(t); setActionMenuOpen(null); }}
                                            className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold flex items-center gap-2 text-slate-600 dark:text-slate-300"
                                        >
                                            <Edit size={16} /> Editar Datos
                                        </button>

                                        {onToggleStatus && (
                                            <button
                                                onClick={() => { onToggleStatus(t); setActionMenuOpen(null); }}
                                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold flex items-center gap-2 ${t.is_active ? 'text-orange-500' : 'text-green-500'}`}
                                            >
                                                <Power size={16} /> {t.is_active ? 'Suspender' : 'Reactivar'}
                                            </button>
                                        )}

                                        {onDelete && (
                                            <button
                                                onClick={() => { onDelete(t); setActionMenuOpen(null); }}
                                                className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-semibold flex items-center gap-2 text-red-500"
                                            >
                                                <Trash2 size={16} /> Eliminar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
