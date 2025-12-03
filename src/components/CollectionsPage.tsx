import { useState, useEffect } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { type Product } from './data/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductsService } from '../lib/supabaseService';

interface CollectionsPageProps {
  onNavigate?: (page: string, productId?: string) => void;
}

interface CategoryData {
  name: string;
  description: string;
  productCount: number;
  featured: Product[];
  image: string;
}

export function CollectionsPage({ onNavigate }: CollectionsPageProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const products = (await ProductsService.getProducts()).filter(p => p.status === 'published');

      const categoryMap = new Map<string, Product[]>();
      products.forEach(product => {
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, []);
        }
        categoryMap.get(product.category)!.push(product);
      });

      const categoriesData: CategoryData[] = [
        {
          name: 'Anillos',
          description: 'Anillos elegantes para cada ocasión especial',
          productCount: categoryMap.get('Anillos')?.length || 0,
          featured: (categoryMap.get('Anillos') || []).slice(0, 3),
          image: 'https://images.unsplash.com/photo-1638382874453-6f93c3b4b36a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByaW5ncyUyMGpld2Vscnl8ZW58MXx8fHwxNzU5MTg2Mzc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          name: 'Collares',
          description: 'Collares sofisticados que realzan tu belleza',
          productCount: categoryMap.get('Collares')?.length || 0,
          featured: (categoryMap.get('Collares') || []).slice(0, 3),
          image: 'https://images.unsplash.com/photo-1733761013921-89d19f4a2194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbmVja2xhY2UlMjBqZXdlbHJ5fGVufDF8fHx8MTc1OTE3MTQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          name: 'Aretes',
          description: 'Aretes delicados y llamativos para complementar tu estilo',
          productCount: categoryMap.get('Aretes')?.length || 0,
          featured: (categoryMap.get('Aretes') || []).slice(0, 3),
          image: 'https://images.unsplash.com/photo-1671642883395-0ab89c3ac890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBlYXJyaW5ncyUyMGpld2Vscnl8ZW58MXx8fHwxNzU5MTYzMzg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        },
        {
          name: 'Pulseras',
          description: 'Pulseras refinadas para adornar tus muñecas',
          productCount: categoryMap.get('Pulseras')?.length || 0,
          featured: (categoryMap.get('Pulseras') || []).slice(0, 3),
          image: 'https://images.unsplash.com/photo-1676301086281-e65f219c7f22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYnJhY2VsZXQlMjBqZXdlbHJ5fGVufDF8fHx8MTc1OTE4NjM4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        }
      ];

      setCategories(categoriesData);
    };

    loadProducts();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    onNavigate?.(`catalog?category=${categoryName}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif mb-4">Nuestras Colecciones</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explora nuestras cuidadosamente curadas colecciones de joyas, 
          cada una diseñada para momentos especiales y estilos únicos
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {categories.map((category) => (
          <Card key={category.name} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="relative h-64 bg-muted">
              <ImageWithFallback
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-serif mb-1">{category.name}</h3>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {category.productCount} productos
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">{category.description}</p>
              
              {/* Productos destacados */}
              {category.featured.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-3">Productos destacados:</h4>
                  <div className="space-y-2">
                    {category.featured.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                            <ImageWithFallback
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.title}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {product.salePrice ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-destructive">${product.salePrice}</span>
                              <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium">${product.price}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => handleCategoryClick(category.name)}
                className="w-full"
              >
                Ver colección completa
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Llamada a la accion */}
      <div className="text-center bg-muted rounded-lg p-8">
        <h2 className="text-2xl font-serif mb-4">¿No encuentras lo que buscas?</h2>
        <p className="text-muted-foreground mb-6">
          Explora nuestro catálogo completo o contáctanos para crear algo especial
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => onNavigate?.('catalog')}>
            Ver catálogo completo
          </Button>
          <Button variant="outline" onClick={() => onNavigate?.('contact')}>
            Contactar
          </Button>
        </div>
      </div>
    </div>
  );
}