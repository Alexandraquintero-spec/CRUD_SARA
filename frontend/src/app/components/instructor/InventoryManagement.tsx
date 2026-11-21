import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Package, Plus, AlertTriangle, Calendar, Phone } from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  fechaVencimiento: string;
  tipo: "perecedero" | "no-perecedero";
  categoria: string;
  estado: "disponible" | "por-vencer" | "vencido";
}

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      nombre: "Arroz",
      cantidad: 50,
      unidad: "kg",
      fechaVencimiento: "2025-06-15",
      tipo: "no-perecedero",
      categoria: "Granos",
      estado: "disponible"
    },
    {
      id: "2",
      nombre: "Pollo",
      cantidad: 15,
      unidad: "kg",
      fechaVencimiento: "2024-12-20",
      tipo: "perecedero",
      categoria: "Proteína",
      estado: "por-vencer"
    },
    {
      id: "3",
      nombre: "Lechuga",
      cantidad: 8,
      unidad: "unidades",
      fechaVencimiento: "2024-12-22",
      tipo: "perecedero",
      categoria: "Verduras",
      estado: "disponible"
    },
    {
      id: "4",
      nombre: "Aceite",
      cantidad: 25,
      unidad: "litros",
      fechaVencimiento: "2025-08-30",
      tipo: "no-perecedero",
      categoria: "Condimentos",
      estado: "disponible"
    }
  ]);

  const [newItem, setNewItem] = useState({
    nombre: "",
    cantidad: "",
    unidad: "",
    fechaVencimiento: "",
    tipo: "perecedero" as "perecedero" | "no-perecedero",
    categoria: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddItem = () => {
    if (!newItem.nombre || !newItem.cantidad || !newItem.unidad || !newItem.fechaVencimiento) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      nombre: newItem.nombre,
      cantidad: parseFloat(newItem.cantidad),
      unidad: newItem.unidad,
      fechaVencimiento: newItem.fechaVencimiento,
      tipo: newItem.tipo,
      categoria: newItem.categoria,
      estado: "disponible"
    };

    setItems([...items, item]);
    setNewItem({
      nombre: "",
      cantidad: "",
      unidad: "",
      fechaVencimiento: "",
      tipo: "perecedero",
      categoria: ""
    });
    setIsDialogOpen(false);
    toast.success(`${item.nombre} agregado al inventario`);
  };

  const lowStockItems = items.filter(item => item.cantidad < 10);
  const expiringItems = items.filter(item => item.estado === "por-vencer");

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "disponible":
        return <Badge className="bg-green-600">Disponible</Badge>;
      case "por-vencer":
        return <Badge className="bg-yellow-600">Por Vencer</Badge>;
      case "vencido":
        return <Badge className="bg-red-600">Vencido</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Productos</CardDescription>
            <CardTitle className="text-3xl">{items.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Stock Bajo</CardDescription>
            <CardTitle className="text-3xl text-yellow-700">{lowStockItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Por Vencer</CardDescription>
            <CardTitle className="text-3xl text-red-700">{expiringItems.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Alertas */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Alertas de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockItems.length > 0 && (
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm">Stock bajo en: {lowStockItems.map(i => i.nombre).join(", ")}</p>
                </div>
              </div>
            )}
            {expiringItems.length > 0 && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm">Por vencer: {expiringItems.map(i => i.nombre).join(", ")}</p>
                </div>
              </div>
            )}
            <Button size="sm" variant="outline" className="mt-2">
              <Phone className="w-4 h-4 mr-2" />
              Contactar Proveedor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabla de inventario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventario de Productos</CardTitle>
              <CardDescription>Gestión de materia prima e insumos</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Entrada
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Entrada</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos del producto que llega al inventario
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Producto</Label>
                    <Input
                      id="nombre"
                      value={newItem.nombre}
                      onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                      placeholder="Ej: Tomate"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cantidad">Cantidad</Label>
                      <Input
                        id="cantidad"
                        type="number"
                        value={newItem.cantidad}
                        onChange={(e) => setNewItem({ ...newItem, cantidad: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unidad">Unidad</Label>
                      <Input
                        id="unidad"
                        value={newItem.unidad}
                        onChange={(e) => setNewItem({ ...newItem, unidad: e.target.value })}
                        placeholder="kg, litros, unidades"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Input
                      id="categoria"
                      value={newItem.categoria}
                      onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                      placeholder="Ej: Verduras, Granos, Proteína"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Producto</Label>
                    <Select
                      value={newItem.tipo}
                      onValueChange={(value: "perecedero" | "no-perecedero") =>
                        setNewItem({ ...newItem, tipo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perecedero">Perecedero</SelectItem>
                        <SelectItem value="no-perecedero">No Perecedero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha de Vencimiento</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={newItem.fechaVencimiento}
                      onChange={(e) => setNewItem({ ...newItem, fechaVencimiento: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddItem} className="w-full bg-green-600 hover:bg-green-700">
                    Agregar Producto
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
                <TableHead>Cantidad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>
                    {item.cantidad} {item.unidad}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.tipo === "perecedero" ? "Perecedero" : "No Perecedero"}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell>{new Date(item.fechaVencimiento).toLocaleDateString("es-CO")}</TableCell>
                  <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
