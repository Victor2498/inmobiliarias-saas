import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, Mail, MessageSquare } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

interface Tenant {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    plan: string;
    whatsapp_enabled: boolean;
    created_at: string;
}

const AdminDashboard: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [showCreate, setShowCreate] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPlan, setNewPlan] = useState('lite');
    const [newWhatsApp, setNewWhatsApp] = useState(false);

    const fetchTenants = async () => {
        try {
            const res = await axiosInstance.get('/admin/');
            setTenants(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            setNewPlan('lite');
            setNewWhatsApp(false);
            fetchTenants();
        } catch (err) {
            alert('Error al crear inmobiliaria');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await axiosInstance.patch(`/admin/${id}`, { is_active: !currentStatus });
            fetchTenants();
        } catch (err) {
            alert('Error al actualizar estado');
        }
    };

    const toggleWhatsApp = async (id: string, currentStatus: boolean) => {
        try {
            await axiosInstance.patch(`/admin/${id}`, { whatsapp_enabled: !currentStatus });
            fetchTenants();
        } catch (err) {
            alert('Error al actualizar WhatsApp');
        }
    };

    const updatePlan = async (id: string, plan: string) => {
        try {
            await axiosInstance.patch(`/admin/${id}`, { plan });
            fetchTenants();
        } catch (err) {
            alert('Error al actualizar plan');
        }
    };

    return (
        <div className="space-y-8 p-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Gestión Multi-tenant</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Panel de control del SuperAdministrador</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/20 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    <span>Alta Inmobiliaria</span>
                </button>
            </header>

            {/* Modal de Creación */}
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

            {/* Grid de Tenants */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tenants.map(tenant => (
                    <motion.div key={tenant.id} layout className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        {/* Indicador de Plan */}
                        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${tenant.plan === 'premium' ? 'bg-purple-600 text-white' :
                            tenant.plan === 'basic' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}>
                            Plan {tenant.plan}
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${tenant.is_active ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Shield className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <button onClick={() => toggleStatus(tenant.id, tenant.is_active)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${tenant.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {tenant.is_active ? 'Activa' : 'Suspendida'}
                                </button>
                                <button onClick={() => toggleWhatsApp(tenant.id, tenant.whatsapp_enabled)} className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold ${tenant.whatsapp_enabled ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{tenant.whatsapp_enabled ? 'WA ON' : 'WA OFF'}</span>
                                </button>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black mb-1 group-hover:text-blue-600 transition-colors truncate">{tenant.name}</h3>
                        <div className="flex items-center text-slate-400 text-sm mb-6 font-medium">
                            <Mail className="w-4 h-4 mr-2" />
                            {tenant.email}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Cambiar Plan</span>
                                <select
                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer hover:text-blue-500 transition-colors"
                                    value={tenant.plan}
                                    onChange={(e) => updatePlan(tenant.id, e.target.value)}
                                >
                                    <option value="lite">Lite</option>
                                    <option value="basic">Básico</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Desde</span>
                                <span className="text-sm font-bold">{new Date(tenant.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
