import React, { useEffect, useState } from 'react';
import { Property, PropertyService } from './PropertyService';
import { Plus, Edit, Trash2, MapPin, DollarSign, Home } from 'lucide-react';
import PropertyForm from './PropertyForm';

const PropertyList: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            const data = await PropertyService.list();
            setProperties(data);
        } catch (error) {
            console.error("Error loading properties", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedProperty(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (prop: Property) => {
        setSelectedProperty(prop);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("¿Estás seguro de eliminar esta propiedad?")) {
            await PropertyService.delete(id);
            loadProperties();
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Gestión de Propiedades</h1>
                    <p className="text-slate-400 text-sm">Administra el inventario de inmuebles de tu inmobiliaria</p>
                </div>

                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Cuadrícula
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Tabla
                        </button>
                    </div>

                    <button
                        onClick={handleCreate}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 font-bold"
                    >
                        <Plus size={20} />
                        <span>Nueva Propiedad</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : properties.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-2xl p-20 text-center">
                    <div className="bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home size={32} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No hay propiedades registradas</h3>
                    <p className="text-slate-400 mb-6">Comienza agregando tu primera propiedad al sistema.</p>
                    <button onClick={handleCreate} className="text-blue-400 hover:text-blue-300 font-bold underline">Agregar propiedad</button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map((prop) => (
                        <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col shadow-xl">
                            <div className="h-48 bg-slate-900 flex items-center justify-center text-slate-700 relative overflow-hidden">
                                <Home size={64} className="group-hover:scale-110 transition-transform duration-500 opacity-20" />
                                <div className="absolute top-4 right-4">
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-black tracking-wider ${prop.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {prop.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 mb-1 line-clamp-1">{prop.title}</h3>
                                    <div className="flex items-center text-slate-500 text-xs">
                                        <MapPin size={12} className="mr-1" />
                                        <span className="line-clamp-1">{prop.address}</span>
                                    </div>
                                </div>
                                <div className="mt-auto flex justify-between items-center">
                                    <div className="text-emerald-400 font-black text-xl">
                                        <span className="text-sm mr-1">{prop.currency}</span>
                                        {prop.price.toLocaleString()}
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleEdit(prop)}
                                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => prop.id && handleDelete(prop.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Inmueble</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ubicación</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Precio</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {properties.map((prop) => (
                                    <tr key={prop.id} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 mr-3 shrink-0">
                                                    <Home size={20} />
                                                </div>
                                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">{prop.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">{prop.address}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-emerald-400 text-lg">
                                                <span className="text-xs mr-1">{prop.currency}</span>
                                                {prop.price.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black ${prop.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                {prop.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(prop)}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => prop.id && handleDelete(prop.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <PropertyForm
                    property={selectedProperty}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={loadProperties}
                />
            )}
        </div>
    );
};

export default PropertyList;
