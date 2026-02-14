import React, { useEffect, useState } from 'react';
import { Property, PropertyService } from './PropertyService';
import { Plus, Edit, Trash2, MapPin, Home } from 'lucide-react';
import PropertyForm from './PropertyForm';

const PropertyList: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            console.log("Fetching properties...");
            const data = await PropertyService.list();
            console.log("Properties received:", data);
            setProperties(data);
        } catch (error) {
            console.error("Error loading properties", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = properties
        .filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            return (b.id || 0) - (a.id || 0);
        });

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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header Row: Title and Subtitle */}
            <div className="mb-12">
                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                    Gestión de <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Propiedades</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium">Control centralizado de tu inventario inmobiliario</p>
            </div>

            {/* Controls Row: Single line glassmorphism toolbar */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl mb-10 flex flex-wrap items-center gap-4 shadow-2xl">
                <div className="relative flex-1 min-w-[300px]">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-45" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título, dirección o referencia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white font-medium focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950/50 border border-slate-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer font-bold text-sm"
                    >
                        <option value="ALL">Todos los Estados</option>
                        <option value="AVAILABLE">Disponible</option>
                        <option value="RENTED">Alquilado</option>
                        <option value="SOLD">Vendido</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-slate-950/50 border border-slate-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer font-bold text-sm"
                    >
                        <option value="newest">Más recientes</option>
                        <option value="price_asc">Precio: Bajo a Alto</option>
                        <option value="price_desc">Precio: Alto a Bajo</option>
                    </select>

                    <div className="bg-slate-950/50 p-1 rounded-2xl border border-slate-800 flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Home size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Edit size={20} className="rotate-90" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl flex items-center space-x-3 transition-all shadow-lg shadow-blue-600/20 font-black text-sm active:scale-95 ml-auto"
                >
                    <Plus size={22} strokeWidth={3} />
                    <span>AGREGAR PROPIEDAD</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-32">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <span className="text-slate-400 font-medium animate-pulse">Cargando inventario...</span>
                </div>
            ) : filteredProperties.length === 0 ? (
                <div className="bg-slate-800/30 border-2 border-slate-700/50 border-dashed rounded-[2.5rem] p-24 text-center backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-500">
                        <Home size={48} className="text-slate-500" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">¡Tu inventario está vacío!</h3>
                    <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">Parece que aún no has registrado ninguna propiedad. Comienza agregando la primera ahora mismo.</p>
                    <button
                        onClick={handleCreate}
                        className="bg-white text-slate-900 border-none px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl active:scale-95"
                    >
                        Crear Propiedad
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {filteredProperties.map((prop) => (
                        <div key={prop.id} className="bg-slate-800/80 border border-slate-700/50 rounded-[2rem] overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col shadow-2xl backdrop-blur-sm relative hover:-translate-y-2 duration-300">
                            <div className="h-56 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-slate-700 relative overflow-hidden">
                                <img
                                    src={`https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop`}
                                    alt={prop.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-800 to-transparent" />
                                <div className="absolute top-5 left-5">
                                    <span className={`text-[10px] px-3 py-1.5 rounded-xl uppercase font-black tracking-widest backdrop-blur-md border ${prop.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-900/40 text-slate-400 border-slate-700'}`}>
                                        {prop.status === 'AVAILABLE' ? 'Disponible' : prop.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-white group-hover:text-blue-400 mb-2 line-clamp-1 transition-colors">{prop.title}</h3>
                                    <div className="flex items-start text-slate-400 text-sm">
                                        <MapPin size={16} className="mr-2 mt-0.5 text-blue-500 shrink-0" />
                                        <span className="line-clamp-2">{prop.address}</span>
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Precio</span>
                                        <div className="text-white font-black text-2xl flex items-baseline">
                                            <span className="text-sm text-blue-500 mr-1.5">{prop.currency}</span>
                                            {prop.price.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(prop)}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-700/50 text-slate-300 hover:text-white hover:bg-blue-600 rounded-xl transition-all shadow-lg"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => prop.id && handleDelete(prop.id)}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-700/50 text-slate-300 hover:text-white hover:bg-red-600 rounded-xl transition-all shadow-lg"
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
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/80 border-b border-slate-700">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Inmueble</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ubicación</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Precio</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {filteredProperties.map((prop) => (
                                    <tr key={prop.id} className="hover:bg-blue-500/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="w-14 h-14 bg-slate-700 rounded-2xl overflow-hidden mr-4 shrink-0 shadow-lg">
                                                    <img
                                                        src={`https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=200&auto=format&fit=crop`}
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                                <span className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{prop.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400 font-medium">{prop.address}</td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-white text-xl">
                                                <span className="text-sm text-blue-500 mr-1">{prop.currency}</span>
                                                {prop.price.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] px-3 py-1.5 rounded-xl uppercase font-black tracking-widest border ${prop.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/30 text-slate-500 border-slate-700/50'}`}>
                                                {prop.status === 'AVAILABLE' ? 'Disponible' : prop.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(prop)}
                                                    className="p-3 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl transition-all shadow-lg"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => prop.id && handleDelete(prop.id)}
                                                    className="p-3 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl transition-all shadow-lg"
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
