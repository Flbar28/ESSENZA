import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, LogIn } from 'lucide-react';
import { AdminUser } from '../types';

import { supabase } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('login', login)
      .eq('password', password)
      .single();

    if (data && !dbError) {
      onLoginSuccess();
      onClose();
      setLogin('');
      setPassword('');
      setError('');
    } else {
      setError('Login ou senha incorretos.');
    }
    
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[201] flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 w-full max-w-sm pointer-events-auto space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-gold" size={32} />
                </div>
                <h2 className="text-2xl font-serif text-white">Acesso Restrito</h2>
                <p className="text-white/40 text-sm font-light mt-2">Identifique-se para acessar o painel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="text"
                    placeholder="Usuário"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="password"
                    placeholder="Senha"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs text-center font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-black py-4 rounded-xl font-bold tracking-widest hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn size={18} /> {loading ? 'ENTRANDO...' : 'ENTRAR NO PAINEL'}
                </button>
              </form>

              <button
                onClick={onClose}
                className="w-full text-white/20 text-[10px] uppercase tracking-widest hover:text-white transition-colors"
              >
                VOLTAR PARA A LOJA
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
