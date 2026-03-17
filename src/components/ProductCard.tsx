import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm"
    >
      <div className="aspect-[4/5] overflow-hidden relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
        
        <button
          onClick={() => onAddToCart(product)}
          className="absolute bottom-4 right-4 bg-gold text-black p-3 rounded-full shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-white"
        >
          <Plus size={20} />
        </button>

        <div className="absolute top-4 left-4">
          <span className="bg-black/60 backdrop-blur-md text-gold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-gold/30">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-serif text-white mb-2 group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <div className="relative group/desc">
          <p className="text-white/50 text-sm mb-4 line-clamp-2 font-light cursor-help">
            {product.description}
          </p>
          <div className="absolute left-0 bottom-full mb-2 w-full p-3 bg-zinc-800 border border-white/10 rounded-lg opacity-0 invisible group-hover/desc:opacity-100 group-hover/desc:visible transition-all duration-300 z-10 shadow-xl pointer-events-none">
            <p className="text-white/90 text-sm font-light leading-relaxed">
              {product.description}
            </p>
            <div className="absolute top-full left-4 -mt-1 w-2 h-2 bg-zinc-800 border-b border-r border-white/10 rotate-45 transform"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gold">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-gold transition-colors uppercase tracking-widest"
          >
            <ShoppingCart size={14} />
            Comprar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
