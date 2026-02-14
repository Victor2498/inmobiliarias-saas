import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Shield, MessageSquare, Search, Filter, MoreHorizontal, TrendingUp, Users, AlertTriangle, Edit, Power, Trash2, X, Save, Download, Loader2 } from 'lucide-react';
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

// Separate Modal for Better Performance (Prevents typing lag)
const CreateTenantModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPlan, setNewPlan] = useState('lite');
    const [newWhatsApp, setNewWhatsApp] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/admin/', {
                name: newName,
                email: newEmail,
                password: newPassword,
                plan: newPlan,
                whatsapp_enabled: newWhatsApp
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al crear inmobiliaria');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Nueva Inmobiliaria</h2>
                        <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mt-1">Alta de Cliente SaaS</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-slate-500 hover:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nombre Comercial</label>
                            <input required className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Inmobiliaria Central" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Principal</label>
                            <input type="email" required className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@ejemplo.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Contraseña de Acceso</label>
                            <input type="password" required className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Plan</label>
                                <select className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-blue-500/50" value={newPlan} onChange={e => setNewPlan(e.target.value)}>
                                    <option value="lite" className="bg-slate-900">Lite</option>
                                    <option value="basic" className="bg-slate-900">Básico</option>
                                    <option value="premium" className="bg-slate-900">Premium</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-3">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input type="checkbox" className="w-6 h-6 rounded-lg border-white/5 bg-slate-950 text-blue-600 focus:ring-blue-500/20" checked={newWhatsApp} onChange={e => setNewWhatsApp(e.target.checked)} />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">WhatsApp Bot</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-2 px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Crear Acceso"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ view = 'dashboard', setActiveTab }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [stats, setStats] = useState({ totalContext: 0, active: 0, mrr: 0, errors: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    // Form state for Edit
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPlan, setEditPlan] = useState('');
    const [editWhatsApp, setEditWhatsApp] = useState(false);

    // Force Delete state
    const [showForceDelete, setShowForceDelete] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
    const [confirmName, setConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTenants = async () => {
        try {
            const res = await axiosInstance.get('/admin/');
            setTenants(res.data);
            const active = res.data.filter((t: Tenant) => t.is_active).length;
            const mrr = res.data.reduce((acc: number, t: Tenant) => {
                const price = t.plan === 'premium' ? 29900 : t.plan === 'basic' ? 14900 : 0;
                return acc + price;
            }, 0);
            setStats({ totalContext: res.data.length, active, mrr, errors: res.data.filter((t: Tenant) => !t.is_active).length });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

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
        setTenantToDelete(tenant);
        setConfirmName('');
        setShowForceDelete(true);
    };

    const handleConfirmForceDelete = async () => {
        if (!tenantToDelete || confirmName !== tenantToDelete.name) return;
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/admin/tenants/${tenantToDelete.id}/force`);
            setShowForceDelete(false);
            setTenantToDelete(null);
            fetchTenants();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al eliminar inmobiliaria forzosamente');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExportTenant = async (tenant: Tenant) => {
        try {
            const response = await axiosInstance.get(`/reports/admin/export-movements/${tenant.id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `backup_${tenant.name}_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert('Error al descargar backup');
        }
    };

    if (view === 'dashboard') {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="MRR Estimado" value={`$${stats.mrr.toLocaleString()}`} icon={TrendingUp} color="blue" />
                    <MetricCard title="Inmobiliarias Activas" value={stats.active.toString()} icon={Users} color="green" />
                    <MetricCard title="Total Registradas" value={stats.totalContext.toString()} icon={Shield} color="purple" />
                    <MetricCard title="Alertas / Suspendidas" value={stats.errors.toString()} icon={AlertTriangle} color="red" />
                </div>
                <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Últimas Inmobiliarias</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Actividad reciente del sistema</p>
                        </div>
                        <button onClick={() => setActiveTab && setActiveTab('tenants')} className="bg-blue-600/10 text-blue-600 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Ver todas</button>
                    </div>
                    <TenantTable tenants={tenants.slice(0, 5)} compact onEdit={openEditModal} onToggleStatus={handleToggleStatus} onDelete={handleDeleteTenant} onExport={handleExportTenant} />
                </div>
            </div>
        );
    }

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="mb-12">
                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                    Gestión de <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Inmobiliarias</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium">Control total de accesos, planes y servicios SaaS</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl flex flex-wrap items-center gap-4 shadow-2xl">
                <div className="flex-1 relative min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o ID..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-white font-medium focus:outline-none focus:border-blue-500/50 transition-all outline-none placeholder:text-slate-700"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="px-6 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center space-x-2 text-slate-400 font-bold hover:text-white hover:border-slate-700 transition-all text-sm">
                    <Filter className="w-4 h-4" />
                    <span>Filtros Avanzados</span>
                </button>

                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-blue-600 hover:bg-blue-50 text-white hover:text-blue-600 px-8 py-3.5 rounded-2xl flex items-center space-x-3 transition-all shadow-lg shadow-blue-600/20 font-black text-sm active:scale-95 ml-auto"
                >
                    <Plus className="w-5 h-5 stroke-[3]" />
                    <span>AGREGAR INMOBILIARIA</span>
                </button>
            </div>

            <TenantTable
                tenants={filteredTenants}
                onEdit={openEditModal}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTenant}
                onExport={handleExportTenant}
            />

            <AnimatePresence>
                {showCreate && <CreateTenantModal onClose={() => setShowCreate(false)} onSuccess={fetchTenants} />}
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

            {/* Modal de Eliminación Forzosa */}
            <AnimatePresence>
                {showForceDelete && tenantToDelete && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex items-center gap-4 text-red-600 mb-6">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="text-2xl font-black">Eliminación Forzosa</h2>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-slate-600 dark:text-slate-400 font-medium">
                                    Estás a punto de eliminar permanentemente a <span className="font-bold text-slate-900 dark:text-white">{tenantToDelete.name}</span>.
                                </p>
                                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                                    <p className="text-red-700 dark:text-red-400 text-sm font-bold">
                                        ⚠️ ATENCIÓN: Esta acción es irreversible. Se eliminarán todas las propiedades, contratos, clientes y registros históricos.
                                    </p>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Para confirmar, escribe el nombre de la inmobiliaria exactamente:
                                </p>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 ring-red-500 font-bold"
                                    placeholder={tenantToDelete.name}
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirmForceDelete}
                                    disabled={confirmName !== tenantToDelete.name || isDeleting}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? "Eliminando..." : <><Trash2 size={20} /> Confirmar Eliminación Total</>}
                                </button>
                                <button
                                    onClick={() => { setShowForceDelete(false); setTenantToDelete(null); }}
                                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
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
    onExport?: (tenant: Tenant) => void;
}


const TenantTable = ({ tenants, compact, onEdit, onToggleStatus, onDelete, onExport }: TenantTableProps) => {
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
                            <td className="py-4 text-right pr-4">
                                <div className="flex justify-end items-center space-x-2">
                                    {onExport && (
                                        <button
                                            onClick={() => onExport(t)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-blue-600"
                                            title="Descargar Backup"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}

                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(t)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-blue-600"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}

                                    {onToggleStatus && (
                                        <button
                                            onClick={() => onToggleStatus(t)}
                                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${t.is_active ? 'text-green-500 hover:text-orange-500' : 'text-red-500 hover:text-green-500'}`}
                                            title={t.is_active ? "Suspender" : "Activar"}
                                        >
                                            <Power className="w-4 h-4" />
                                        </button>
                                    )}

                                    {onDelete && !compact && (
                                        <button
                                            onClick={() => onDelete(t)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-slate-400 hover:text-red-600"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
