import { useState, useEffect } from 'react';
import { StorageManager, type Cart, type Product } from './data/mockData';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CartPageProps {
  cart: Cart;
  onNavigate: (destination: string) => void;
  onUpdateCart: (cart: Cart) => void;
  isAuthenticated: boolean;
  userId?: string;
}

export function CartPage({ cart, onNavigate, onUpdateCart, isAuthenticated, userId }: CartPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const allProducts = StorageManager.getProducts();
    setProducts(allProducts);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="mb-4">Inicia sesión para ver tu carrito</h2>
          <p className="text-muted-foreground mb-6">
            Necesitas estar autenticado para acceder a tu carrito de compras.
          </p>
          <Button onClick={() => onNavigate('auth')}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    const newCart = { ...cart };
    const itemIndex = newCart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex >= 0) {
      newCart.items[itemIndex].quantity = newQuantity;
      
      // Recalculate totals
      recalculateCart(newCart);
      onUpdateCart(newCart);
      
      if (userId) {
        StorageManager.setCart(userId, newCart);
      }
    }
  };

  const removeItem = (productId: string) => {
    const newCart = { ...cart };
    newCart.items = newCart.items.filter(item => item.productId !== productId);
    
    recalculateCart(newCart);
    onUpdateCart(newCart);
    
    if (userId) {
      StorageManager.setCart(userId, newCart);
    }
    
    toast.success('Producto eliminado del carrito');
  };

  const recalculateCart = (cartToUpdate: Cart) => {
    const settings = StorageManager.getSettings();
    
    cartToUpdate.subtotal = cartToUpdate.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    cartToUpdate.taxes = cartToUpdate.subtotal * settings.taxRate;
    cartToUpdate.shipping = cartToUpdate.subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
    cartToUpdate.total = cartToUpdate.subtotal + cartToUpdate.taxes + cartToUpdate.shipping;
  };

  const applyPromoCode = () => {
    // Simple promo code simulation
    if (promoCode.toLowerCase() === 'welcome10') {
      const newCart = { ...cart };
      newCart.subtotal = newCart.subtotal * 0.9; // 10% discount
      recalculateCart(newCart);
      onUpdateCart(newCart);
      
      if (userId) {
        StorageManager.setCart(userId, newCart);
      }
      
      toast.success('Código promocional aplicado: 10% de descuento');
      setPromoCode('');
    } else if (promoCode) {
      toast.error('Código promocional no válido');
    }
  };

  const proceedToCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    // Check stock availability
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        toast.error(`Stock insuficiente para ${product?.title || 'un producto'}`);
        return;
      }
    }

    // For now, simulate checkout
    toast.success('Redirigiendo al checkout...');
    // onNavigate('checkout');
  };

  const settings = StorageManager.getSettings();
  const currencySymbol = settings.currency === 'USD' ? '$' : '€';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => onNavigate('catalog')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continuar comprando
        </Button>
        <h1>Carrito de Compras</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="mb-4">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6">
            Descubre nuestra colección de joyería exclusiva.
          </p>
          <Button onClick={() => onNavigate('catalog')}>
            Explorar productos
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;

              return (
                <Card key={`${item.productId}-${item.variant.size}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.title}</h3>
                        {item.variant.size && (
                          <p className="text-sm text-muted-foreground">
                            Talla: {item.variant.size}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {currencySymbol}{item.unitPrice} c/u
                        </p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= product.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-medium">
                              {currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{cart.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Impuestos:</span>
                  <span>{currencySymbol}{cart.taxes.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>
                    {cart.shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      `${currencySymbol}${cart.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{currencySymbol}{cart.total.toFixed(2)}</span>
                </div>
                
                <Button onClick={proceedToCheckout} className="w-full" size="lg">
                  Proceder al pago
                </Button>
                
                {cart.subtotal < settings.freeShippingThreshold && (
                  <p className="text-sm text-muted-foreground text-center">
                    Añade {currencySymbol}{(settings.freeShippingThreshold - cart.subtotal).toFixed(2)} más para envío gratuito
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Código promocional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingresa tu código"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={applyPromoCode}>
                    Aplicar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Prueba: WELCOME10
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}