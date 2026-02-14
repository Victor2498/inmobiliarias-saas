import React, { useState } from 'react';
import { Property, PropertyService } from './PropertyService';
import { X, Save, Home, DollarSign, Layout, MapPin, Layers, Info, CheckCircle2, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyFormProps {
    property?: Property;
    onClose: () => void;
    onSuccess: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<'principal' | 'secundario'>('principal');
    const [loading, setLoading] = useState(false);

    // Initial state reconstruction from property.features if editing
    const [formData, setFormData] = useState<Property>(property || {
        title: '',
        description: '',
        price: 0,
        currency: 'USD',
        address: '',
        status: 'AVAILABLE',
        features: {
            tipo: 'Vivienda',
            depto: '',
            uf: '',
            provincia: '',
            localidad: '',
            barrio: '',
            cp: '',
            matricula: '',
            ambientes: '1 Ambiente',
            capacidad_personas: '',
            carpeta: '',
            fecha_alta: new Date().toISOString().split('T')[0],
            estado_comercial: 'Nulo',
            antiguedad: '',
            estado_general: 'Excelente',
            plantas: '',
            calefaccion: 'Calefactor T/B',
            banos: '',
            dormitorios: '',
            orientacion: 'Norte',
            techo: 'Cielorrazo en Yeso',
            vista: 'A la Calle',
            carpinteria: 'Madera Vista',
            precio_venta: '',
            precio_alquiler_1: '',
            precio_alquiler_2: '',
            precio_alquiler_3: '',
            sup_total: '',
            sup_cubierta: '',
            sup_descubierta: '',
            circunscripcion: '',
            seccion: '',
            manzana: '',
            parcela: '',
            llaves: '',
            luz: '',
            agua: '',
            gas: '',
            municipal: ''
        }
    });

    const updateFeature = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...(prev.features || {}),
                [key]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Sincronizar campos principales que pueden estar duplicados para compatibilidad
            const payload = { ...formData };
            if (payload.features?.tipo) payload.title = `${payload.features.tipo} - ${payload.address}`;

            if (property?.id) {
                await PropertyService.update(property.id, payload);
            } else {
                await PropertyService.create(payload);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving property", error);
            alert(error.response?.data?.detail || "Error al guardar la propiedad");
        } finally {
            setLoading(false);
        }
    };


    const InputField = ({ label, value, onChange, placeholder, type = "text", required = false, select = false, options = [] }: any) => (
        <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center mb-1">
                {label} {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {select ? (
                <div className="relative group">
                    <select
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer group-hover:bg-slate-900/60"
                    >
                        {options.map((opt: string) => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronRight size={14} className="rotate-90" />
                    </div>
                </div>
            ) : (
                <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all hover:bg-slate-900/60"
                />
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 text-slate-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] w-full max-w-5xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col max-h-[92vh] overflow-hidden"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-center">
                    <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
                            <Home className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                                {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest p-0.5 px-1.5 bg-blue-500/10 rounded-md">Inmonea Cloud</span>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">• Panel de Control V4 •</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-slate-500 transition-all duration-300 group"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Tabs Selector - Single line, unified style */}
                <div className="flex p-1.5 bg-slate-950/30 mx-8 mt-6 rounded-[1.25rem] border border-white/5 gap-1.5 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setActiveTab('principal')}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest ${activeTab === 'principal'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <Info size={14} />
                        <span>Datos Principales</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('secundario')}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest ${activeTab === 'secundario'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <Layers size={14} />
                        <span>Datos Secundarios</span>
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'principal' ? (
                            <motion.div
                                key="principal"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Sub-Sección: Datos de la Propiedad */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center space-x-2 text-blue-500 mb-2">
                                            <MapPin size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Ubicación y Tipo</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="col-span-2">
                                                <InputField
                                                    label="Tipo"
                                                    select
                                                    options={['Vivienda', 'Departamento', 'Local', 'Terreno', 'Oficina', 'Campo']}
                                                    value={formData.features.tipo}
                                                    onChange={(v: string) => updateFeature('tipo', v)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <InputField
                                                    label="Dirección"
                                                    value={formData.address}
                                                    onChange={(v: string) => setFormData({ ...formData, address: v })}
                                                    placeholder="Ej: Av. San Martí 123"
                                                    required
                                                />
                                            </div>
                                            <InputField label="Depto" value={formData.features.depto} onChange={(v: string) => updateFeature('depto', v)} />
                                            <InputField label="UF" value={formData.features.uf} onChange={(v: string) => updateFeature('uf', v)} />
                                            <InputField label="Provincia" value={formData.features.provincia} onChange={(v: string) => updateFeature('provincia', v)} required />
                                            <InputField label="Localidad" value={formData.features.localidad} onChange={(v: string) => updateFeature('localidad', v)} required />
                                            <InputField label="Barrio" value={formData.features.barrio} onChange={(v: string) => updateFeature('barrio', v)} />
                                            <InputField label="CP" value={formData.features.cp} onChange={(v: string) => updateFeature('cp', v)} />
                                            <InputField label="Matrícula" value={formData.features.matricula} onChange={(v: string) => updateFeature('matricula', v)} />
                                            <InputField label="Catastro" placeholder="Ref" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                label="Ambientes"
                                                select
                                                options={['Monombiente', '1 Ambiente', '2 Ambientes', '3 Ambientes', '4 Ambientes', '5+ Ambientes']}
                                                value={formData.features.ambientes}
                                                onChange={(v: string) => updateFeature('ambientes', v)}
                                            />
                                            <InputField label="Capacidad máx." type="number" value={formData.features.capacidad_personas} onChange={(v: string) => updateFeature('capacidad_personas', v)} />
                                        </div>
                                    </div>

                                    {/* Sub-Sección: Datos Comerciales */}
                                    <div className="space-y-6 bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50">
                                        <div className="flex items-center space-x-2 text-blue-500 mb-2">
                                            <DollarSign size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Estado Comercial</span>
                                        </div>
                                        <InputField label="Carpeta" value={formData.features.carpeta} onChange={(v: string) => updateFeature('carpeta', v)} required />
                                        <InputField label="Fecha de Alta" type="date" value={formData.features.fecha_alta} onChange={(v: string) => updateFeature('fecha_alta', v)} required />
                                        <InputField
                                            label="Estado Comercial"
                                            select
                                            options={['Nulo', 'Disponible', 'Alquilado', 'Vendido', 'Reservado']}
                                            value={formData.features.estado_comercial}
                                            onChange={(v: string) => updateFeature('estado_comercial', v)}
                                        />
                                        <div className="pt-4">
                                            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter leading-tight">
                                                    Nota: Los campos marcados con * son obligatorios para el seguimiento de la propiedad.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="secundario"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Columna Izquierda: Características Físicas */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-2 text-indigo-500 mb-2">
                                            <Layout size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Características Constructivas</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Antigüedad" value={formData.features.antiguedad} onChange={(v: string) => updateFeature('antiguedad', v)} />
                                            <InputField label="Estado Gral." select options={['Excelente', 'Muy Bueno', 'Bueno', 'Regular', 'A Refaccionar']} value={formData.features.estado_general} onChange={(v: string) => updateFeature('estado_general', v)} />
                                            <InputField label="Plantas" type="number" value={formData.features.plantas} onChange={(v: string) => updateFeature('plantas', v)} />
                                            <InputField label="Calefacción" select options={['Calefactor T/B', 'Losa Radiante', 'Aire Acondicionado', 'Central']} value={formData.features.calefaccion} onChange={(v: string) => updateFeature('calefaccion', v)} />
                                            <InputField label="Baños" type="number" value={formData.features.banos} onChange={(v: string) => updateFeature('banos', v)} />
                                            <InputField label="Dormitorios" type="number" value={formData.features.dormitorios} onChange={(v: string) => updateFeature('dormitorios', v)} />
                                            <InputField label="Orientación" select options={['Norte', 'Sur', 'Este', 'Oeste', 'NE', 'NO', 'SE', 'SO']} value={formData.features.orientacion} onChange={(v: string) => updateFeature('orientacion', v)} />
                                            <InputField label="Techo" select options={['Cielorrazo en Yeso', 'Madera', 'Teja', 'Chapa', 'Hormigón']} value={formData.features.techo} onChange={(v: string) => updateFeature('techo', v)} />
                                            <InputField label="Vista" select options={['A la Calle', 'Al Contrafrente', 'Lateral', 'Vía Pública']} value={formData.features.vista} onChange={(v: string) => updateFeature('vista', v)} />
                                            <InputField label="Carpintería" select options={['Madera Vista', 'Aluminio', 'PVC', 'Hierro']} value={formData.features.carpinteria} onChange={(v: string) => updateFeature('carpinteria', v)} />
                                        </div>
                                    </div>

                                    {/* Columna Derecha: Precios y Superficies */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-2 text-emerald-500 mb-2">
                                            <DollarSign size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Precios y Superficies</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 bg-emerald-500/5 p-4 rounded-3xl border border-emerald-500/10">
                                            <InputField label="Precio Venta" value={formData.features.precio_venta} onChange={(v: string) => updateFeature('precio_venta', v)} />
                                            <InputField label="Moneda" select options={['USD', 'ARS', 'BUSD']} value={formData.currency} onChange={(v: string) => setFormData({ ...formData, currency: v })} />
                                            <InputField label="Alquiler 1" value={formData.features.precio_alquiler_1} onChange={(v: string) => updateFeature('precio_alquiler_1', v)} />
                                            <InputField label="Alquiler 2" value={formData.features.precio_alquiler_2} onChange={(v: string) => updateFeature('precio_alquiler_2', v)} />
                                        </div>

                                        <div className="flex items-center space-x-2 text-amber-500 mb-2 pt-2">
                                            <Layers size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Metraje</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <InputField label="Sup. Total" value={formData.features.sup_total} onChange={(v: string) => updateFeature('sup_total', v)} />
                                            <InputField label="Cubierta" value={formData.features.sup_cubierta} onChange={(v: string) => updateFeature('sup_cubierta', v)} />
                                            <InputField label="Descubierta" value={formData.features.sup_descubierta} onChange={(v: string) => updateFeature('sup_descubierta', v)} />
                                        </div>

                                        <div className="flex items-center space-x-2 text-slate-400 mb-2 pt-2">
                                            <CheckCircle2 size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Servicios</span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            <InputField label="Luz" value={formData.features.luz} onChange={(v: string) => updateFeature('luz', v)} />
                                            <InputField label="Gas" value={formData.features.gas} onChange={(v: string) => updateFeature('gas', v)} />
                                            <InputField label="Agua" value={formData.features.agua} onChange={(v: string) => updateFeature('agua', v)} />
                                            <InputField label="Llav" value={formData.features.llaves} onChange={(v: string) => updateFeature('llaves', v)} />
                                            <InputField label="Mun" value={formData.features.municipal} onChange={(v: string) => updateFeature('municipal', v)} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-white/5 bg-slate-950/20 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => setActiveTab(activeTab === 'principal' ? 'secundario' : 'principal')}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest group"
                    >
                        {activeTab === 'principal' ? (
                            <>
                                <span>Ver Datos Secundarios</span>
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        ) : (
                            <>
                                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                <span>Volver a Principales</span>
                            </>
                        )}
                    </button>

                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-red-400 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center space-x-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Guardar Propiedad</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PropertyForm;
