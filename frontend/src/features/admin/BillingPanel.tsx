import React, { useEffect, useState } from 'react';
import {
    CreditCard,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    Download,
    DollarSign
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

interface BillingRecord {
    id: number;
    tenant_id: string;
    plan_id: string;
    amount: number;
    currency: string;
    payment_status: 'paid' | 'pending' | 'failed';
    billing_cycle_end: string;
    created_at: string;
}

const BillingPanel: React.FC = () => {
    const [history, setHistory] = useState<BillingRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const res = await axiosInstance.get('/admin/billing');
                setHistory(res.data);
            } catch (err) {
                console.error("Error fetching billing", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBilling();
    }, []);

    // Estadísticas Simpificadas (Mockeado para visualización inicial)
    const mrr = history
        .filter(r => r.payment_status === 'paid')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingPayments = history.filter(r => r.payment_status === 'pending').length;

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión Financiera</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Control de suscripciones, pagos y métricas MRR.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4" />
                        <span>Exportar Reporte</span>
                    </button>
                    <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                        <Filter className="w-4 h-4" />
                        <span>Filtrar Pagos</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                    <TrendingUp className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">MRR Total</h3>
                    <p className="text-3xl font-black mt-1">$ {mrr.toLocaleString()}<span className="text-sm text-slate-400 ml-2">ARS</span></p>
                    <p className="text-xs text-green-500 font-bold mt-2">↑ 12% vs mes anterior</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <Clock className="w-8 h-8 text-yellow-500 mb-4" />
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pendientes</h3>
                    <p className="text-3xl font-black mt-1">{pendingPayments}</p>
                    <p className="text-xs text-slate-400 font-bold mt-2">Pagos por verificar</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tasa de Pago</h3>
                    <p className="text-3xl font-black mt-1">94.2%</p>
                    <p className="text-xs text-green-500 font-bold mt-2">Eficiencia de cobro</p>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Historial de Transacciones</h3>
                    <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                        <span>Ver todas</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">ID Pago</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Inmobiliaria</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Monto</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Estado</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Vence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="font-bold">No se registran transacciones todavía.</p>
                                        <p className="text-xs">Los pagos de Mercado Pago aparecerán aquí automáticamente.</p>
                                    </td>
                                </tr>
                            ) : (
                                history.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-5 font-mono text-[10px] font-bold text-blue-600">#{record.id}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                                                    {record.tenant_id.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-sm tracking-tight">{record.tenant_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-black text-sm">
                                            $ {record.amount.toLocaleString()} <span className="text-[10px] text-slate-400">{record.currency}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${record.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                                    record.payment_status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {record.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-slate-400 font-medium">
                                            {new Date(record.billing_cycle_end).toLocaleDateString()}
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

export default BillingPanel;
