import React, { useState } from 'react';
import { User, Lock, Save, AlertCircle, CheckCircle, Download, Database } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import axiosInstance from '../../api/axiosInstance';

const SettingsPage: React.FC = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'data'>('profile');

    // Security Form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Error al actualizar contraseña' });
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await axiosInstance.get('/reports/export-movements', {
                responseType: 'blob',
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `movimientos_inmobiliaria_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exportando datos', error);
            alert("Error al exportar datos. Intente nuevamente.");
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
            <header>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    Ajustes de Inmobiliaria
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Gestiona tu perfil, seguridad y datos de la cuenta.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar de Ajustes */}
                <div className="md:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all ${activeTab === 'profile'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <User size={20} /> Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all ${activeTab === 'security'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Lock size={20} /> Seguridad
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all ${activeTab === 'data'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Database size={20} /> Datos y Backup
                    </button>
                </div>

                {/* Contenido */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <User className="text-blue-500" /> Información de la Cuenta
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Nombre / Razón Social</label>
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300">
                                        {user?.name || 'Inmobiliaria Demo'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300">
                                        {user?.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Rol</label>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                                        {user?.role?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Lock className="text-blue-500" /> Cambiar Contraseña
                            </h2>

                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                        Contraseña Actual
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                        Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                        Confirmar Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {message && (
                                    <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Actualizando...' : 'Guardar Cambios'} <Save size={20} />
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Database className="text-blue-500" /> Exportación de Datos y Backup
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">
                                Descarga un historial completo de tus movimientos financieros (Cobros y Liquidaciones) en formato CSV.
                                Utiliza este archivo para realizar copias de seguridad externas o para análisis en Excel.
                            </p>

                            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Historial Financiero Completo</h3>
                                    <p className="text-sm text-slate-500">Incluye fechas, conceptos, montos y métodos de todos los movimientos.</p>
                                </div>
                                <button
                                    onClick={handleExportData}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-all hover:scale-105"
                                >
                                    <Download size={20} /> Exportar CSV
                                </button>
                            </div>

                            <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl text-orange-800 dark:text-orange-200 text-sm flex gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    Nota: Si planeas dar de baja tu cuenta, te recomendamos descargar este archivo para conservar tu historial operativo.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
