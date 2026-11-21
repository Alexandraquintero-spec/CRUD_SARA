import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { Leaf, Plus, Edit, TrendingUp, Package } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  nombre: string;
  categoria: "cafe" | "hortalizas" | "frutas" | "lacteos" | "otros";
  precio: number;
  stock: number;
  unidad: string;
  descripcion: string;
  disponible: boolean;
  ventas: number;
}

export default function StoreManagement() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      nombre: "Café Premium SENA",
      categoria: "cafe",
      precio: 15000,
      stock: 50,
      unidad: "500g",
      descripcion: "Café cultivado por aprendices SENA",
      disponible: true,
      ventas: 45
    },
    {
      id: "2",
      nombre: "Lechuga Fresca",
      categoria: "hortalizas",
      precio: 2000,
      stock: 25,
      unidad: "unidad",
      descripcion: "Lechuga fresca cultivada en huerta SENA",
      disponible: true,
      ventas: 38
    },
    {
      id: "3",
      nombre: "Tomate Chonto",
      categoria: "hortalizas",
      precio: 3500,
      stock: 40,
      unidad: "kg",
      descripcion: "Tomate fresco de huerta orgánica",
      disponible: true,
      ventas: 52
    },
    {
      id: "4",
      nombre: "Aguacate Hass",
      categoria: "frutas",
      precio: 2000,
      stock: 0,
      unidad: "unidad",
      descripcion: "Aguacate Hass de excelente calidad",
      disponible: false,
      ventas: 65
    },
    {
      id: "5",
      nombre: "Leche Fresca",
      categoria: "lacteos",
      precio: 3000,
      stock: 20,
      unidad: "litro",
      descripcion: "Leche fresca pasteurizada",
      disponible: true,
      ventas: 28
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "hortalizas" as Product["categoria"],
    precio: "",
    stock: "",
    unidad: "",
    descripcion: ""
  });

  const categories = [
    { value: "cafe", label: "Café" },
    { value: "hortalizas", label: "Hortalizas" },
    { value: "frutas", label: "Frutas" },
    { value: "lacteos", label: "Lácteos" },
    { value: "otros", label: "Otros" }
  ];

  const handleOpenNewProduct = () => {
    setIsEditMode(false);
    setEditingProduct(null);
    setFormData({
      nombre: "",
      categoria: "hortalizas",
      precio: "",
      stock: "",
      unidad: "",
      descripcion: ""
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setIsEditMode(true);
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      categoria: product.categoria,
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      unidad: product.unidad,
      descripcion: product.descripcion
    });
    setIsDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formData.nombre || !formData.precio || !formData.stock || !formData.unidad) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (isEditMode && editingProduct) {
      setProducts(products.map(p =>
        p.id === editingProduct.id
          ? {
              ...p,
              nombre: formData.nombre,
              categoria: formData.categoria,
              precio: parseFloat(formData.precio),
              stock: parseInt(formData.stock),
              unidad: formData.unidad,
              descripcion: formData.descripcion
            }
          : p
      ));
      toast.success("Producto actualizado exitosamente");
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        categoria: formData.categoria,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        unidad: formData.unidad,
        descripcion: formData.descripcion,
        disponible: true,
        ventas: 0
      };
      setProducts([...products, newProduct]);
      toast.success("Producto agregado exitosamente");
    }

    setIsDialogOpen(false);
  };

  const handleToggleAvailability = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, disponible: !p.disponible } : p
    ));
    toast.success("Disponibilidad actualizada");
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setProducts(products.map(p =>
      p.id === productId ? { ...p, stock: newStock } : p
    ));
    toast.success("Stock actualizado");
  };

  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.disponible && p.stock > 0).length;
  const lowStockProducts = products.filter(p => p.stock < 10 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalSales = products.reduce((sum, p) => sum + p.ventas, 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.ventas * p.precio), 0);

  const getCategoryBadge = (categoria: string) => {
    const colors: Record<string, string> = {
      cafe: "bg-amber-100 text-amber-700",
      hortalizas: "bg-green-100 text-green-700",
      frutas: "bg-pink-100 text-pink-700",
      lacteos: "bg-sara-green-100 text-sara-green-dark",
      otros: "bg-sara-orange-100 text-sara-orange-dark"
    };
    return colors[categoria] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Productos</CardDescription>
            <CardTitle className="text-3xl">{totalProducts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Disponibles</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#00543A' }}>{availableProducts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Stock Bajo</CardDescription>
            <CardTitle className="text-3xl text-yellow-700">{lowStockProducts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Agotados</CardDescription>
            <CardTitle className="text-3xl text-red-700">{outOfStockProducts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Resumen de ventas */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sara-green-dark" />
              Total de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-sara-green-dark">{totalSales} unidades</p>
            <p className="text-sm text-gray-600 mt-1">Productos vendidos en total</p>
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: '#E8F5E9' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#39A900' }} />
              Ingresos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl" style={{ color: '#00543A' }}>${totalRevenue.toLocaleString("es-CO")}</p>
            <p className="text-sm text-gray-600 mt-1">Generados por la tienda</p>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de productos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5" style={{ color: '#39A900' }} />
                Gestión de Productos Agrícolas
              </CardTitle>
              <CardDescription>
                Administra el catálogo de la tienda SENA
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleOpenNewProduct}
                  style={{ backgroundColor: '#39A900' }}
                  className="hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Editar Producto" : "Agregar Nuevo Producto"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode
                      ? "Actualiza la información del producto"
                      : "Completa los datos del nuevo producto agrícola"
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="nombre">Nombre del Producto *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Café Premium"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoría *</Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value: Product["categoria"]) =>
                          setFormData({ ...formData, categoria: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unidad">Unidad de Medida *</Label>
                      <Input
                        id="unidad"
                        value={formData.unidad}
                        onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                        placeholder="Ej: kg, litro, unidad"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="precio">Precio (COP) *</Label>
                      <Input
                        id="precio"
                        type="number"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Inicial *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Descripción del producto..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProduct}
                    className="w-full"
                    style={{ backgroundColor: '#39A900' }}
                  >
                    {isEditMode ? "Actualizar Producto" : "Agregar Producto"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p>{product.nombre}</p>
                      <p className="text-xs text-gray-600">{product.unidad}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadge(product.categoria)}>
                      {categories.find(c => c.value === product.categoria)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>${product.precio.toLocaleString("es-CO")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                        className="w-20"
                      />
                      {product.stock === 0 && (
                        <Badge className="bg-red-600">Agotado</Badge>
                      )}
                      {product.stock > 0 && product.stock < 10 && (
                        <Badge className="bg-yellow-600">Bajo</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.ventas}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.disponible}
                      onCheckedChange={() => handleToggleAvailability(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Productos más vendidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" style={{ color: '#F27C00' }} />
            Productos Más Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products
              .sort((a, b) => b.ventas - a.ventas)
              .slice(0, 5)
              .map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#F27C00' }}>
                      {index + 1}
                    </Badge>
                    <div>
                      <p>{product.nombre}</p>
                      <p className="text-sm text-gray-600">${product.precio.toLocaleString("es-CO")} / {product.unidad}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p>{product.ventas} ventas</p>
                    <p className="text-sm text-gray-600">
                      ${(product.ventas * product.precio).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {(lowStockProducts > 0 || outOfStockProducts > 0) && (
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#F27C00' }}>Alertas de Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {lowStockProducts > 0 && (
              <p>{lowStockProducts} producto(s) con stock bajo (menos de 10 unidades)</p>
            )}
            {outOfStockProducts > 0 && (
              <p>{outOfStockProducts} producto(s) agotado(s) - Requiere reposición</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
