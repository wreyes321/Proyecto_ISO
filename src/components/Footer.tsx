import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useState } from 'react';

interface FooterProps {
  onMenuItemClick?: (item: string) => void;
}

export function Footer({ onMenuItemClick }: FooterProps) {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Simulate newsletter subscription
      alert('¡Gracias por suscribirte a nuestro newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <h3 className="text-3xl font-serif text-gradient mb-4 font-bold">RenelyGems</h3>
            <p className="text-sm mb-6 opacity-90 leading-relaxed">
              Joyas que cuentan tu historia. Creamos piezas únicas con materiales certificados 
              y el más alto nivel de calidad.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:text-yellow-400 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-yellow-400 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-yellow-400 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold mb-4 text-yellow-400 text-lg">Navegación</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button 
                  onClick={() => onMenuItemClick?.('catalog')}
                  className="opacity-90 hover:opacity-100 hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 block"
                >
                  Catálogo
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onMenuItemClick?.('collections')}
                  className="opacity-90 hover:opacity-100 hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 block"
                >
                  Colecciones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onMenuItemClick?.('about')}
                  className="opacity-90 hover:opacity-100 hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 block"
                >
                  Acerca de
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onMenuItemClick?.('contact')}
                  className="opacity-90 hover:opacity-100 hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 block"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4 text-yellow-400 text-lg">Atención al Cliente</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button 
                  onClick={() => onMenuItemClick?.('shipping')}
                  className="opacity-90 hover:opacity-100 hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 block"
                >
                  Envíos y Devoluciones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onMenuItemClick?.('warranty')}
                  className="opacity-90 hover:opacity-100 hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 block"
                >
                  Garantía
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onMenuItemClick?.('size-guide')}
                  className="opacity-90 hover:opacity-100 hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 block"
                >
                  Guía de Tallas
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onMenuItemClick?.('care')}
                  className="opacity-90 hover:opacity-100 hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 block"
                >
                  Cuidado de Joyas
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h4 className="font-bold mb-4 text-yellow-400 text-lg">Mantente Conectado</h4>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">
              Recibe noticias sobre nuevas colecciones y ofertas especiales.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  required
                />
                <Button type="submit" variant="outline" className="btn-accent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white font-medium">
                  Suscribirse
                </Button>
              </div>
            </form>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 opacity-90 hover:opacity-100 transition-opacity">
                <Phone className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 opacity-90 hover:opacity-100 transition-opacity">
                <Mail className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">info@renelygems.com</span>
              </div>
              <div className="flex items-center space-x-3 opacity-90 hover:opacity-100 transition-opacity">
                <MapPin className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">123 Jewelry Ave, City, State</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-yellow-400/30 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="font-medium">&copy; 2025 RenelyGems. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <button 
              onClick={() => onMenuItemClick?.('privacy')}
              className="hover:text-yellow-400 transition-colors font-medium"
            >
              Política de Privacidad
            </button>
            <button 
              onClick={() => onMenuItemClick?.('terms')}
              className="hover:text-yellow-400 transition-colors font-medium"
            >
              Términos de Uso
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}