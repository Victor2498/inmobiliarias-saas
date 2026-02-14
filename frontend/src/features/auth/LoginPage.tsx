import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, Home, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from './AuthService';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [loginType, setLoginType] = useState<'tenant' | 'admin'>('tenant');
    const [identifier, setIdentifier] = useState(''); // email o username
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let data;
            if (loginType === 'tenant') {
                data = await AuthService.loginTenant(identifier, password);
            } else {
                data = await AuthService.loginAdmin(identifier, password);
            }
            setAuth(data.access_token, data.user);

            // Redirección inteligente basada en el rol
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
        <div className="min-h-screen bg-slate-950 dark:bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/10 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative">
                    <div className="flex justify-center mb-8">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-xl shadow-blue-500/20">
                            <Home className="text-white w-8 h-8" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white text-center mb-2">Inmonea</h1>
                    <p className="text-slate-400 text-center mb-8">Gestión Inmobiliaria Inteligente</p>

                    {/* Login Type Switcher */}
                    <div className="flex p-1 bg-slate-900/50 rounded-2xl mb-8 border border-white/5">
                        <button
                            onClick={() => setLoginType('tenant')}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${loginType === 'tenant' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Inmobiliaria
                        </button>
                        <button
                            onClick={() => setLoginType('admin')}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${loginType === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            Administrador
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">
                                {loginType === 'tenant' ? 'Email o Usuario' : 'Correo / Username'}
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    {loginType === 'tenant' ? <Home className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                </div>
                                <input
                                    type={loginType === 'tenant' ? 'text' : 'email'}
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                                    placeholder={loginType === 'tenant' ? 'Email o nombre de usuario' : 'superadmin o correo@admin.com'}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors"
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Entrar al Sistema</span>
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
