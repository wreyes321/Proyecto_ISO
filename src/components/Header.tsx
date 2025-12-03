import { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart, LogOut, Settings, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface HeaderProps {
  cartItemsCount?: number;
  isAuthenticated?: boolean;
  userName?: string;
  userRole?: 'client' | 'admin';
  onCartClick?: () => void;
  onAuthClick?: () => void;
  onLogout?: () => void;
  onMenuItemClick?: (item: string) => void;
  onSearchSubmit?: (query: string) => void;
}

export function Header({ 
  cartItemsCount = 0, 
  isAuthenticated = false,
  userName = 'Usuario',
  userRole = 'client',
  onCartClick,
  onAuthClick,
  onLogout,
  onMenuItemClick,
  onSearchSubmit
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const navigationItems = [
    { label: 'Inicio', value: 'home' },
    { label: 'Catálogo', value: 'catalog' },
    { label: 'Colecciones', value: 'collections' },
    { label: 'Acerca de', value: 'about' },
    { label: 'Contacto', value: 'contact' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit?.(searchQuery);
      onMenuItemClick?.(`search:${searchQuery}`);
      setIsSearchExpanded(false);
    }
  };

  const handleMenuClick = (value: string) => {
    onMenuItemClick?.(value);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Barra de navegacion */}
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onMenuItemClick?.('home')}
              className="text-2xl md:text-3xl font-serif text-gradient hover:scale-105 transition-all duration-300 font-bold"
              aria-label="Ir a inicio"
            >
              RenelyGems
            </button>

            {/* Navegacion */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleMenuClick(item.value)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  aria-label={`Ir a ${item.label}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Barra de busqueda - Desktop */}
            <div className="hidden md:block">
              {isSearchExpanded ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in slide-in-from-right">
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 h-9"
                    autoFocus
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchExpanded(true)}
                  className="hover:bg-gray-100"
                  aria-label="Abrir búsqueda"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Boton de busqueda - Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden hover:bg-gray-100"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Boton de carrito */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="relative hover:bg-gray-100"
              aria-label={`Carrito con ${cartItemsCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-gray-100"
                    aria-label="Menú de usuario"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-gray-500">
                        {userRole === 'admin' ? 'Administrador' : 'Cliente'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {userRole === 'client' && (
                    <>
                      <DropdownMenuItem onClick={() => handleMenuClick('my-orders')}>
                        <Package className="mr-2 h-4 w-4" />
                        Mis Pedidos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMenuClick('wishlist')}>
                        <Heart className="mr-2 h-4 w-4" />
                        Lista de Deseos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMenuClick('profile')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {userRole === 'admin' && (
                    <DropdownMenuItem onClick={() => handleMenuClick('admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Panel Admin
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onAuthClick}
                className="hidden sm:flex"
              >
                Iniciar Sesión
              </Button>
            )}

            {/* Menu Mobile */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden hover:bg-gray-100"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-serif bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    RenelyGems
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-2 mt-8">
                  {navigationItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleMenuClick(item.value)}
                      className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  
                  {!isAuthenticated && (
                    <>
                      <div className="my-4 border-t border-gray-200" />
                      <button
                        onClick={() => {
                          onAuthClick?.();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Iniciar Sesión
                      </button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Barra de busqueda Mobile */}
        {isSearchExpanded && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}