import React, { useState, useEffect } from 'react';
import { WhatsAppService } from './WhatsAppService';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle, Plus } from 'lucide-react';

const WhatsAppDashboard: React.FC = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [newInstanceName, setNewInstanceName] = useState('');

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await WhatsAppService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error("Error loading WhatsApp sessions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInstance = async () => {
        if (!newInstanceName) return;
        try {
            const result = await WhatsAppService.createSession(newInstanceName);
            if (result.qrcode?.base64) {
                setQrCode(result.qrcode.base64);
            }
            loadSessions();
        } catch (error) {
            console.error("Error creating instance", error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <Smartphone className="text-blue-500" />
                    <span>Conexión de WhatsApp</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Panel de Control */}
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                    <h2 className="text-lg font-semibold text-white mb-4">Nueva Instancia</h2>
                    <div className="space-y-4">
                        <input
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Nombre de la inmobiliaria (ej: inmobiliaria_centro)"
                            value={newInstanceName}
                            onChange={(e) => setNewInstanceName(e.target.value)}
                        />
                        <button
                            onClick={handleCreateInstance}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={20} />
                            <span>Generar Código QR</span>
                        </button>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-white font-semibold mb-4">Instancias Activas</h2>
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <div key={session.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">{session.instance_name}</p>
                                        <p className="text-xs text-slate-500 uppercase">ID: {session.id}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {session.status === 'CONNECTED' ? (
                                            <span className="text-emerald-400 flex items-center text-sm font-bold">
                                                <CheckCircle size={14} className="mr-1" /> Conectado
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 flex items-center text-sm">
                                                <AlertCircle size={14} className="mr-1" /> Esperando QR
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {sessions.length === 0 && !loading && (
                                <p className="text-slate-500 text-sm italic">No hay instancias configuradas aún.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Visor de QR */}
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center">
                    <h2 className="text-lg font-semibold text-white mb-6">Escanea el Código QR</h2>
                    <div className="bg-white p-4 rounded-2xl shadow-2xl relative group">
                        {qrCode ? (
                            <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                        ) : (
                            <div className="w-64 h-64 bg-slate-100 flex items-center justify-center text-slate-400 text-center p-8">
                                Ingresa un nombre y haz clic en "Generar QR" para comenzar la conexión
                            </div>
                        )}
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={handleCreateInstance} className="bg-slate-900 text-white p-3 rounded-full shadow-xl">
                                <RefreshCw size={24} />
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-6 text-center max-w-xs">
                        Abre WhatsApp en tu teléfono, ve a Dispositivos vinculados y escanea este código.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppDashboard;
