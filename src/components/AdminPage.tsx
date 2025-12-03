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
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  Eye,
  DollarSign,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import { type Product, type Order } from './data/mockData';
import { toast } from 'sonner';
import { ProductsService, OrdersService } from '../lib/supabaseService';

interface AdminPageProps {
  onNavigate: (destination: string, productId?: string) => void;
  currentUser: any;
}

export function AdminPage({ onNavigate, currentUser }: AdminPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const [newProduct, setNewProduct] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    stock: '',
    images: ['']
  });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      toast.error('Acceso denegado. Solo administradores pueden ver esta página.');
      onNavigate('home');
      return;
    }

    const loadData = async () => {
      const allProducts = await ProductsService.getAllProducts();
      const allOrders = await OrdersService.getAllOrders();

      setProducts(allProducts);
      setOrders(allOrders);
    };

    loadData();
  }, [currentUser, onNavigate]);

  // Estadisticas
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const lowStockProducts = products.filter(p => p.stock <= 5).length;

  const stats = [
    {
      title: 'Total Productos',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-200'
    },
    {
      title: 'Pedidos',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-200'
    },
    {
      title: 'Ingresos',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-200'
    },
    {
      title: 'Stock Bajo',
      value: lowStockProducts,
      icon: TrendingUp,
      color: 'bg-orange-200'
    }
  ];

  const handleCreateProduct = async () => {
    if (!newProduct.title || !newProduct.category || !newProduct.price || !newProduct.stock) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const productData = {
      title: newProduct.title,
      slug: newProduct.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      description: newProduct.description,
      stock: parseInt(newProduct.stock),
      images: newProduct.images.filter(img => img.trim()),
      specs: {},
      rating: 0,
      status: 'published' as const
    };

    const { error } = await ProductsService.createProduct(productData);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Producto creado exitosamente');

    // Recargar productos
    const allProducts = await ProductsService.getAllProducts();
    setProducts(allProducts);

    // Limpiar formulario
    setNewProduct({
      title: '',
      category: '',
      price: '',
      description: '',
      stock: '',
      images: ['']
    });
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    const { error } = await ProductsService.updateProduct(selectedProduct.id, {
      title: selectedProduct.title,
      price: selectedProduct.price,
      category: selectedProduct.category,
      description: selectedProduct.description,
      stock: selectedProduct.stock,
      images: selectedProduct.images
    });

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Producto actualizado');

    // Recargar productos
    const allProducts = await ProductsService.getAllProducts();
    setProducts(allProducts);

    setIsEditingProduct(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    const { error } = await ProductsService.deleteProduct(id);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Producto eliminado');

    // Recargar productos
    const allProducts = await ProductsService.getAllProducts();
    setProducts(allProducts);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const { error } = await OrdersService.updateOrderStatus(orderId, newStatus);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Estado del pedido actualizado');

    // Recargar pedidos Y productos 
    const allOrders = await OrdersService.getAllOrders();
    setOrders(allOrders);

    const allProducts = await ProductsService.getAllProducts();
    setProducts(allProducts);
  };

  // Filtrar productos
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => {
    if (selectedMonth === 'all') return true;
    const orderDate = new Date(order.createdAt);
    const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    return orderMonth === selectedMonth;
  });

  const availableMonths = Array.from(new Set(
    orders.map(order => {
      const date = new Date(order.createdAt);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    })
  )).sort().reverse();

  const getMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('home')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-500">Gestiona productos, pedidos y más</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm border">
            <TabsTrigger value="products" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
              <Package className="w-4 h-4 mr-2" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
              <Plus className="w-4 h-4 mr-2" />
              Crear Producto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-200 to-blue-300 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Gestión de Productos</CardTitle>
                    <CardDescription className="text-gray-700">
                      Administra el catálogo de productos
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-white text-blue-700">
                    {filteredProducts.length} productos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Buscar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar productos por nombre o categoría..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{product.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">${product.price.toFixed(2)}</span>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              product.stock > 5
                                ? 'bg-green-100 text-green-700'
                                : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('product', product.id)}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditingProduct(true);
                            }}
                            className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No se encontraron productos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ordenes */}
          <TabsContent value="orders">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-200 to-green-300 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Gestión de Pedidos</CardTitle>
                    <CardDescription className="text-gray-700">
                      Administra los pedidos de los clientes
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-white text-green-700">
                    {filteredOrders.length} pedidos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
       
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <Label className="text-sm font-medium text-gray-700">Filtrar por mes:</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los meses</SelectItem>
                        {availableMonths.map(month => (
                          <SelectItem key={month} value={month}>
                            {getMonthLabel(month)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lista de ordenes */}
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-5 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Pedido #{order.id.slice(-8)}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-600">
                              Cliente: {order.userName || order.shippingAddress?.name || 'Desconocido'}
                            </p>
                            <span className="text-sm text-gray-400">•</span>
                            <p className="text-sm font-semibold text-gray-900">
                              ${order.total.toFixed(2)}
                            </p>
                            <span className="text-sm text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="mt-2 space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-xs text-gray-500">
                                • {item.productTitle || `Producto ${item.productId.slice(0, 8)}`} (x{item.quantity})
                              </div>
                            ))}
                          </div>
                        </div>
                        <Badge
                          variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'processing' ? 'secondary' :
                            order.status === 'shipped' ? 'outline' : 'destructive'
                          }
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value as Order['status'])}
                        >
                          <SelectTrigger className="w-48">
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
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No hay pedidos para mostrar</p>
                      {selectedMonth !== 'all' && (
                        <Button
                          variant="link"
                          onClick={() => setSelectedMonth('all')}
                          className="mt-2"
                        >
                          Ver todos los pedidos
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crear producto */}
          <TabsContent value="create">
            <Card className="border-none shadow-md max-w-4xl mx-auto">
              <CardHeader className="bg-gradient-to-r from-purple-200 to-purple-300 rounded-t-lg">
                <CardTitle className="text-gray-900">Crear Nuevo Producto</CardTitle>
                <CardDescription className="text-gray-700">
                  Añade un nuevo producto al catálogo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
      
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                        Título del Producto *
                      </Label>
                      <Input
                        id="title"
                        value={newProduct.title}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Collar de Plata con Diamante"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                        Categoría *
                      </Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Anillos">Anillos</SelectItem>
                          <SelectItem value="Collares">Collares</SelectItem>
                          <SelectItem value="Aretes">Aretes</SelectItem>
                          <SelectItem value="Pulseras">Pulseras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                          Precio ($) *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">
                          Stock *
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                          placeholder="10"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                        Descripción *
                      </Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción detallada del producto..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Imágenes del Producto
                      </Label>
                      <p className="text-xs text-gray-500 mb-2">
                        Añade las rutas de las imágenes (una por línea)
                      </p>
                      <Textarea
                        value={newProduct.images.join('\n')}
                        onChange={(e) => setNewProduct(prev => ({
                          ...prev,
                          images: e.target.value.split('\n')
                        }))}
                        placeholder="/images/products/producto-1.jpg&#10;/images/products/producto-2.jpg"
                        rows={4}
                        className="mt-1 font-mono text-xs"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Ejemplo: /images/products/tu-imagen.jpg
                      </p>
                    </div>

                    <Button
                      onClick={handleCreateProduct}
                      className="w-full bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-gray-900 shadow-lg h-12"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Producto
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Editar producto */}
      {isEditingProduct && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-200 to-green-300">
              <CardTitle className="text-gray-900">Editar Producto</CardTitle>
              <CardDescription className="text-gray-700">
                Actualiza la información del producto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Título</Label>
                    <Input
                      value={selectedProduct.title}
                      onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Categoría</Label>
                    <Select
                      value={selectedProduct.category}
                      onValueChange={(value) => setSelectedProduct(prev => prev ? { ...prev, category: value } : null)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Anillos">Anillos</SelectItem>
                        <SelectItem value="Collares">Collares</SelectItem>
                        <SelectItem value="Aretes">Aretes</SelectItem>
                        <SelectItem value="Pulseras">Pulseras</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Precio ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={selectedProduct.price}
                        onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Stock</Label>
                      <Input
                        type="number"
                        value={selectedProduct.stock}
                        onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, stock: parseInt(e.target.value) } : null)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Descripción</Label>
                    <Textarea
                      value={selectedProduct.description}
                      onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>


                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Imágenes</Label>
                    <Textarea
                      value={selectedProduct.images.join('\n')}
                      onChange={(e) => setSelectedProduct(prev => prev ? ({
                        ...prev,
                        images: e.target.value.split('\n').filter(s => s.trim())
                      }) : null)}
                      rows={4}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de accion */}
              <div className="flex gap-3 mt-8 pt-6 border-t">
                <Button
                  onClick={handleUpdateProduct}
                  className="flex-1 bg-gradient-to-r from-green-300 to-green-400 hover:from-green-400 hover:to-green-500 text-gray-900 h-12"
                >
                  Guardar Cambios
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingProduct(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 h-12"
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
