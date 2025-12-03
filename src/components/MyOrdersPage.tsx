import { useState, useEffect } from 'react';
import { type Order, type Product } from './data/mockData';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Package, Star } from 'lucide-react';
import { toast } from 'sonner';
import { OrdersService, ProductsService, ReviewsService } from '../lib/supabaseService';

interface MyOrdersPageProps {
  onNavigate: (destination: string, productId?: string) => void;
  userId: string;
}

interface ReviewFormData {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
}

export function MyOrdersPage({ onNavigate, userId }: MyOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState<ReviewFormData | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const userOrders = await OrdersService.getUserOrders(userId);
      setOrders(userOrders);

      // Cargar información de productos
      const productIds = new Set<string>();
      userOrders.forEach(order => {
        order.items.forEach(item => productIds.add(item.productId));
      });

      const allProducts = await ProductsService.getProducts();
      const productMap = new Map<string, Product>();
      allProducts.forEach(product => {
        if (productIds.has(product.id)) {
          productMap.set(product.id, product);
        }
      });
      setProducts(productMap);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReview = (productId: string, orderId: string) => {
    setReviewForm({
      productId,
      orderId,
      rating: 5,
      comment: ''
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewForm) return;

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error('Selecciona una calificación válida');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await ReviewsService.createReview({
        userId,
        productId: reviewForm.productId,
        orderId: reviewForm.orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success('¡Gracias por tu calificación!');
      setReviewForm(null);
      loadOrders(); 
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error al enviar calificación');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: 'Pendiente' },
      processing: { variant: 'default' as const, text: 'Procesando' },
      shipped: { variant: 'outline' as const, text: 'Enviado' },
      completed: { variant: 'default' as const, text: 'Completado' },
      cancelled: { variant: 'destructive' as const, text: 'Cancelado' }
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const canReview = (order: Order) => {
    return order.status === 'completed' || order.status === 'shipped';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-4 animate-pulse" />
          <p className="text-gray-500 font-light">Cargando pedidos...</p>
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
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 font-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900">
            Mis pedidos
          </h1>
          <p className="text-gray-500 font-light mt-2">
            Historial completo de tus compras
          </p>
        </div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-light text-gray-900 mb-2">
                No tienes pedidos aún
              </h3>
              <p className="text-gray-500 font-light mb-6">
                Explora nuestra colección y realiza tu primera compra
              </p>
              <Button
                onClick={() => onNavigate('catalog')}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-none h-12 px-8 font-light"
              >
                Ver catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Order header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-normal text-gray-900 mb-1">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500 font-light">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-normal text-gray-900 mt-2">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="space-y-4">
                    {order.items.map((item, idx) => {
                      const product = products.get(item.productId);
                      return (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          {/* Product image */}
                          {product?.images[0] && (
                            <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                              <img
                                src={product.images[0]}
                                alt={item.productTitle || 'Producto'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-normal text-gray-900 truncate">
                              {item.productTitle || `Producto ${item.productId.slice(0, 8)}`}
                            </h4>
                            <p className="text-sm text-gray-500 font-light">
                              Cantidad: {item.quantity} × ${item.unitPrice.toFixed(2)}
                            </p>
                            <p className="text-sm font-normal text-gray-900 mt-1">
                              Subtotal: ${(item.quantity * item.unitPrice).toFixed(2)}
                            </p>

                            {/* Review button */}
                            {canReview(order) && product && (
                              <div className="mt-3">
                                {reviewForm?.productId === item.productId && reviewForm?.orderId === order.id ? (
                                  <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-light text-gray-700">Tu calificación:</span>
                                      <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="p-1 hover:scale-110 transition-transform"
                                          >
                                            <Star
                                              className={`h-6 w-6 ${
                                                star <= reviewForm.rating
                                                  ? 'fill-yellow-400 text-yellow-400'
                                                  : 'text-gray-300'
                                              }`}
                                            />
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <Textarea
                                      value={reviewForm.comment}
                                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                      placeholder="Cuéntanos tu experiencia con este producto (opcional)"
                                      rows={3}
                                      className="rounded-none border-gray-200 font-light text-sm"
                                    />

                                    <div className="flex gap-2">
                                      <Button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview}
                                        className="bg-gray-900 hover:bg-gray-800 text-white rounded-none h-10 px-6 font-light text-sm"
                                      >
                                        {submittingReview ? 'Enviando...' : 'Enviar calificación'}
                                      </Button>
                                      <Button
                                        onClick={() => setReviewForm(null)}
                                        variant="outline"
                                        className="rounded-none h-10 px-6 font-light text-sm"
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleStartReview(item.productId, order.id)}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-light"
                                  >
                                    <Star className="h-4 w-4" />
                                    Calificar producto
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen de orden */}
                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 font-light">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-light">
                      <span>Impuestos</span>
                      <span>${order.taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-light">
                      <span>Envío</span>
                      <span>
                        {order.shipping === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          `$${order.shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-normal text-gray-900 pt-2">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Delivery info */}
                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 font-light">
                      <p className="font-normal text-gray-900 mb-1">Información de entrega:</p>
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.phone}</p>
                      {order.deliveryType === 'home' && (
                        <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                      )}
                      {order.deliveryType === 'pickup' && (
                        <p className="text-blue-600">Recoger en tienda</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
