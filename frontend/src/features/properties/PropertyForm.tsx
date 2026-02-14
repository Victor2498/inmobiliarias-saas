import React, { useState } from 'react';
import { Property, PropertyService } from './PropertyService';
import { X } from 'lucide-react';

interface PropertyFormProps {
    property?: Property;
    onClose: () => void;
    onSuccess: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Property>(property || {
        title: '',
        description: '',
        price: 0,
        currency: 'USD',
        address: '',
        status: 'AVAILABLE'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (property?.id) {
                await PropertyService.update(property.id, formData);
                alert('¡Propiedad actualizada con éxito!');
            } else {
                await PropertyService.create(formData);
                alert('¡Propiedad agregada con éxito!');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving property", error);
            const msg = error.response?.data?.detail || "Error al guardar la propiedad";
            alert(msg);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">
                        {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Título</label>
                            <input
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Dirección</label>
                            <input
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Precio</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Moneda</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="USD">USD</option>
                                <option value="ARS">ARS</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Descripción</label>
                        <textarea
                            rows={4}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropertyForm;
