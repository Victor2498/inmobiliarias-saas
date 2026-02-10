import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from './AuthService';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await AuthService.login(email, password);
            setAuth(data.access_token, data.user);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Credenciales inválidas o error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
                            <Home className="text-white w-8 h-8" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white text-center mb-2">Bienvenido</h1>
                    <p className="text-slate-400 text-center mb-8">Ingresa a tu portal inmobiliario</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Iniciar Sesión</span>
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
