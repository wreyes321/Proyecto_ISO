import { useState, useEffect } from 'react';
import { type Product, type Review, type Settings } from './data/mockData';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Heart, Star, ShoppingCart, ArrowLeft, Package, Shield, Truck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProductsService, SettingsService, ReviewsService } from '../lib/supabaseService';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (destination: string) => void;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  userWishlist: string[];
  isAuthenticated: boolean;
  userId?: string;
}

export function ProductDetailPage({
  productId,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  userWishlist,
  isAuthenticated,
  userId
}: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [settings, setSettings] = useState<Settings>({ currency: 'USD', taxRate: 0.13, shippingCost: 3.50, freeShippingThreshold: 25 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const foundProduct = await ProductsService.getProductById(productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }

      const appSettings = await SettingsService.getSettings();
      setSettings(appSettings);

      // Cargar reseñas del producto
      const productReviews = await ReviewsService.getProductReviews(productId);
      setReviews(productReviews);

      // Verificar si el usuario ya calificó este producto
      if (userId) {
        const hasReviewed = productReviews.some(review => review.userId === userId);
        setUserHasReviewed(hasReviewed);
      }

      setLoading(false);
    };

    loadData();
  }, [productId, userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-4 animate-pulse" />
          <p className="text-gray-500 font-light">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-light text-gray-900 mb-4">Producto no encontrado</h2>
          <Button
            onClick={() => onNavigate('catalog')}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-none h-12 px-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  const isInWishlist = userWishlist.includes(product.id);
  const currentPrice = product.salePrice || product.price;
  const hasDiscount = !!product.salePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;

  // Calcular rating promedio de las reseñas reales
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para añadir productos al carrito');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }

    onAddToCart(product.id);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para gestionar tu lista de deseos');
      return;
    }
    onToggleWishlist(product.id);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-500 font-light">
          <button onClick={() => onNavigate('home')} className="hover:text-gray-900 transition-colors">
            Inicio
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('catalog')} className="hover:text-gray-900 transition-colors">
            Joyería
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate(`category=${product.category}`)}
            className="hover:text-gray-900 transition-colors capitalize"
          >
            {product.category}
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  -{discountPercentage}%
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  Nuevo
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index
                        ? 'border-gray-900 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Título y badges */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-light">
                    Últimas unidades
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 font-light">
                    Sin stock
                  </Badge>
                )}
                {product.stock > 10 && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 font-light">
                    Disponible
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-light">
                  {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
                </span>
              </div>
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-light text-gray-900">
                  {settings.currency === 'USD' ? '$' : '€'}{currentPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-2xl text-gray-400 line-through font-light">
                    {settings.currency === 'USD' ? '$' : '€'}{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-600 font-light">
                  Ahorras {settings.currency === 'USD' ? '$' : '€'}{(product.price - currentPrice).toFixed(2)}
                </p>
              )}
            </div>

            <Separator />

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Botones de acción */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-none h-14 text-base font-light"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? 'Sin stock' : 'Añadir al carrito'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                  className={`h-14 w-14 rounded-none ${
                    isInWishlist
                      ? 'text-red-600 border-red-600 hover:bg-red-50'
                      : 'border-gray-300 hover:border-gray-900'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-sm text-orange-600 font-light text-center">
                  ¡Solo quedan {product.stock} unidades disponibles!
                </p>
              )}
            </div>

            {/* Beneficios */}
            <Card className="border-none shadow-sm bg-gray-100">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-normal text-gray-900">Envío gratis</p>
                    <p className="text-sm text-gray-600 font-light">
                      En compras superiores a ${settings.freeShippingThreshold}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-normal text-gray-900">Compra segura</p>
                    <p className="text-sm text-gray-600 font-light">
                      Garantía de satisfacción 100%
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-normal text-gray-900">Empaque premium</p>
                    <p className="text-sm text-gray-600 font-light">
                      Presentación elegante ideal para regalar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Especificaciones */}
            {Object.keys(product.specs).length > 0 && (
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-normal text-gray-900 mb-4">Especificaciones</h3>
                  <div className="space-y-3">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-600 font-light">{key}</span>
                        <span className="text-gray-900 font-normal">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sección de reseñas */}
        <div className="mt-16">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-2">Reseñas de clientes</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg text-gray-600 font-light">
                      {averageRating.toFixed(1)} de 5
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-light mt-1">
                    Basado en {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                  </p>
                </div>

                {/* Indicador si el usuario ya calificó */}
                {isAuthenticated && userHasReviewed && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-light">Ya calificaste este producto</span>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Lista de reseñas */}
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-light">
                    Sé el primero en calificar este producto
                  </p>
                  {isAuthenticated ? (
                    <p className="text-sm text-gray-400 font-light mt-2">
                      Compra este producto para poder calificarlo
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 font-light mt-2">
                      Inicia sesión para poder calificar
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b last:border-b-0 border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-normal text-gray-900">
                              {review.userName || 'Usuario'}
                            </p>
                            <p className="text-sm text-gray-500 font-light">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 font-light leading-relaxed ml-13">
                          {review.comment}
                        </p>
                      )}
                      {review.verified && (
                        <Badge className="ml-13 mt-2 bg-green-100 text-green-800 border-green-200 font-light text-xs">
                          Compra verificada
                        </Badge>
                      )}
                      {review.userId === userId && (
                        <Badge className="ml-2 mt-2 bg-blue-100 text-blue-800 border-blue-200 font-light text-xs">
                          Tu reseña
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
