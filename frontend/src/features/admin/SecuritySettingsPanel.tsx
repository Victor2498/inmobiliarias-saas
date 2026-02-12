import React, { useState } from 'react';
import { Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const SecuritySettingsPanel: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setErrorMsg("Las nuevas contraseñas no coinciden.");
            setStatus('error');
            return;
        }

        if (newPassword.length < 8) {
            setErrorMsg("La nueva contraseña debe tener al menos 8 caracteres.");
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            await axiosInstance.post('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setStatus('success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.response?.data?.detail || "Error al actualizar la contraseña.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                    <Lock className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Seguridad de la Cuenta</h1>
                    <p className="text-slate-500 text-sm">Gestiona tus credenciales de acceso SuperAdmin.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-lg font-bold mb-6">Cambiar Contraseña</h2>

                <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Contraseña Actual</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 ring-blue-500 transition-all font-medium"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {status === 'error' && (
                        <div className="flex items-center p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {errorMsg}
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex items-center p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Contraseña actualizada correctamente.
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? (
                                <span>Procesando...</span>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    <span>Actualizar Contraseña</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SecuritySettingsPanel;
