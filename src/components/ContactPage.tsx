import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

export function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Información de contacto
  const contactInfo = [
    {
      icon: Phone,
      label: 'Teléfono',
      value: '7207 0407',
      link: 'tel:+50372070407'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'renelygems@gmail.com',
      link: 'mailto:renelygems@gmail.com'
    },
    {
      icon: MapPin,
      label: 'Ubicación',
      value: 'Concepción de Ataco, El Salvador',
      link: null
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Enviar email con EmailJS
      await emailjs.send(
        'YOUR_SERVICE_ID',        // Service ID
        'YOUR_TEMPLATE_ID',       // Template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || 'No proporcionado',
          message: formData.message,
          to_email: 'renelygems@gmail.com'
        },
        'YOUR_PUBLIC_KEY'         // Public Key
      );

      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });

      toast.success(
        'Mensaje enviado',
        {
          description: 'Te contactaremos pronto.',
          icon: <CheckCircle2 className="h-5 w-5" />
        }
      );
    } catch (error) {
      console.error('Error al enviar email:', error);
      toast.error('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-gray-900">
            Contáctanos
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Estamos aquí para ayudarte
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Información de contacto */}
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-8">
                  Información
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="group">
                      {info.link ? (
                        <a
                          href={info.link}
                          className="flex items-start gap-4 transition-all hover:translate-x-1"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-900 transition-colors">
                            <info.icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="pt-1">
                            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-medium">
                              {info.label}
                            </p>
                            <p className="text-gray-900 font-light group-hover:text-gray-600 transition-colors">
                              {info.value}
                            </p>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <info.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="pt-1">
                            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-medium">
                              {info.label}
                            </p>
                            <p className="text-gray-900 font-light">
                              {info.value}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Horarios */}
              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-medium">
                  Horarios
                </p>
                <div className="space-y-2 text-sm text-gray-600 font-light">
                  <p>Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                  <p>Sábado: 10:00 AM - 4:00 PM</p>
                  <p>Domingo: Cerrado</p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div>
              <Card className="border-0 shadow-none p-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                      Nombre
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                      Teléfono (opcional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="7207 0407"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                      Mensaje
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="border-0 border-b border-gray-200 rounded-none px-0 resize-none focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-none font-light tracking-wide transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto mt-20 pt-12 border-t border-gray-100">
          <p className="text-center text-sm text-gray-400 font-light">
            Te responderemos en menos de 24 horas
          </p>
        </div>
      </div>
    </div>
  );
}
