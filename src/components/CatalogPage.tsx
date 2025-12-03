import { useState, useEffect} from 'react';
import { Filter, Grid3X3, List, SlidersHorizontal} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ProductCard } from './ProductCard';
import { type Product } from './data/mockData';
import { ProductsService } from '../lib/supabaseService';

interface CatalogPageProps {
  searchQuery?: string;
  categoryFilter?: string;
  onNavigate?: (page: string, productId?: string) => void;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  userWishlist?: string[];
  wishlistOnly?: boolean;
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
}

export function CatalogPage({
  searchQuery = '',
  categoryFilter = '',
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  userWishlist = [],
  wishlistOnly = false
}: CatalogPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [searchInput, setSearchInput] = useState(searchQuery);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: categoryFilter ? [categoryFilter] : [],
    priceRange: [0, 2000],
    inStock: false,
    onSale: false
  });

  useEffect(() => {
    setSearchInput(searchQuery);
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      categories: categoryFilter ? [categoryFilter] : []
    }));
  }, [categoryFilter]);

  const allCategories = ['Anillos', 'Collares', 'Aretes', 'Pulseras'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await ProductsService.getProducts();
      setProducts(allProducts);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Wishlist filtro
    if (wishlistOnly) {
      filtered = filtered.filter(product => userWishlist.includes(product.id));
    }

    // Filtro de busqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    }

    // Filtro de categoria
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }

    // Filtro de precio
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Filtro de stock
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Filtro de promocion
    if (filters.onSale) {
      filtered = filtered.filter(product => product.salePrice);
    }

    // Orden
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filters, sortBy, wishlistOnly, userWishlist]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 2000],
      inStock: false,
      onSale: false
    });
    setSearchTerm('');
    setSearchInput('');
  };

  const getActiveFiltersCount = () => {
    return filters.categories.length + 
           (filters.inStock ? 1 : 0) + 
           (filters.onSale ? 1 : 0) +
           (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000 ? 1 : 0);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Busqueda */}
      <div>
        <label className="block font-medium mb-2">Buscar</label>
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Categorias */}
      <div>
        <label className="block font-medium mb-3">Categorías</label>
        <div className="space-y-2">
          {allCategories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <label htmlFor={`category-${category}`} className="text-sm">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>



      {/* Rango de precio */}
      <div>
        <label className="block font-medium mb-3">
          Precio: ${filters.priceRange[0]} - ${filters.priceRange[1]}
        </label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
          max={2000}
          min={0}
          step={50}
          className="w-full"
        />
      </div>

      {/* Filtros adicionales */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStock: checked as boolean }))}
          />
          <label htmlFor="in-stock" className="text-sm">Solo productos en stock</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="on-sale"
            checked={filters.onSale}
            onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onSale: checked as boolean }))}
          />
          <label htmlFor="on-sale" className="text-sm">Solo ofertas</label>
        </div>
      </div>

      {/* Limpieza de filtros */}
      {getActiveFiltersCount() > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Limpiar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-4">Catálogo de Joyas</h1>
        <p className="text-muted-foreground">
          Descubre nuestra colección completa de joyas elegantes y atemporales
        </p>
      </div>

      {/* Barra de controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-4">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Resultados */}
          <span className="text-sm text-muted-foreground">
            {filteredProducts.length} productos encontrados
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
              <SelectItem value="name">Nombre A-Z</SelectItem>
              <SelectItem value="rating">Mejor valorados</SelectItem>
            </SelectContent>
          </Select>

          {/* Modo de vista */}
          <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-8 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium">Filtros</h3>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </div>
            <FilterContent />
          </div>
        </aside>

        {/*  Grid */}
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar los filtros o realizar una búsqueda diferente
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar todos los filtros
              </Button>
            </div>
          ) : (
            <div 
              className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-6'
              }
            >
              {filteredProducts.map((product) => (
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
          )}
        </main>
      </div>
    </div>
  );
}