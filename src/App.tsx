import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { CollectionsPage } from './components/CollectionsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { AuthPage } from './components/AuthPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { AdminPage } from './components/AdminPage';
import { StorageManager, type User, type Cart } from './components/data/mockData';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

type Page = 'home' | 'catalog' | 'collections' | 'product' | 'cart' | 'auth' | 'admin' | 'about' | 'contact';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Initialize app data
  useEffect(() => {
    // Load current user
    const user = StorageManager.getCurrentUser();
    setCurrentUser(user);

    // Load cart if user is logged in
    if (user && user.role === 'client') {
      const userCart = StorageManager.getCart(user.id);
      setCart(userCart);
    }
  }, []);

  const handleNavigation = (destination: string, productId?: string) => {
    if (destination.startsWith('search:')) {
      const query = destination.replace('search:', '');
      setSearchQuery(query);
      setCurrentPage('catalog');
      return;
    }

    // Handle category filtering
    if (destination.includes('category=')) {
      const category = destination.split('category=')[1];
      setCategoryFilter(category);
      setCurrentPage('catalog');
      return;
    }

    // Handle catalog with query parameters
    if (destination.startsWith('catalog?')) {
      const urlParams = new URLSearchParams(destination.split('?')[1]);
      const category = urlParams.get('category');
      if (category) {
        setCategoryFilter(category);
      }
      setCurrentPage('catalog');
      return;
    }

    switch (destination) {
      case 'home':
        setCurrentPage('home');
        setSearchQuery('');
        setCategoryFilter('');
        break;
      case 'catalog':
        setCurrentPage('catalog');
        break;
      case 'collections':
        setCurrentPage('collections');
        break;
      case 'product':
        setCurrentPage('product');
        setSelectedProductId(productId || null);
        break;
      case 'cart':
        setCurrentPage('cart');
        break;
      case 'auth':
        setCurrentPage('auth');
        break;
      case 'admin':
        setCurrentPage('admin');
        break;
      case 'about':
        setCurrentPage('about');
        break;
      case 'contact':
        setCurrentPage('contact');
        break;
      case 'shipping':
      case 'warranty':
      case 'size-guide':
      case 'care':
      case 'privacy':
      case 'terms':
        // For now, show a simple message for these pages
        toast.info(`Página "${destination}" en construcción`);
        break;
      default:
        setCurrentPage('home');
    }
  };

  const handleAuth = () => {
    if (currentUser) {
      // Logout
      StorageManager.setCurrentUser(null);
      setCurrentUser(null);
      setCart({ items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 });
      toast.success('Sesión cerrada correctamente');
      setCurrentPage('home');
    } else {
      // Navigate to auth page
      setCurrentPage('auth');
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'client') {
      const userCart = StorageManager.getCart(user.id);
      setCart(userCart);
    }
  };

  const handleAddToCart = (productId: string, size?: string) => {
    if (!currentUser || currentUser.role !== 'client') {
      toast.error('Inicia sesión para añadir productos al carrito');
      return;
    }

    const products = StorageManager.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }

    // Add to cart logic
    const selectedSize = size || product.sizes[0];
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === productId && item.variant.size === selectedSize
    );
    const price = product.salePrice || product.price;
    
    let newCart = { ...cart };
    
    if (existingItemIndex >= 0) {
      if (newCart.items[existingItemIndex].quantity >= product.stock) {
        toast.error('No hay más stock disponible');
        return;
      }
      newCart.items[existingItemIndex].quantity += 1;
    } else {
      newCart.items.push({
        productId,
        variant: { size: selectedSize },
        quantity: 1,
        unitPrice: price
      });
    }

    // Recalculate totals
    newCart.subtotal = newCart.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const settings = StorageManager.getSettings();
    newCart.taxes = newCart.subtotal * settings.taxRate;
    newCart.shipping = newCart.subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
    newCart.total = newCart.subtotal + newCart.taxes + newCart.shipping;

    setCart(newCart);
    StorageManager.setCart(currentUser.id, newCart);
    
    toast.success(`${product.title} añadido al carrito`);
  };

  const handleToggleWishlist = (productId: string) => {
    if (!currentUser || currentUser.role !== 'client') {
      toast.error('Inicia sesión para gestionar tu lista de deseos');
      return;
    }

    const users = StorageManager.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex >= 0) {
      const isInWishlist = users[userIndex].wishlist.includes(productId);
      
      if (isInWishlist) {
        users[userIndex].wishlist = users[userIndex].wishlist.filter(id => id !== productId);
        toast.success('Producto eliminado de la lista de deseos');
      } else {
        users[userIndex].wishlist.push(productId);
        toast.success('Producto añadido a la lista de deseos');
      }
      
      StorageManager.setUsers(users);
      setCurrentUser(users[userIndex]);
    }
  };

  const cartItemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const userWishlist = currentUser?.wishlist || [];

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigation}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            userWishlist={userWishlist}
          />
        );
      case 'catalog':
        return (
          <CatalogPage
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            onNavigate={handleNavigation}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            userWishlist={userWishlist}
          />
        );
      case 'collections':
        return (
          <CollectionsPage
            onNavigate={handleNavigation}
          />
        );
      case 'product':
        return selectedProductId ? (
          <ProductDetailPage
            productId={selectedProductId}
            onNavigate={handleNavigation}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            userWishlist={userWishlist}
            isAuthenticated={!!currentUser}
          />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <h2 className="mb-4">Producto no especificado</h2>
              <button
                onClick={() => handleNavigation('catalog')}
                className="text-primary hover:underline"
              >
                ← Volver al catálogo
              </button>
            </div>
          </div>
        );
      case 'cart':
        return (
          <CartPage
            cart={cart}
            onNavigate={handleNavigation}
            onUpdateCart={setCart}
            isAuthenticated={!!currentUser}
            userId={currentUser?.id}
          />
        );
      case 'auth':
        return (
          <AuthPage
            onNavigate={handleNavigation}
            onAuthSuccess={handleAuthSuccess}
          />
        );
      case 'about':
        return (
          <AboutPage onNavigate={handleNavigation} />
        );
      case 'contact':
        return (
          <ContactPage onNavigate={handleNavigation} />
        );
      case 'admin':
        return (
          <AdminPage 
            onNavigate={handleNavigation}
            currentUser={currentUser}
          />
        );
      default:
        return (
          <HomePage
            onNavigate={handleNavigation}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            userWishlist={userWishlist}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        cartItemsCount={cartItemsCount}
        isAuthenticated={!!currentUser}
        userRole={currentUser?.role}
        onCartClick={() => handleNavigation('cart')}
        onAuthClick={handleAuth}
        onMenuItemClick={handleNavigation}
      />
      
      <main className="flex-1">
        {renderPage()}
      </main>
      
      <Footer onMenuItemClick={handleNavigation} />
      <Toaster />
    </div>
  );
}