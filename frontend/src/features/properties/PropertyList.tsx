import React, { useEffect, useState } from 'react';
import { Property, PropertyService } from './PropertyService';
import { Plus, Edit, Trash2, MapPin, DollarSign, Home } from 'lucide-react';
import PropertyForm from './PropertyForm';

const PropertyList: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();

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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Gestión de Propiedades</h1>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    <span>Nueva Propiedad</span>
                </button>
            </div>

            {loading ? (
                <div className="text-slate-400">Cargando propiedades...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((prop) => (
                        <div key={prop.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
                            <div className="h-48 bg-slate-700 flex items-center justify-center text-slate-500">
                                <Home size={48} />
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">{prop.title}</h3>
                                    <span className="bg-blue-500/10 text-blue-500 text-xs px-2 py-1 rounded-full uppercase font-bold">
                                        {prop.status}
                                    </span>
                                </div>
                                <div className="flex items-center text-slate-400 text-sm mb-2">
                                    <MapPin size={14} className="mr-1" />
                                    {prop.address}
                                </div>
                                <div className="flex items-center text-emerald-400 font-bold text-xl mb-4">
                                    <DollarSign size={18} />
                                    {prop.price.toLocaleString()} {prop.currency}
                                </div>
                                <div className="flex justify-end space-x-2 border-t border-slate-700 pt-4">
                                    <button
                                        onClick={() => handleEdit(prop)}
                                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => prop.id && handleDelete(prop.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
