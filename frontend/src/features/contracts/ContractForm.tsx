import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Contract, ContractService } from './ContractService';
import { PropertyService } from '../properties/PropertyService';
import { PeopleService, Person } from '../people/PeopleService';
import { FileText, Save, ArrowLeft, DollarSign, Calendar } from 'lucide-react';

const ADJUSTMENT_TYPES = [
    { value: 'ICL', label: 'ICL' },
    { value: 'IPC', label: 'IPC' },
    { value: 'FIJO', label: 'Fijo' },
];

const FREQUENCY_OPTIONS = [6, 12, 18, 24];

const ContractForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [properties, setProperties] = useState<{ id: number; title: string }[]>([]);
    const [people, setPeople] = useState<Person[]>([]);

    const [formData, setFormData] = useState<Partial<Contract>>({
        property_id: 0,
        person_id: 0,
        start_date: '',
        end_date: '',
        monthly_rent: 0,
        currency: 'ARS',
        adjustment_type: 'ICL',
        adjustment_period: 12,
        status: 'ACTIVE',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [props, persons] = await Promise.all([
                    PropertyService.list(),
                    PeopleService.list(),
                ]);
                setProperties(props.map(p => ({ id: p.id!, title: p.title || `#${p.id}` })));
                setPeople(persons);
                if (isEdit && id) {
                    const contract = await ContractService.get(parseInt(id, 10));
                    setFormData({
                        property_id: contract.property_id,
                        person_id: contract.person_id,
                        start_date: contract.start_date?.slice(0, 10) || '',
                        end_date: contract.end_date?.slice(0, 10) || '',
                        monthly_rent: contract.monthly_rent ?? 0,
                        currency: contract.currency || 'ARS',
                        adjustment_type: contract.adjustment_type || 'ICL',
                        adjustment_period: contract.adjustment_period ?? 12,
                        base_amount: contract.base_amount ?? contract.monthly_rent,
                        status: contract.status || 'ACTIVE',
                    });
                } else {
                    setFormData(prev => ({
                        ...prev,
                        start_date: new Date().toISOString().slice(0, 10),
                        end_date: '',
                    }));
                }
            } catch (e) {
                console.error('Error loading form data', e);
            } finally {
                setLoadingData(false);
            }
        };
        load();
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.property_id || !formData.person_id || !formData.start_date || !formData.end_date) {
            alert('Completa propiedad, inquilino y fechas.');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                property_id: formData.property_id,
                person_id: formData.person_id,
                start_date: formData.start_date + 'T12:00:00',
                end_date: formData.end_date + 'T12:00:00',
                monthly_rent: Number(formData.monthly_rent) || 0,
                currency: formData.currency || 'ARS',
                adjustment_type: formData.adjustment_type || 'ICL',
                adjustment_period: Number(formData.adjustment_period) || 12,
                status: formData.status || 'ACTIVE',
                base_amount: formData.base_amount ?? formData.monthly_rent,
            };
            if (isEdit && id) {
                await ContractService.update(parseInt(id, 10), payload);
            } else {
                await ContractService.create(payload as Contract);
            }
            navigate('/multitenant');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al guardar contrato');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="p-6 text-slate-400 flex items-center justify-center min-h-[300px]">
                Cargando...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <FileText className="text-emerald-500" size={32} />
                    {isEdit ? 'Editar contrato' : 'Nuevo contrato'}
                </h1>
                <button
                    type="button"
                    onClick={() => navigate('/multitenant')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                >
                    <ArrowLeft size={18} /> Volver
                </button>
            </header>

            <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Propiedad</label>
                        <select
                            required
                            value={formData.property_id || ''}
                            onChange={e => setFormData(f => ({ ...f, property_id: parseInt(e.target.value, 10) }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                        >
                            <option value="">Seleccionar...</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Inquilino</label>
                        <select
                            required
                            value={formData.person_id || ''}
                            onChange={e => setFormData(f => ({ ...f, person_id: parseInt(e.target.value, 10) }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                        >
                            <option value="">Seleccionar...</option>
                            {people.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12} /> Inicio</label>
                        <input
                            type="date"
                            required
                            value={formData.start_date || ''}
                            onChange={e => setFormData(f => ({ ...f, start_date: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12} /> Vencimiento</label>
                        <input
                            type="date"
                            required
                            value={formData.end_date || ''}
                            onChange={e => setFormData(f => ({ ...f, end_date: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign size={12} /> Monto mensual</label>
                        <input
                            type="number"
                            required
                            min={0}
                            step={0.01}
                            value={formData.monthly_rent ?? ''}
                            onChange={e => setFormData(f => ({ ...f, monthly_rent: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Moneda</label>
                        <select
                            value={formData.currency || 'ARS'}
                            onChange={e => setFormData(f => ({ ...f, currency: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                        >
                            <option value="ARS">ARS</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Ajuste de alquiler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tipo de ajuste</label>
                            <select
                                value={formData.adjustment_type || 'ICL'}
                                onChange={e => setFormData(f => ({ ...f, adjustment_type: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                            >
                                {ADJUSTMENT_TYPES.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Frecuencia (meses)</label>
                            <select
                                value={formData.adjustment_period ?? 12}
                                onChange={e => setFormData(f => ({ ...f, adjustment_period: parseInt(e.target.value, 10) }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500/30 outline-none"
                            >
                                {FREQUENCY_OPTIONS.map(m => (
                                    <option key={m} value={m}>Cada {m} meses</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/multitenant')}
                        className="px-5 py-2.5 rounded-xl font-bold border border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : <span className="flex items-center gap-2"><Save size={18} /> Guardar</span>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContractForm;
