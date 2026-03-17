import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Edit2, Save, Image as ImageIcon, Search, Package, Settings, ShoppingCart, CheckCircle, Clock, Truck, CreditCard, DollarSign } from 'lucide-react';
import { Product, Order, PaymentSettings, OrderStatus, AdminUser } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  contactState: string;
  isOnlinePaymentEnabled: boolean;
  isPaymentOnDeliveryEnabled: boolean;
  paymentSettings: PaymentSettings;
  orders: Order[];
  adminUsers: AdminUser[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (state: string, paymentOnDelivery: boolean, onlinePayment: boolean) => void;
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onAddAdminUser: (user: Omit<AdminUser, 'id'>) => void;
  onUpdateAdminUser: (id: string, user: Partial<AdminUser>) => void;
  onDeleteAdminUser: (id: string) => void;
  onLogout: () => void;
}

type Tab = 'produtos' | 'pedidos' | 'configuracoes' | 'usuarios';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  products, 
  contactState,
  isOnlinePaymentEnabled,
  isPaymentOnDeliveryEnabled,
  paymentSettings,
  orders,
  adminUsers,
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onUpdateSettings,
  onUpdatePaymentSettings,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddAdminUser,
  onUpdateAdminUser,
  onDeleteAdminUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('pedidos');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempState, setTempState] = useState(contactState);
  const [tempOnlinePayment, setTempOnlinePayment] = useState(isOnlinePaymentEnabled);
  const [tempPaymentOnDelivery, setTempPaymentOnDelivery] = useState(isPaymentOnDeliveryEnabled);
  const [tempPaymentSettings, setTempPaymentSettings] = useState<PaymentSettings>(paymentSettings);

  const [userFormData, setUserFormData] = useState({ login: '', password: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Sync temp states with props when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setTempState(contactState);
      setTempOnlinePayment(isOnlinePaymentEnabled);
      setTempPaymentOnDelivery(isPaymentOnDeliveryEnabled);
      setTempPaymentSettings(paymentSettings);
    }
  }, [isOpen, contactState, isOnlinePaymentEnabled, isPaymentOnDeliveryEnabled, paymentSettings]);

  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'unissex'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure price is properly formatted if user clicks Save without triggering onBlur
    let finalPrice = formData.price;
    if (typeof finalPrice === 'string') {
      finalPrice = parseFloat(finalPrice.replace(/\./g, '').replace(',', '.')) || 0;
    }
    
    const submitData = { ...formData, price: finalPrice };
    
    if (editingId) {
      onUpdateProduct(editingId, submitData);
      setEditingId(null);
    } else {
      onAddProduct(submitData);
      setIsAdding(false);
    }
    setFormData({ name: '', description: '', price: 0, imageUrl: '', category: 'unissex' });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category
    });
    setIsAdding(true);
  };

  const togglePaymentMethod = (type: 'online' | 'entrega', method: keyof PaymentSettings['online']) => {
    const newSettings = {
      ...tempPaymentSettings,
      [type]: {
        ...tempPaymentSettings[type],
        [method]: {
          ...tempPaymentSettings[type][method],
          enabled: !tempPaymentSettings[type][method].enabled
        }
      }
    };
    setTempPaymentSettings(newSettings);
  };

  const updatePixKey = (type: 'online' | 'entrega', key: string) => {
    const newSettings = {
      ...tempPaymentSettings,
      [type]: {
        ...tempPaymentSettings[type],
        pix: {
          ...tempPaymentSettings[type].pix,
          pixKey: key
        }
      }
    };
    setTempPaymentSettings(newSettings);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pendente': return 'text-yellow-500';
      case 'aceito': return 'text-blue-500';
      case 'pago': return 'text-green-500';
      case 'entregue': return 'text-gold';
      case 'cancelado': return 'text-red-500';
      default: return 'text-white/40';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[100] overflow-y-auto"
        >
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-serif text-white mb-2">Painel Administrativo</h2>
                <div className="flex gap-6 mt-4">
                  {(['pedidos', 'produtos', 'configuracoes', 'usuarios'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 pb-2 border-b-2 ${
                        activeTab === tab ? 'text-gold border-gold' : 'text-white/40 border-transparent hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Sair
                </button>
                <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                  <X size={32} />
                </button>
              </div>
            </div>

            {activeTab === 'pedidos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-serif text-white">Gerenciamento de Pedidos</h3>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-white/5 flex items-center gap-2">
                      <Clock size={16} className="text-yellow-500" />
                      <span className="text-xs text-white/60">Pendentes: {orders.filter(o => o.status === 'pendente').length}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {orders.length === 0 ? (
                    <div className="py-24 text-center bg-zinc-900/30 rounded-3xl border border-white/5">
                      <ShoppingCart size={48} className="mx-auto text-white/10 mb-4" />
                      <p className="text-white/40 font-light">Nenhum pedido realizado ainda.</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 hover:border-gold/30 transition-all duration-300">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className="text-white/20 text-[10px] uppercase tracking-widest">
                                {new Date(order.created_at).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <h4 className="text-lg font-medium text-white mb-2">Pedido #{order.id.slice(0, 8)}</h4>
                            <div className="space-y-1 mb-4">
                              <p className="text-sm text-white/60">Cliente: {order.customer_name}</p>
                              <p className="text-sm text-white/60">Telefone: {order.customer_phone}</p>
                            </div>
                            <div className="bg-black/40 rounded-2xl p-4 space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                  <span className="text-white/40">{item.quantity}x {item.name}</span>
                                  <span className="text-gold">R$ {(item.price * item.quantity).toLocaleString('pt-BR')}</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-white/5 flex justify-between font-bold">
                                <span className="text-white">TOTAL</span>
                                <span className="text-gold">R$ {order.total.toLocaleString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="lg:w-64 space-y-3">
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 mb-4">
                              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Pagamento</p>
                              <p className="text-xs text-white font-medium">{order.payment_type === 'online' ? 'Online' : 'Na Entrega'}</p>
                              <p className="text-xs text-gold font-bold">{order.payment_method}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {order.status === 'pendente' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, 'aceito')}
                                  className="col-span-2 py-3 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                                >
                                  ACEITAR PEDIDO
                                </button>
                              )}
                              {order.status === 'aceito' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, 'pago')}
                                  className="col-span-2 py-3 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                                >
                                  MARCAR COMO PAGO
                                </button>
                              )}
                              {order.status === 'pago' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, 'entregue')}
                                  className="col-span-2 py-3 bg-gold text-black rounded-xl text-xs font-bold hover:bg-white transition-colors"
                                >
                                  MARCAR COMO ENTREGUE
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteOrder(order.id)}
                                className="py-3 bg-white/5 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                              >
                                <Trash2 size={14} /> EXCLUIR
                              </button>
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'cancelado')}
                                className="py-3 bg-white/5 text-white/40 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
                              >
                                CANCELAR
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'produtos' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Form Section */}
                <div className="lg:col-span-1">
                  <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 sticky top-12">
                    <h3 className="text-xl font-serif text-gold mb-6">
                      {editingId ? 'Editar Perfume' : 'Adicionar Novo Perfume'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Nome do Produto</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Descrição</label>
                        <textarea
                          required
                          rows={3}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors resize-none"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Preço (R$)</label>
                          <input
                            type="text"
                            required
                            placeholder="0,00"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                            value={formData.price || ''}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value as any })}
                            onBlur={(e) => {
                              // On blur, format properly: remove dots, replace comma with dot. E.g "1.500,50" -> 1500.50
                              let val = e.target.value;
                              if (typeof val === 'string') {
                                val = val.replace(/\./g, '').replace(',', '.');
                                setFormData({ ...formData, price: parseFloat(val) || 0 });
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Categoria</label>
                          <select
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors appearance-none"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          >
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="unissex">Unissex</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">URL da Imagem</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            required
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          />
                          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                            {formData.imageUrl ? (
                              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} className="text-white/20" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-gold text-black py-4 rounded-xl font-bold tracking-widest hover:bg-white transition-all duration-300"
                        >
                          {editingId ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR PERFUME'}
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setFormData({ name: '', description: '', price: 0, imageUrl: '', category: 'unissex' });
                            }}
                            className="px-6 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                          >
                            CANCELAR
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-serif text-white">Catálogo Atual ({products.length})</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 flex items-center gap-6 group hover:border-gold/30 transition-colors"
                      >
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{product.name}</h4>
                          <p className="text-white/40 text-xs truncate font-light mb-1">{product.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-gold font-bold text-sm">R$ {product.price.toLocaleString('pt-BR')}</span>
                            <span className="text-[10px] uppercase tracking-widest text-white/20 px-2 py-0.5 border border-white/10 rounded-full">
                              {product.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-white/40 hover:text-gold transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-2 text-white/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'configuracoes' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  {/* Contact Settings */}
                  <div className="bg-zinc-900/50 border border-gold/20 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-serif text-gold">Configurações Gerais</h3>
                      <button
                        onClick={() => onUpdateSettings(tempState, tempPaymentOnDelivery, tempOnlinePayment)}
                        className="p-2 bg-gold text-black rounded-xl font-bold hover:bg-white transition-colors"
                        title="Salvar Configurações Gerais"
                      >
                        <Save size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Estado / Localização</label>
                        <input
                          type="text"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                          value={tempState}
                          onChange={(e) => setTempState(e.target.value)}
                          placeholder="Ex: São Paulo, SP"
                        />
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <label className="flex items-center justify-between cursor-pointer group">
                          <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                            Pagamento Online (Master Switch)
                          </span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={tempOnlinePayment}
                              onChange={(e) => setTempOnlinePayment(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold peer-checked:after:bg-black"></div>
                          </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                          <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                            Pagamento na Entrega (Master Switch)
                          </span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={tempPaymentOnDelivery}
                              onChange={(e) => setTempPaymentOnDelivery(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold peer-checked:after:bg-black"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Payment Methods Settings */}
                  <div className="bg-zinc-900/50 border border-gold/20 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-serif text-gold">Métodos de Pagamento</h3>
                      <button
                        onClick={() => onUpdatePaymentSettings(tempPaymentSettings)}
                        className="p-2 bg-gold text-black rounded-xl font-bold hover:bg-white transition-colors"
                        title="Salvar Métodos de Pagamento"
                      >
                        <Save size={18} />
                      </button>
                    </div>

                    <div className="space-y-8">
                      {/* Online Section */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                          <CreditCard size={16} className="text-gold" /> Pagamento Online
                        </h4>
                        <div className="space-y-3">
                          {(['pix', 'credito', 'debito'] as const).map((method) => (
                            <div key={method} className="space-y-2">
                              <label className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 cursor-pointer hover:border-gold/30 transition-colors">
                                <span className="text-xs text-white/60 capitalize">{method}</span>
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={tempPaymentSettings.online[method].enabled}
                                    onChange={() => togglePaymentMethod('online', method)}
                                  />
                                  <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold peer-checked:after:bg-black"></div>
                                </div>
                              </label>
                              {method === 'pix' && tempPaymentSettings.online.pix.enabled && (
                                <input
                                  type="text"
                                  placeholder="Chave PIX Online"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-gold transition-colors"
                                  value={tempPaymentSettings.online.pix.pixKey || ''}
                                  onChange={(e) => updatePixKey('online', e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Section */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                          <Truck size={16} className="text-gold" /> Pagamento na Entrega
                        </h4>
                        <div className="space-y-3">
                          {(['pix', 'credito', 'debito'] as const).map((method) => (
                            <div key={method} className="space-y-2">
                              <label className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 cursor-pointer hover:border-gold/30 transition-colors">
                                <span className="text-xs text-white/60 capitalize">{method}</span>
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={tempPaymentSettings.entrega[method].enabled}
                                    onChange={() => togglePaymentMethod('entrega', method)}
                                  />
                                  <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold peer-checked:after:bg-black"></div>
                                </div>
                              </label>
                              {method === 'pix' && tempPaymentSettings.entrega.pix.enabled && (
                                <input
                                  type="text"
                                  placeholder="Chave PIX na Entrega"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-gold transition-colors"
                                  value={tempPaymentSettings.entrega.pix.pixKey || ''}
                                  onChange={(e) => updatePixKey('entrega', e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 sticky top-12">
                    <h3 className="text-xl font-serif text-gold mb-6">
                      {editingUserId ? 'Editar Usuário' : 'Novo Administrador'}
                    </h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (editingUserId) {
                          onUpdateAdminUser(editingUserId, userFormData);
                          setEditingUserId(null);
                        } else {
                          onAddAdminUser(userFormData);
                        }
                        setUserFormData({ login: '', password: '' });
                      }} 
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Login</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                          value={userFormData.login}
                          onChange={(e) => setUserFormData({ ...userFormData, login: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Senha</label>
                        <input
                          type="password"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-gold text-black py-4 rounded-xl font-bold tracking-widest hover:bg-white transition-all duration-300"
                        >
                          {editingUserId ? 'SALVAR' : 'CRIAR ACESSO'}
                        </button>
                        {editingUserId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUserId(null);
                              setUserFormData({ login: '', password: '' });
                            }}
                            className="px-6 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                          >
                            CANCELAR
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xl font-serif text-white mb-6">Usuários com Acesso ({adminUsers.length})</h3>
                  <div className="space-y-4">
                    {adminUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-gold/30 transition-colors"
                      >
                        <div>
                          <p className="text-white font-medium">{user.login}</p>
                          <p className="text-white/20 text-xs font-mono mt-1">••••••••</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingUserId(user.id);
                              setUserFormData({ login: user.login, password: user.password });
                            }}
                            className="p-2 text-white/40 hover:text-gold transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          {adminUsers.length > 1 && (
                            <button
                              onClick={() => onDeleteAdminUser(user.id)}
                              className="p-2 text-white/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
