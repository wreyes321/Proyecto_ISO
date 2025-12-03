import { Button } from './ui/button';
import { Heart, Sparkles, Users } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (destination: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const values = [
    {
      icon: Heart,
      title: 'Pasión',
      description: 'Cada pieza es creada con dedicación y amor por el arte de la joyería'
    },
    {
      icon: Sparkles,
      title: 'Calidad',
      description: 'Materiales auténticos y diseños únicos que perduran en el tiempo'
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Construimos relaciones cercanas con cada uno de nuestros clientes'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero */}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 space-y-6">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
              Nuestra Historia
            </p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-gray-900">
              RenelyGems
            </h1>
          </div>

          {/* Main Content */}
          <div className="space-y-16">
            {/* Intro */}
            <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl font-light text-gray-600 leading-relaxed text-center">
                Creamos joyas que cuentan historias, celebran momentos y se convierten
                en tesoros para las generaciones futuras.
              </p>
            </div>

            {/* Divider */}
            <div className="w-20 h-px bg-gray-200 mx-auto" />

            {/* Story */}
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4 font-medium">
                  Nuestra Misión
                </h2>
                <p className="text-gray-600 leading-relaxed font-light">
                  En RenelyGems, creemos que la joyería es más que adorno. Es expresión,
                  es memoria, es arte. Cada pieza que ofrecemos ha sido cuidadosamente
                  seleccionada para reflejar elegancia atemporal y calidad excepcional.
                </p>
              </div>

              <div>
                <p className="text-gray-600 leading-relaxed font-light">
                  Trabajamos directamente con artesanos especializados y utilizamos únicamente
                  materiales auténticos. Nuestro compromiso es ofrecerte piezas únicas que no
                  solo complementen tu estilo, sino que se conviertan en parte de tu historia.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-20 h-px bg-gray-200 mx-auto" />

            {/* Valores */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-12 font-medium text-center">
                Nuestros Valores
              </h2>

              <div className="grid md:grid-cols-3 gap-12">
                {values.map((value, index) => (
                  <div key={index} className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                      <value.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-gray-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-light leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-20 h-px bg-gray-200 mx-auto" />

            {/* Ubicacion */}
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4 font-medium">
                Ubicación
              </h2>
              <p className="text-gray-600 font-light">
                Km 94 1/2 carretera Ruta de las Flores<br />
                El Jardín de Celeste<br />
                Concepción de Ataco, El Salvador
              </p>
            </div>

            {/* CTA */}
            <div className="max-w-2xl mx-auto text-center space-y-8 pt-8">
              <p className="text-gray-500 font-light">
                Descubre nuestra colección
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => onNavigate('catalog')}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-none h-12 px-8 font-light tracking-wide"
                >
                  Ver Catálogo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('contact')}
                  className="border-gray-300 text-gray-900 hover:bg-gray-50 rounded-none h-12 px-8 font-light tracking-wide"
                >
                  Contáctanos
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-24 pt-12 border-t border-gray-100">
          <button
            onClick={() => onNavigate('home')}
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors font-light tracking-wide mx-auto block"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
