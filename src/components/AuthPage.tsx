import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { StorageManager } from './data/mockData';
import { toast } from 'sonner';

interface AuthPageProps {
  onNavigate: (destination: string) => void;
  onAuthSuccess: (user: any) => void;
}

export function AuthPage({ onNavigate, onAuthSuccess }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = StorageManager.getUsers();
      const user = users.find(u => 
        u.email === loginForm.email && u.password === loginForm.password
      );

      if (user) {
        StorageManager.setCurrentUser(user);
        onAuthSuccess(user);
        toast.success(`¡Bienvenido${user.role === 'admin' ? ' administrador' : ''}, ${user.name}!`);
        onNavigate(user.role === 'admin' ? 'admin' : 'home');
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (registerForm.password !== registerForm.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }

      if (registerForm.password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = StorageManager.getUsers();
      const existingUser = users.find(u => u.email === registerForm.email);

      if (existingUser) {
        toast.error('Ya existe una cuenta con este email');
        return;
      }

      const newUser = {
        id: `user_${Date.now()}`,
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: 'client' as const,
        wishlist: [],
        orders: []
      };

      users.push(newUser);
      StorageManager.setUsers(users);
      StorageManager.setCurrentUser(newUser);
      
      onAuthSuccess(newUser);
      toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${newUser.name}`);
      onNavigate('home');
    } catch (error) {
      toast.error('Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (userType: 'client' | 'admin') => {
    const users = StorageManager.getUsers();
    const demoUser = users.find(u => u.role === userType);
    
    if (demoUser) {
      StorageManager.setCurrentUser(demoUser);
      onAuthSuccess(demoUser);
      toast.success(`Conectado como ${userType === 'admin' ? 'administrador' : 'cliente'} de prueba`);
      onNavigate(userType === 'admin' ? 'admin' : 'home');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="mb-2">Bienvenido a RenelyGems</h1>
          <p className="text-muted-foreground">
            Accede a tu cuenta o crea una nueva para continuar
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para acceder a tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>

                <div className="mt-6 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                   
                   
                   
                   
                   
                  </div>
                  <div className="space-y-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleDemoLogin('client')}
                    >
                      Demo Cliente
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleDemoLogin('admin')}
                    >
                      Demo Administrador
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>
                  Regístrate para comenzar a comprar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}