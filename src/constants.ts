import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Essenza D\'Or Asad',
    description: 'Um perfume marcante com notas de pimenta preta, tabaco e baunilha.',
    price: 289.90,
    imageUrl: 'https://picsum.photos/seed/asad/400/500',
    category: 'masculino',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Essenza D\'Or Khamrah',
    description: 'Fragrância luxuosa com notas de canela, tâmara e praliné.',
    price: 349.90,
    imageUrl: 'https://picsum.photos/seed/khamrah/400/500',
    category: 'unissex',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Essenza D\'Or Fakhar Black',
    description: 'Elegância em frasco com notas oceânicas e lavanda.',
    price: 259.90,
    imageUrl: 'https://picsum.photos/seed/fakhar/400/500',
    category: 'masculino',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Essenza D\'Or Yara',
    description: 'Doce e feminino com notas de orquídea, heliotrópio e baunilha.',
    price: 279.90,
    imageUrl: 'https://picsum.photos/seed/yara/400/500',
    category: 'feminino',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Essenza D\'Or Qaed Al Fursan',
    description: 'Frescor tropical com abacaxi, açafrão e notas amadeiradas.',
    price: 239.90,
    imageUrl: 'https://picsum.photos/seed/qaed/400/500',
    category: 'unissex',
    createdAt: new Date().toISOString()
  }
];
