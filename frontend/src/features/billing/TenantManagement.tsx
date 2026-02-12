import React, { useState } from 'react';
import { FileText, Receipt, Plus, Users } from 'lucide-react';
import ContractList from '../contracts/ContractList';
import ChargeList from './ChargeList';
import { useNavigate } from 'react-router-dom';

const TenantManagement: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'contracts' | 'charges'>('contracts');

    return (
        <div className="p-6 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <Users className="text-indigo-600 dark:text-indigo-400" size={32} />
                        Gestión de Inquilinos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Administra contratos, liquidaciones y estados de cuenta.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/billing/new')}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 font-bold transition-all hover:scale-105"
                    >
                        <Plus size={20} /> Nueva Liquidación
                    </button>
                    {/* Add New Contract button could go here too */}
                </div>
            </header>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('contracts')}
                    className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'contracts'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    <FileText size={18} /> Contratos
                </button>
                <button
                    onClick={() => setActiveTab('charges')}
                    className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'charges'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    <Receipt size={18} /> Liquidaciones
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-[500px]">
                {activeTab === 'contracts' ? (
                    <div className="p-4">
                        <ContractList />
                    </div>
                ) : (
                    <div className="p-4">
                        <ChargeList />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantManagement;
