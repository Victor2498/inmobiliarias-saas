import React, { useState } from 'react';
import { Check, Zap, Shield } from 'lucide-react';
import { SubscriptionService } from './SubscriptionService';
import { useAuthStore } from '../../store/useAuthStore';

const SaaSPlans: React.FC = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState<string | null>(null);

    const handleUpgrade = async (plan: string) => {
        setLoading(plan);
        try {
            const { init_point } = await SubscriptionService.getUpgradePreference(plan);
            window.location.href = init_point;
        } catch (error) {
            alert("Error al procesar el pago");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="p-10 space-y-12 bg-slate-950 min-h-full rounded-[3rem]">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-black text-white tracking-tight">Escala tu Inmobiliaria</h1>
                <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                    Potencia tu gestión con herramientas avanzadas de IA, automatización de cargos e integración premium con WhatsApp.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Plan Basic */}
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Plan Basic</h3>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Ideal para empezar</p>
                        </div>
                        <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-500">
                            <Shield size={32} />
                        </div>
                    </div>

                    <div className="text-4xl font-black text-white mb-8">
                        $5.000 <span className="text-lg text-slate-500">/mes</span>
                    </div>

                    <ul className="space-y-4 mb-10">
                        {['Hasta 50 propiedades', 'WhatsApp Lite', 'Cargos Automáticos', 'Gestión de Contratos'].map((feat, i) => (
                            <li key={i} className="flex items-center text-slate-300 font-medium">
                                <Check size={18} className="text-blue-500 mr-3" /> {feat}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleUpgrade('basic')}
                        disabled={loading !== null || user?.plan === 'basic'}
                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${user?.plan === 'basic' ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-950 hover:bg-blue-600 hover:text-white shadow-xl hover:shadow-blue-500/25'}`}
                    >
                        {user?.plan === 'basic' ? 'Plan Actual' : (loading === 'basic' ? 'Cargando...' : 'Obtener Basic')}
                    </button>
                </div>

                {/* Plan Premium */}
                <div className="bg-slate-900 border-2 border-emerald-500/30 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500 transition-all shadow-2xl shadow-emerald-500/5">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest">Recomendado</div>

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 text-emerald-400">Plan Premium</h3>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Máximo Potencial</p>
                        </div>
                        <div className="bg-emerald-600/10 p-3 rounded-2xl text-emerald-500">
                            <Zap size={32} />
                        </div>
                    </div>

                    <div className="text-4xl font-black text-white mb-8">
                        $15.000 <span className="text-lg text-slate-500">/mes</span>
                    </div>

                    <ul className="space-y-4 mb-10">
                        {['Propiedades Ilimitadas', 'IA Full Automation', 'WhatsApp Multi-agente', 'Reportes de Impago IA', 'Prioridad Soporte'].map((feat, i) => (
                            <li key={i} className="flex items-center text-slate-300 font-medium">
                                <Check size={18} className="text-emerald-500 mr-3" /> {feat}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleUpgrade('premium')}
                        disabled={loading !== null || user?.plan === 'premium'}
                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${user?.plan === 'premium' ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-500/20'}`}
                    >
                        {user?.plan === 'premium' ? 'Plan Actual' : (loading === 'premium' ? 'Cargando...' : 'Obtener Premium')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaaSPlans;
