//src/lib/supabaseService.ts
import { supabase, handleSupabaseError } from './supabaseClient';
import type {
  Product,
  User,
  Cart,
  CartItem,
  Order,
  Settings
} from '../components/data/mockData';

async function getUserWishlist(userId: string): Promise<string[]> {
  try {
    const { data, error } = (await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId)) as { data: any[] | null; error: any };

    if (error) {
      console.error('Error al obtener wishlist:', error);
      return [];
    }

    return data?.map((item: any) => item.product_id) || [];
  } catch (error) {
    console.error('Error al obtener wishlist:', error);
    return [];
  }
}

// AUTH SERVICE
export class AuthService {
  // Registrar un nuevo usuario
   
  static async signUp(email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, 
          }
        }
      });

      if (authError) {
        return { user: null, error: handleSupabaseError(authError) };
      }

      if (!authData.user) {
        return { user: null, error: 'No se pudo crear el usuario' };
      }

      let profileData: any = null;
      let retries = 10; 
      let lastError: any = null;

      while (retries > 0 && !profileData) {
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const { data, error } = (await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle()) as { data: any; error: any };

        if (data) {
          profileData = data;
          break;
        }

        if (error) {
          lastError = error;
          console.error(`Intento ${11 - retries} - Error fetching profile:`, error);
        } else {
          console.log(`Intento ${11 - retries} - Perfil aún no creado, reintentando...`);
        }

        retries--;
      }

      if (!profileData) {
        console.error('Error final después de todos los reintentos:', lastError);
        console.error('User ID:', authData.user.id);
        return {
          user: null,
          error: 'No se pudo crear el perfil de usuario. El trigger podría no estar configurado correctamente. Revisa la consola del navegador para más detalles.'
        };
      }

      
      const wishlist = await getUserWishlist(profileData.id);

      // Convertir a formato User
      const user: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role as 'client' | 'admin',
        wishlist,
        orders: [],
        addresses: [],
        createdAt: profileData.created_at,
      };

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: handleSupabaseError(error) };
    }
  }

  // Iniciar sesión de usuario
   
  static async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Autenticar con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { user: null, error: handleSupabaseError(authError) };
      }

      if (!authData.user) {
        return { user: null, error: 'No se pudo iniciar sesión' };
      }

      // Obtener perfil del usuario
      const { data: profileData, error: profileError} = await supabase
        .from('profiles')
        .select('*, addresses(*)')
        .eq('id', authData.user.id)
        .single() as { data: any; error: any };

      if (profileError) {
        return { user: null, error: handleSupabaseError(profileError) };
      }

      const wishlist = await getUserWishlist(profileData.id);

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role as 'client' | 'admin',
        wishlist,
        orders: [],
        addresses: profileData.addresses || [],
        createdAt: profileData.created_at,
      };

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: handleSupabaseError(error) };
    }
  }

  // Cerrar la sesión del usuario
   
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: handleSupabaseError(error) };
      }
      return { error: null };
    } catch (error: any) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Obtener el usuario actual
   
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*, addresses(*)')
        .eq('id', session.user.id)
        .single() as { data: any; error: any };

      if (error || !profileData) {
        return null;
      }

      // Get wishlist from separate table
      const wishlist = await WishlistService.getWishlist(profileData.id);

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role as 'client' | 'admin',
        wishlist,
        orders: [],
        addresses: profileData.addresses || [],
        createdAt: profileData.created_at,
      };

      return user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }
}

// PRODUCTS SERVICE

export class ProductsService {

  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          reviews (
            id,
            user_name,
            rating,
            comment,
            created_at,
            verified
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener productos:', error);
        return [];
      }

      // Convertir a formato Product
      return data.map(p => this.convertToProduct(p));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  // Obtener todos los productos 

  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          reviews (
            id,
            user_name,
            rating,
            comment,
            created_at,
            verified
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener productos:', error);
        return [];
      }

      return data.map(p => this.convertToProduct(p));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  // Obtener un producto por ID
   
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          reviews (
            id,
            user_name,
            rating,
            comment,
            created_at,
            verified
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error al obtener producto:', error);
        return null;
      }

      return this.convertToProduct(data);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return null;
    }
  }

  // Crear un nuevo producto 
   
  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'reviews'>): Promise<{ product: Product | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: product.title,
          slug: product.slug,
          price: product.price,
          sale_price: product.salePrice,
          images: product.images,
          category: product.category,
          stock: product.stock,
          description: product.description,
          specs: product.specs as any,
          rating: product.rating,
          is_new: product.isNew,
          is_featured: product.isFeatured,
          status: product.status,
        } as any)
        .select()
        .single() as { data: any; error: any };

      if (error) {
        return { product: null, error: handleSupabaseError(error) };
      }

      return { product: this.convertToProduct(data), error: null };
    } catch (error: any) {
      return { product: null, error: handleSupabaseError(error) };
    }
  }

  // Actualizar un producto existente
 
  static async updateProduct(id: string, updates: Partial<Product>): Promise<{ product: Product | null; error: string | null }> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.slug) updateData.slug = updates.slug;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.salePrice !== undefined) updateData.sale_price = updates.salePrice;
      if (updates.images) updateData.images = updates.images;
      if (updates.category) updateData.category = updates.category;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.description) updateData.description = updates.description;
      if (updates.specs) updateData.specs = updates.specs;
      if (updates.isNew !== undefined) updateData.is_new = updates.isNew;
      if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
      if (updates.status) updateData.status = updates.status;

      const { data, error } = (await (supabase as any)
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()) as { data: any; error: any };

      if (error) {
        return { product: null, error: handleSupabaseError(error) };
      }

      return { product: this.convertToProduct(data), error: null };
    } catch (error: any) {
      return { product: null, error: handleSupabaseError(error) };
    }
  }

  // Eliminar un producto 

  static async deleteProduct(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await (supabase as any)
        .from('products')
        .update({ status: 'draft' })
        .eq('id', id);

      if (error) {
        return { error: handleSupabaseError(error) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Convertir un registro de BD a tipo Product
   
  private static convertToProduct(data: any): Product {
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      price: parseFloat(data.price),
      salePrice: data.sale_price ? parseFloat(data.sale_price) : undefined,
      images: data.images,
      category: data.category,
      stock: data.stock,
      description: data.description,
      specs: data.specs || {},
      rating: parseFloat(data.rating) || 0,
      reviews: data.reviews?.map((r: any) => ({
        id: r.id,
        userName: r.user_name,
        rating: r.rating,
        comment: r.comment,
        date: r.created_at,
        verified: r.verified,
      })) || [],
      isNew: data.is_new,
      isFeatured: data.is_featured,
      createdAt: data.created_at,
      status: data.status,
    };
  }
}

// CART SERVICE

export class CartService {
  //Obtener el carrito del usuario actual
   
  static async getCart(userId: string): Promise<Cart> {
    try {
      // Obtener items del carrito directamente (sin tabla carts)
      const { data: itemsData, error: itemsError } = (await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)) as { data: any[] | null; error: any };

      if (itemsError || !itemsData) {
        return { items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 };
      }

      // Convertir a formato CartItem
      const items: CartItem[] = itemsData.map((item: any) => ({
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
      }));

      // Calcular totales
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const settings = await SettingsService.getSettings();
      const taxes = subtotal * settings.taxRate;
      const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
      const total = subtotal + taxes + shipping;

      return { items, subtotal, taxes, shipping, total };
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      return { items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 };
    }
  }

  // Añadir un item al carrito
   
  static async addToCart(userId: string, productId: string, unitPrice: number): Promise<{ error: string | null }> {
    try {
      // Verificar si el item ya existe
      const { data: existingItem } = (await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()) as { data: any; error: any };

      if (existingItem) {
        // Actualizar cantidad
        const { error } = (await (supabase as any)
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)) as { error: any };

        if (error) {
          return { error: handleSupabaseError(error) };
        }
      } else {
        // Insertar nuevo item
        const { error} = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity: 1,
            unit_price: unitPrice,
          } as any);

        if (error) {
          console.error('Error al insertar en carrito:', error);
          return { error: handleSupabaseError(error) };
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error en addToCart:', error);
      return { error: handleSupabaseError(error) };
    }
  }

  // Actualizar la cantidad de un item en el carrito
  
  static async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<{ error: string | null }> {
    try {
      if (quantity <= 0) {
        // Eliminar item
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) {
          return { error: handleSupabaseError(error) };
        }
      } else {
        // Actualizar cantidad
        const { error } = (await (supabase as any)
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userId)
          .eq('product_id', productId)) as { error: any };

        if (error) {
          return { error: handleSupabaseError(error) };
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Vaciar el carrito del usuario
   
  static async clearCart(userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        return { error: handleSupabaseError(error) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: handleSupabaseError(error) };
    }
  }
}

// ORDERS SERVICE

export class OrdersService {
  // Crea un nuevo pedido
   
  static async createOrder(orderData: any): Promise<{ orderId: string | null; error: string | null }> {
    try {
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          subtotal: orderData.subtotal,
          taxes: orderData.taxes,
          shipping: orderData.shipping,
          total: orderData.total,
          status: 'pending',
          shipping_name: orderData.shippingInfo.name,
          shipping_email: orderData.shippingInfo.email,
          shipping_phone: orderData.shippingInfo.phone,
          shipping_address: orderData.shippingInfo.address || '',
          shipping_city: orderData.shippingInfo.city || '',
          shipping_postal_code: orderData.shippingInfo.postalCode || '',
          shipping_country: orderData.shippingInfo.country,
        } as any)
        .select()
        .single() as { data: any; error: any };

      if (orderError) {
        console.error('Error al crear orden:', orderError);
        return { orderId: null, error: handleSupabaseError(orderError) };
      }

      // Insertar items del pedido
      const orderItemsData = orderData.items.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.productId,
        product_title: 'Product', 
        product_image: null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData as any);

      if (itemsError) {
        console.error('Error al insertar items:', itemsError);
        return { orderId: null, error: handleSupabaseError(itemsError) };
      }

      for (const item of orderData.items) {
        const { data: product } = (await supabase
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .single()) as { data: any; error: any };

        if (product && product.stock !== undefined) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await (supabase as any)
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.productId);
        }
      }

      return { orderId: newOrder.id, error: null };
    } catch (error: any) {
      console.error('Error en createOrder:', error);
      return { orderId: null, error: handleSupabaseError(error) };
    }
  }

  // Obtiene todos los pedidos de un usuario
   
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener pedidos:', error);
        return [];
      }

      return data.map(o => this.convertToOrder(o));
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return [];
    }
  }

  // Obtiene todos los pedidos

  static async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = (await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          profiles!orders_user_id_fkey (name)
        `)
        .order('created_at', { ascending: false })) as { data: any[] | null; error: any };

      if (error) {
        console.error('Error al obtener pedidos:', error);
        return [];
      }

      if (!data) return [];

      const productIds = new Set<string>();
      data.forEach((order: any) => {
        order.order_items?.forEach((item: any) => {
          productIds.add(item.product_id);
        });
      });

      const { data: products } = (await supabase
        .from('products')
        .select('id, title')
        .in('id', Array.from(productIds))) as { data: any[] | null; error: any };

      const productMap = new Map(products?.map((p: any) => [p.id, p.title]) || []);

      return data.map((o: any) => this.convertToOrder(o, productMap));
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return [];
    }
  }

  // Actualiza el estado de un pedido

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ error: string | null }> {
    try {
      const { data: currentOrder } = (await supabase
        .from('orders')
        .select('status, order_items(product_id, quantity)')
        .eq('id', orderId)
        .single()) as { data: any; error: any };

      const previousStatus = currentOrder?.status;

      const { error } = (await (supabase as any)
        .from('orders')
        .update({ status })
        .eq('id', orderId)) as { error: any };

      if (error) {
        return { error: handleSupabaseError(error) };
      }

      if (currentOrder?.order_items) {
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
          for (const item of currentOrder.order_items) {
            const { data: product } = (await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single()) as { data: any; error: any };

            if (product && product.stock !== undefined) {
              const newStock = product.stock + item.quantity;
              await (supabase as any)
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.product_id);
            }
          }
        }

        else if (previousStatus === 'cancelled' && status !== 'cancelled') {
          for (const item of currentOrder.order_items) {
            const { data: product } = (await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single()) as { data: any; error: any };

            if (product && product.stock !== undefined) {
              const newStock = Math.max(0, product.stock - item.quantity);
              await (supabase as any)
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.product_id);
            }
          }
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Convierte un registro de BD a tipo Order

  private static convertToOrder(data: any, productMap?: Map<string, string>): Order {
    return {
      id: data.id,
      userId: data.user_id,
      userName: data.profiles?.name || data.shipping_name, 
      items: data.order_items?.map((item: any) => ({
        productId: item.product_id,
        productTitle: productMap?.get(item.product_id), 
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
      })) || [],
      subtotal: parseFloat(data.subtotal),
      taxes: parseFloat(data.taxes),
      shipping: parseFloat(data.shipping),
      total: parseFloat(data.total),
      status: data.status,
      shippingAddress: {
        name: data.shipping_name,
        email: data.shipping_email,
        phone: data.shipping_phone,
        address: data.shipping_address,
        city: data.shipping_city,
        postalCode: data.shipping_postal_code,
        country: data.shipping_country,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// WISHLIST SERVICE

export class WishlistService {
  // Añade un producto a la wishlist

  static async addToWishlist(userId: string, productId: string): Promise<{ error: string | null }> {
    try {
      const { data: existingItem } = (await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()) as { data: any; error: any };

      if (existingItem) {
        return { error: null };
      }

      const { error } = await (supabase as any)
        .from('wishlist')
        .insert({
          user_id: userId,
          product_id: productId
        });

      if (error) {
        return { error: handleSupabaseError(error) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Elimina un producto de la wishlist

  static async removeFromWishlist(userId: string, productId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        return { error: handleSupabaseError(error) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Obtiene la wishlist de un usuario

  static async getWishlist(userId: string): Promise<string[]> {
    return getUserWishlist(userId);
  }
}

// SETTINGS SERVICE

export class SettingsService {

  // Obtiene las configuraciones del sistema
   
  static async getSettings(): Promise<Settings> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value') as { data: any[] | null; error: any };

      if (error || !data) {
        console.error('Error al obtener configuraciones:', error);
        return this.getDefaultSettings();
      }

      const settings: any = {};
      data.forEach((item: any) => {
        settings[item.key] = JSON.parse(item.value);
      });

      return {
        currency: settings.currency || 'USD',
        taxRate: parseFloat(settings.tax_rate) || 0.08,
        shippingCost: parseFloat(settings.shipping_cost) || 12.99,
        freeShippingThreshold: parseFloat(settings.free_shipping_threshold) || 150.00,
      };
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      return this.getDefaultSettings();
    }
  }

  // Actualiza una configuración
   
  static async updateSetting(key: string, value: any): Promise<{ error: string | null }> {
    try {
      const { error } = (await (supabase as any)
        .from('settings')
        .update({ value: JSON.stringify(value) })
        .eq('key', key)) as { error: any };

      if (error) {
        return { error: handleSupabaseError(error) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Obtiene configuraciones por defecto
   
  private static getDefaultSettings(): Settings {
    return {
      currency: 'USD',
      taxRate: 0.08,
      shippingCost: 12.99,
      freeShippingThreshold: 150.00,
    };
  }
}