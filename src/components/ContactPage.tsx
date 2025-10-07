import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Package, 
  Shield, 
  Send,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  });

  // Información de contacto
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Dirección',
      details: [
        'Km 94 1/2 carretera Ruta de las Flores',
        'El Jardín de Celeste, Concepción de Ataco',
        'El Salvador'
      ],
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      details: [
        '+503 7XXX-XXXX',
        'WhatsApp disponible',
        'Lun - Vie: 9:00 AM - 6:00 PM'
      ],
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'info@renelygems.com',
        'ventas@renelygems.com',
        'soporte@renelygems.com'
      ],
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Clock,
      title: 'Horarios',
      details: [
        'Lunes - Viernes: 9:00 AM - 6:00 PM',
        'Sábado: 10:00 AM - 4:00 PM',
        'Domingo: Cerrado'
      ],
      color: 'bg-blue-50 text-blue-600'
    }
  ];

  const supportCategories = [
    { 
      value: 'general', 
      label: 'Consulta General', 
      icon: MessageCircle,
      description: 'Preguntas generales sobre productos o servicios'
    },
    { 
      value: 'orders', 
      label: 'Pedidos y Envíos', 
      icon: Package,
      description: 'Consultas sobre pedidos, tracking o envíos'
    },
    { 
      value: 'warranty', 
      label: 'Garantía y Devoluciones', 
      icon: Shield,
      description: 'Información sobre garantías, cambios o devoluciones'
    },
    { 
      value: 'custom', 
      label: 'Diseño Personalizado', 
      icon: MessageCircle,
      description: 'Solicitud de diseños personalizados o exclusivos'
    }
  ];

  // Preguntas frecuentes
  const faqs = [
    {
      question: '¿Cuál es el tiempo de envío?',
      answer: 'Los envíos nacionales tardan de 2 a 3 días hábiles. Para envíos internacionales, el tiempo estimado es de 5 a 7 días hábiles. Todos los envíos incluyen número de tracking.'
    },
    {
      question: '¿Ofrecen garantía en las joyas?',
      answer: 'Sí, todas nuestras joyas cuentan con garantía de 12 meses contra defectos de fabricación. Además, ofrecemos servicio de mantenimiento y limpieza gratuito durante el primer año.'
    },
    {
      question: '¿Puedo personalizar una joya?',
      answer: 'Por supuesto. Ofrecemos servicio de diseño personalizado. Puedes contactarnos para discutir tus ideas y te proporcionaremos un presupuesto personalizado sin compromiso.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos transferencias bancarias, tarjetas de crédito/débito y pago contra entrega. Para compras mayores a $500, ofrecemos planes de financiamiento.'
    },
    {
      question: '¿Puedo cambiar o devolver un producto?',
      answer: 'Sí, aceptamos cambios y devoluciones dentro de los 15 días posteriores a la compra, siempre que el producto esté en su estado original sin uso. Los gastos de envío corren por cuenta del cliente.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.category) {
        toast.error('Por favor selecciona una categoría de consulta');
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      });

      toast.success(
        '¡Mensaje enviado exitosamente!',
        {
          description: 'Te responderemos en menos de 24 horas.',
          icon: <CheckCircle2 className="h-5 w-5" />
        }
      );
    } catch (error) {
      toast.error('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Encabezado */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contáctanos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier 
            consulta sobre nuestras joyas, pedidos o servicios personalizados.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Send className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-2xl">Envíanos un Mensaje</CardTitle>
                </div>
                <CardDescription>
                  Completa el formulario y te responderemos en menos de 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre y Email  */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Nombre completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="transition-all focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="transition-all focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Teléfono (opcional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+503 XXXX-XXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Categoría de consulta */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Categoría de consulta <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Selecciona el tipo de consulta" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-start gap-3 py-1">
                              <category.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                              <div className="flex flex-col">
                                <span className="font-medium">{category.label}</span>
                                <span className="text-xs text-gray-500">
                                  {category.description}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Asunto */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Asunto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Resumen de tu consulta"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Mensaje <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Cuéntanos más detalles sobre tu consulta..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="transition-all focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.message.length} / 500 caracteres
                    </p>
                  </div>

                  {/* Botón de envío */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Información de contacto */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Phone className="h-6 w-6 text-blue-600" />
                Información de Contacto
              </h2>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <info.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2">{info.title}</h4>
                          <div className="space-y-1">
                            {info.details.map((detail, idx) => (
                              <p key={idx} className="text-sm text-gray-600">
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
          </div>
        </div>

        {/* Preguntas Frecuentes */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">Preguntas Frecuentes</CardTitle>
            </div>
            <CardDescription>
              Encuentra respuestas rápidas a las preguntas más comunes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-blue-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 border-0 text-white shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-3">
                ¿Prefieres hablar directamente con nosotros?
              </h3>
              <p className="text-blue-50 mb-6 max-w-2xl mx-auto">
                Nuestro equipo está disponible para atenderte por WhatsApp o llamada telefónica
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                  onClick={() => window.open('https://wa.me/50370000000', '_blank')}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                  onClick={() => window.location.href = 'tel:+50370000000'}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Llamar Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}