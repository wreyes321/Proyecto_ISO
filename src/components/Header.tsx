import { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface HeaderProps {
  cartItemsCount?: number;
  isAuthenticated?: boolean;
  userRole?: 'client' | 'admin';
  onCartClick?: () => void;
  onAuthClick?: () => void;
  onMenuItemClick?: (item: string) => void;
}

export function Header({ 
  cartItemsCount = 0, 
  isAuthenticated = false, 
  userRole = 'client',
  onCartClick,
  onAuthClick,
  onMenuItemClick 
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      onMenuItemClick?.(`search:${searchQuery}`);
    }
  };

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 border-b-2 border-blue-200 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onMenuItemClick?.('home')}
              className="text-3xl font-serif text-gradient hover:scale-105 transition-all duration-300 font-bold"
            >
              RenelyGems
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onMenuItemClick?.(item.value)}
                className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar joyas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 bg-muted border-border"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </form>

            {/* User Account */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onAuthClick}
              className="hidden sm:flex items-center space-x-2 btn-secondary hover:scale-105"
            >
              <User className="h-4 w-4" />
              <span className="font-medium">
                {isAuthenticated 
                  ? (userRole === 'admin' ? 'Admin' : 'Mi Cuenta')
                  : 'Ingresar'
                }
              </span>
            </Button>

            {/* Admin Panel Link */}
            {isAuthenticated && userRole === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMenuItemClick?.('admin')}
                className="hidden sm:flex btn-outline border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Panel Admin
              </Button>
            )}

            {/* Shopping Cart */}
            {userRole === 'client' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCartClick}
                className="relative btn-accent hover:scale-105"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center p-0 bg-red-500 animate-pulse"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Buscar joyas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-muted border-border"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border pt-4">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onMenuItemClick?.(item.value);
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-secondary hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onAuthClick?.();
                  setIsMenuOpen(false);
                }}
                className="text-left text-secondary hover:text-primary transition-colors sm:hidden"
              >
                {isAuthenticated 
                  ? (userRole === 'admin' ? 'Admin' : 'Mi Cuenta')
                  : 'Ingresar'
                }
              </button>
              {isAuthenticated && userRole === 'admin' && (
                <button
                  onClick={() => {
                    onMenuItemClick?.('admin');
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-secondary hover:text-primary transition-colors sm:hidden"
                >
                  Panel Admin
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}