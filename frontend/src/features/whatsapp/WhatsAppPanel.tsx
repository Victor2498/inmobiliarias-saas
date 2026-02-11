import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, RefreshCw, LogOut, CheckCircle2, Zap, ShieldAlert, Key, Layout, CreditCard } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';

const WhatsAppPanel: React.FC = () => {
    const { user } = useAuthStore();
    const [status, setStatus] = useState<'LOADING' | 'NOT_CREATED' | 'QR_PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('LOADING');
    const [qr, setQr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const plan = (user as any)?.plan || 'lite';

    const fetchStatus = async () => {
        try {
            const res = await axiosInstance.get('/whatsapp/status');
            setStatus(res.data.status);
        } catch (err: any) {
            if (err.response?.status === 403) {
                setStatus('ERROR');
            } else {
                setStatus('NOT_CREATED');
            }
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 15000); // Polling cada 15s
        return () => clearInterval(interval);
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.post('/whatsapp/connect');
            setQr(res.data.qr);
            setStatus('QR_PENDING');
        } catch (err) {
            alert('Error al conectar WhatsApp');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!confirm('¿Cerrar sesión de WhatsApp?')) return;
        setLoading(true);
        try {
            await axiosInstance.post('/whatsapp/logout');
            setStatus('DISCONNECTED');
            setQr(null);
        } catch (err) {
            alert('Error al cerrar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                {plan === 'lite' && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                )}
                <div className="flex items-center space-x-5">
                    <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">WhatsApp Business</h1>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'CONNECTED' ? 'bg-green-500' : 'bg-slate-400'}`} />
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">
                                {status === 'CONNECTED' ? 'Conectado' : status.replace('_', ' ')}
                            </p>
                        </div>
                    </div>
                </div>

                {status === 'CONNECTED' && (
                    <button onClick={handleLogout} disabled={loading} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                        <LogOut className="w-6 h-6" />
                    </button>
                )}
            </header>

            {plan === 'lite' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-start space-x-4">
                    <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                        <h4 className="text-amber-800 dark:text-amber-500 font-black uppercase text-xs tracking-widest mb-1">Plan Lite - Panel Provisorio</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed">
                            Solo puedes gestionar la conexión de WhatsApp. Actualiza a un <strong>Plan Básico</strong> para acceder al CRM completo y automatizaciones.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lado Izquierdo: Acciones y Estado */}
                <div className="space-y-6">
                    {(status === 'DISCONNECTED' || status === 'NOT_CREATED' || status === 'ERROR') && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 h-full flex flex-col justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                                <Key className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Vincular Dispositivo</h3>
                                <p className="text-slate-500 text-sm">Escanea el código QR para conectar tu WhatsApp Business con Inmonea</p>
                            </div>
                            <button
                                onClick={handleConnect}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Generar Código QR</span>}
                            </button>
                        </div>
                    )}

                    {status === 'CONNECTED' && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 h-full flex flex-col justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Conexión Activa</h3>
                                <p className="text-slate-500 text-sm">Tu WhatsApp está sincronizado correctamente.</p>
                            </div>
                            <div className="pt-4 grid grid-cols-3 gap-2">
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sesión</p>
                                    <p className="text-xs font-bold text-green-500">Activa</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Plan</p>
                                    <p className="text-xs font-bold capitalize">{plan}</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">WEB</p>
                                    <p className="text-xs font-bold text-blue-500">Live</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lado Derecho: Visualizador de QR o Info Pro */}
                <div className="min-h-[400px]">
                    {status === 'QR_PENDING' && qr && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col items-center">
                            <div className="p-4 bg-slate-50 rounded-3xl mb-6">
                                <img src={qr} alt="WhatsApp QR" className="w-64 h-64" />
                            </div>
                            <p className="text-slate-900 font-black text-center text-sm mb-2">Escanea este código QR</p>
                            <p className="text-slate-500 text-xs text-center leading-relaxed">
                                Abre WhatsApp en tu teléfono {'>'} Menú {'>'} Dispositivos Vinculados {'>'} Vincular Dispositivo.
                            </p>
                            <button onClick={handleConnect} className="mt-6 text-blue-600 text-sm font-bold flex items-center space-x-2">
                                <RefreshCw className="w-4 h-4" />
                                <span>Regenerar QR</span>
                            </button>
                        </motion.div>
                    )}

                    {status === 'CONNECTED' && plan !== 'lite' && (
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[2.5rem] text-white h-full flex flex-col justify-between">
                            <Zap className="w-12 h-12 text-blue-200" />
                            <div>
                                <h3 className="text-3xl font-black mb-4 leading-tight">Acceso CRM Habilitado</h3>
                                <p className="text-blue-100 text-sm mb-8 leading-relaxed">
                                    Como usuario del <strong>Plan {plan.toUpperCase()}</strong>, tienes acceso a todas las herramientas de venta por WhatsApp.
                                </p>
                                <button className="w-full bg-white text-blue-700 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center">
                                    <span>Ir al Panel de Ventas</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'CONNECTED' && plan === 'lite' && (
                        <div className="bg-slate-100 dark:bg-slate-800 p-10 rounded-[2.5rem] h-full flex flex-col justify-center items-center text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Layout className="w-16 h-16 text-slate-300 mb-6" />
                            <h4 className="text-xl font-bold mb-2">Panel Limitado</h4>
                            <p className="text-slate-400 text-sm mb-6 max-w-[200px]">Las funciones avanzadas no están disponibles en el Plan Lite.</p>
                            <button className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl text-xs font-bold flex items-center space-x-2">
                                <CreditCard className="w-4 h-4" />
                                <span>Mejorar Plan</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppPanel;
