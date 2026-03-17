import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, Truck, Smartphone, Wallet, User, Phone, Copy, Check } from 'lucide-react';
import { CartItem, PaymentSettings } from '../types';
import { QRCodeSVG } from 'qrcode.react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (customerData: { name: string; phone: string }, paymentType: 'online' | 'entrega', paymentMethod: string) => void;
  isOnlinePaymentEnabled: boolean;
  isPaymentOnDeliveryEnabled: boolean;
  paymentSettings: PaymentSettings;
}

export const Cart: React.FC<CartProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  isOnlinePaymentEnabled,
  isPaymentOnDeliveryEnabled,
  paymentSettings
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentType, setPaymentType] = useState<'online' | 'entrega'>(isOnlinePaymentEnabled ? 'online' : 'entrega');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [showPixModal, setShowPixModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Ensure paymentType is valid if props change
  React.useEffect(() => {
    if (!isOnlinePaymentEnabled && paymentType === 'online') {
      setPaymentType('entrega');
    } else if (!isPaymentOnDeliveryEnabled && paymentType === 'entrega') {
      setPaymentType('online');
    }
  }, [isOnlinePaymentEnabled, isPaymentOnDeliveryEnabled, paymentType]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!customerName || !customerPhone) {
      alert('Por favor, preencha seu nome e telefone.');
      return;
    }
    if (!paymentMethod) {
      alert('Por favor, selecione uma forma de pagamento.');
      return;
    }

    if (paymentMethod === 'PIX') {
      setShowPixModal(true);
    } else {
      onCheckout({ name: customerName, phone: customerPhone }, paymentType, paymentMethod);
    }
  };

  const confirmPixPayment = () => {
    setShowPixModal(false);
    onCheckout({ name: customerName, phone: customerPhone }, paymentType, paymentMethod);
  };

  const getAvailableMethods = (type: 'online' | 'entrega') => {
    const settings = paymentSettings[type];
    return Object.entries(settings)
      .filter(([_, config]) => (config as any).enabled)
      .map(([key, config]) => ({ id: key, label: (config as any).label, pixKey: (config as any).pixKey }));
  };

  const currentPixKey = getAvailableMethods(paymentType).find(m => m.id === 'pix')?.pixKey || '';

  const copyPixKey = () => {
    navigator.clipboard.writeText(currentPixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-gold" />
                <h2 className="text-xl font-serif text-white">Seu Carrinho</h2>
                <span className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <ShoppingBag size={32} className="text-white/10" />
                  </div>
                  <p className="text-white/40 font-light">Seu carrinho está vazio.</p>
                  <button
                    onClick={onClose}
                    className="text-gold text-sm font-bold tracking-widest hover:text-white transition-colors"
                  >
                    CONTINUAR COMPRANDO
                  </button>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-16 h-20 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white text-sm font-medium truncate">{item.name}</h3>
                          <p className="text-gold text-sm font-bold mt-1">R$ {item.price.toLocaleString('pt-BR')}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="p-1 text-white/40 hover:text-white transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-[10px] text-white font-medium w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="p-1 text-white/40 hover:text-white transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => onRemove(item.id)}
                              className="text-white/20 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Data */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h4 className="text-[10px] uppercase tracking-widest text-white/40">Seus Dados</h4>
                    <div className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input
                          type="text"
                          placeholder="Nome Completo"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input
                          type="tel"
                          placeholder="Telefone"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Opção de Pagamento:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {isOnlinePaymentEnabled && (
                          <button
                            onClick={() => {
                              setPaymentType('online');
                              setPaymentMethod('');
                            }}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 ${
                              paymentType === 'online' 
                                ? 'bg-gold/10 border-gold text-gold' 
                                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                            }`}
                          >
                            <Smartphone size={16} />
                            <span className="text-xs font-bold">ONLINE</span>
                          </button>
                        )}
                        {isPaymentOnDeliveryEnabled && (
                          <button
                            onClick={() => {
                              setPaymentType('entrega');
                              setPaymentMethod('');
                            }}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 ${
                              paymentType === 'entrega' 
                                ? 'bg-gold/10 border-gold text-gold' 
                                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                            }`}
                          >
                            <Truck size={16} />
                            <span className="text-xs font-bold">NA ENTREGA</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">Forma de Pagamento:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {getAvailableMethods(paymentType).map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.label)}
                            className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all duration-300 ${
                              paymentMethod === method.label 
                                ? 'bg-gold/10 border-gold text-gold' 
                                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                            }`}
                          >
                            {method.id === 'pix' && <Smartphone size={14} />}
                            {method.id === 'credito' && <CreditCard size={14} />}
                            {method.id === 'debito' && <Wallet size={14} />}
                            <span className="text-[10px] font-bold">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-zinc-900 border-t border-white/5">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-white/40 text-sm font-light">Total</span>
                  <span className="text-2xl font-serif text-white">R$ {total.toLocaleString('pt-BR')}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gold text-black py-4 rounded-xl font-bold tracking-[0.2em] hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-gold/10"
                >
                  FINALIZAR PEDIDO
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* PIX Modal */}
      <AnimatePresence>
        {showPixModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPixModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-zinc-950 border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl">
                  <QRCodeSVG value={currentPixKey} size={200} />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-serif text-white mb-2">Pagamento via PIX</h3>
                <p className="text-white/40 text-sm font-light">Escaneie o QR Code ou copie a chave abaixo</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <span className="text-xs text-white truncate font-mono">{currentPixKey}</span>
                <button
                  onClick={copyPixKey}
                  className="p-2 bg-gold/10 text-gold rounded-lg hover:bg-gold hover:text-black transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={confirmPixPayment}
                  className="w-full bg-gold text-black py-4 rounded-xl font-bold tracking-widest hover:bg-white transition-all"
                >
                  JÁ REALIZEI O PAGAMENTO
                </button>
                <button
                  onClick={() => setShowPixModal(false)}
                  className="w-full text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
