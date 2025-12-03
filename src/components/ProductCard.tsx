import { useState } from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    salePrice?: number;
    images: string[];
    category: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    isNew?: boolean;
  };
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export function ProductCard({ 
  product, 
  onProductClick, 
  onAddToCart, 
  onToggleWishlist,
  isInWishlist = false 
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(price);
  };

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleImageHover = () => {
    if (product.images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleImageLeave = () => {
    setCurrentImageIndex(0);
  };

  return (
    <div className="group relative card-luxury hover-lift hover-glow">
      {/* Image Container */}
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => onProductClick?.(product.id)}
        onMouseEnter={handleImageHover}
        onMouseLeave={handleImageLeave}
      >
        <ImageWithFallback
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-full group-hover:translate-y-0 transition-all duration-300">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product.id);
            }}
            disabled={!product.inStock}
            className="btn-primary shadow-xl hover:shadow-2xl"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.inStock ? 'Añadir al carrito' : 'Sin stock'}
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold shadow-lg animate-pulse">
              ✨ Nuevo
            </Badge>
          )}
          {product.salePrice && (
            <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg">
              🔥 -{discountPercentage}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="outline" className="bg-white/90 text-gray-600 font-bold shadow-lg">
              ❌ Sin stock
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(product.id);
          }}
          className="absolute top-3 right-3 p-3 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 rounded-full"
        >
          <Heart 
            className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-600 hover:text-red-500'}`} 
          />
        </Button>
      </div>

      {/* Informacion del producto */}
      <div className="p-6 bg-gradient-to-b from-white to-gray-50">
        <div 
          className="cursor-pointer"
          onClick={() => onProductClick?.(product.id)}
        >
          <p className="text-xs uppercase tracking-wide text-blue-600 font-bold mb-2">
            {product.category}
          </p>
          <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
            {product.title}
          </h3>
          


          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              ({product.reviewCount})
            </span>
          </div>

          {/* Precio */}
          <div className="flex items-center gap-3">
            {product.salePrice ? (
              <>
                <span className="font-bold text-2xl text-green-600">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-bold text-2xl text-gray-800">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}