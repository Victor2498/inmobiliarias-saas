import React, { useEffect, useState } from 'react';
import { Activity, User, Building, Clock, Info } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

interface AuditLog {
    id: string;
    actor_id: number;
    tenant_id: string | null;
    action: string;
    details: any;
    timestamp: string;
}

const AuditLogPanel: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // En un futuro este endpoint existirá en /api/v1/admin/audit
                const res = await axiosInstance.get('/admin/audit');
                setLogs(res.data);
            } catch (err) {
                console.error("Error fetching logs", err);
            } finally {
                // Loading state removed
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Registro de Auditoría</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Historial inmutable de acciones administrativas.</p>
                </div>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">Exportar CSV</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">Filtros Avanzados</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Evento</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Actor</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Inmobiliaria</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Fecha</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-sm">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <Activity className="w-12 h-12 mb-4 opacity-10" />
                                        <p>No hay registros de auditoría disponibles todavía.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-[10px] font-black">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-slate-400" />
                                        ID #{log.actor_id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <Building className="w-4 h-4 mr-2 text-slate-400" />
                                            {log.tenant_id || 'Global'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-slate-400 text-xs">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-500 flex items-center text-xs font-bold">
                                            <Info className="w-4 h-4 mr-1" /> Ver JSON
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogPanel;
