import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ShoppingCart, Minus, Plus, Search, Package, Leaf, CheckCircle, Coffee,
  Carrot,
  Apple,
  Milk,
  Egg,
} from "lucide-react";
import { toast } from "sonner";
import { useGlobalData } from "../../GlobalDataContext";
import { User } from "../../types";

interface Product {
  id: string;
  nombre: string;
  categoria: "cafe" | "hortalizas" | "frutas" | "lacteos" | "otros";
  precio: number;
  stock: number;
  unidad: string;
  imagen: string;
  descripcion: string;
  disponible: boolean;
}

const CATEGORY_ICONS = { cafe: Coffee, hortalizas: Carrot, frutas: Apple, lacteos: Milk, otros: Egg } as const;

function CategoryIcon({ categoria, className }: { categoria: keyof typeof CATEGORY_ICONS; className?: string }) {
  const Icon = CATEGORY_ICONS[categoria] ?? Egg;
  return <Icon className={className} style={{ color: "#2E8A00" }} />;
}

interface CartItem extends Product {
  cantidad: number;
}

interface StoreViewProps {
  userType: "aprendiz" | "instructor";
  user?: User;
}

export default function StoreView({ userType, user }: StoreViewProps) {
  const { addTransaction } = useGlobalData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const products: Product[] = [
    {
      id: "1",
      nombre: "Café Premium SENA",
      categoria: "cafe",
      precio: 15000,
      stock: 50,
      unidad: "500g",
      imagen: "",
      descripcion: "Café cultivado por aprendices SENA, 100% colombiano",
      disponible: true
    },
    {
      id: "2",
      nombre: "Café Orgánico",
      categoria: "cafe",
      precio: 20000,
      stock: 30,
      unidad: "500g",
      imagen: "",
      descripcion: "Café orgánico sin pesticidas",
      disponible: true
    },
    {
      id: "3",
      nombre: "Lechuga Fresca",
      categoria: "hortalizas",
      precio: 2000,
      stock: 25,
      unidad: "unidad",
      imagen: "",
      descripcion: "Lechuga fresca cultivada en huerta SENA",
      disponible: true
    },
    {
      id: "4",
      nombre: "Tomate Chonto",
      categoria: "hortalizas",
      precio: 3500,
      stock: 40,
      unidad: "kg",
      imagen: "",
      descripcion: "Tomate fresco de huerta orgánica",
      disponible: true
    },
    {
      id: "5",
      nombre: "Zanahoria",
      categoria: "hortalizas",
      precio: 2500,
      stock: 35,
      unidad: "kg",
      imagen: "",
      descripcion: "Zanahoria fresca y crujiente",
      disponible: true
    },
    {
      id: "6",
      nombre: "Cilantro",
      categoria: "hortalizas",
      precio: 1500,
      stock: 20,
      unidad: "atado",
      imagen: "",
      descripcion: "Cilantro fresco aromático",
      disponible: true
    },
    {
      id: "7",
      nombre: "Aguacate Hass",
      categoria: "frutas",
      precio: 2000,
      stock: 0,
      unidad: "unidad",
      imagen: "",
      descripcion: "Aguacate Hass de excelente calidad",
      disponible: false
    },
    {
      id: "8",
      nombre: "Fresas",
      categoria: "frutas",
      precio: 5000,
      stock: 15,
      unidad: "bandeja",
      imagen: "",
      descripcion: "Fresas dulces y jugosas",
      disponible: true
    },
    {
      id: "9",
      nombre: "Leche Fresca",
      categoria: "lacteos",
      precio: 3000,
      stock: 20,
      unidad: "litro",
      imagen: "",
      descripcion: "Leche fresca pasteurizada",
      disponible: true
    },
    {
      id: "10",
      nombre: "Queso Campesino",
      categoria: "lacteos",
      precio: 8000,
      stock: 12,
      unidad: "500g",
      imagen: "",
      descripcion: "Queso campesino artesanal",
      disponible: true
    },
    {
      id: "11",
      nombre: "Huevos Criollos",
      categoria: "otros",
      precio: 12000,
      stock: 30,
      unidad: "cubeta (30 unidades)",
      imagen: "",
      descripcion: "Huevos criollos de gallinas felices",
      disponible: true
    },
    {
      id: "12",
      nombre: "Miel de Abeja",
      categoria: "otros",
      precio: 18000,
      stock: 8,
      unidad: "500ml",
      imagen: "",
      descripcion: "Miel pura de colmenas SENA",
      disponible: true
    }
  ];

  const categories = [
    { value: "todas", label: "Todas", icon: "" },
    { value: "cafe", label: "Café", icon: "" },
    { value: "hortalizas", label: "Hortalizas", icon: "" },
    { value: "frutas", label: "Frutas", icon: "" },
    { value: "lacteos", label: "Lácteos", icon: "" },
    { value: "otros", label: "Otros", icon: "" }
  ];

  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === "todas" || product.categoria === selectedCategory;
    const matchSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       product.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: Product) => {
    if (!product.disponible || product.stock === 0) {
      toast.error("Producto no disponible");
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.cantidad >= product.stock) {
        toast.error("No hay más stock disponible");
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, cantidad: 1 }]);
    }
    
    toast.success(`${product.nombre} agregado al carrito`);
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(i => i.id === productId);
    if (item && item.cantidad > 1) {
      setCart(cart.map(i =>
        i.id === productId ? { ...i, cantidad: i.cantidad - 1 } : i
      ));
    } else {
      setCart(cart.filter(i => i.id !== productId));
    }
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Carrito vaciado");
  };

  const getTotalCart = () => {
    return cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const handleCheckout = () => {
    const total = getTotalCart();

    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    // Registrar transacción en el sistema global
    if (user) {
      const now = new Date();
      const productsDetails = cart.map(item => `${item.nombre} (${item.cantidad} ${item.unidad})`).join(", ");

      addTransaction({
        type: "tienda",
        userId: user.id,
        userName: user.name,
        userRole: user.role || "aprendiz",
        amount: total,
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        details: productsDetails,
        status: "completado",
      });
    }

    toast.success("¡Pedido registrado!", {
      description: `Total: $${total.toLocaleString("es-CO")}. Dirígete al punto de pago del restaurante.`
    });

    setCart([]);
    setShowCart(false);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const cartTotal = getTotalCart();

  return (
    <div className="space-y-6">
      {/* Header de la tienda */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Leaf className="w-6 h-6" style={{ color: '#39A900' }} />
                Tienda SENA - Productos Agrícolas
              </CardTitle>
              <CardDescription>
                Productos cultivados y elaborados por aprendices SENA
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              style={{ backgroundColor: '#F27C00' }}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrito
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-600">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.value)}
            className={selectedCategory === cat.value ? "" : ""}
            style={selectedCategory === cat.value ? { backgroundColor: '#39A900' } : {}}
          >
            
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Carrito flotante */}
      {showCart && cart.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tu Carrito ({cartItemCount} productos)</CardTitle>
              <Button variant="outline" size="sm" onClick={clearCart}>
                Vaciar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <CategoryIcon categoria={item.categoria} className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="text-sm">{item.nombre}</p>
                    <p className="text-xs text-gray-600">${item.precio.toLocaleString("es-CO")} / {item.unidad}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.cantidad}</span>
                  <Button size="sm" variant="outline" onClick={() => addToCart(item)} disabled={item.cantidad >= item.stock}>
                    <Plus className="w-4 h-4" />
                  </Button>
                  <p className="ml-2 w-24 text-right">${(item.precio * item.cantidad).toLocaleString("es-CO")}</p>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg mb-2">
                <span>Total:</span>
                <span style={{ color: '#F27C00' }}>${cartTotal.toLocaleString("es-CO")}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3 bg-sara-green-50 p-2 rounded-lg">
                El pago se realiza en el punto de venta del restaurante SENA
              </p>
              <Button
                onClick={handleCheckout}
                className="w-full"
                style={{ backgroundColor: '#39A900' }}
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar pedido · ${cartTotal.toLocaleString("es-CO")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catálogo de productos */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={!product.disponible ? "opacity-60" : ""}>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-sara-green-50 flex items-center justify-center"><CategoryIcon categoria={product.categoria} className="w-8 h-8" /></div>
                <div>
                  <h3>{product.nombre}</h3>
                  <p className="text-xs text-gray-600 mt-1">{product.descripcion}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Precio:</span>
                    <span className="text-lg" style={{ color: '#39A900' }}>
                      ${product.precio.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Unidad:</span>
                    <span>{product.unidad}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <Badge className={product.stock > 10 ? "bg-green-600" : "bg-yellow-600"}>
                      {product.stock} disponibles
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => addToCart(product)}
                  disabled={!product.disponible || product.stock === 0}
                  className="w-full"
                  style={{ backgroundColor: product.disponible ? '#F27C00' : '#gray' }}
                >
                  {!product.disponible || product.stock === 0 ? (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Agotado
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Agregar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No se encontraron productos con los filtros aplicados
          </CardContent>
        </Card>
      )}

      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre Nuestros Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Todos los productos son cultivados y elaborados por aprendices SENA</p>
          <p>Productos frescos y de excelente calidad</p>
          <p>Prácticas agrícolas sostenibles y responsables</p>
          <p>Los productos se entregan en el punto de retiro SENA</p>
          <p>Pago en el punto de venta del restaurante</p>
        </CardContent>
      </Card>
    </div>
  );
}