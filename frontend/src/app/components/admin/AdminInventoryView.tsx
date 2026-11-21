import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Truck,
  Leaf,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle,
  Search,
  Warehouse,
  Edit2,
  Trash2,
  CalendarDays,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type Origen = "proveedor" | "sena";

interface ProductoInventario {
  id: string;
  nombre: string;
  categoria: string;
  origen: Origen;
  proveedor?: string;
  cantidad: number;
  unidad: string;
  stockMinimo: number;
  fechaIngreso: string;
  fechaVencimiento?: string;
  lote?: string;
  observaciones?: string;
}

interface Merma {
  id: string;
  fecha: string;
  materialAfectado: string;
  categoriaProducto: string;
  cantidadPerdida: number;
  unidad: string;
  razonDetallada: string;
  origen: Origen;
}

const CATEGORIAS_PROVEEDOR = [
  "Carnes y Proteínas",
  "Lácteos y Huevos",
  "Aceites y Grasas",
  "Granos y Cereales",
  "Condimentos y Especias",
  "Bebidas",
  "Enlatados y Conservas",
  "Otros",
];

const CATEGORIAS_SENA = [
  "Hortalizas",
  "Frutas",
  "Aromáticas",
  "Tubérculos",
  "Leguminosas",
  "Hierbas",
  "Otros",
];

const UNIDADES = ["kg", "g", "L", "mL", "unidades", "cajas", "bolsas", "atados"];

const PROVEEDORES = [
  "Distribuidora Makro",
  "Almacén El Huerto",
  "Carrefour B2B",
  "Frigorífico Central",
  "Lacteos del Valle",
  "Proveedor Directo",
];

const DEMO_PROVEEDOR: ProductoInventario[] = [
  {
    id: "p001",
    nombre: "Pollo entero",
    categoria: "Carnes y Proteínas",
    origen: "proveedor",
    proveedor: "Frigorífico Central",
    cantidad: 25,
    unidad: "kg",
    stockMinimo: 10,
    fechaIngreso: "2026-05-10",
    fechaVencimiento: "2026-05-17",
    lote: "L-240510",
  },
  {
    id: "p002",
    nombre: "Arroz blanco",
    categoria: "Granos y Cereales",
    origen: "proveedor",
    proveedor: "Distribuidora Makro",
    cantidad: 50,
    unidad: "kg",
    stockMinimo: 20,
    fechaIngreso: "2026-05-08",
    fechaVencimiento: "2027-05-08",
    lote: "L-240508",
  },
  {
    id: "p003",
    nombre: "Aceite vegetal",
    categoria: "Aceites y Grasas",
    origen: "proveedor",
    proveedor: "Almacén El Huerto",
    cantidad: 8,
    unidad: "L",
    stockMinimo: 15,
    fechaIngreso: "2026-05-05",
    fechaVencimiento: "2027-02-05",
    lote: "L-240505",
  },
  {
    id: "p004",
    nombre: "Leche entera",
    categoria: "Lácteos y Huevos",
    origen: "proveedor",
    proveedor: "Lacteos del Valle",
    cantidad: 30,
    unidad: "L",
    stockMinimo: 10,
    fechaIngreso: "2026-05-12",
    fechaVencimiento: "2026-05-19",
    lote: "L-240512",
  },
  {
    id: "p005",
    nombre: "Sal refinada",
    categoria: "Condimentos y Especias",
    origen: "proveedor",
    proveedor: "Distribuidora Makro",
    cantidad: 12,
    unidad: "kg",
    stockMinimo: 5,
    fechaIngreso: "2026-04-20",
    fechaVencimiento: "2028-04-20",
    lote: "L-240420",
  },
];

const DEMO_SENA: ProductoInventario[] = [
  {
    id: "s001",
    nombre: "Tomate chonto",
    categoria: "Hortalizas",
    origen: "sena",
    cantidad: 18,
    unidad: "kg",
    stockMinimo: 5,
    fechaIngreso: "2026-05-13",
    observaciones: "Cosecha del bloque agroecológico",
  },
  {
    id: "s002",
    nombre: "Cilantro",
    categoria: "Aromáticas",
    origen: "sena",
    cantidad: 3,
    unidad: "kg",
    stockMinimo: 1,
    fechaIngreso: "2026-05-13",
    observaciones: "Jardín aromático - aprendices ficha 2841792",
  },
  {
    id: "s003",
    nombre: "Ahuyama",
    categoria: "Hortalizas",
    origen: "sena",
    cantidad: 22,
    unidad: "kg",
    stockMinimo: 8,
    fechaIngreso: "2026-05-11",
    observaciones: "Cosecha lote B",
  },
  {
    id: "s004",
    nombre: "Lechuga batavia",
    categoria: "Hortalizas",
    origen: "sena",
    cantidad: 4,
    unidad: "kg",
    stockMinimo: 3,
    fechaIngreso: "2026-05-12",
    observaciones: "Hidroponía - bloque 3",
  },
  {
    id: "s005",
    nombre: "Limón Tahití",
    categoria: "Frutas",
    origen: "sena",
    cantidad: 10,
    unidad: "kg",
    stockMinimo: 4,
    fechaIngreso: "2026-05-10",
    observaciones: "Árbol frutal sector norte",
  },
];

function getStockStatus(p: ProductoInventario) {
  if (p.cantidad <= 0) return { label: "Sin stock", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
  if (p.cantidad <= p.stockMinimo) return { label: "Stock bajo", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
  return { label: "Normal", color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle className="w-3.5 h-3.5" /> };
}

function isVencimientoProximo(fecha?: string) {
  if (!fecha) return false;
  const diff = (new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 5;
}

function isVencido(fecha?: string) {
  if (!fecha) return false;
  return new Date(fecha).getTime() < Date.now();
}

interface FormState {
  nombre: string;
  categoria: string;
  proveedor: string;
  cantidad: string;
  unidad: string;
  stockMinimo: string;
  fechaVencimiento: string;
  lote: string;
  observaciones: string;
}

const EMPTY_FORM: FormState = {
  nombre: "", categoria: "", proveedor: "", cantidad: "", unidad: "kg",
  stockMinimo: "", fechaVencimiento: "", lote: "", observaciones: "",
};

interface MermaFormState {
  materialAfectado: string;
  cantidadPerdida: string;
  unidad: string;
  razonDetallada: string;
}

const EMPTY_MERMA_FORM: MermaFormState = {
  materialAfectado: "",
  cantidadPerdida: "",
  unidad: "kg",
  razonDetallada: "",
};

export default function AdminInventoryView() {
  const [seccion, setSeccion] = useState<Origen>("proveedor");
  const [productosProveedor, setProductosProveedor] = useState<ProductoInventario[]>(DEMO_PROVEEDOR);
  const [productosSena, setProductosSena] = useState<ProductoInventario[]>(DEMO_SENA);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [vistaActual, setVistaActual] = useState<"inventario" | "mermas">("inventario");
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [mostrarFormMerma, setMostrarFormMerma] = useState(false);
  const [formMerma, setFormMerma] = useState<MermaFormState>(EMPTY_MERMA_FORM);

  const productos = seccion === "proveedor" ? productosProveedor : productosSena;
  const setProductos = seccion === "proveedor" ? setProductosProveedor : setProductosSena;
  const categorias = seccion === "proveedor" ? CATEGORIAS_PROVEEDOR : CATEGORIAS_SENA;

  const filtrados = productos.filter((p) => {
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = categoriaFiltro === "todas" || p.categoria === categoriaFiltro;
    return matchBusq && matchCat;
  });

  const contStockBajo = productos.filter((p) => p.cantidad <= p.stockMinimo).length;
  const contVencProximo = productos.filter((p) => isVencimientoProximo(p.fechaVencimiento)).length;
  const contVencidos = productos.filter((p) => isVencido(p.fechaVencimiento)).length;

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(EMPTY_FORM);
    setMostrarForm(true);
  };

  const abrirEditar = (p: ProductoInventario) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre,
      categoria: p.categoria,
      proveedor: p.proveedor || "",
      cantidad: p.cantidad.toString(),
      unidad: p.unidad,
      stockMinimo: p.stockMinimo.toString(),
      fechaVencimiento: p.fechaVencimiento || "",
      lote: p.lote || "",
      observaciones: p.observaciones || "",
    });
    setMostrarForm(true);
  };

  const guardar = () => {
    if (!form.nombre.trim() || !form.categoria || !form.cantidad || !form.stockMinimo) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    const producto: ProductoInventario = {
      id: editandoId || `${seccion[0]}${Date.now()}`,
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      origen: seccion,
      proveedor: seccion === "proveedor" ? form.proveedor : undefined,
      cantidad: Number(form.cantidad),
      unidad: form.unidad,
      stockMinimo: Number(form.stockMinimo),
      fechaIngreso: new Date().toISOString().split("T")[0],
      fechaVencimiento: form.fechaVencimiento || undefined,
      lote: form.lote || undefined,
      observaciones: form.observaciones || undefined,
    };
    if (editandoId) {
      setProductos((prev) => prev.map((p) => (p.id === editandoId ? producto : p)));
      toast.success("Producto actualizado");
    } else {
      setProductos((prev) => [producto, ...prev]);
      toast.success("Producto registrado en inventario");
    }
    setMostrarForm(false);
    setEditandoId(null);
    setForm(EMPTY_FORM);
  };

  const eliminar = (id: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Producto eliminado del inventario");
  };

  const abrirNuevaMerma = () => {
    setFormMerma(EMPTY_MERMA_FORM);
    setMostrarFormMerma(true);
  };

  const guardarMerma = () => {
    if (!formMerma.materialAfectado.trim() || !formMerma.cantidadPerdida || !formMerma.razonDetallada.trim()) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    const producto = productos.find((p) => p.nombre.toLowerCase() === formMerma.materialAfectado.toLowerCase());

    const nuevaMerma: Merma = {
      id: `m${Date.now()}`,
      fecha: new Date().toISOString().split("T")[0],
      materialAfectado: formMerma.materialAfectado.trim(),
      categoriaProducto: producto?.categoria || "Sin categoría",
      cantidadPerdida: Number(formMerma.cantidadPerdida),
      unidad: formMerma.unidad,
      razonDetallada: formMerma.razonDetallada.trim(),
      origen: seccion,
    };

    setMermas((prev) => [nuevaMerma, ...prev]);
    toast.success("Merma registrada correctamente");
    setMostrarFormMerma(false);
    setFormMerma(EMPTY_MERMA_FORM);
  };

  const eliminarMerma = (id: string) => {
    setMermas((prev) => prev.filter((m) => m.id !== id));
    toast.success("Registro de merma eliminado");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-sm" style={{ borderLeftColor: "#39A900" }}>
        <CardContent className="pt-4 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#39A900" }}>
            <Warehouse className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Gestión de inventario</p>
            <p className="text-sm text-gray-500">
              Control de productos adquiridos por proveedor e insumos producidos en el SENA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {(contVencidos > 0 || contVencProximo > 0 || contStockBajo > 0) && (
        <div className="grid sm:grid-cols-3 gap-3">
          {contVencidos > 0 && (
            <Card>
              <CardContent className="pt-3 pb-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700">{contVencidos} producto(s) vencido(s)</p>
                  <p className="text-xs text-red-500">Retirar del inventario</p>
                </div>
              </CardContent>
            </Card>
          )}
          {contVencProximo > 0 && (
            <Card>
              <CardContent className="pt-3 pb-3 flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700">{contVencProximo} vence en ≤5 días</p>
                  <p className="text-xs text-yellow-500">Usar con prioridad</p>
                </div>
              </CardContent>
            </Card>
          )}
          {contStockBajo > 0 && (
            <Card>
              <CardContent className="pt-3 pb-3 flex items-center gap-3">
                <Package className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-700">{contStockBajo} con stock bajo</p>
                  <p className="text-xs text-orange-500">Reabastecer pronto</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Selector de Vista */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => setVistaActual("inventario")}
          variant={vistaActual === "inventario" ? "default" : "outline"}
          className={`gap-2 h-9 text-sm ${vistaActual === "inventario" ? "text-white" : ""}`}
          style={vistaActual === "inventario" ? { backgroundColor: "#39A900" } : {}}
        >
          <Package className="w-4 h-4" />
          Inventario
        </Button>
        <Button
          onClick={() => setVistaActual("mermas")}
          variant={vistaActual === "mermas" ? "default" : "outline"}
          className={`gap-2 h-9 text-sm ${vistaActual === "mermas" ? "text-white" : ""}`}
          style={vistaActual === "mermas" ? { backgroundColor: "#39A900" } : {}}
        >
          <XCircle className="w-4 h-4" />
          Gestión de Mermas
        </Button>
      </div>

      {/* Vista de Inventario */}
      {vistaActual === "inventario" && (
        <Tabs value={seccion} onValueChange={(v) => { setSeccion(v as Origen); setBusqueda(""); setCategoriaFiltro("todas"); setMostrarForm(false); }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList>
              <TabsTrigger value="proveedor" className="gap-2">
                <Truck className="w-4 h-4" />
                Productos de Proveedor
              </TabsTrigger>
              <TabsTrigger value="sena" className="gap-2">
                <Leaf className="w-4 h-4" />
                Insumos SENA
              </TabsTrigger>
            </TabsList>
            <Button
              onClick={abrirNuevo}
              className="text-white text-sm h-9 gap-2"
              style={{ backgroundColor: "#39A900" }}
            >
              <Plus className="w-4 h-4" />
              Registrar {seccion === "proveedor" ? "Producto" : "Insumo"}
            </Button>
          </div>

        {/* Formulario */}
        {mostrarForm && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base" style={{ color: "#39A900" }}>
                {editandoId ? "Editar" : "Registrar"} {seccion === "proveedor" ? "producto de proveedor" : "insumo SENA"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Nombre *</Label>
                  <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder={seccion === "proveedor" ? "Ej: Pollo entero" : "Ej: Tomate chonto"}
                    className="rounded-xl h-10" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Categoría *</Label>
                  <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {seccion === "proveedor" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Proveedor</Label>
                    <Select value={form.proveedor} onValueChange={(v) => setForm({ ...form, proveedor: v })}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {PROVEEDORES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm">Cantidad *</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={0} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                      placeholder="0" className="rounded-xl h-10 flex-1" />
                    <Select value={form.unidad} onValueChange={(v) => setForm({ ...form, unidad: v })}>
                      <SelectTrigger className="rounded-xl h-10 w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Stock mínimo *</Label>
                  <Input type="number" min={0} value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                    placeholder="0" className="rounded-xl h-10" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Fecha vencimiento</Label>
                  <Input type="date" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
                    className="rounded-xl h-10" />
                </div>

                {seccion === "proveedor" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Lote</Label>
                    <Input value={form.lote} onChange={(e) => setForm({ ...form, lote: e.target.value })}
                      placeholder="Ej: L-240512" className="rounded-xl h-10" />
                  </div>
                )}

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm">Observaciones</Label>
                  <Input value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    placeholder={seccion === "sena" ? "Ej: Cosecha bloque agroecológico - ficha 2841792" : "Notas adicionales"}
                    className="rounded-xl h-10" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button onClick={guardar} className="text-white h-9" style={{ backgroundColor: "#39A900" }}>
                  {editandoId ? "Actualizar" : "Registrar"}
                </Button>
                <Button variant="outline" className="h-9" onClick={() => { setMostrarForm(false); setEditandoId(null); setForm(EMPTY_FORM); }}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <TabsContent value={seccion} className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 rounded-xl h-10"
              />
            </div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="rounded-xl h-10 w-52">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-0">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-2xl font-bold text-gray-700">{productos.length}</p>
                <p className="text-xs text-gray-500">Total ítems</p>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{contStockBajo}</p>
                <p className="text-xs text-yellow-600">Stock bajo</p>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-2xl font-bold text-red-600">{contVencidos}</p>
                <p className="text-xs text-red-600">Vencidos</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista */}
          {filtrados.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No se encontraron productos</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtrados.map((p) => {
                const stock = getStockStatus(p);
                const vencido = isVencido(p.fechaVencimiento);
                const vencProx = isVencimientoProximo(p.fechaVencimiento);
                return (
                  <Card
                    key={p.id}
                    className={`border shadow-sm hover:shadow-md transition-shadow ${vencido ? "border-red-200 bg-red-50/40" : vencProx ? "border-yellow-200 bg-yellow-50/40" : ""}`}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800">{p.nombre}</p>
                            {vencido && (
                              <Badge className="text-xs bg-red-100 text-red-700 border border-red-200">Vencido</Badge>
                            )}
                            {!vencido && vencProx && (
                              <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">Vence pronto</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">{p.categoria}</span>
                            {p.proveedor && (
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3" /> {p.proveedor}
                              </span>
                            )}
                            {p.lote && <span>Lote: {p.lote}</span>}
                            <span>Ingreso: {new Date(p.fechaIngreso).toLocaleDateString("es-CO")}</span>
                            {p.fechaVencimiento && (
                              <span className={vencido ? "text-red-600 font-medium" : vencProx ? "text-yellow-600 font-medium" : ""}>
                                Vence: {new Date(p.fechaVencimiento).toLocaleDateString("es-CO")}
                              </span>
                            )}
                          </div>

                          {p.observaciones && (
                            <p className="text-xs text-gray-500 italic">{p.observaciones}</p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${stock.color}`}>
                            {stock.icon}
                            {stock.label}
                          </div>
                          <p className="text-lg font-bold text-gray-700">
                            {p.cantidad} <span className="text-sm font-normal text-gray-400">{p.unidad}</span>
                          </p>
                          <p className="text-xs text-gray-400">Mín: {p.stockMinimo} {p.unidad}</p>
                          <div className="flex gap-1.5 mt-1">
                            <button
                              onClick={() => abrirEditar(p)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => eliminar(p.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        </Tabs>
      )}

      {/* Vista de Gestión de Mermas */}
      {vistaActual === "mermas" && (
        <div className="space-y-4">
          {/* Tabs de origen */}
          <Tabs value={seccion} onValueChange={(v) => { setSeccion(v as Origen); setMostrarFormMerma(false); }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList>
                <TabsTrigger value="proveedor" className="gap-2">
                  <Truck className="w-4 h-4" />
                  Productos de Proveedor
                </TabsTrigger>
                <TabsTrigger value="sena" className="gap-2">
                  <Leaf className="w-4 h-4" />
                  Insumos SENA
                </TabsTrigger>
              </TabsList>
              <Button
                onClick={abrirNuevaMerma}
                className="text-white text-sm h-9 gap-2"
                style={{ backgroundColor: "#F27C00" }}
              >
                <Plus className="w-4 h-4" />
                Registrar Merma
              </Button>
            </div>

            {/* Formulario de Merma */}
            {mostrarFormMerma && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base" style={{ color: "#F27C00" }}>
                    Registrar merma de {seccion === "proveedor" ? "producto de proveedor" : "insumo SENA"}
                  </CardTitle>
                  <CardDescription>
                    Documenta las pérdidas de material para llevar un control y análisis de desperdicios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Material afectado *</Label>
                      <Select
                        value={formMerma.materialAfectado}
                        onValueChange={(v) => {
                          const prod = productos.find(p => p.nombre === v);
                          setFormMerma({
                            ...formMerma,
                            materialAfectado: v,
                            unidad: prod?.unidad || "kg"
                          });
                        }}
                      >
                        <SelectTrigger className="rounded-xl h-10">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {productos.map((p) => (
                            <SelectItem key={p.id} value={p.nombre}>
                              {p.nombre} ({p.cantidad} {p.unidad} disponibles)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">Cantidad de pérdida *</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={formMerma.cantidadPerdida}
                          onChange={(e) => setFormMerma({ ...formMerma, cantidadPerdida: e.target.value })}
                          placeholder="0"
                          className="rounded-xl h-10 flex-1"
                        />
                        <Select value={formMerma.unidad} onValueChange={(v) => setFormMerma({ ...formMerma, unidad: v })}>
                          <SelectTrigger className="rounded-xl h-10 w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {UNIDADES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-sm">Razón detallada de la merma *</Label>
                      <Input
                        value={formMerma.razonDetallada}
                        onChange={(e) => setFormMerma({ ...formMerma, razonDetallada: e.target.value })}
                        placeholder="Ej: Producto en mal estado por vencimiento, daño durante almacenamiento, sobras no reutilizables, etc."
                        className="rounded-xl h-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button
                      onClick={guardarMerma}
                      className="text-white h-9"
                      style={{ backgroundColor: "#F27C00" }}
                    >
                      Registrar Merma
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9"
                      onClick={() => {
                        setMostrarFormMerma(false);
                        setFormMerma(EMPTY_MERMA_FORM);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <TabsContent value={seccion} className="mt-4 space-y-4">
              {/* Resumen de mermas */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-0">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {mermas.filter((m) => m.origen === seccion).length}
                    </p>
                    <p className="text-xs text-orange-600">Total registros</p>
                  </CardContent>
                </Card>
                <Card className="border-0">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {mermas
                        .filter((m) => m.origen === seccion)
                        .reduce((sum, m) => sum + m.cantidadPerdida, 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-xs text-red-600">Total pérdidas (kg/L/unidades)</p>
                  </CardContent>
                </Card>
                <Card className="border-0">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-2xl font-bold text-gray-700">
                      {new Set(mermas.filter((m) => m.origen === seccion).map((m) => m.materialAfectado)).size}
                    </p>
                    <p className="text-xs text-gray-600">Productos afectados</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de mermas */}
              {mermas.filter((m) => m.origen === seccion).length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center text-gray-400">
                    <XCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay registros de mermas</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {mermas
                    .filter((m) => m.origen === seccion)
                    .map((merma) => (
                      <Card key={merma.id} className="/30 shadow-sm">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-800">{merma.materialAfectado}</p>
                                <Badge className="text-xs bg-orange-100 text-orange-700 border border-orange-200">
                                  {merma.categoriaProducto}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  {new Date(merma.fecha).toLocaleDateString("es-CO")}
                                </span>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                  Pérdida: {merma.cantidadPerdida} {merma.unidad}
                                </span>
                              </div>

                              <div className="bg-white/60 p-2 rounded-lg border border-orange-100">
                                <p className="text-xs text-gray-600">
                                  <span className="font-semibold text-gray-700">Razón: </span>
                                  {merma.razonDetallada}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => eliminarMerma(merma.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                              title="Eliminar registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
