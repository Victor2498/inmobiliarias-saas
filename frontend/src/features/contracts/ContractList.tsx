import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Contract, ContractService } from './ContractService';
import { FileText, Calendar, Clock, DollarSign, Plus, Pencil } from 'lucide-react';

const ContractList: React.FC = () => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Default to current month/year
    const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
    const [targetYear, setTargetYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            const data = await ContractService.list();
            setContracts(data);
        } catch (error) {
            console.error("Error loading contracts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCharges = async () => {
        setGenerating(true);
        try {
            const res = await ContractService.generateMonthlyCharges(targetMonth, targetYear);
            alert(res.message);
        } catch (error) {
            alert("Error al generar liquidaciones");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <header className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-black text-white">Contratos de Alquiler</h1>

                <div className="flex items-center gap-3">
                    <Link
                        to="/contracts/new"
                        className="px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                        <Plus size={18} /> Nuevo contrato
                    </Link>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center space-x-4 shadow-xl">
                    <div className="flex items-center space-x-2 px-3">
                        <select
                            className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm"
                            value={targetMonth}
                            onChange={(e) => setTargetMonth(parseInt(e.target.value))}
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('es', { month: 'long' })}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="w-20 bg-transparent text-white font-bold outline-none text-sm"
                            value={targetYear}
                            onChange={(e) => setTargetYear(parseInt(e.target.value))}
                        />
                    </div>
                    <button
                        onClick={handleGenerateCharges}
                        disabled={generating}
                        className={`px-6 py-2.5 rounded-xl font-bold transition-all ${generating ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
                    >
                        {generating ? 'Procesando...' : 'Liquidación Mensual'}
                    </button>
                </div>
                </div>
            </header>

            <div className="space-y-4">
                {contracts.map((contract) => (
                    <div key={contract.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center space-x-4">
                            <div className="bg-emerald-600/10 p-3 rounded-lg text-emerald-500">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Contrato #{contract.id}</h3>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                    <span className="flex items-center"><Calendar size={12} className="mr-1" /> {new Date(contract.start_date).toLocaleDateString()}</span>
                                    <span className="flex items-center"><Clock size={12} className="mr-1" /> Vence: {new Date(contract.end_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                            <div>
                                <div className="text-xl font-bold text-white flex items-center justify-end">
                                    <DollarSign size={18} className="text-emerald-500" />
                                    {(contract.current_rent ?? contract.monthly_rent).toLocaleString()} {contract.currency}
                                </div>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${contract.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {contract.status}
                                </span>
                            </div>
                            <Link
                                to={`/contracts/${contract.id}/edit`}
                                className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                                title="Editar"
                            >
                                <Pencil size={18} />
                            </Link>
                        </div>
                    </div>
                ))}
                {contracts.length === 0 && !loading && (
                    <div className="text-slate-500 text-center py-20 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                        No hay contratos registrados aún.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractList;
