import { useState } from 'react';
import { type Cart } from './data/mockData';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { ArrowLeft, CreditCard, Banknote, Upload, X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { OrdersService, CartService, StorageService } from '../lib/supabaseService';

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
        paymentProofUrl: null,
      };

      const { orderId, error } = await OrdersService.createOrder(orderData);

      if (error || !orderId) {
        toast.error(error || 'Error al crear el pedido');
        setIsSubmitting(false);
        return;
      }

      // Si hay comprobante de pago, subirlo
      if (transferProof && paymentMethod === 'transfer') {
        const { url, error: uploadError } = await StorageService.uploadPaymentProof(
          userId,
          orderId,
          transferProof
        );

        if (uploadError) {
          console.error('Error al subir comprobante:', uploadError);
          toast.error('Pedido creado, pero hubo un error al subir el comprobante. Envíalo por WhatsApp.');
        } else if (url) {
          // Actualizar la orden con la URL del comprobante
          const { error: updateError } = await OrdersService.updatePaymentProof(orderId, url);
          if (updateError) {
            console.error('Error al actualizar URL del comprobante:', updateError);
          }
        }
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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-6" />
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            El carrito está vacío
          </h2>
          <p className="text-gray-500 mb-8 font-light">
            Agrega productos para proceder con tu compra
          </p>
          <Button
            onClick={() => onNavigate('catalog')}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-none h-12 px-8 font-light"
          >
            Ir al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => onNavigate('cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 font-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al carrito
          </button>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900">
            Finalizar compra
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información de Contacto */}
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-xl font-light text-gray-900 mb-6">
                Información de contacto
              </h2>

              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="name" className="text-sm font-light text-gray-700 mb-2 block">
                      Nombre completo *
                    </Label>
                    <Input
                      id="name"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Juan Pérez"
                      className="rounded-none border-gray-200 focus:border-gray-900 font-light h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-light text-gray-700 mb-2 block">
                      Teléfono *
                    </Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="7207-0407"
                      className="rounded-none border-gray-200 focus:border-gray-900 font-light h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-light text-gray-700 mb-2 block">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    className="rounded-none border-gray-200 focus:border-gray-900 font-light h-12"
                  />
                </div>

                {/* Tipo de entrega */}
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-light text-gray-700">
                    Tipo de entrega *
                  </Label>
                  <RadioGroup value={deliveryType} onValueChange={(value: 'home' | 'pickup') => setDeliveryType(value)}>
                    <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                      <RadioGroupItem value="home" id="home" />
                      <Label htmlFor="home" className="font-light cursor-pointer flex-1">
                        Entrega a domicilio
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="font-light cursor-pointer flex-1">
                        Recoger en tienda
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {deliveryType === 'home' && (
                  <>
                    <div>
                      <Label htmlFor="address" className="text-sm font-light text-gray-700 mb-2 block">
                        Dirección *
                      </Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Calle Principal, Casa #123"
                        className="rounded-none border-gray-200 focus:border-gray-900 font-light h-12"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                      <div className="md:col-span-1">
                        <Label htmlFor="city" className="text-sm font-light text-gray-700 mb-2 block">
                          Ciudad *
                        </Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="San Salvador"
                          className="rounded-none border-gray-200 focus:border-gray-900 font-light h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode" className="text-sm font-light text-gray-700 mb-2 block">
                          Código Postal
                        </Label>
                        <Input
                          id="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="1101"
                          className="rounded-none border-gray-200 focus:border-gray-900 font-light h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-sm font-light text-gray-700 mb-2 block">
                          País
                        </Label>
                        <Input
                          id="country"
                          value={shippingInfo.country}
                          disabled
                          className="rounded-none border-gray-200 font-light h-12 bg-gray-50"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="notes" className="text-sm font-light text-gray-700 mb-2 block">
                    Notas adicionales (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instrucciones especiales, referencias, etc."
                    rows={3}
                    className="rounded-none border-gray-200 focus:border-gray-900 font-light"
                  />
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-xl font-light text-gray-900 mb-6">
                Método de pago
              </h2>

              <RadioGroup value={paymentMethod} onValueChange={(value: 'transfer' | 'cash_on_delivery') => setPaymentMethod(value)}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-gray-400 transition-colors">
                    <RadioGroupItem value="cash_on_delivery" id="cash" className="mt-1" />
                    <Label htmlFor="cash" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Banknote className="h-5 w-5 text-gray-600" />
                        <span className="font-normal text-gray-900">Pago contra entrega</span>
                      </div>
                      <p className="text-sm text-gray-500 font-light">
                        Paga en efectivo al recibir tu pedido
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-4 border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-gray-400 transition-colors">
                    <RadioGroupItem value="transfer" id="transfer" className="mt-1" />
                    <Label htmlFor="transfer" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span className="font-normal text-gray-900">Transferencia Bancaria</span>
                      </div>
                      <p className="text-sm text-gray-500 font-light">
                        Transfiere a nuestra cuenta bancaria
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === 'transfer' && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg space-y-4">
                  <h4 className="font-normal text-gray-900">Datos Bancarios:</h4>
                  <div className="space-y-2 text-sm font-light text-gray-700">
                    <p><span className="font-normal">Banco:</span> BancoAgricola</p>
                    <p><span className="font-normal">Tipo de cuenta:</span> Cuenta de ahorros</p>
                    <p><span className="font-normal">Número de cuenta:</span> 32723827493</p>
                  </div>

                  <div className="h-px bg-gray-200 my-4" />

                  <div className="space-y-3">
                    <Label htmlFor="proof" className="text-sm font-light text-gray-700">
                      Comprobante de transferencia (opcional)
                    </Label>
                    <p className="text-xs text-gray-500 font-light">
                      Puedes subir el comprobante ahora o enviarlo por WhatsApp después
                    </p>

                    {!transferProof ? (
                      <Input
                        id="proof"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="cursor-pointer rounded-none border-gray-200 font-light"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                        <Upload className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-light flex-1 truncate">{transferProof.name}</span>
                        <button
                          onClick={removeFile}
                          className="text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-8 sticky top-8">
              <h2 className="text-xl font-light text-gray-900 mb-8">
                Resumen del pedido
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 font-light">
                  <span>Productos ({cart.items.length})</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600 font-light">
                  <span>Impuestos</span>
                  <span>${cart.taxes.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600 font-light">
                  <span>Envío</span>
                  <span>
                    {cart.shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      `$${cart.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="h-px bg-gray-200 my-4" />

                <div className="flex justify-between text-lg text-gray-900">
                  <span className="font-normal">Total</span>
                  <span className="font-normal">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-none h-14 font-light text-base mb-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar pedido'}
              </Button>

              <p className="text-xs text-gray-500 font-light text-center">
                Al confirmar, serás redirigido a WhatsApp para coordinar la entrega
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
