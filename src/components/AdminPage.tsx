import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  DollarSign
} from 'lucide-react';
import { StorageManager, type Product, type Order } from './data/mockData';
import { toast } from 'sonner';

interface AdminPageProps {
  onNavigate: (destination: string) => void;
  currentUser: any;
}

export function AdminPage({ onNavigate, currentUser }: AdminPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    stock: '',
    sizes: [''],
    images: ['']
  });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      toast.error('Acceso denegado. Solo administradores pueden ver esta página.');
      onNavigate('home');
      return;
    }

    setProducts(StorageManager.getProducts());
    setOrders(StorageManager.getOrders());
  }, [currentUser, onNavigate]);

  // Statistics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const lowStockProducts = products.filter(p => p.stock <= 5).length;

  const stats = [
    {
      title: 'Total Productos',
      value: totalProducts,
      icon: Package,
      change: '+12%'
    },
    {
      title: 'Pedidos',
      value: totalOrders,
      icon: ShoppingCart,
      change: '+8%'
    },
    {
      title: 'Ingresos',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: '+23%'
    },
    {
      title: 'Stock Bajo',
      value: lowStockProducts,
      icon: TrendingUp,
      change: '-5%'
    }
  ];

  const handleCreateProduct = () => {
    if (!newProduct.title || !newProduct.price || !newProduct.category) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const product: Product = {
      id: `product_${Date.now()}`,
      title: newProduct.title,
      category: newProduct.category as any,
      price: parseFloat(newProduct.price),
      description: newProduct.description,
      stock: parseInt(newProduct.stock) || 10,
      sizes: newProduct.sizes.filter(s => s.trim() !== ''),
      images: newProduct.images.filter(img => img.trim() !== ''),
      isNew: true,
      rating: 5,
      reviews: 0
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    StorageManager.setProducts(updatedProducts);

    // Reset form
    setNewProduct({
      title: '',
      category: '',
      price: '',
      description: '',
      stock: '',
      sizes: [''],
      images: ['']
    });

    toast.success('Producto creado exitosamente');
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;

    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id ? selectedProduct : p
    );
    setProducts(updatedProducts);
    StorageManager.setProducts(updatedProducts);
    setIsEditingProduct(false);
    setSelectedProduct(null);
    toast.success('Producto actualizado exitosamente');
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    StorageManager.setProducts(updatedProducts);
    toast.success('Producto eliminado exitosamente');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    StorageManager.setOrders(updatedOrders);
    toast.success('Estado del pedido actualizado');
  };

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona productos, pedidos e inventario
          </p>
        </div>
        <Button onClick={() => onNavigate('home')} variant="outline">
          Volver al sitio
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.title}</p>
                  <p className="text-2xl font-serif">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="create">Crear Producto</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Productos</CardTitle>
              <CardDescription>
                Administra el catálogo de productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4>{product.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          {product.category} • Stock: {product.stock} • ${product.price}
                        </p>
                        {product.stock <= 5 && (
                          <Badge variant="destructive" className="mt-1">
                            Stock Bajo
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate('product', product.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsEditingProduct(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Pedidos</CardTitle>
              <CardDescription>
                Administra los pedidos de los clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4>Pedido #{order.id.slice(-8)}</h4>
                        <p className="text-muted-foreground text-sm">
                          Cliente: {order.userId} • Total: ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'processing' ? 'secondary' :
                        order.status === 'shipped' ? 'outline' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateOrderStatus(order.id, value as Order['status'])}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="processing">Procesando</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay pedidos registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Product Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Producto</CardTitle>
              <CardDescription>
                Añade un nuevo producto al catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título del Producto</Label>
                    <Input
                      id="title"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rings">Anillos</SelectItem>
                        <SelectItem value="necklaces">Collares</SelectItem>
                        <SelectItem value="earrings">Aretes</SelectItem>
                        <SelectItem value="bracelets">Pulseras</SelectItem>
                        <SelectItem value="sets">Conjuntos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del producto"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Tallas (una por línea)</Label>
                    <Textarea
                      value={newProduct.sizes.join('\n')}
                      onChange={(e) => setNewProduct(prev => ({ 
                        ...prev, 
                        sizes: e.target.value.split('\n').filter(s => s.trim()) 
                      }))}
                      placeholder="S&#10;M&#10;L"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreateProduct} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Producto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Modal (simplified) */}
      {isEditingProduct && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Editar Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={selectedProduct.title}
                  onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Precio</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedProduct.price}
                  onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={selectedProduct.stock}
                  onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, stock: parseInt(e.target.value) } : null)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateProduct} className="flex-1">
                  Guardar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingProduct(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}