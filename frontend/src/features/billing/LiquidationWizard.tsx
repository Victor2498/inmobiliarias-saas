import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Users, DollarSign, Send, CheckCircle,
    AlertCircle, ArrowRight, ArrowLeft, Plus, Trash2, Calendar
} from 'lucide-react';
import { ContractService, Contract } from '../contracts/ContractService';
import { LiquidationService, Liquidation, LiquidationItem } from './LiquidationService';
import { useNavigate } from 'react-router-dom';

const LiquidationWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [selectedContract, setSelectedContract] = useState<string>('');
    const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [dueDate, setDueDate] = useState<string>(new Date().toISOString().slice(0, 10));

    // Draft Data
    const [currentLiquidation, setCurrentLiquidation] = useState<Liquidation | null>(null);

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            const data = await ContractService.list();
            setContracts(data);
        } catch (err) {
            setError('Error al cargar contratos');
        }
    };

    const handleCreateDraft = async () => {
        setLoading(true);
        setError(null);
        try {
            const draft = await LiquidationService.createDraft({
                contract_id: parseInt(selectedContract),
                period: period,
                due_date: dueDate
            });
            setCurrentLiquidation(draft);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al crear borrador');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!currentLiquidation) return;
        setLoading(true);
        try {
            await LiquidationService.confirm(currentLiquidation.id);
            // Success animation or redirect
            navigate('/billing');
            // In a real app, maybe show a success modal first
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al confirmar liquidación');
        } finally {
            setLoading(false);
        }
    };

    // --- Steps Components ---

    const StepIndicator = ({ current }: { current: number }) => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((i) => (
                <React.Fragment key={i}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 transform ${i <= current ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-500'
                        }`}>
                        {i < current ? <CheckCircle size={20} /> : i}
                    </div>
                    {i < 3 && (
                        <div className={`w-16 h-1 transition-colors duration-300 ${i < current ? 'bg-indigo-600' : 'bg-gray-200'
                            }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
            >
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Nueva Liquidación
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Genera y envía liquidaciones mensuales en 3 simples pasos.
                </p>
            </motion.div>

            <StepIndicator current={step} />

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <Users className="text-indigo-500" /> Selección de Contrato
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                        Período
                                    </label>
                                    <input
                                        type="month"
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                        Vencimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                    Contrato / Inquilino
                                </label>
                                <select
                                    value={selectedContract}
                                    onChange={(e) => setSelectedContract(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Seleccione un contrato...</option>
                                    {contracts.map(c => (
                                        <option key={c.id} value={c.id}>
                                            Inquilino ID: {c.tenant_id} - Propiedad: {c.property_id} ({c.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleCreateDraft}
                                    disabled={!selectedContract || loading}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                                >
                                    {loading ? 'Procesando...' : 'Continuar'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && currentLiquidation && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <DollarSign className="text-green-500" /> Conceptos y Ajustes
                            </h2>

                            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="p-4 font-medium">Concepto</th>
                                            <th className="p-4 font-medium">Valor Anterior</th>
                                            <th className="p-4 font-medium">Ajuste (%)</th>
                                            <th className="p-4 font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {currentLiquidation.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                                                    {item.concept_name}
                                                    {item.description && <div className="text-xs text-slate-400 font-normal">{item.description}</div>}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                                    ${item.previous_value.toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    {item.adjustment_applied ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            +{item.adjustment_percentage}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">
                                                    ${item.current_value.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-white">
                                        <tr>
                                            <td colSpan={3} className="p-4 text-right">Total a Pagar:</td>
                                            <td className="p-4 text-xl text-indigo-600 dark:text-indigo-400">
                                                ${currentLiquidation.total_amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-2 transition-colors"
                                >
                                    <ArrowLeft size={20} /> Atrás
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-all hover:scale-105"
                                >
                                    Ver Resumen <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && currentLiquidation && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6 text-center"
                        >
                            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                ¿Listo para enviar?
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                Se generará el PDF y se enviará automáticamente por WhatsApp al inquilino.
                                <br />
                                <strong>Total: ${currentLiquidation.total_amount.toLocaleString()}</strong>
                            </p>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-2 mt-4">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-center gap-4 pt-8">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Revisar
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 font-bold transition-all hover:scale-105"
                                >
                                    {loading ? 'Enviando...' : 'Confirmar y Enviar'} <Send size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiquidationWizard;
