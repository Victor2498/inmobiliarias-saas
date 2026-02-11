import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Shield, CheckCircle, XCircle, Settings, Mail } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

interface Tenant {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
}

const AdminDashboard: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

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
                password: newPassword
            });
            setShowCreate(false);
            setNewName('');
            setNewEmail('');
            setNewPassword('');
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

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Inmobiliarias</h1>
                    <p className="text-slate-500">Panel de control del SuperAdministrador</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nueva Inmobiliaria</span>
                </button>
            </header>

            {/* Modal de Creación */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-6">Alta de Inmobiliaria</h2>
                        <form onSubmit={handleCreateTenant} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre Comercial</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Administrador</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Contraseña Inicial</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-500/20"
                                >
                                    Crear
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Listado de Tenants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map(tenant => (
                    <motion.div
                        key={tenant.id}
                        layoutId={tenant.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => toggleStatus(tenant.id, tenant.is_active)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tenant.is_active ? 'bg-green-500/10 text-green-500 hover:bg-red-500/10 hover:text-red-500' : 'bg-red-500/10 text-red-500 hover:bg-green-500/10 hover:text-green-500'}`}
                            >
                                {tenant.is_active ? 'Activa' : 'Inactiva'}
                            </button>
                        </div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-blue-500 transition-colors">{tenant.name}</h3>
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-4">
                            <Mail className="w-4 h-4 mr-2" />
                            {tenant.email}
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                            <span>Desde: {new Date(tenant.created_at).toLocaleDateString()}</span>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Settings className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
