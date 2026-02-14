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

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 border-b-2 transition-all ${activeTab === id
                    ? 'border-blue-500 text-blue-500 bg-blue-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
        >
            <Icon size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
        </button>
    );

    const InputField = ({ label, value, onChange, placeholder, type = "text", required = false, select = false, options = [] }: any) => (
        <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                {label} {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {select ? (
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <Home className="text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {property ? 'Editar Propiedad' : 'Alta de Propiedad'}
                            </h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Módulo de Gestión Inmobiliaria</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs Selector */}
                <div className="flex border-b border-slate-800">
                    <TabButton id="principal" label="Datos Principales" icon={Info} />
                    <TabButton id="secundario" label="Datos Secundarios" icon={Layers} />
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
                <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={() => setActiveTab(activeTab === 'principal' ? 'secundario' : 'principal')}
                        className="flex items-center space-x-2 px-6 py-3 text-slate-400 hover:text-white transition-all font-bold group"
                    >
                        {activeTab === 'principal' ? (
                            <>
                                <span>Ver Datos Secundarios</span>
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        ) : (
                            <>
                                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                                <span>Volver a Principales</span>
                            </>
                        )}
                    </button>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 text-slate-400 font-bold hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center space-x-3"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span className="uppercase tracking-widest">Guardar y Salir</span>
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
