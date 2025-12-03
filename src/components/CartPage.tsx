import { useState, useEffect } from 'react';
import { type Cart, type Product } from './data/mockData';
import { Button } from './ui/button';
import { Minus, Plus, X, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { CartService, ProductsService, SettingsService } from '../lib/supabaseService';

interface CartPageProps {
  cart: Cart;
  onNavigate: (destination: string) => void;
  onUpdateCart: (cart: Cart) => void;
  isAuthenticated: boolean;
  userId?: string;
}

export function CartPage({ cart, onNavigate, onUpdateCart, isAuthenticated, userId }: CartPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState({ currency: 'USD', freeShippingThreshold: 25 });

  useEffect(() => {
    const loadData = async () => {
      const allProducts = await ProductsService.getProducts();
      setProducts(allProducts);

      const appSettings = await SettingsService.getSettings();
      setSettings(appSettings);
    };

    loadData();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-6" />
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Inicia sesión para ver tu carrito
          </h2>
          <p className="text-gray-500 mb-8 font-light">
            Necesitas estar autenticado para acceder a tu carrito de compras.
          </p>
          <Button
            onClick={() => onNavigate('auth')}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-none h-12 px-8 font-light"
          >
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1 || !userId) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    const { error } = await CartService.updateCartItemQuantity(
      userId,
      productId,
      newQuantity
    );

    if (error) {
      toast.error(error);
      return;
    }

    const updatedCart = await CartService.getCart(userId);
    onUpdateCart(updatedCart);
  };

  const removeItem = async (productId: string) => {
    if (!userId) return;

    const { error } = await CartService.updateCartItemQuantity(
      userId,
      productId,
      0
    );

    if (error) {
      toast.error(error);
      return;
    }

    const updatedCart = await CartService.getCart(userId);
    onUpdateCart(updatedCart);

    toast.success('Producto eliminado');
  };

  const proceedToCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        toast.error(`Stock insuficiente para ${product?.title || 'un producto'}`);
        return;
      }
    }

    onNavigate('checkout');
  };

  const currencySymbol = settings.currency === 'USD' ? '$' : '€';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 font-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar comprando
          </button>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900">
            Carrito de compras
          </h1>
        </div>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg p-16 text-center">
            <ShoppingBag className="mx-auto h-20 w-20 text-gray-300 mb-6" />
            <h2 className="text-2xl font-light text-gray-900 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-500 mb-8 font-light">
              Descubre nuestra colección de joyería exclusiva
            </p>
            <Button
              onClick={() => onNavigate('catalog')}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-none h-12 px-8 font-light"
            >
              Explorar productos
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;

                return (
                  <div key={item.productId} className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-6">
                      {/* Imagen */}
                      <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info del producto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-normal text-gray-900 mb-1 truncate">
                              {product.title}
                            </h3>
                            <p className="text-sm text-gray-500 font-light">
                              {currencySymbol}{item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-400 hover:text-gray-900 transition-colors ml-4"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Controles de cantidad */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-6 text-sm font-light">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= product.stock}
                              className="p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <span className="text-lg font-normal text-gray-900">
                            {currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-8 sticky top-8">
                <h2 className="text-xl font-light text-gray-900 mb-8">
                  Resumen
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{cart.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Impuestos</span>
                    <span>{currencySymbol}{cart.taxes.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Envío</span>
                    <span>
                      {cart.shipping === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        `${currencySymbol}${cart.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="h-px bg-gray-200 my-4" />

                  <div className="flex justify-between text-lg text-gray-900">
                    <span className="font-normal">Total</span>
                    <span className="font-normal">{currencySymbol}{cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {cart.subtotal < settings.freeShippingThreshold && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-900 font-light text-center">
                      Añade {currencySymbol}{(settings.freeShippingThreshold - cart.subtotal).toFixed(2)} más para envío gratuito
                    </p>
                  </div>
                )}

                <Button
                  onClick={proceedToCheckout}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-none h-14 font-light text-base group"
                >
                  Proceder al pago
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
