//src/App.tsx
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { CollectionsPage } from './components/CollectionsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AuthPage } from './components/AuthPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { AdminPage } from './components/AdminPage';
import { MyOrdersPage } from './components/MyOrdersPage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import type { User, Cart } from './components/data/mockData';
import {
  AuthService,
  CartService,
  ProductsService,
  WishlistService
} from './lib/supabaseService';

type Page = 'home' | 'catalog' | 'collections' | 'product' | 'cart' | 'checkout' | 'auth' | 'admin' | 'about' | 'contact' | 'wishlist' | 'my-orders';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Initialize app data
 useEffect(() => {
  const initializeApp = async () => {
    const user = await AuthService.getCurrentUser();
    setCurrentUser(user);

    if (user && user.role === 'client') {
      const userCart = await CartService.getCart(user.id);
      setCart(userCart);
    }
  };

  initializeApp();
}, []);

  const handleNavigation = (destination: string, productId?: string) => {
    if (destination.startsWith('search:')) {
      const query = destination.replace('search:', '');
      setSearchQuery(query);
      setCurrentPage('catalog');
      return;
    }

    if (destination.includes('category=')) {
      const category = destination.split('category=')[1];
      setCategoryFilter(category);
      setCurrentPage('catalog');
      return;
    }

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
      case 'checkout':
        if (!currentUser) {
          toast.error('Debes iniciar sesión para continuar');
          setCurrentPage('auth');
        } else {
          setCurrentPage('checkout');
        }
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
      case 'my-orders':
        if (!currentUser) {
          toast.error('Debes iniciar sesión para ver tus pedidos');
          setCurrentPage('auth');
        } else {
          setCurrentPage('my-orders');
        }
        break;
      case 'wishlist':
        if (!currentUser) {
          toast.error('Inicia sesión para ver tu lista de deseos');
          setCurrentPage('auth');
        } else {
          setCurrentPage('wishlist');
        }
        break;
      case 'orders':
      case 'profile':
        toast.info(`Página "${destination}" en construcción`);
        break;
      case 'shipping':
      case 'warranty':
      case 'size-guide':
      case 'care':
      case 'privacy':
      case 'terms':
        toast.info(`Página "${destination}" en construcción`);
        break;
      default:
        setCurrentPage('home');
    }
  };

const handleAuth = async () => {
  if (currentUser) {
    await AuthService.signOut();
    setCurrentUser(null);
    setCart({ items: [], subtotal: 0, taxes: 0, shipping: 0, total: 0 });
    toast.success('Sesión cerrada correctamente');
    setCurrentPage('home');
  } else {
    setCurrentPage('auth');
  }
};

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    if (user.role === 'client') {
      const userCart = await CartService.getCart(user.id);
      setCart(userCart);
    }
  };

  const handleAddToCart = async (productId: string) => {
  if (!currentUser || currentUser.role !== 'client') {
    toast.error('Inicia sesión para añadir productos al carrito');
    return;
  }

  const product = await ProductsService.getProductById(productId);

  if (!product) {
    toast.error('Producto no encontrado');
    return;
  }

  if (product.stock <= 0) {
    toast.error('Producto sin stock');
    return;
  }

  const price = product.salePrice || product.price;

  const { error } = await CartService.addToCart(
    currentUser.id,
    productId,
    price
  );

  if (error) {
    toast.error(error);
    return;
  }

  // Recargar carrito
  const updatedCart = await CartService.getCart(currentUser.id);
  setCart(updatedCart);

  toast.success(`${product.title} añadido al carrito`);
};

  const handleToggleWishlist = async (productId: string) => {
  if (!currentUser || currentUser.role !== 'client') {
    toast.error('Inicia sesión para gestionar tu lista de deseos');
    return;
  }

  const isInWishlist = currentUser.wishlist.includes(productId);
  
  if (isInWishlist) {
    const { error } = await WishlistService.removeFromWishlist(currentUser.id, productId);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Producto eliminado de la lista de deseos');
  } else {
    const { error } = await WishlistService.addToWishlist(currentUser.id, productId);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Producto añadido a la lista de deseos');
  }

  // Actualizar usuario actual
  const updatedUser = await AuthService.getCurrentUser();
  if (updatedUser) {
    setCurrentUser(updatedUser);
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
            userId={currentUser?.id}
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
      case 'checkout':
        return currentUser ? (
          <CheckoutPage
            cart={cart}
            onNavigate={handleNavigation}
            onUpdateCart={setCart}
            userId={currentUser.id}
            userEmail={currentUser.email}
          />
        ) : null;
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
          <ContactPage />
        );
      case 'my-orders':
        return currentUser ? (
          <MyOrdersPage
            onNavigate={handleNavigation}
            userId={currentUser.id}
          />
        ) : null;
      case 'wishlist':
        return (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif mb-6">Mi Lista de Deseos</h1>
            <CatalogPage
              searchQuery=""
              categoryFilter=""
              onNavigate={handleNavigation}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              userWishlist={userWishlist}
              wishlistOnly={true}
            />
          </div>
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
        userName={currentUser?.name || 'Usuario'}
        userRole={currentUser?.role}
        onCartClick={() => handleNavigation('cart')}
        onAuthClick={handleAuth}
        onLogout={handleAuth}
        onMenuItemClick={handleNavigation}
        onSearchSubmit={(query) => handleNavigation(`search:${query}`)}
      />
      
      <main className="flex-1">
        {renderPage()}
      </main>
      
      <Footer onMenuItemClick={handleNavigation} />
      <Toaster />
    </div>
  );
}