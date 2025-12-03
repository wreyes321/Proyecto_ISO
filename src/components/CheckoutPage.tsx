import { useState } from 'react';
import { type Cart } from './data/mockData';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { ArrowLeft, CreditCard, Banknote, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { OrdersService, CartService } from '../lib/supabaseService';

interface CheckoutPageProps {
  cart: Cart;
  onNavigate: (destination: string) => void;
  onUpdateCart: (cart: Cart) => void;
  userId: string;
  userEmail: string;
}

export function CheckoutPage({ cart, onNavigate, onUpdateCart, userId, userEmail }: CheckoutPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash_on_delivery'>('cash_on_delivery');
  const [deliveryType, setDeliveryType] = useState<'home' | 'pickup'>('home');
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: userEmail || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'El Salvador',
  });

  const [notes, setNotes] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast.error('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      setTransferProof(file);
      toast.success('Comprobante cargado');
    }
  };

  const removeFile = () => {
    setTransferProof(null);
  };

  const validateForm = () => {
    if (!shippingInfo.name.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return false;
    }
    if (!shippingInfo.email.trim()) {
      toast.error('Por favor ingresa tu email');
      return false;
    }
    if (!shippingInfo.phone.trim()) {
      toast.error('Por favor ingresa tu teléfono');
      return false;
    }
    if (deliveryType === 'home') {
      if (!shippingInfo.address.trim()) {
        toast.error('Por favor ingresa tu dirección');
        return false;
      }
      if (!shippingInfo.city.trim()) {
        toast.error('Por favor ingresa tu ciudad');
        return false;
      }
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    if (cart.items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        userId,
        items: cart.items,
        subtotal: cart.subtotal,
        taxes: cart.taxes,
        shipping: cart.shipping,
        total: cart.total,
        paymentMethod,
        deliveryType,
        shippingInfo,
        notes: notes.trim() || null,
      };

      const { orderId, error } = await OrdersService.createOrder(orderData);

      if (error || !orderId) {
        toast.error(error || 'Error al crear el pedido');
        setIsSubmitting(false);
        return;
      }

      await CartService.clearCart(userId);
      const emptyCart = await CartService.getCart(userId);
      onUpdateCart(emptyCart);

      // Mensaje de whatsapp
      const whatsappMessage = generateWhatsAppMessage(orderId);
      const whatsappUrl = `https://wa.me/50372070407?text=${encodeURIComponent(whatsappMessage)}`;

      // Mensaje de exito
      toast.success('¡Pedido realizado con éxito!');

      // Redireccion a whatsapp
      window.open(whatsappUrl, '_blank');

      setTimeout(() => {
        onNavigate('home');
      }, 2000);

    } catch (error) {
      console.error('Error al procesar pedido:', error);
      toast.error('Error al procesar el pedido');
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppMessage = (orderId: string) => {
    let message = `Hola! He realizado un pedido:\n\n`;
    message += `*Pedido #${orderId.slice(-8).toUpperCase()}*\n\n`;

    message += `*Productos:*\n`;
    cart.items.forEach((item, index) => {
      message += `${index + 1}. Producto ID: ${item.productId.slice(-6)}`;
      message += ` - Cantidad: ${item.quantity}\n`;
    });

    message += `\n*Resumen:*\n`;
    message += `Subtotal: $${cart.subtotal.toFixed(2)}\n`;
    message += `Impuestos: $${cart.taxes.toFixed(2)}\n`;
    message += `Envío: ${cart.shipping === 0 ? 'Gratis' : '$' + cart.shipping.toFixed(2)}\n`;
    message += `*Total: $${cart.total.toFixed(2)}*\n\n`;

    message += `*Método de pago:* ${paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Contra entrega'}\n`;
    message += `*Entrega:* ${deliveryType === 'home' ? 'A domicilio' : 'Recoger en tienda'}\n\n`;

    message += `*Datos de contacto:*\n`;
    message += `Nombre: ${shippingInfo.name}\n`;
    message += `Teléfono: ${shippingInfo.phone}\n`;
    if (deliveryType === 'home') {
      message += `Dirección: ${shippingInfo.address}, ${shippingInfo.city}\n`;
    }

    if (paymentMethod === 'transfer' && !transferProof) {
      message += `\n*Enviaré el comprobante de transferencia.*`;
    }

    if (notes) {
      message += `\n\n*Notas:* ${notes}`;
    }

    return message;
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="mb-4">El carrito está vacío</h2>
          <Button onClick={() => onNavigate('catalog')}>
            Ir al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => onNavigate('cart')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al carrito
        </Button>
        <h1>Finalizar Compra</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="7207-0407"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              {/* Tipo de delivery  */}
              <div className="space-y-2">
                <Label>Tipo de entrega *</Label>
                <RadioGroup value={deliveryType} onValueChange={(value: 'home' | 'pickup') => setDeliveryType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="home" id="home" />
                    <Label htmlFor="home" className="font-normal cursor-pointer">Entrega a domicilio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="font-normal cursor-pointer">Recoger en tienda</Label>
                  </div>
                </RadioGroup>
              </div>

              {deliveryType === 'home' && (
                <>
                  <div>
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Calle Principal, Casa #123"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="San Salvador"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder="1101"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={shippingInfo.country}
                        disabled
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales, referencias, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Metodo de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={(value: 'transfer' | 'cash_on_delivery') => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="cash_on_delivery" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 font-normal cursor-pointer flex-1">
                    <Banknote className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Pago contra entrega</div>
                      <div className="text-sm text-muted-foreground">Paga en efectivo al recibir tu pedido</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer" className="flex items-center gap-2 font-normal cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Transferencia Bancaria</div>
                      <div className="text-sm text-muted-foreground">Transfiere a nuestra cuenta bancaria</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'transfer' && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Datos Bancarios:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Banco:</strong> BancoAgricola</p>
                    <p><strong>Tipo de cuenta:</strong> Cuenta de ahorros</p>
                    <p><strong>Número de cuenta:</strong> 32723827493</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="proof">Comprobante de transferencia (opcional)</Label>
                    <p className="text-xs text-muted-foreground">
                      Puedes subir el comprobante ahora o enviarlo por WhatsApp después
                    </p>

                    {!transferProof ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id="proof"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-background rounded border">
                        <Upload className="h-4 w-4 text-green-600" />
                        <span className="text-sm flex-1">{transferProof.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen de orden */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Productos ({cart.items.length})</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuestos</span>
                  <span>${cart.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>
                    {cart.shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      `$${cart.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleSubmitOrder}
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Al confirmar, serás redirigido a WhatsApp para coordinar la entrega
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
