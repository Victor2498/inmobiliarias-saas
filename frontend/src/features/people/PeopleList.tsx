import React, { useEffect, useState } from 'react';
import { Person, PeopleService } from './PeopleService';
import { User, Phone, Mail, CreditCard } from 'lucide-react';

const PeopleList: React.FC = () => {
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        try {
            const data = await PeopleService.list();
            setPeople(data);
        } catch (error) {
            console.error("Error loading people", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Inquilinos y Propietarios</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {people.map((person) => (
                    <div key={person.id} className="bg-slate-800 border border-slate-700 p-5 rounded-xl hover:border-blue-500/50 transition-all">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="bg-blue-600/10 p-3 rounded-full text-blue-500">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{person.full_name}</h3>
                                <span className="text-xs uppercase font-bold text-slate-500">{person.type}</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex items-center">
                                <CreditCard size={14} className="mr-2" />
                                DNI/CUIT: {person.dni_cuit}
                            </div>
                            <div className="flex items-center">
                                <Mail size={14} className="mr-2" />
                                {person.email || 'N/A'}
                            </div>
                            <div className="flex items-center text-emerald-400">
                                <Phone size={14} className="mr-2" />
                                {person.phone || 'N/A'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeopleList;
