import React, { useEffect, useState } from 'react';
import {
    MessageSquare,
    Server,
    CheckCircle2,
    XCircle,
    RefreshCcw,
    Settings,
    Zap,
    Globe,
    AlertCircle
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

interface WhatsAppInstance {
    id: string;
    tenant_id: string;
    instance_name: string;
    status: 'CONNECTED' | 'NOT_CONNECTED' | 'QR_PENDING' | 'DISCONNECTED' | 'ERROR';
    last_connected_at: string | null;
    error_message: string | null;
}

const WhatsAppPanel: React.FC = () => {
    const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
    const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('online');
    const [syncingId, setSyncingId] = useState<string | null>(null);

    const fetchInstances = async () => {
        try {
            const res = await axiosInstance.get('/admin/whatsapp/instances');
            setInstances(res.data);
        } catch (err) {
            console.error("Error fetching instances", err);
        }
    };

    const fetchServerStatus = async () => {
        try {
            const res = await axiosInstance.get('/admin/whatsapp/health');
            setServerStatus(res.data.status);
        } catch (err) {
            setServerStatus('offline');
        }
    };

    const syncInstance = async (id: string) => {
        setSyncingId(id);
        try {
            await axiosInstance.post(`/admin/whatsapp/instances/${id}/sync`);
            await fetchInstances();
        } catch (err) {
            console.error("Error syncing instance", err);
        } finally {
            setSyncingId(null);
        }
    };

    const deleteInstance = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta instancia? Se borrará de Evolution API y de la DB.")) return;
        try {
            await axiosInstance.delete(`/admin/whatsapp/instances/${id}`);
            await fetchInstances();
        } catch (err) {
            console.error("Error deleting instance", err);
        }
    };

    useEffect(() => {
        fetchInstances();
        fetchServerStatus();
        const interval = setInterval(fetchServerStatus, 30000); // Check cada 30s
        return () => clearInterval(interval);
    }, []);

    const connectedCount = instances.filter(i => i.status === 'CONNECTED').length;
    const errorCount = instances.filter(i => i.status === 'ERROR' || i.status === 'DISCONNECTED').length;

    return (
        <div className="space-y-8">
            {/* Infrastructure Header */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative z-10 flex items-center space-x-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-500/30">
                        <Server className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold">Evolution API Gateway</h1>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center ${serverStatus === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                {serverStatus}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                            Nodo Principal: <span className="font-mono text-xs">apievolution.agentech.ar</span>
                        </p>
                    </div>
                </div>

                <div className="flex space-x-4 relative z-10">
                    <button onClick={fetchInstances} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-2xl transition-all">
                        <RefreshCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold text-xs transition-all hover:opacity-90">
                        <Settings className="w-4 h-4" />
                        <span>Configuración Global</span>
                    </button>
                </div>
            </div>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <Zap className="w-6 h-6 text-blue-500 mb-3" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Instancias Totales</p>
                    <p className="text-2xl font-black mt-1">{instances.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mb-3" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Conectadas</p>
                    <p className="text-2xl font-black mt-1 text-green-500">{connectedCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <AlertCircle className="w-6 h-6 text-yellow-500 mb-3" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Desconectadas</p>
                    <p className="text-2xl font-black mt-1 text-yellow-500">{instances.length - connectedCount - errorCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <XCircle className="w-6 h-6 text-red-500 mb-3" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Con Errores</p>
                    <p className="text-2xl font-black mt-1 text-red-500">{errorCount}</p>
                </div>
            </div>

            {/* Instance List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Mapeo de Instancias Multi-tenant</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Instancia</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Tenant ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Última Conexión</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {instances.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="font-bold">No hay instancias creadas.</p>
                                    </td>
                                </tr>
                            ) : (
                                instances.map((instance) => (
                                    <tr key={instance.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-2 h-2 rounded-full ${instance.status === 'CONNECTED' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                <span className="font-bold text-sm tracking-tight">{instance.instance_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px] font-bold">
                                                {instance.tenant_id}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${instance.status === 'CONNECTED' ? 'bg-green-500/10 text-green-500' :
                                                instance.status === 'ERROR' ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                {instance.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-slate-400 font-medium">
                                            {instance.last_connected_at ? new Date(instance.last_connected_at).toLocaleString() : 'Nunca'}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => syncInstance(instance.id)}
                                                    disabled={syncingId === instance.id}
                                                    className={`p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg text-blue-600 transition-all ${syncingId === instance.id ? 'animate-spin opacity-50' : ''}`}
                                                    title="Sincronizar Estado"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteInstance(instance.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-600 transition-all"
                                                    title="Eliminar Instancia"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppPanel;
