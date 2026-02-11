import React, { useEffect, useState } from 'react';
import { Charge, ChargeService } from './ChargeService';
import { Receipt, Calendar, CreditCard, Filter } from 'lucide-react';

const ChargeList: React.FC = () => {
    const [charges, setCharges] = useState<Charge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCharges();
    }, []);

    const loadCharges = async () => {
        try {
            const data = await ChargeService.list();
            setCharges(data);
        } catch (error) {
            console.error("Error loading charges", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-black text-white">Liquidaciones y Cargos</h1>
                <p className="text-slate-400 font-medium">Historial de deudas y estados de pago de inquilinos</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {charges.map((charge) => (
                    <div key={charge.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/5 group">
                        <div className="flex items-center space-x-6">
                            <div className={`p-4 rounded-2xl ${charge.is_paid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                <Receipt size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{charge.description}</h3>
                                <div className="flex items-center space-x-4 text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    <span className="flex items-center"><Calendar size={14} className="mr-2" /> Vence: {new Date(charge.due_date).toLocaleDateString()}</span>
                                    <span className="flex items-center"><CreditCard size={14} className="mr-2" /> Contrato #{charge.contract_id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-black text-white mb-2">
                                ${charge.amount.toLocaleString()}
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${charge.is_paid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 animate-pulse'}`}>
                                {charge.is_paid ? 'Pagado' : 'Pendiente'}
                            </span>
                        </div>
                    </div>
                ))}

                {charges.length === 0 && !loading && (
                    <div className="text-slate-500 text-center py-32 bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center">
                        <Filter size={48} className="mb-4 text-slate-700" />
                        <p className="text-xl font-bold">No hay liquidaciones generadas</p>
                        <p className="text-sm">Inicia una liquidación desde el panel de contratos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChargeList;
