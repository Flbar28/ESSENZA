export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'masculino' | 'feminino' | 'unissex';
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pendente' | 'aceito' | 'pago' | 'entregue' | 'cancelado';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: CartItem[];
  total: number;
  payment_type: 'online' | 'entrega';
  payment_method: string;
  status: OrderStatus;
  created_at: string;
}

export interface PaymentMethodConfig {
  enabled: boolean;
  label: string;
  pixKey?: string;
}

export interface PaymentSettings {
  online: {
    pix: PaymentMethodConfig;
    credito: PaymentMethodConfig;
    debito: PaymentMethodConfig;
  };
  entrega: {
    pix: PaymentMethodConfig;
    credito: PaymentMethodConfig;
    debito: PaymentMethodConfig;
  };
}

export interface AdminUser {
  id: string;
  login: string;
  password: string;
}
