import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, Home, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from './AuthService';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { token, user, setAuth } = useAuthStore();

    // Redirigir si ya está logueado
    React.useEffect(() => {
        if (token && user) {
            if (user.role === 'SUPERADMIN') {
                navigate('/superadmin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [token, user, navigate]);

    const [identifier, setIdentifier] = useState(''); // email, username o nombre inmobiliaria
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Usamos AuthService.loginTenant que ya tiene lógica para detectar
            // si el identificador es un usuario (Admin/Asesor/SuperAdmin) o una empresa.
            const data = await AuthService.loginTenant(identifier, password);
            setAuth(data.access_token, data.user);

            if (data.user.role === 'SUPERADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Credenciales inválidas o error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative">
                    <div className="flex justify-center mb-8">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-xl shadow-blue-500/20">
                            <Home className="text-white w-10 h-10" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-extrabold text-white text-center mb-2 tracking-tight">Inmonea</h1>
                    <p className="text-slate-400 text-center mb-10 font-medium">Gestión Inmobiliaria Inteligente</p>

                    <form onSubmit={handleSubmit} className="space-y-7">
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
                                Identificación
                            </label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-5 pl-14 pr-4 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                                    placeholder="Email, Usuario o Inmobiliaria"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-5 pl-14 pr-14 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl text-center font-bold"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-6 h-6" />
                            ) : (
                                <>
                                    <LogIn className="w-6 h-6" />
                                    <span>Acceder al Panel</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-slate-500 text-sm">
                            ¿Necesitas ayuda? <a href="#" className="text-blue-500 hover:text-blue-400 font-medium">Soporte Técnico</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
