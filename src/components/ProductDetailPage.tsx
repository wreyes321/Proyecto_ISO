import { useState, useEffect } from 'react';
import { StorageManager, type Product } from './data/mockData';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Heart, Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (destination: string) => void;
  onAddToCart: (productId: string, size?: string) => void;
  onToggleWishlist: (productId: string) => void;
  userWishlist: string[];
  isAuthenticated: boolean;
}

export function ProductDetailPage({
  productId,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  userWishlist,
  isAuthenticated
}: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const products = StorageManager.getProducts();
    const foundProduct = products.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedSize(foundProduct.sizes[0] || '');
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="mb-4">Producto no encontrado</h2>
          <Button onClick={() => onNavigate('catalog')} variant="outline">
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
  const settings = StorageManager.getSettings();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para añadir productos al carrito');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }

    onAddToCart(product.id, selectedSize);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para gestionar tu lista de deseos');
      return;
    }
    onToggleWishlist(product.id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <button onClick={() => onNavigate('home')} className="hover:text-foreground">
          Inicio
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('catalog')} className="hover:text-foreground">
          Joyería
        </button>
        <span>/</span>
        <button onClick={() => onNavigate(`category=${product.category}`)} className="hover:text-foreground">
          {product.category}
        </button>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-md border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-muted'
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

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.isNew && <Badge variant="secondary">Nuevo</Badge>}
              {hasDiscount && <Badge variant="destructive">Oferta</Badge>}
              {product.stock <= 5 && product.stock > 0 && (
                <Badge variant="outline">Últimas unidades</Badge>
              )}
              {product.stock === 0 && <Badge variant="destructive">Sin stock</Badge>}
            </div>
            <h1 className="mb-4">{product.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.rating}) {product.reviews.length} reseñas
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-medium">
                {settings.currency === 'USD' ? '$' : '€'}{currentPrice}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {settings.currency === 'USD' ? '$' : '€'}{product.price}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-green-600">
                Ahorras {settings.currency === 'USD' ? '$' : '€'}{product.price - currentPrice}
              </p>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {/* Size Selection */}
          {product.sizes.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Talla</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una talla" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock === 0 ? 'Sin stock' : 'Añadir al carrito'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleWishlist}
              className={isInWishlist ? 'text-red-500 border-red-500' : ''}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Stock Info */}
          <div className="text-sm text-muted-foreground">
            {product.stock > 0 ? (
              <span>En stock: {product.stock} unidades disponibles</span>
            ) : (
              <span>Producto agotado</span>
            )}
          </div>

          {/* Specifications */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4">Especificaciones</h3>
              <div className="space-y-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4">Reseñas</h3>
                <div className="space-y-4">
                  {product.reviews.map(review => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.userName}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}