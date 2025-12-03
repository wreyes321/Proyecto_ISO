export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  stock: number;
  description: string;
  specs: Record<string, string>;
  rating: number;
  reviews: Review[];
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  status: 'draft' | 'published';
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  productId: string;
  productTitle?: string; 
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
  paymentMethod?: 'transfer' | 'cash_on_delivery';
  deliveryType?: 'home' | 'pickup';
  notes?: string | null;
  paymentProofUrl?: string | null;
  shippingAddress?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  role: 'client' | 'admin';
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  addresses?: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  wishlist: string[];
  orders?: string[];
  createdAt?: string;
}

export interface Settings {
  currency: string;
  taxRate: number;
  shippingCost: number;
  freeShippingThreshold: number;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Anillo de Oro Blanco con Diamante',
    slug: 'anillo-oro-blanco-diamante',
    price: 1299,
    salePrice: 999,
    images: [
      'https://images.unsplash.com/photo-1714747453609-1cb3acaccf62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5JTIwcmluZ3MlMjBkaWFtb25kc3xlbnwxfHx8fDE3NTkxODQ3Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'
    ],
    category: 'Anillos',
    stock: 15,
    description: 'Elegante anillo de oro blanco de 18 quilates con diamante solitario de 0.5 quilates. Diseño clásico y atemporal perfecto para cualquier ocasión especial.',
    specs: {
      'Material': 'Oro Blanco 18k',
      'Piedra': 'Diamante 0.5ct',
      'Certificación': 'GIA',
      'Peso': '3.2g',
      'Ancho banda': '2mm'
    },
    rating: 4.8,
    reviews: [
      {
        id: '1',
        userName: 'María García',
        rating: 5,
        comment: 'Hermoso anillo, la calidad es excepcional. Muy recomendado.',
        date: '2024-12-15',
        verified: true
      }
    ],
    isNew: false,
    isFeatured: true,
    createdAt: '2024-11-01',
    status: 'published'
  },
  {
    id: '2',
    title: 'Collar de Perlas Cultivadas',
    slug: 'collar-perlas-cultivadas',
    price: 450,
    images: [
      'https://images.unsplash.com/photo-1758541331106-f595bbea8534?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFybCUyMG5lY2tsYWNlJTIwZWxlZ2FudCUyMGpld2Vscnl8ZW58MXx8fHwxNzU5MTU3MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
    ],
    category: 'Collares',
    stock: 8,
    description: 'Collar clásico de perlas cultivadas de agua dulce con cierre de oro amarillo. Perfecto para looks elegantes y sofisticados.',
    specs: {
      'Material': 'Perlas cultivadas de agua dulce',
      'Cierre': 'Oro Amarillo 14k',
      'Tamaño perlas': '7-8mm',
      'Origen': 'China',
      'Lustre': 'Alto'
    },
    rating: 4.6,
    reviews: [],
    isNew: true,
    isFeatured: false,
    createdAt: '2024-12-01',
    status: 'published'
  },
  {
    id: '3',
    title: 'Aretes de Diamantes en Oro Rosa',
    slug: 'aretes-diamantes-oro-rosa',
    price: 850,
    images: [
      'https://images.unsplash.com/photo-1602751584549-44d0f48236a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwZWFycmluZ3MlMjBkaWFtb25kcyUyMGx1eHVyeXxlbnwxfHx8fDE3NTkxODQ3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    category: 'Aretes',
    stock: 12,
    description: 'Elegantes aretes tipo botón con diamantes en engaste de oro rosa. Diseño moderno y versátil.',
    specs: {
      'Material': 'Oro Rosa 18k',
      'Piedras': 'Diamantes 0.25ct total',
      'Cierre': 'Presión',
      'Peso': '1.8g cada uno'
    },
    rating: 4.9,
    reviews: [],
    isNew: false,
    isFeatured: true,
    createdAt: '2024-10-15',
    status: 'published'
  },
  {
    id: '4',
    title: 'Pulsera de Oro con Charms',
    slug: 'pulsera-oro-charms',
    price: 320,
    images: [
      'https://images.unsplash.com/photo-1655707063496-e1c00b3280de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYnJhY2VsZXQlMjBqZXdlbHJ5JTIwbHV4dXJ5fGVufDF8fHx8MTc1OTA2OTMwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    category: 'Pulseras',
    stock: 20,
    description: 'Pulsera de cadena de oro amarillo con charms intercambiables. Perfecta para personalizar tu estilo.',
    specs: {
      'Material': 'Oro Amarillo 14k',
      'Tipo cadena': 'Rolo',
      'Charms incluidos': '3',
      'Peso': '5.2g'
    },
    rating: 4.4,
    reviews: [],
    isNew: false,
    isFeatured: false,
    createdAt: '2024-09-20',
    status: 'published'
  },
  {
    id: '5',
    title: 'Anillo de Esmeralda Vintage',
    slug: 'anillo-esmeralda-vintage',
    price: 1850,
    images: [
      'https://images.unsplash.com/photo-1589674717843-f29fb2b722ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbWVyYWxkJTIwcmluZyUyMHZpbnRhZ2UlMjBqZXdlbHJ5fGVufDF8fHx8MTc1OTE4NDc3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    category: 'Anillos',
    stock: 5,
    description: 'Anillo vintage con esmeralda natural de Colombia y detalles en oro amarillo. Pieza única de colección.',
    specs: {
      'Material': 'Oro Amarillo 18k',
      'Piedra': 'Esmeralda natural 1.2ct',
      'Origen': 'Colombia',
      'Estilo': 'Vintage',
      'Año': '1960s inspirado'
    },
    rating: 5.0,
    reviews: [],
    isNew: false,
    isFeatured: true,
    createdAt: '2024-08-10',
    status: 'published'
  },
  {
    id: '6',
    title: 'Collar Gargantilla de Plata',
    slug: 'collar-gargantilla-plata',
    price: 180,
    images: [
      'https://images.unsplash.com/photo-1679973296637-1411c1d25c7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWx2ZXIlMjBjaG9rZXIlMjBuZWNrbGFjZSUyMG1vZGVybnxlbnwxfHx8fDE3NTkxODQ3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    ],
    category: 'Collares',
    stock: 25,
    description: 'Gargantilla moderna de plata esterlina con acabado pulido. Perfecta para uso diario.',
    specs: {
      'Material': 'Plata 925',
      'Acabado': 'Pulido',
      'Cierre': 'Mosquetón',
      'Peso': '8.5g'
    },
    rating: 4.3,
    reviews: [],
    isNew: true,
    isFeatured: false,
    createdAt: '2024-12-10',
    status: 'published'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'order_001',
    userId: 'user_client_1',
    items: [
      {
        productId: '1',
        quantity: 1,
        unitPrice: 299.99
      }
    ],
    subtotal: 299.99,
    taxes: 24.00,
    shipping: 0,
    total: 323.99,
    status: 'processing',
    createdAt: '2024-09-25',
    shippingAddress: {
      name: 'María González',
      email: 'maria@example.com',
      phone: '+34 666 777 888',
      address: 'Calle Falsa 123',
      city: 'Madrid',
      postalCode: '28001',
      country: 'España'
    }
  },
  {
    id: 'order_002',
    userId: 'user_client_2',
    items: [
      {
        productId: '2',
        quantity: 1,
        unitPrice: 159.99
      },
      {
        productId: '3',
        quantity: 2,
        unitPrice: 89.99
      }
    ],
    subtotal: 339.97,
    taxes: 27.20,
    shipping: 0,
    total: 367.17,
    status: 'shipped',
    createdAt: '2024-09-20',
    shippingAddress: {
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      phone: '+34 555 444 333',
      address: 'Avenida Principal 456',
      city: 'Barcelona',
      postalCode: '08001',
      country: 'España'
    }
  },
  {
    id: 'order_003',
    userId: 'user_client_1',
    items: [
      {
        productId: '5',
        quantity: 1,
        unitPrice: 1850.00
      }
    ],
    subtotal: 1850.00,
    taxes: 148.00,
    shipping: 0,
    total: 1998.00,
    status: 'completed',
    createdAt: '2024-09-15'
  }
];

// localStorage keys
export const STORAGE_KEYS = {
  PRODUCTS: 'rg_products',
  CART: 'rg_cart',
  ORDERS: 'rg_orders',
  USERS: 'rg_users',
  SETTINGS: 'rg_settings',
  CURRENT_USER: 'rg_current_user'
};

// localStorage 
export class StorageManager {
  static getProducts(): Product[] {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      this.setProducts(mockProducts);
      return mockProducts;
    }
    return JSON.parse(stored);
  }

  static setProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  static getCart(userId: string): Cart {
    const stored = localStorage.getItem(`${STORAGE_KEYS.CART}_${userId}`);
    if (!stored) {
      const emptyCart: Cart = { items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 };
      this.setCart(userId, emptyCart);
      return emptyCart;
    }
    return JSON.parse(stored);
  }

  static setCart(userId: string, cart: Cart): void {
    localStorage.setItem(`${STORAGE_KEYS.CART}_${userId}`, JSON.stringify(cart));
  }

  static getOrders(): Order[] {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!stored) {
      this.setOrders(mockOrders);
      return mockOrders;
    }
    return JSON.parse(stored);
  }

  static setOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  static getUsers(): User[] {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!stored) {
      this.setUsers(mockUsers);
      return mockUsers;
    }
    return JSON.parse(stored);
  }

  static setUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getCurrentUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  static getSettings(): Settings {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) {
      this.setSettings(mockSettings);
      return mockSettings;
    }
    return JSON.parse(stored);
  }

  static setSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
}

// Mock users data
export const mockUsers: User[] = [
  {
    id: 'user_client_1',
    role: 'client',
    name: 'María González',
    email: 'maria@example.com',
    password: 'demo123',
    wishlist: ['1', '3'],
    orders: [],
    addresses: [
      {
        id: 'addr_1',
        name: 'María González',
        address: 'Calle Falsa 123',
        city: 'Madrid',
        postalCode: '28001',
        country: 'España',
        isDefault: true
      }
    ],
    createdAt: '2024-01-15'
  },
  {
    id: 'user_client_2',
    role: 'client',
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    password: 'demo123',
    wishlist: ['2', '4', '5'],
    orders: [],
    addresses: [
      {
        id: 'addr_2',
        name: 'Carlos Rodríguez',
        address: 'Avenida Principal 456',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'España',
        isDefault: true
      }
    ],
    createdAt: '2024-02-10'
  },
  {
    id: 'user_admin_1',
    role: 'admin',
    name: 'Admin RenelyGems',
    email: 'admin@renelygems.com',
    password: 'admin123',
    wishlist: [],
    orders: [],
    addresses: [],
    createdAt: '2023-12-01'
  }
];

// Mock settings
export const mockSettings: Settings = {
  currency: 'USD',
  taxRate: 0.13,
  shippingCost: 3.50,
  freeShippingThreshold: 25.00
};