import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Phone, Mail, Clock, MessageCircle, Package, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ContactPageProps {
  onNavigate: (destination: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Dirección',
      details: ['123 Jewelry District', 'Nueva York, NY 10001', 'Estados Unidos']
    },
    {
      icon: Phone,
      title: 'Teléfono',
      details: ['+1 (555) 123-4567', 'Lun - Vie: 9:00 AM - 6:00 PM', 'Sáb: 10:00 AM - 4:00 PM']
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@renelygems.com', 'support@renelygems.com', 'sales@renelygems.com']
    },
    {
      icon: Clock,
      title: 'Horarios',
      details: ['Lunes - Viernes: 9:00 AM - 6:00 PM', 'Sábado: 10:00 AM - 4:00 PM', 'Domingo: Cerrado']
    }
  ];

  const supportCategories = [
    { value: 'general', label: 'Consulta General', icon: MessageCircle },
    { value: 'orders', label: 'Pedidos y Envíos', icon: Package },
    { value: 'warranty', label: 'Garantía y Devoluciones', icon: Shield },
    { value: 'custom', label: 'Diseño Personalizado', icon: MessageCircle }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });

      toast.success('¡Mensaje enviado exitosamente! Te responderemos pronto.');
    } catch (error) {
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="mb-4">Contáctanos</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier 
          consulta sobre nuestras joyas, pedidos o servicios personalizados.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un Mensaje</CardTitle>
              <CardDescription>
                Completa el formulario y te responderemos en menos de 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría de consulta</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Resumen de tu consulta"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Cuéntanos más detalles sobre tu consulta..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-6">Información de Contacto</h2>
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="mb-2">{info.title}</h4>
                        <div className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-muted-foreground text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-1">¿Cuál es el tiempo de envío?</h4>
                <p className="text-muted-foreground text-sm">
                  Los envíos nacionales tardan 2-3 días hábiles. Envíos internacionales 5-7 días hábiles.
                </p>
              </div>
              <div>
                <h4 className="mb-1">¿Ofrecen garantía?</h4>
                <p className="text-muted-foreground text-sm">
                  Sí, todas nuestras joyas incluyen garantía de 2 años contra defectos de fabricación.
                </p>
              </div>
              <div>
                <h4 className="mb-1">¿Hacen diseños personalizados?</h4>
                <p className="text-muted-foreground text-sm">
                  ¡Por supuesto! Contacta con nuestro equipo para crear tu pieza única.
                </p>
              </div>
              <div>
                <h4 className="mb-1">¿Puedo devolver un producto?</h4>
                <p className="text-muted-foreground text-sm">
                  Aceptamos devoluciones dentro de 30 días en productos sin personalizar.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('catalog')}
              >
                <Package className="w-4 h-4 mr-2" />
                Ver Catálogo de Productos
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('size-guide')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Guía de Tallas
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('care')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Cuidado de Joyas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center mt-12">
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