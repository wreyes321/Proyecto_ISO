import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Shield, Truck, Award } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (destination: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const features = [
    {
      icon: Heart,
      title: 'Pasión por la Elegancia',
      description: 'Cada pieza es seleccionada con cuidado para reflejar sofisticación y belleza atemporal.'
    },
    {
      icon: Shield,
      title: 'Calidad Garantizada',
      description: 'Ofrecemos garantía completa en todas nuestras joyas con certificados de autenticidad.'
    },
    {
      icon: Truck,
      title: 'Envío Seguro',
      description: 'Envío gratuito en compras superiores a $150 con seguimiento completo.'
    },
    {
      icon: Award,
      title: 'Experiencia Premium',
      description: 'Más de 10 años creando experiencias únicas para nuestros clientes.'
    }
  ];

  const values = [
    {
      title: 'Excelencia',
      description: 'Nos comprometemos con la más alta calidad en cada detalle.'
    },
    {
      title: 'Confianza',
      description: 'Construimos relaciones duraderas basadas en transparencia y honestidad.'
    },
    {
      title: 'Innovación',
      description: 'Combinamos tradición artesanal con las últimas tendencias del diseño.'
    },
    {
      title: 'Servicio',
      description: 'Tu satisfacción es nuestra prioridad, antes, durante y después de la compra.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          Nuestra Historia
        </Badge>
        <h1 className="mb-6">Acerca de RenelyGems</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          RenelyGems nació de la pasión por crear joyas excepcionales que celebren los momentos más importantes de la vida. 
          Desde nuestros inicios, nos hemos dedicado a ofrecer piezas únicas que combinan elegancia clásica con diseño contemporáneo.
        </p>
      </div>

      {/* Story Section */}
      <div className="mb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="mb-6">Nuestra Misión</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                En RenelyGems, creemos que cada joya cuenta una historia. Nuestra misión es ser parte 
                de tus momentos más especiales, ofreciéndote piezas que no solo complementen tu estilo, 
                sino que se conviertan en tesoros familiares para las generaciones futuras.
              </p>
              <p>
                Trabajamos directamente con artesanos especializados y proveedores certificados para 
                garantizar que cada pieza cumpla con nuestros estándares de calidad y belleza. 
                Desde anillos de compromiso hasta collares statement, cada joya es una obra de arte 
                diseñada para durar toda la vida.
              </p>
              <p>
                Nuestro compromiso va más allá de la venta. Ofrecemos servicio personalizado, 
                asesoramiento experto y garantía completa para que tu experiencia con RenelyGems 
                sea tan especial como las joyas que eliges.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-12 h-12 text-primary" />
                </div>
                <h3 className="mb-2">Crafted with Love</h3>
                <p className="text-muted-foreground">
                  Cada pieza es creada con dedicación y atención al detalle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="mb-4">¿Por qué elegir RenelyGems?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre lo que nos hace únicos en el mundo de la joyería fina
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="mb-4">Nuestros Valores</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Los principios que guían cada decisión que tomamos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <div key={index} className="flex gap-4">
              <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0" />
              <div>
                <h4 className="mb-2">{value.title}</h4>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-muted rounded-lg p-8">
        <h2 className="mb-4">¿Listo para encontrar tu joya perfecta?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Explora nuestra colección cuidadosamente curada y descubre piezas únicas 
          que reflejen tu estilo personal.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => onNavigate('catalog')} size="lg">
            Ver Catálogo
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onNavigate('contact')}
            size="lg"
          >
            Contáctanos
          </Button>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center mt-8">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('home')}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Volver al inicio
        </Button>
      </div>
    </div>
  );
}