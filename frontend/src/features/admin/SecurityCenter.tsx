import React, { useEffect, useState } from 'react';
import { ShieldAlert, Activity, Lock, UserX, FileText, Download, Filter } from 'lucide-react';
import AuditLogPanel from './AuditLogPanel';

const SecurityCenter: React.FC = () => {
    const [stats, setStats] = useState({
        failedLogins: 0,
        lockedUsers: 0,
        activeSessions: 0,
        criticalAlerts: 0
    });

    useEffect(() => {
        // En un futuro endpoint real /admin/security/stats
        setStats({
            failedLogins: 12,
            lockedUsers: 2,
            activeSessions: 45,
            criticalAlerts: 1
        });
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Centro de Seguridad</h1>
                    <p className="text-slate-500 text-sm">Monitoreo de amenazas y registro de auditoría.</p>
                </div>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center">
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Ver Alertas Críticas
                    </button>
                </div>
            </div>

            {/* KPIs de Seguridad */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SecurityCard title="Intentos Fallidos (24h)" value={stats.failedLogins} icon={UserX} color="orange" />
                <SecurityCard title="Usuarios Bloqueados" value={stats.lockedUsers} icon={Lock} color="red" />
                <SecurityCard title="Sesiones Activas" value={stats.activeSessions} icon={Activity} color="green" />
                <SecurityCard title="Alertas Críticas" value={stats.criticalAlerts} icon={ShieldAlert} color="purple" />
            </div>

            {/* Monitor de Salud del Sistema */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <h2 className="text-xl font-bold mb-6 flex items-center relative z-10">
                    <Activity className="w-5 h-5 mr-3 text-green-400" />
                    Salud del Sistema
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <HealthMetric label="Latencia API" value="45ms" status="healthy" />
                    <HealthMetric label="Base de Datos" value="Conectado" status="healthy" />
                    <HealthMetric label="Redis Cache" value="98% Hit" status="healthy" />
                    <HealthMetric label="WhatsApp Gateway" value="Online" status="healthy" />
                    <HealthMetric label="Almacenamiento" value="24% Usado" status="warning" />
                    <HealthMetric label="Error Rate (1h)" value="0.01%" status="healthy" />
                </div>
            </div>

            {/* Panel de Auditoría Integrado */}
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-blue-600" />
                        Registro de Eventos
                    </h2>
                    <div className="flex space-x-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                            <Filter className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <AuditLogPanel embedded />
            </div>
        </div>
    );
};

const SecurityCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className={`absolute right-0 top-0 p-10 opacity-5 transform translate-x-2 -translate-y-2 bg-${color}-500 rounded-full`}></div>
        <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-black">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const HealthMetric = ({ label, value, status }: { label: string, value: string, status: 'healthy' | 'warning' | 'critical' }) => {
    const color = status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-${status === 'healthy' ? 'green' : status === 'warning' ? 'yellow' : 'red'}-500`}></div>
        </div>
    );
};

export default SecurityCenter;
