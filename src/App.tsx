import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { SuccessModal } from './components/SuccessModal';
import { Logo } from './components/Logo';
import { Product, CartItem, Order, PaymentSettings, OrderStatus, AdminUser } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { supabase } from './lib/supabase';

// Helper to map DB Product to App Product type
const mapDbProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description,
  price: Number(dbProduct.price),
  imageUrl: dbProduct.image_url,
  category: dbProduct.category,
  createdAt: dbProduct.created_at,
});

export default function App() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [contactState, setContactState] = useState('São Paulo, SP');
  const [isOnlinePaymentEnabled, setIsOnlinePaymentEnabled] = useState(true);
  const [isPaymentOnDeliveryEnabled, setIsPaymentOnDeliveryEnabled] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    online: {
      pix: { enabled: true, label: 'PIX' },
      credito: { enabled: true, label: 'Crédito' },
      debito: { enabled: true, label: 'Débito' }
    },
    entrega: {
      pix: { enabled: true, label: 'PIX' },
      credito: { enabled: true, label: 'Crédito' },
      debito: { enabled: true, label: 'Débito' }
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'masculino' | 'feminino' | 'unissex'>('todos');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const isConfigured = Boolean((import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY);

  // Load from Supabase on mount
  useEffect(() => {
    fetchProducts();
    fetchSettings();
    const savedCart = localStorage.getItem('lattafa_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    const savedLoginState = localStorage.getItem('lattafa_is_logged_in');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAdminData();
    }
  }, [isLoggedIn]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setProducts(data.map(mapDbProduct));
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setDbError(err.message);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setContactState(data.contact_state);
        setIsOnlinePaymentEnabled(data.is_online_payment_enabled);
        setIsPaymentOnDeliveryEnabled(data.is_payment_on_delivery_enabled);
        setPaymentSettings(data.payment_settings as PaymentSettings);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchAdminData = async () => {
    // Orders
    const { data: ordersData } = await supabase.from('orders').select(`
      *,
      order_items (
        id, quantity, price_at_time,
        products (*)
      )
    `).order('created_at', { ascending: false });
    
    if (ordersData) {
      const mappedOrders: Order[] = ordersData.map((o: any) => ({
        id: o.id,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        customer_email: o.customer_email,
        items: o.order_items.map((oi: any) => ({
          ...mapDbProduct(oi.products),
          quantity: oi.quantity,
          price: Number(oi.price_at_time),
        })),
        total: Number(o.total),
        payment_type: o.payment_type,
        payment_method: o.payment_method,
        status: o.status,
        created_at: o.created_at,
      }));
      setOrders(mappedOrders);
    }

    // Users
    const { data: usersData } = await supabase.from('admin_users').select('*');
    if (usersData) {
      setAdminUsers(usersData);
    }
  };

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('lattafa_cart', JSON.stringify(cart));
  }, [cart]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Handlers
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async (customerData: { name: string; phone: string }, paymentType: 'online' | 'entrega', paymentMethod: string) => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    // Save order to Supabase
    const { data: newOrder, error } = await supabase.from('orders').insert({
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      customer_email: '',
      total,
      payment_type: paymentType,
      payment_method: paymentMethod,
      status: 'pendente',
    }).select().single();

    if (newOrder && !error) {
      // Insert order items
      const itemsToInsert = cart.map(item => ({
        order_id: newOrder.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }));
      await supabase.from('order_items').insert(itemsToInsert);

      // Refresh admin orders if logged in
      if (isLoggedIn) fetchAdminData();
      
      setCart([]);
      setIsCartOpen(false);
      setIsSuccessModalOpen(true);
    } else {
      console.error("Error creating order", error);
    }
  };

  // Admin Handlers
  const handleAddProduct = async (newProduct: Omit<Product, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('products').insert({
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      image_url: newProduct.imageUrl,
      category: newProduct.category,
    }).select().single();
    
    if (error) {
      console.error('Error adding product:', error);
      alert('Erro ao adicionar produto: ' + error.message);
    } else if (data) {
      setProducts([mapDbProduct(data), ...products]);
      alert('Produto adicionado com sucesso!');
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    const { data, error } = await supabase.from('products').update(dbUpdates).eq('id', id).select().single();
    if (error) {
      console.error('Error updating product:', error);
      alert('Erro ao atualizar produto: ' + error.message);
    } else if (data) {
      setProducts(products.map(p => p.id === id ? mapDbProduct(data) : p));
      alert('Produto atualizado com sucesso!');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto: ' + error.message);
    } else {
      setProducts(products.filter(p => p.id !== id));
      alert('Produto excluído com sucesso!');
    }
  };

  const handleUpdateSettings = async (state: string, paymentOnDelivery: boolean, onlinePayment: boolean) => {
    const { data, error } = await supabase.from('store_settings').update({
      contact_state: state,
      is_payment_on_delivery_enabled: paymentOnDelivery,
      is_online_payment_enabled: onlinePayment,
    }).eq('id', 1).select().single();

    if (error) {
      console.error('Error updating settings:', error);
      alert('Erro ao atualizar configurações: ' + error.message);
    } else if (data) {
      setContactState(data.contact_state);
      setIsPaymentOnDeliveryEnabled(data.is_payment_on_delivery_enabled);
      setIsOnlinePaymentEnabled(data.is_online_payment_enabled);
      alert('Configurações atualizadas!');
    }
  };

  const handleUpdatePaymentSettings = async (settings: PaymentSettings) => {
    const { data, error } = await supabase.from('store_settings').update({
      payment_settings: settings as any,
    }).eq('id', 1).select().single();

    if (error) {
      console.error('Error updating payment settings:', error);
      alert('Erro ao atualizar métodos de pagamento: ' + error.message);
    } else if (data) {
      setPaymentSettings(data.payment_settings as PaymentSettings);
      alert('Métodos de pagamento atualizados!');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.error('Error deleting order:', error);
      alert('Erro ao excluir pedido: ' + error.message);
    } else {
      setOrders(orders.filter(o => o.id !== orderId));
      alert('Pedido excluído com sucesso!');
    }
  };

  // Admin User Handlers
  const handleAddAdminUser = async (user: Omit<AdminUser, 'id'>) => {
    const { data, error } = await supabase.from('admin_users').insert({
      login: user.login,
      password: user.password
    }).select().single();

    if (error) {
      console.error('Error adding admin user:', error);
      alert('Erro ao adicionar usuário: ' + error.message);
    } else if (data) {
      setAdminUsers([...adminUsers, data as AdminUser]);
      alert('Administrador adicionado com sucesso!');
    }
  };

  const handleUpdateAdminUser = async (id: string, updates: Partial<AdminUser>) => {
    const { data, error } = await supabase.from('admin_users').update(updates).eq('id', id).select().single();
    if (error) {
      console.error('Error updating admin user:', error);
      alert('Erro ao atualizar usuário: ' + error.message);
    } else if (data) {
      setAdminUsers(adminUsers.map(u => u.id === id ? { ...u, ...data } : u));
      alert('Usuário atualizado com sucesso!');
    }
  };

  const handleDeleteAdminUser = async (id: string) => {
    if (adminUsers.length <= 1) {
      alert('Não é possível excluir o único administrador do sistema!');
      return;
    }
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) {
      console.error('Error deleting admin user:', error);
      alert('Erro ao excluir usuário: ' + error.message);
    } else {
      setAdminUsers(adminUsers.filter(u => u.id !== id));
      alert('Usuário excluído!');
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('lattafa_is_logged_in', 'true');
    setIsAdminOpen(true);
    fetchAdminData();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('lattafa_is_logged_in', 'false');
    setIsAdminOpen(false);
    setOrders([]);
    setAdminUsers([]);
  };

  const handleAdminClick = () => {
    if (isLoggedIn) {
      setIsAdminOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <Logo size="lg" className="mb-8" />
        <h1 className="text-2xl font-serif text-gold mb-4">Configuração Necessária</h1>
        <p className="text-white/60 max-w-md mb-8">
          Para que o Essenza D&apos;Or funcione na Vercel, você precisa configurar as variáveis de ambiente 
          <strong> VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong>.
        </p>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-sm font-mono text-left">
          Dica: Acesse Project Settings &gt; Environment Variables no painel da Vercel.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gold selection:text-black">
      <Navbar 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={handleAdminClick}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Hero />

      <main id="perfumes" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl font-serif mb-2">Nossa Coleção</h2>
            <p className="text-white/40 font-light">Explore as fragrâncias mais desejadas do mundo árabe</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {(['todos', 'masculino', 'feminino', 'unissex'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                  selectedCategory === cat 
                    ? 'bg-gold border-gold text-black' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-gold/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-white/40 font-light text-lg">Nenhum perfume encontrado para sua busca.</p>
          </div>
        )}
      </main>

      <footer className="bg-zinc-950 border-t border-white/5 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Logo size="lg" className="mb-6" />
            <p className="text-white/50 font-light max-w-md leading-relaxed">
              Essenza D'Or é uma marca de perfumes importados de alta perfumaria, 
              conhecida por suas fragrâncias luxuosas que combinam elegância e exclusividade.
            </p>
          </div>
          <div>
            <h4 className="text-gold text-sm font-bold uppercase tracking-widest mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-white/40 text-sm font-light">
              <li className="hover:text-gold cursor-pointer transition-colors">Início</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Perfumes</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Sobre Nós</li>
              <li className="hover:text-gold cursor-pointer transition-colors">Contato</li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold text-sm font-bold uppercase tracking-widest mb-6">Contato</h4>
            <ul className="space-y-4 text-white/40 text-sm font-light">
              <li>{contactState}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-[10px] uppercase tracking-[0.2em]">
            © 2026 Essenza D'Or Perfumes Importados. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-white/20 text-[10px] uppercase tracking-[0.2em]">
            <span className="hover:text-gold cursor-pointer transition-colors">Privacidade</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Termos</span>
          </div>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isOnlinePaymentEnabled={isOnlinePaymentEnabled}
        isPaymentOnDeliveryEnabled={isPaymentOnDeliveryEnabled}
        paymentSettings={paymentSettings}
      />

      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        contactState={contactState}
        isOnlinePaymentEnabled={isOnlinePaymentEnabled}
        isPaymentOnDeliveryEnabled={isPaymentOnDeliveryEnabled}
        paymentSettings={paymentSettings}
        orders={orders}
        adminUsers={adminUsers}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateSettings={handleUpdateSettings}
        onUpdatePaymentSettings={handleUpdatePaymentSettings}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onAddAdminUser={handleAddAdminUser}
        onUpdateAdminUser={handleUpdateAdminUser}
        onDeleteAdminUser={handleDeleteAdminUser}
        onLogout={handleLogout}
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}
