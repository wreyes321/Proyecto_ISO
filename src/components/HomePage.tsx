import { useState, useEffect } from 'react';
import { ArrowRight, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ProductCard } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { type Product } from './data/mockData';
import { ProductsService } from '../lib/supabaseService';

interface HomePageProps {
  onNavigate?: (page: string, productId?: string) => void;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  userWishlist?: string[];
}

export function HomePage({ 
  onNavigate, 
  onAddToCart, 
  onToggleWishlist,
  userWishlist = [] 
}: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const heroSlides = [
    {
      title: "Joyas que cuentan tu historia",
      subtitle: "Descubre nuestra nueva colección de anillos de compromiso",
      image: "https://images.unsplash.com/photo-1598594661945-d7e693e4522c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5JTIwaGVybyUyMGJhbm5lcnxlbnwxfHx8fDE3NTkxODQ4MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      cta: "Ver Colección",
      action: () => onNavigate?.('catalog')
    },
    {
      title: "Elegancia atemporal",
      subtitle: "Collares y aretes que destacan tu personalidad única",
      image: "https://images.unsplash.com/photo-1756792339487-d044709b27f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwamV3ZWxyeSUyMGNvbGxlY3Rpb24lMjBkaXNwbGF5fGVufDF8fHx8MTc1OTE4NDgzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      cta: "Explorar",
      action: () => onNavigate?.('catalog')
    },
    {
      title: "Crafted with love",
      subtitle: "Cada pieza es creada a mano con los mejores materiales",
      image: "https://images.unsplash.com/photo-1598724168411-9ba1e003a7fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kY3JhZnRlZCUyMGpld2VscnklMjB3b3Jrc2hvcCUyMGFydGlzYW58ZW58MXx8fHwxNzU5MTg0ODM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      cta: "Conocer Más",
      action: () => onNavigate?.('about')
    }
  ];

  const benefits = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Envío Seguro",
      description: "Envío gratuito en pedidos superiores a €500"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Garantía de 1 Año",
      description: "Todas nuestras joyas incluyen garantía completa"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Materiales Certificados",
      description: "Oro, plata y piedras preciosas autenticadas"
    }
  ];

  const collections = [
    {
      name: "Anillos de Compromiso",
      image: "https://images.unsplash.com/photo-1714747453609-1cb3acaccf62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5JTIwcmluZ3MlMjBkaWFtb25kc3xlbnwxfHx8fDE3NTkxODQ3Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Momentos únicos merecen joyas únicas",
      category: "Anillos"
    },
    {
      name: "Collares Elegantes",
      image: "https://images.unsplash.com/photo-1758541331106-f595bbea8534?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFybCUyMG5lY2tsYWNlJTIwZWxlZ2FudCUyMGpld2Vscnl8ZW58MXx8fHwxNzU5MTU3MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Sofisticación para cada ocasión",
      category: "Collares"
    },
    {
      name: "Aretes Modernos",
      image: "https://images.unsplash.com/photo-1602751584549-44d0f48236a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwZWFycmluZ3MlMjBkaWFtb25kcyUyMGx1eHVyeXxlbnwxfHx8fDE3NTkxODQ3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Detalles que marcan la diferencia",
      category: "Aretes"
    }
  ];

  useEffect(() => {
    const loadProducts = async () => {
      const products = await ProductsService.getProducts();
      setFeaturedProducts(products.filter((p: Product) => p.isFeatured && p.status === 'published').slice(0, 4));
      setNewProducts(products.filter((p: Product) => p.isNew && p.status === 'published').slice(0, 4));
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[600px] lg:h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroSlides[currentHeroSlide].image}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl lg:text-7xl font-serif mb-6 font-bold leading-tight">
              {heroSlides[currentHeroSlide].title}
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-95 leading-relaxed">
              {heroSlides[currentHeroSlide].subtitle}
            </p>
            <Button
              size="lg"
              onClick={heroSlides[currentHeroSlide].action}
              className="btn-primary text-lg px-8 py-4 shadow-2xl hover:shadow-3xl"
            >
              {heroSlides[currentHeroSlide].cta}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Flechas */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentHeroSlide ? 'bg-yellow-400 scale-125' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-xl mb-4 text-gray-800 group-hover:text-blue-600 transition-colors">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-6 text-gradient font-bold">Productos Destacados</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Descubre nuestra selección cuidadosamente curada de las joyas más elegantes y populares
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  reviewCount: product.reviews.length,
                  inStock: product.stock > 0
                }}
                onProductClick={onNavigate ? (id) => onNavigate('product', id) : undefined}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={userWishlist.includes(product.id)}
              />
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => onNavigate?.('catalog')}
              className="btn-outline text-lg px-8 py-4 hover:scale-105"
            >
              Ver Todo el Catálogo
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Collecciones */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-6 text-gradient font-bold">Nuestras Colecciones</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Explora nuestras diferentes colecciones, cada una diseñada para momentos especiales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer card-luxury hover-lift"
                onClick={() => onNavigate?.('catalog', `category=${collection.category}`)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden rounded-t-xl">
                    <ImageWithFallback
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/80 transition-all duration-300" />
                  </div>
                  <div className="p-8">
                    <h3 className="font-serif text-2xl mb-4 group-hover:text-blue-600 transition-colors font-bold">
                      {collection.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{collection.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recien llegados */}
      {newProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold text-lg px-6 py-3 shadow-lg animate-pulse">✨ Nuevos</Badge>
              <h2 className="text-4xl font-serif mb-6 text-gradient font-bold">Últimas Incorporaciones</h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                Las joyas más recientes que hemos añadido a nuestra colección
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    reviewCount: product.reviews.length,
                    inStock: product.stock > 0
                  }}
                  onProductClick={onNavigate ? (id) => onNavigate('product', id) : undefined}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isInWishlist={userWishlist.includes(product.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif mb-6 text-gradient font-bold">Mantente al día</h2>
          <p className="text-xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
            Suscríbete a nuestro newsletter y recibe noticias sobre nuevas colecciones, ofertas especiales y consejos de cuidado para tus joyas.
          </p>
          <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-lg"
            />
            <Button
              className="btn-accent text-lg px-8 py-4 hover:scale-105"
            >
              Suscribirse
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}