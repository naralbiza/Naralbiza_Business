import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EyeIcon, EyeOffIcon } from '../components/common/Icon';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (currentUser && !authLoading) {
            navigate('/');
        }
    }, [currentUser, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Credenciais inválidas. Por favor, verifique seu email e senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header Area */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-widest text-white mb-2">NARALBIZA</h1>
                    <p className="text-xs text-brand-gold font-bold tracking-[0.3em] uppercase">Business Management</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 transform transition-all hover:border-brand-gold/30">
                    <h2 className="text-xl font-bold text-center mb-8 text-white tracking-wide">Acesso ao Sistema</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center shadow-lg shadow-red-500/5">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider" htmlFor="email">
                                Email Corporativo
                            </label>
                            <input
                                className="w-full bg-brand-dark/50 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-300"
                                id="email"
                                type="email"
                                placeholder="nome@naralbiza.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider" htmlFor="password">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full bg-brand-dark/50 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all duration-300 pr-12"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-brand-gold transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                className="w-full bg-brand-gold hover:bg-yellow-500 text-brand-dark font-black py-4 px-4 rounded-xl focus:outline-none shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/40 transform hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Acessando...
                                    </span>
                                ) : 'Entrar na Plataforma'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-[10px] text-gray-600 mt-8 font-medium tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
                    &copy; 2025 Naralbiza Studios. All rights reserved.
                </p>
            </div>
        </div>
    );
};
