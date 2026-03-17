import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-gold/20 rounded-2xl p-8 text-center shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} className="text-gold" />
              </div>
            </div>

            <h3 className="text-2xl font-serif text-gold mb-2">Pedido Realizado!</h3>
            <p className="text-white/60 font-light mb-8">
              Seu pedido foi recebido com sucesso. Em breve entraremos em contato para confirmar os detalhes.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-gold text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold/90 transition-all active:scale-[0.98]"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
