import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Home, ArrowRight } from 'lucide-react';
import { AuthService } from './AuthService';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No se proporcionó un token de verificación.');
                return;
            }

            try {
                const data = await AuthService.verifyEmail(token);
                setStatus('success');
                setMessage(data.message);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.detail || 'Error al verificar el email. El enlace puede haber expirado.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl shadow-xl shadow-blue-500/20">
                            <Home className="text-white w-8 h-8" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-6">Verificación de Cuenta</h1>

                    {status === 'loading' && (
                        <div className="space-y-4">
                            <Loader2 className="animate-spin w-12 h-12 text-blue-500 mx-auto" />
                            <p className="text-slate-400">Verificando tu email...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6">
                            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <p className="text-green-500 font-medium">{message}</p>
                            </div>
                            <Link
                                to="/login"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-500/20"
                            >
                                <span>Ir al Login</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6">
                            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
                                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-red-500 font-medium">{message}</p>
                            </div>
                            <Link
                                to="/login"
                                className="text-blue-500 hover:text-blue-400 font-medium block"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
